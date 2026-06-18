#!/bin/bash

# Take a screenshot of the emulator (for all supported platforms)

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

function cleanup {
  echo "" > src/config.h
}
trap cleanup EXIT

function take_screenshot {
  pebble install --emulator "$2" &> /dev/null
  pebble screenshot --emulator "$2" "screenshots/$2/$1.png" &> /dev/null
}

pebble wipe
pebble kill

for platform in $SUPPORTED_PLATFORMS; do
  mkdir -p "screenshots/$platform"
  take_screenshot "$1" "$platform"
  pebble wipe
  pebble kill
done
