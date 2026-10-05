#!/usr/bin/env bash
# Trusted half of FE PR previews. Never runs PR code; the build artifact is only ever loaded as an image.
#
#   fe-preview.sh deploy <head-sha> <image.tar.gz|-> [built-host]   after a build: gate, push, deploy, statuses
#   fe-preview.sh watch <pr> <sha> <deployment-uuid>   wait for Coolify, then set the Preview status
#   fe-preview.sh close <pr>                           PR closed: delete preview and image tags
#   fe-preview.sh sweep                                expire idle previews, start queued ones
#
# Env: REPO, GH_TOKEN, COOLIFY_URL (https only), COOLIFY_TOKEN, COOLIFY_PREVIEW_APP,
#      PREVIEW_CAP (30), PREVIEW_TTL_HOURS (48), DRY_RUN=1 (no Coolify, GHCR or GitHub writes).
# Config from the base checkout: .github/preview.env, .github/preview-orgs.
#
# The build artifact's meta.json is written next to PR code, so nothing here trusts it: the PR,
# gate and backend are recomputed from the GitHub API and the base branch config.
# State: one bot comment per PR, edited in place:
#   <!-- fe-preview state=active|queued|expired|evicted|removed|error|skipped sha= tag= host= dep= at= -->
# A preview only leaves `active` once Coolify confirms the delete, so a failed delete is retried.
set -euo pipefail

: "${REPO:?}" "${COOLIFY_PREVIEW_APP:?}"
CAP=${PREVIEW_CAP:-30}
TTL_H=${PREVIEW_TTL_HOURS:-48}
NOW=$(date +%s)
MARK="<!-- fe-preview"
CFG=.github/preview.env
cfg() { sed -n "s/^$1=//p" "$CFG" | head -1; }
DOMAIN=$(cfg PREVIEW_DOMAIN)
DEFAULT_HOST=$(cfg PREVIEW_BACKEND_HOST)
OWNER=$(tr '[:upper:]' '[:lower:]' <<< "${REPO%%/*}")
IMAGE="ghcr.io/$OWNER/zedu-fe-preview"
dry() { [ -n "${DRY_RUN:-}" ]; }

if ! dry; then
  : "${COOLIFY_URL:?}" "${COOLIFY_TOKEN:?}"
  [[ "$COOLIFY_URL" == https://* ]] || { echo "::error::COOLIFY_URL must be https; refusing to send the token in cleartext."; exit 1; }
fi

coolify() { # method path -> body on stdout; non-2xx fails
  if dry; then echo "  [dry-run] coolify $1 $2" >&2; echo '{"deployments":[{"deployment_uuid":"dry-run"}],"status":"finished"}'; return 0; fi
  curl -fsS -m 60 -X "$1" -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Accept: application/json" "${COOLIFY_URL%/}/api/v1$2"
}

url() { echo "https://$1.$DOMAIN"; }

status() { # sha context state description [target]
  if dry; then echo "  [dry-run] status ${1:0:7} $2=$3: $4" >&2; return 0; fi
  gh api "repos/$REPO/statuses/$1" -f state="$3" -f context="$2" -f description="${4:0:140}" ${5:+-f target_url="$5"} >/dev/null
}

# Prints "<comment id> <state> <sha> <tag> <host> <dep> <at>" ("-" for empty fields), or nothing.
read_state() {
  gh api --paginate "repos/$REPO/issues/$1/comments?per_page=100" \
    | jq -rs --arg m "$MARK" 'flatten | map(select(.user.login == "github-actions[bot]" and (.body | contains($m)))) | last // empty
      | (.body | capture("state=(?<s>[a-z]*) sha=(?<h>[^ ]*) tag=(?<t>[^ ]*) host=(?<o>[^ ]*) dep=(?<d>[^ ]*) at=(?<a>[0-9]*)")) as $c
      | [.id, $c.s, $c.h, $c.t, $c.o, $c.d, $c.a] | map(if . == "" then "-" else tostring end) | join(" ")'
}

write_state() { # pr state sha tag host dep message [comment id]
  local body
  body=$(printf '%s state=%s sha=%s tag=%s host=%s dep=%s at=%s -->\n### Preview\n\n%s\n' \
    "$MARK" "$2" "${3#-}" "${4#-}" "${5#-}" "${6#-}" "$NOW" "$7")
  if dry; then echo "  [dry-run] PR #$1 state=$2: $7" >&2; return 0; fi
  if [ -n "${8:-}" ] && [ "$8" != - ]; then
    gh api -X PATCH "repos/$REPO/issues/comments/$8" -f body="$body" >/dev/null
  else
    gh api "repos/$REPO/issues/$1/comments" -f body="$body" >/dev/null
  fi
}

# Backend host from the PR body (trusted API read), or the default. Prints "<host> <override>" or fails.
backend() {
  local body line u
  body=$(gh api "repos/$REPO/pulls/$1" --jq '.body // ""' | tr -d '\r')
  line=$(grep -iE '^[[:space:]]*backend url:' <<< "$body" | head -1 || true)
  [ -n "$line" ] || { echo "$DEFAULT_HOST false"; return 0; }
  u=$(sed -E 's/^[[:space:]]*[Bb][Aa][Cc][Kk][Ee][Nn][Dd] [Uu][Rr][Ll]:[[:space:]]*//; s/[[:space:]`<>]//g; s#/+$##' <<< "$line")
  [[ "$u" =~ ^https://(api\.[a-z0-9-]+\.groups\.zedu\.chat)$ ]] || return 1
  echo "${BASH_REMATCH[1]} true"
}

# Every open PR's active previews, oldest first: "<at> <pr>".
active_previews() {
  local n
  for n in $(gh api --paginate "repos/$REPO/pulls?state=open&base=dev&per_page=100" --jq '.[].number'); do
    read_state "$n" | awk -v n="$n" '$2 == "active" { print $7, n }'
  done | sort -n
}

remove() { # pr new-state message -> 0 when Coolify confirmed the delete
  local id st sha tag host dep at
  read -r id st sha tag host dep at <<< "$(read_state "$1")"
  [ "$st" = active ] || return 0
  if ! coolify DELETE "/applications/$COOLIFY_PREVIEW_APP/previews/$1" >/dev/null; then
    echo "::warning::PR #$1: Coolify didn't delete the preview; it stays active and the next sweep retries."
    return 1
  fi
  write_state "$1" "$2" "$sha" "$tag" "$host" - "~~$(url "$1")~~ $3" "$id"
  [ "$2" = removed ] || status "$sha" Preview success "Stopped: $3" ""
}

deploy_tag() { # pr sha tag host comment-id
  local res dep
  res=$(coolify POST "/deploy?uuid=$COOLIFY_PREVIEW_APP&pr=$1&docker_tag=$3") || res=""
  dep=$(jq -r '[.deployments[]? | .deployment_uuid // empty][0] // empty' <<< "$res" 2>/dev/null || true)
  if [ -z "$dep" ]; then
    local why; why=$(jq -r '[.deployments[]?.message // empty, .message // empty][0] // "no deployment created"' <<< "$res" 2>/dev/null || echo "Coolify request failed")
    status "$2" Preview failure "Coolify didn't start a deployment: $why"
    write_state "$1" error "$2" "$3" "$4" - "Preview failed to start: $why" "$5"
    return 1
  fi
  status "$2" Preview pending "Deploying in Coolify (backend $4)"
  write_state "$1" active "$2" "$3" "$4" "$dep" "$(url "$1") is deploying ${2:0:7} against \`$4\`. It's removed when the PR closes, or after ${TTL_H}h without a push." "$5"
  [ -n "${GITHUB_OUTPUT:-}" ] && { echo "deployment=$dep"; echo "pr=$1"; echo "sha=$2"; } >> "$GITHUB_OUTPUT"
  return 0
}

deploy() { # head-sha image
  local sha=$1 tarball=$2 built=${3:-} pr pull org head_repo labels gate host override id st ssha shost
  pull=$(gh api "repos/$REPO/commits/$sha/pulls" --jq '[.[] | select(.state == "open" and .base.ref == "dev")][0] // empty')
  # Fork commits aren't linked to base-repo PRs; fall back to matching the head sha.
  [ -n "$pull" ] || pull=$(gh api --paginate "repos/$REPO/pulls?state=open&base=dev&per_page=100" \
    | jq -cs --arg s "$sha" 'flatten | map(select(.head.sha == $s))[0] // empty')
  [ -n "$pull" ] || { echo "No open PR into dev has head $sha (superseded or closed); nothing to do."; return 0; }
  pr=$(jq -r .number <<< "$pull"); head_repo=$(jq -r '.head.repo.full_name // ""' <<< "$pull")
  org=${head_repo%%/*}; labels=$(jq -c '[.labels[].name]' <<< "$pull")
  read -r id st ssha _ shost _ <<< "$(read_state "$pr")"; [ -n "$id" ] || id=-

  if ! read -r host override < <(backend "$pr"); then
    status "$sha" "Backend dependency" failure "Backend URL must look like https://api.<name>.groups.zedu.chat"
    status "$sha" Preview failure "Invalid Backend URL in the PR description"
    write_state "$pr" error "$sha" - - - "Not built: the \`Backend URL:\` line must look like \`https://api.<name>.groups.zedu.chat\`." "$id"
    return 0
  fi
  if [ "$override" = true ]; then
    status "$sha" "Backend dependency" failure "Depends on backend preview $host. Merge after it's on dev, then delete the Backend URL line."
  else
    status "$sha" "Backend dependency" success "Uses the dev backend"
  fi

  if [ "$head_repo" = "$REPO" ]; then gate=reviewer
  elif grep -v '^#' .github/preview-orgs | grep -qixF "$org"; then gate=registered
  elif jq -e 'index("preview") != null' <<< "$labels" >/dev/null; then gate=label
  else gate=skip; fi
  if [ "$gate" = skip ]; then
    [ "$st" = skipped ] || write_state "$pr" skipped "$sha" - - - "No preview: \`$org\` isn't a registered team org. A reviewer can add the \`preview\` label." "$id"
    return 0
  fi
  # The body was edited after this build started; that edit triggered a newer build.
  if [ -n "$built" ] && [ "$built" != "$host" ]; then
    echo "PR #$pr: image built for $built but the PR now asks for $host; a newer build will deploy."; return 0
  fi
  if [ "$tarball" = - ] || [ ! -s "$tarball" ]; then
    echo "::warning::PR #$pr passed the gate but the build produced no image."; return 0
  fi
  # Same commit and backend already live: nothing to do. An expired or evicted preview isn't
  # active, so a push or the `preview` label (both trigger a build) redeploys it.
  if [ "$st" = active ] && [ "$ssha" = "$sha" ] && [ "$shost" = "$host" ]; then
    echo "PR #$pr: preview already running for ${sha:0:7} against $host."; return 0
  fi

  local tag="pr-$pr-${sha:0:7}"
  if dry; then echo "  [dry-run] docker push $IMAGE:$tag" >&2
  else
    local loaded; loaded=$(gunzip -c "$tarball" | docker load | sed -n 's/^Loaded image: //p' | tail -1)
    [ -n "$loaded" ] || { echo "::error::Artifact holds no image."; return 1; }
    docker tag "$loaded" "$IMAGE:$tag"
    docker push -q "$IMAGE:$tag" >/dev/null
  fi

  # Cap: this PR's own slot is reused; otherwise evict the oldest. A failed delete frees nothing.
  local running; running=$(active_previews | awk -v p="$pr" '$2 != p' | wc -l | tr -d ' ')
  if (( running >= CAP )); then
    local oldest; oldest=$(active_previews | awk -v p="$pr" '$2 != p { print $2; exit }')
    [ -n "$oldest" ] && remove "$oldest" evicted "Stopped to free a slot (cap: $CAP). Push a commit or ask a reviewer for the \`preview\` label to bring it back." \
      && running=$(( running - 1 ))
  fi
  if (( running >= CAP )); then
    status "$sha" Preview pending "Queued: all $CAP preview slots are in use"
    write_state "$pr" queued "$sha" "$tag" "$host" - "Queued: all $CAP preview slots are in use. It deploys automatically when one frees up." "$id"
    return 0
  fi
  deploy_tag "$pr" "$sha" "$tag" "$host" "$id"
}

watch() { # pr sha deployment-uuid
  local s="" i
  for (( i = 0; i < 60; i++ )); do
    s=$(coolify GET "/deployments/$3" | jq -r '.status // empty')
    case "$s" in finished|failed|cancelled*) break ;; esac
    dry && break; sleep 15
  done
  case "$s" in
    finished) status "$2" Preview success "Preview is live" "$(url "$1")" ;;
    failed|cancelled*) status "$2" Preview failure "Coolify deployment $s; see the Coolify logs" ;;
    *) status "$2" Preview pending "Still deploying; the next sweep updates this" ;;
  esac
}

close() { # pr
  remove "$1" removed "Removed: PR closed." || true
  dry && return 0
  local ids
  ids=$(gh api --paginate "orgs/$OWNER/packages/container/zedu-fe-preview/versions?per_page=100" 2>/dev/null \
    | jq -rs --arg p "pr-$1-" 'flatten | .[] | select(any(.metadata.container.tags[]?; startswith($p))) | .id' || true)
  for v in $ids; do
    gh api -X DELETE "orgs/$OWNER/packages/container/zedu-fe-preview/versions/$v" >/dev/null 2>&1 \
      || echo "::warning::Couldn't delete image version $v for PR #$1."
  done
}

sweep() {
  local n id st sha tag host dep at s
  for n in $(gh api --paginate "repos/$REPO/pulls?state=open&base=dev&sort=created&direction=asc&per_page=100" --jq '.[].number'); do
    read -r id st sha tag host dep at <<< "$(read_state "$n")"
    case "$st" in
      active)
        if (( NOW - at > TTL_H * 3600 )); then
          remove "$n" expired "Expired after ${TTL_H}h without a push. Push a commit or ask a reviewer for the \`preview\` label to bring it back." || true
        elif [ "$dep" != - ]; then
          # Settle deployments the watch job didn't see finish.
          s=$(coolify GET "/deployments/$dep" | jq -r '.status // empty' 2>/dev/null || true)
          case "$s" in
            finished) status "$sha" Preview success "Preview is live" "$(url "$n")"
                      write_state "$n" active "$sha" "$tag" "$host" - "$(url "$n") serves ${sha:0:7} against \`$host\`. It's removed when the PR closes, or after ${TTL_H}h without a push." "$id" ;;
            failed|cancelled*) status "$sha" Preview failure "Coolify deployment $s; see the Coolify logs" ;;
          esac
        fi ;;
      queued)
        if (( $(active_previews | wc -l) < CAP )); then deploy_tag "$n" "$sha" "$tag" "$host" "$id" || true; fi ;;
    esac
  done
}

case "${1:-}" in
  deploy) deploy "${2:?head sha}" "${3:--}" "${4:-}" ;;
  watch) watch "${2:?pr}" "${3:?sha}" "${4:?deployment}" ;;
  close) [[ "${2:-}" =~ ^[0-9]+$ ]] || { echo "Usage: $0 close <pr>" >&2; exit 1; }; close "$2" ;;
  sweep) sweep ;;
  *) echo "Usage: $0 deploy <sha> <image> | watch <pr> <sha> <deployment> | close <pr> | sweep" >&2; exit 1 ;;
esac
