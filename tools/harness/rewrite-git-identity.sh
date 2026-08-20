#!/usr/bin/env bash
#
# Rewrite every commit that carries the personal Naver address so the public
# repository stops publishing it.
#
#   WHY THIS IS NEEDED AT ALL
#   A commit's author email is not part of any file. It lives in commit
#   metadata, so no edit to the working tree removes it. On a public repo
#   GitHub serves it to anyone, forever, three ways: the commit page, the REST
#   API, and <commit-url>.patch. As of 2026-08-20 this repo had 64 commits
#   authored and committed as jasonml@naver.com, against 8 already using the
#   GitHub noreply address.
#
#   READ THIS BEFORE RUNNING
#   This rewrites every commit on every branch. Every SHA changes. That means:
#     * the remote will reject a normal push; it needs --force
#     * anyone who has cloned or forked keeps the old history
#     * any link to a specific commit SHA breaks, including in the README
#   It cannot be undone except from the backup this script makes first.
#
#   PUSH ACCESS
#   As of 2026-08-20 the authenticated gh account on this machine was
#   `gamesandlifeai`, while the repo belongs to `ji-hun-git`, and push returned
#   403. Resolve that first, or the rewrite leaves you with a local history you
#   cannot publish. Check with:  gh auth status && git push --dry-run
#
# Usage:
#   bash tools/harness/rewrite-git-identity.sh --dry-run   # show what changes
#   bash tools/harness/rewrite-git-identity.sh --run       # do it
#
set -euo pipefail

OLD_EMAIL="jasonml@naver.com"
NEW_EMAIL="90397147+ji-hun-git@users.noreply.github.com"
NEW_NAME="Jihun C"

cd "$(dirname "$0")/../.."
REPO="$(pwd)"
MODE="${1:---dry-run}"

echo "repo:      $REPO"
echo "rewriting: $OLD_EMAIL"
echo "        -> $NEW_NAME <$NEW_EMAIL>"
echo

AFFECTED=$(git log --all --format='%ae%n%ce' | grep -c "^${OLD_EMAIL}$" || true)
echo "commit records carrying the old address: $AFFECTED"

if [ "$AFFECTED" = "0" ]; then
  echo "Nothing to do."
  exit 0
fi

if [ "$MODE" = "--dry-run" ]; then
  echo
  echo "These commits would be rewritten:"
  git log --all --format='%h %ae %s' | grep " ${OLD_EMAIL} " | head -20
  echo "  ... (${AFFECTED} records total)"
  echo
  echo "Re-run with --run to apply. A backup bundle is written first."
  exit 0
fi

if [ "$MODE" != "--run" ]; then
  echo "Unknown mode: $MODE (expected --dry-run or --run)" >&2
  exit 2
fi

# ---- backup ---------------------------------------------------------------
STAMP=$(git log -1 --format=%h)
BACKUP="../jihun-site-backup-before-identity-rewrite-${STAMP}.bundle"
echo "writing backup bundle -> $BACKUP"
git bundle create "$BACKUP" --all
echo "restore with:  git clone $BACKUP restored-repo"
echo

# ---- rewrite --------------------------------------------------------------
# filter-branch is slow and deprecated but is always present; git-filter-repo
# is the modern tool (pip install git-filter-repo) and is preferred if you have
# it. Both produce the same result here.
if command -v git-filter-repo >/dev/null 2>&1; then
  echo "using git-filter-repo"
  git filter-repo --force --email-callback "
    return b'${NEW_EMAIL}' if email == b'${OLD_EMAIL}' else email
  " --name-callback "
    return b'${NEW_NAME}' if name == b'ji-hun-git' else name
  "
else
  echo "using git filter-branch (git-filter-repo not installed)"
  FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --env-filter "
    if [ \"\$GIT_AUTHOR_EMAIL\" = '${OLD_EMAIL}' ]; then
      export GIT_AUTHOR_EMAIL='${NEW_EMAIL}'
      export GIT_AUTHOR_NAME='${NEW_NAME}'
    fi
    if [ \"\$GIT_COMMITTER_EMAIL\" = '${OLD_EMAIL}' ]; then
      export GIT_COMMITTER_EMAIL='${NEW_EMAIL}'
      export GIT_COMMITTER_NAME='${NEW_NAME}'
    fi
  " --tag-name-filter cat -- --branches --tags
fi

echo
echo "remaining identities:"
git log --all --format='%an <%ae>' | sort | uniq -c | sort -rn

echo
cat <<'NEXT'
Done locally. Nothing has been published yet.

Next, in order:
  1. Confirm the history looks right:      git log --format='%h %an <%ae> %s' | head
  2. Confirm you can push at all:          git push --dry-run
  3. Publish the rewrite:                  git push --force --all && git push --force --tags
  4. On GitHub: Settings > Emails, tick "Keep my email addresses private" and
     "Block command line pushes that expose my email", so a global git config
     cannot reintroduce the address later.
  5. Re-run the harness:                   python tools/harness/static_checks.py
     The git-identity warning should be gone.

If step 3 fails with 403, the authenticated account does not have push rights
to ji-hun-git/ji-hun-git.github.io. Fix that before forcing anything.
NEXT
