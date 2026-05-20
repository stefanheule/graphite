#!/bin/bash
# Clear the baked config/N directory on the server so the next settings open
# re-pulls HTML/JS from GitHub. Intended to be run via `make deploy_config_online`
# after `scripts/push_config.sh`; running this script alone does not push branches.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "IMPORTANT: Make sure you updated the config branch and pushed to github, otherwise this might not do anything."

version=$(grep -oE "stefanheule\.com/graphite/config/[0-9]+" src/pkjs/index.js | head -1 | grep -oE "[0-9]+$")
if [ -z "$version" ]; then
  echo "error: could not detect config_version from src/pkjs/index.js" >&2
  exit 1
fi

echo "Detected config version $version..."
echo "Resetting config $version on server."
ssh linode "sudo rm -rf /home/stefan/www/pages/common/data/graphite/config/$version"
echo "Done :)"
