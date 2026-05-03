#!/bin/bash
# Sync the config-N branch with the current branch and refresh the server
# cache. N is the config_version baked into src/pkjs/index.js.
#
# Use this for config-only updates that don't require shipping a new .pbw.
# For changes that DO require a new release (new CONFIG keys, changed wire
# format, changed source-ID meaning, etc.), use `make config_new_version`
# to create a config-(N+1) branch and rebuild the watchface instead.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree is not clean. commit or stash before running." >&2
  git status --short >&2
  exit 1
fi

source_branch=$(git rev-parse --abbrev-ref HEAD)
version=$(grep -oE "stefanheule\.com/graphite/config/[0-9]+" src/pkjs/index.js | head -1 | grep -oE "[0-9]+$")
if [ -z "$version" ]; then
  echo "error: could not detect config_version from src/pkjs/index.js" >&2
  exit 1
fi
target_branch="config-$version"

echo "==> Source branch:  $source_branch"
echo "==> Target branch:  $target_branch"
echo "==> Config version: $version"
echo

# 1. Push the source branch first so origin has the latest commits.
echo "==> Pushing $source_branch"
git push origin "$source_branch"
echo

# 2. Make sure local target_branch exists and is up to date with origin.
if git show-ref --verify --quiet "refs/heads/$target_branch"; then
  git fetch origin "$target_branch"
elif git ls-remote --exit-code --heads origin "$target_branch" >/dev/null 2>&1; then
  echo "==> Local $target_branch missing; creating from origin/$target_branch"
  git fetch origin "$target_branch:$target_branch"
else
  echo "error: $target_branch does not exist locally or on origin." >&2
  echo "       run 'make config_new_version' first to create it." >&2
  exit 1
fi

# 3. Fast-forward target_branch onto source_branch.
# Trap restores us to the source branch even if the merge or push fails.
trap 'git checkout "$source_branch" >/dev/null 2>&1 || true' EXIT
echo "==> Fast-forwarding $target_branch onto $source_branch"
git checkout "$target_branch"
if ! git merge --ff-only "$source_branch"; then
  echo "error: $target_branch has diverged from $source_branch and cannot be" >&2
  echo "       fast-forwarded. resolve manually with a real merge." >&2
  exit 1
fi
echo

# 4. Push the updated target branch.
echo "==> Pushing $target_branch"
git push origin "$target_branch"
echo

# 5. Hop back to source branch (also handled by trap on error).
git checkout "$source_branch"
trap - EXIT

# 6. Clear the server's cached copy so the next request re-pulls.
echo
echo "==> Clearing server cache"
./scripts/updated_config.sh

echo
echo "==> Done. Users will see the updated config on next settings open."
