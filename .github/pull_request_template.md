## Ticket

<!-- Link the approved ClickUp/Linear ticket. -->

- **Ticket ID:** <!-- e.g. CHAT-142 -->
- **Ticket title:**

## Team lead

<!-- @handle of your team lead. They review and approve before Zedu reviewers pick this up. -->

@

## What changed

<!-- Short summary of the change. -->

## Why

<!-- The problem or reason this ticket exists. -->

## How to test

<!-- Numbered steps a reviewer can follow to verify the change themselves. -->

1.

## What to expect

<!-- The expected behaviour after following the steps above. -->

## Test evidence

<!-- The Fork build check reports the build result automatically. Say which backend you tested against,
     and whether tests were added or updated for what this ticket changed (and why not, if not). -->

- Tested against:
- Tests:

## Mandatory checks

- [ ] **Atomic:** exactly one ticket, max ~1 day of work (≤400 lines). Larger needs a `size-override` label from a reviewer.
- [ ] **Feature flag:** new routes and large features sit behind a `NEXT_PUBLIC_FF_*` flag, default `OFF`.
  - Flag name: `____________` (write `N/A` for small UI tweaks)
- [ ] **Database / API contract:** schema changes follow Expand-Contract — no destructive drops or renames.
- [ ] **Preview:** I verified the change in the fork build (and my team's preview link, if we deploy one).
- [ ] **Protected files:** I did not change `.github/`, `AGENTS.md`, `CONTRIBUTING.md` or tooling config without reviewer agreement.

## Screenshots / recording

<!-- Required for visible or interactive changes. Otherwise write "N/A, non-visual change". -->

## AI usage

<!-- One line on how AI was used, if significant (see CONTRIBUTING.md, "AI usage"). -->

## Checklist

- [ ] Linked to an approved ticket
- [ ] Only intended files changed
- [ ] No secrets or debug code committed
- [ ] Tests added/updated for what this ticket changed (not retroactive coverage of unrelated code)
- [ ] Fork build triggered (first run: fork → Actions → PR build → Run workflow)
- [ ] Team lead approved this PR
- [ ] Self-reviewed (`git status` / `git diff`)
