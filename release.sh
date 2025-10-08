#!/usr/bin/env bash
set -euo pipefail

# Simple release helper: bump patch version, tag, and push
# Usage: ./release.sh [--dry-run]

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
fi

# Ensure we're in a git repo
git rev-parse --git-dir >/dev/null 2>&1 || { echo "Not a git repository" >&2; exit 1; }

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Ensure working tree is clean (unless dry-run)
if [ "$DRY_RUN" -eq 0 ] && [ -n "$(git status --porcelain)" ]; then
  echo "Working tree not clean. Commit or stash changes before running this script." >&2
  git status --porcelain
  exit 1
fi

# Find latest tag vX.Y.Z
LATEST_TAG=$(git describe --tags --match "v[0-9]*.[0-9]*.[0-9]*" --abbrev=0 2>/dev/null || true)
if [ -z "$LATEST_TAG" ]; then
  LATEST_TAG="v0.0.0"
fi

cur=${LATEST_TAG#v}
IFS='.' read -r MAJ MIN PATCH <<< "$cur"
PATCH=$((PATCH + 1))
NEW_TAG="v${MAJ}.${MIN}.${PATCH}"

echo "Current branch: $CURRENT_BRANCH"
echo "Latest tag: $LATEST_TAG"
echo "New tag: $NEW_TAG"

if git rev-parse "$NEW_TAG" >/dev/null 2>&1; then
  echo "Tag $NEW_TAG already exists" >&2
  exit 1
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo "+ git push origin $CURRENT_BRANCH"
  echo "+ git tag -a $NEW_TAG -m 'Release $NEW_TAG'"
  echo "+ git push origin $NEW_TAG"
  exit 0
fi

# Push branch and tag
git push origin "$CURRENT_BRANCH"
git tag -a "$NEW_TAG" -m "Release $NEW_TAG"
git push origin "$NEW_TAG"

echo "Tagged and pushed $NEW_TAG"
