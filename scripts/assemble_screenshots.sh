#!/bin/bash

# assemble the screenshots for the readme

set -e

for platform in $SUPPORTED_PLATFORMS; do

  watch_width=144
  watch_height=168

  n=11
  hspace=80
  vspace=10
  width=$(((n-1)*hspace+watch_width))
  height=$((5*vspace+watch_height))

  convert -size ${width}x${height} xc:white tmp.png
  for i in `seq 11 -1 6`; do
    x=$(((i-1)*hspace))
    y=$(((11-i)*vspace))
    composite -compose atop -geometry +$x+$y screenshots/$platform/graphite-color-$i.png tmp.png tmp.png
  done
  for i in `seq 1 6`; do
    x=$(((i-1)*hspace))
    y=$(((i-1)*vspace))
    composite -compose atop -geometry +$x+$y screenshots/$platform/graphite-color-$i.png tmp.png tmp.png
  done
  mv tmp.png screenshots/$platform/colors.png
done

for platform in $SUPPORTED_PLATFORMS; do
  for f in screenshots/$platform/*.png; do
    pngcrush -rem time $f tmp.png &> /dev/null
    mv tmp.png $f
  done
done
