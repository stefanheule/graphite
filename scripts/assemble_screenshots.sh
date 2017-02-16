#!/bin/bash

# assemble the screenshots for the readme

set -e

function optpng {
  png=$1
  pngcrush -rem time $png tmp.png &> /dev/null
  mv tmp.png $png
}

convert screenshots/basalt/graphite-1.png -resize 21x25 resources/menu_icon.png
convert resources/menu_icon.png -background transparent -gravity center -extent 25x25 resources/menu_icon.png
optpng resources/menu_icon.png

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
    optpng $f
  done
done
