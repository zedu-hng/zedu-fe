#!/usr/bin/env bash
# Coolify PR previews for zedu-hng/zedu-fe. Coolify clones pull/<N>/head, builds it in its own queue
# and serves it at PREVIEW_URL_TEMPLATE. This script only decides which PRs get a preview.
#
#   fe-preview.sh sweep         reconcile every open PR into dev
#   fe-preview.sh close <pr>    remove the preview of a closed PR
#
# Env: REPO, COOLIFY_URL, COOLIFY_TOKEN, COOLIFY_FE_APP (application uuid),
#      PREVIEW_URL_TEMPLATE (e.g. https://{pr}.hng.groups.zedu.chat), PREVIEW_CAP (default 10),
#      PREVIEW_TTL_HOURS (default 24), DRY_RUN=1 (print actions, call nothing).
#
# A PR wants a preview when Lead approval says "Approved by team lead" or it has the `preview` label.
# Unmapped teams pass Lead approval with a different description, so they never auto-deploy.
# State lives in one bot comment per PR: <!-- fe-preview state=active|expired|evicted|removed sha= at= -->
set -euo pipefail

: "${REPO:?}" "${COOLIFY_FE_APP:?}" "${PREVIEW_URL_TEMPLATE:?}"
CAP=${PREVIEW_CAP:-10}
TTL=$(( ${PREVIEW_TTL_HOURS:-24} * 3600 ))
NOW=$(date +%s)
MARK="<!-- fe-preview"

coolify() { # method path
  if [ -n "${DRY_RUN:-}" ]; then echo "  [dry-run] $1 $2" >&2; return 0; fi
  : "${COOLIFY_URL:?}" "${COOLIFY_TOKEN:?}"
  curl -fsS -m 60 -X "$1" -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Accept: application/json" \
    "${COOLIFY_URL%/}/api/v1$2"
}

preview_url() { echo "${PREVIEW_URL_TEMPLATE//\{pr\}/$1}"; }

# Prints "<comment id> <state> <sha> <at>" for the PR's state comment, or nothing.
read_state() {
  gh api --paginate "repos/$REPO/issues/$1/comments?per_page=100" \
    | jq -rs --arg m "$MARK" 'flatten | map(select(.user.login == "github-actions[bot]" and (.body | contains($m)))) | last // empty
      | "\(.id) " + (.body | capture("state=(?<s>[a-z]+) sha=(?<h>[0-9a-f]*) at=(?<t>[0-9]+)") | "\(.s) \(.h) \(.t)")'
}

write_state() { # pr state sha message [comment id]
  local body
  body=$(printf '%s state=%s sha=%s at=%s -->\n### Preview\n\n%s\n' "$MARK" "$2" "$3" "$NOW" "$4")
  if [ -n "${DRY_RUN:-}" ]; then echo "  [dry-run] PR #$1 state=$2: $4" >&2; return 0; fi
  if [ -n "${5:-}" ]; then
    gh api -X PATCH "repos/$REPO/issues/comments/$5" -f body="$body" >/dev/null
  else
    gh api "repos/$REPO/issues/$1/comments" -f body="$body" >/dev/null
  fi
}

deploy() { # pr sha comment-id
  echo "PR #$1: deploying ${2:0:7}"
  coolify GET "/deploy?uuid=$COOLIFY_FE_APP&pr=$1&force=false" >/dev/null
  write_state "$1" active "$2" "$(preview_url "$1") is building ${2:0:7} in Coolify's queue; ready in about 10 minutes. It uses the shared dev backend and is removed when the PR closes, or after ${PREVIEW_TTL_HOURS:-24}h without a push." "$3"
}

remove() { # pr state sha message comment-id
  echo "PR #$1: removing preview ($2)"
  coolify DELETE "/applications/$COOLIFY_FE_APP/previews/$1" >/dev/null \
    || echo "::warning::PR #$1: Coolify didn't delete the preview; remove it in the Coolify UI."
  write_state "$1" "$2" "$3" "$4" "$5"
}

wants_preview() { # sha labels-json
  jq -e 'index("preview") != null' <<< "$2" >/dev/null && return 0
  gh api "repos/$REPO/commits/$1/status" \
    | jq -e '[.statuses[] | select(.context == "Lead approval")][0].description // "" | startswith("Approved by team lead")' >/dev/null
}

sweep() {
  local -a deploys=() active=()
  local number sha labels state id st ssha at
  while IFS=$'\t' read -r number sha labels; do
    state=$(read_state "$number"); read -r id st ssha at <<< "${state:-- - - 0}"
    [ "$id" = - ] && id=""
    if ! wants_preview "$sha" "$labels"; then
      [ "$st" = active ] && remove "$number" removed "$ssha" "Preview removed: Lead approval is no longer green." "$id"
      continue
    fi
    if [ "$st" = active ] && [ "$ssha" = "$sha" ]; then
      if (( NOW - at > TTL )); then
        remove "$number" expired "$sha" "Preview expired after ${PREVIEW_TTL_HOURS:-24}h without a push. Push a commit or ask a reviewer for the \`preview\` label to bring it back." "$id"
      else
        active+=("$at $number")
      fi
    elif [ "$st" != active ] && [ "$ssha" = "$sha" ]; then
      : # expired, evicted or removed at this commit; a new push or the label brings it back
    else
      deploys+=("$number $sha $id")
    fi
  done < <(gh api --paginate "repos/$REPO/pulls?state=open&base=dev&sort=created&direction=asc&per_page=100" \
    --jq '.[] | select(.draft | not) | [.number, .head.sha, ([.labels[].name] | tojson)] | @tsv')

  # Cap running previews: evict the oldest active ones to make room, newest requests win.
  local running=${#active[@]} over=$(( ${#active[@]} + ${#deploys[@]} - CAP ))
  if (( over > 0 && running > 0 )); then
    while read -r _ number && (( over > 0 )); do
      state=$(read_state "$number"); read -r id st ssha at <<< "$state"
      remove "$number" evicted "$ssha" "Preview stopped to free a slot (cap: $CAP running). Push a commit or ask a reviewer for the \`preview\` label to bring it back." "$id"
      over=$(( over - 1 )); running=$(( running - 1 ))
    done < <(printf '%s\n' "${active[@]}" | sort -n)
  fi
  # Still more requests than slots: the rest wait (empty sha, so the next sweep retries them).
  local slots=$(( CAP - running )) d
  for d in ${deploys[@]+"${deploys[@]}"}; do
    read -r number sha id <<< "$d"
    if (( slots > 0 )); then
      deploy "$number" "$sha" "$id"; slots=$(( slots - 1 ))
    else
      write_state "$number" queued "" "Preview waiting for a free slot (cap: $CAP running). It deploys automatically on a later sweep." "$id"
    fi
  done
}

case "${1:-}" in
  sweep) sweep ;;
  close)
    [[ "${2:-}" =~ ^[0-9]+$ ]] || { echo "Usage: $0 close <pr>" >&2; exit 1; }
    state=$(read_state "$2"); read -r id st ssha at <<< "${state:-- - - 0}"
    [ "$st" = active ] && remove "$2" removed "$ssha" "Preview removed: PR closed." "$id"
    exit 0 ;;
  *) echo "Usage: $0 sweep | close <pr>" >&2; exit 1 ;;
esac
