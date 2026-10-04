# Bootcamp setup and release runbook

How the internship workflow is wired: the repositories and branches, the one-time settings in the
`zedu-hng` review org and in each team fork, and how work is promoted to `zeduchat`. For the day-to-day
contributor view see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

One ticket = one branch = one PR = one squash commit. A team lead approves first, a reviewer merges,
and reviewers promote to the in-house team on a cadence.

## 1. Repositories and branches

| Where                              | Branch                      | Purpose                                                                         | Who changes it           |
| ---------------------------------- | --------------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| `zeduchat/<repo>` (main org)       | `main`                      | Production                                                                      | In-house team            |
|                                    | `staging`                   | Pre-production                                                                  | In-house team            |
| `zedu-hng/<repo>` (reviewers' org) | `dev`                       | Approved work from all teams. Target of every intern PR.                        | Reviewers (squash merge) |
|                                    | `central-staging`           | Release candidate, tested on central staging.                                   | Reviewers (merge commit) |
| Team fork (about 20 teams)         | `dev`                       | Mirror of `zedu-hng:dev`. The team server deploys from it. Nobody commits here. | Team lead syncs it       |
|                                    | `<type>/<ticket-id>-<desc>` | One ticket of work                                                              | The intern               |

`zedu-hng` repos carry `IS_BOOTCAMP=true`; team forks carry `FORK_BUILD_ENABLED=true`. The main org has
neither, so the bootcamp workflows copied there stay inert.

## 2. Reviewers org (`zedu-hng`) — one-time settings

### Variables (Settings → Secrets and variables → Actions → Variables)

- `IS_BOOTCAMP` = `true` — activates the bootcamp workflows. Absent in `zeduchat`, so they stay inert.

### Team

- A **visible** `reviewers` team with **Write** access to every repo.
- Its members are the reviewers. `/claim` authorization uses repo write access, so leads with write
  can also claim.

### Ruleset on `dev`

- Require a pull request before merging.
- Require **1** approval; dismiss stale reviews on push; require approval of the last push; require
  review-thread resolution.
- Allow **squash and merge commits**. Intern PRs are squashed; `sync` PRs use a merge commit so the
  upstream SHAs are preserved.
- Do **not** require branches to be up to date, and do **not** require linear history.
- Required status checks: `Branch name`, `Single author`, `Protected files`, `Size`, `PR title`,
  `PR template`, `Lead approved`, `Fork build`, plus the shared CI (`Validate commit messages`,
  `Structure, reuse, URLs, and secrets`, `File policy`, `Gitleaks secret scan`, `Semgrep SAST`,
  `ClamAV signature scan`, `JS and script malware heuristics`).

### Ruleset on `central-staging`

- Allow **merge commits only**, reviewers push, no force pushes.

### Labels

`sync`, `hotfix`, `size-override`, `config-change-approved`, `ready-for-review`, `queued`,
`escalated-review`, and later `db-change`.

### `teams.yml` (`.github/teams.yml`, protected)

Team name → `leads` and `members`. A PR author must be listed under a team, otherwise routing can't
find a lead. Reviewers are not listed: they are notified when a PR is ready and claim it themselves.

## 3. Team fork — one-time setup (team lead)

### Variables

- `FORK_BUILD_ENABLED` = `true` — turns on the fork build.
- `REVIEW_REPO` = `zedu-hng/<repo>` — where the fork looks for the open PR.
- `APP_ENV_FILE` — the **non-sensitive** values the build needs, one `KEY=value` per line (for example
  `NEXT_PUBLIC_API_URL=https://scratch-api.zedu.chat`). CI writes them to `.env` before building.
  Anything sensitive (tokens, certificates) must be a **secret**, never a variable: variables print in
  the build logs.

### Secrets (preview-only, scratch backend — never anything that touches live data)

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — deploy the fork's FE preview. The deployed
  preview uses the **Vercel project's** env; set the same values there.

### Branch protection

- Protect the fork's `dev`: require a pull request, restrict direct pushes to admins. This keeps the
  mirror clean for **Sync fork**.

### Rollback

- Tag the current `dev` as `stable-pre-cohort` and move the tag after every good sync. If a sync breaks
  the team server, deploy the tag instead of `dev`.

## 4. Interns — local setup

- Clone the team fork, `pnpm install` (installs the Husky hooks).
- Point your local `.env` at the team's scratch backend (same values as `APP_ENV_FILE`).
- No repo settings to change.

## 5. Sync and release

### Step 1 — absorb upstream (`zeduchat:main` → `zedu-hng:dev`)

Open a PR in `zedu-hng` with base `dev` and head `zeduchat:main`, label it `sync`, merge with a
**merge commit**. This keeps `dev` at 0 commits behind and lets the two histories stay connected.

### Step 2 — promote (`zedu-hng:dev` → `zedu-hng:central-staging`)

Open a PR with base `central-staging` and head `dev`, label it `sync`, merge with a **merge commit**.
Test on central staging.

### Step 3 — release (`zedu-hng:central-staging` → `zeduchat:staging`)

Open a PR from `zedu-hng:central-staging` to `zeduchat:staging`, with the changelog as the description
(generated from the squash-commit titles since the last tag). The in-house team merges with a **merge
commit**, tests on `staging`, and promotes to `main`. Tag `central-staging` as `release-YYYY-MM-DD`
after the merge. Nothing is stripped: the bootcamp files travel with the code and do nothing outside
`zedu-hng`.

### Hotfix path

A reviewer opens a `hotfix/...` PR straight to `dev`, labels it `hotfix`, and fast-tracks it through
Steps 2 and 3. A `hotfix` PR skips only the lead-approval and size checks.

## 6. Reviewer queue

- When a PR is lead-approved and its Fork build passes, `reviewer-notify.yml` labels it
  `ready-for-review` and mentions `@zedu-hng/reviewers` once, while the PR's team has fewer than 3
  unclaimed PRs waiting. Beyond that it is labelled `queued`.
- A reviewer comments `/claim` to take a PR and `/release` to return it. A 15-minute sweep escalates a
  PR left unclaimed for 24h and releases a claim with no review after 24h.
- Reviewers read the diff, test the preview, then **squash merge** (or reject with a reason).

## 7. Workflow guards

| Workflow                 | Runs in    | Guard                               |
| ------------------------ | ---------- | ----------------------------------- |
| `pr-rules.yml`           | `zedu-hng` | `vars.IS_BOOTCAMP == 'true'`        |
| `lead-approval.yml`      | `zedu-hng` | `vars.IS_BOOTCAMP == 'true'`        |
| `team-routing.yml`       | `zedu-hng` | `vars.IS_BOOTCAMP == 'true'`        |
| `fork-build.yml` (relay) | `zedu-hng` | `vars.IS_BOOTCAMP == 'true'`        |
| `reviewer-notify.yml`    | `zedu-hng` | `vars.IS_BOOTCAMP == 'true'`        |
| `reviewer-claim.yml`     | `zedu-hng` | `vars.IS_BOOTCAMP == 'true'`        |
| `pr-build.yml`           | team forks | `vars.FORK_BUILD_ENABLED == 'true'` |
