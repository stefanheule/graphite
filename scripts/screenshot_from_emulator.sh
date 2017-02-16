#!/bin/bash

# Take a screenshot of the emulator (for all supported platforms)

function take_screenshot {
  pebble install --emulator $2 &> /dev/null
  pebble screenshot --emulator $2 screenshots/$2/$1.png &> /dev/null
}

pebble wipe
pebble kill

for platform in $GRAPHITE_SUPPORTED_PLATFORMS; do
  (take_screenshot $1 $platform)
  pebble wipe
  pebble kill
done

echo "" > src/config.h
