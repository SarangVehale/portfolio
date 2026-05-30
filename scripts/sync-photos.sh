#!/usr/bin/env bash
#
# sync-photos.sh — run the photo sync locally, then push.
#
# Replaces the old GitHub Actions photo-sync workflow. Run this whenever
# you add or remove images in photos/, before you push.
#
#   ./scripts/sync-photos.sh                 # sync + stage, then you commit/push
#   ./scripts/sync-photos.sh "photos: trek"  # sync + commit + push in one go
#
# It rewrites the photo: block in content.md to match photos/, preserving
# any focal positions you've hand-tuned.

set -euo pipefail

# Always operate from the repo root, regardless of where you call this from.
cd "$(dirname "$0")/.."

python3 scripts/sync-photos.py
# Also rebuild manifest.json so local dev sees the same file list the
# deployed site will see. (Ignored by git; deploy.yml regenerates it.)
python3 scripts/build-manifest.py

# Detect any change in content.md or anywhere under photos/ (working
# tree, staged, untracked). Previous version checked --cached without
# staging first, so brand-new photos were missed and the script lied
# "nothing changed".
if [ -z "$(git status --porcelain -- content.md photos)" ]; then
  echo "Nothing changed — nothing to push."
  exit 0
fi

git add content.md photos

if [ "$#" -ge 1 ]; then
  git commit -m "$1"
  git push
  echo "Committed and pushed."
else
  echo
  echo "Staged content.md + photos/. Review, then:"
  echo "  git commit -m \"photos: update\" && git push"
fi
