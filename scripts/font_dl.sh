#!/bin/bash
# Fetch the icon font from fontello.com and refresh resources/fonts/fasubset.{svg,ttf}.
#
# This replaces the old `fontello-cli install` flow, which pulls in an ancient
# `natives` package that aborts on Node >= 12 with
# "Assertion failed: args[1]->IsString()".  We talk to fontello's HTTP API
# directly with curl + unzip instead, so the only runtime dependencies are
# curl and unzip (both pre-installed on every dev machine we care about).
#
# After this finishes, run `make font_build` to compile the new SVG into
# resources/fasubset.ffont for the watchface.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

config="resources/fonts/fontello-config.json"
fonts_dir="resources/fonts"
api="https://fontello.com"

if [ ! -f "$config" ]; then
  echo "error: $config not found" >&2
  exit 1
fi

for cmd in curl unzip; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: '$cmd' is required but not installed" >&2
    exit 1
  fi
done

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

echo "==> Uploading $config to $api"
session=$(curl -fsS -X POST -F "config=@${config};type=application/json" "$api/")
if [ -z "$session" ]; then
  echo "error: empty session id from fontello (network issue or rejected config?)" >&2
  exit 1
fi
echo "    session: $session"

echo "==> Downloading font bundle"
curl -fsSL -o "$tmp/fontello.zip" "$api/$session/get"

echo "==> Extracting"
unzip -q "$tmp/fontello.zip" -d "$tmp/extracted"
subdir=$(find "$tmp/extracted" -maxdepth 1 -mindepth 1 -type d | head -n 1)
if [ -z "$subdir" ] || [ ! -d "$subdir/font" ]; then
  echo "error: unexpected zip layout under $tmp/extracted" >&2
  ls -la "$tmp/extracted" >&2 || true
  exit 1
fi

echo "==> Updating $fonts_dir/fasubset.{svg,ttf}"
cp "$subdir/font/fasubset.svg" "$fonts_dir/fasubset.svg"
cp "$subdir/font/fasubset.ttf" "$fonts_dir/fasubset.ttf"

echo "==> Done. Now run: make font_build"
