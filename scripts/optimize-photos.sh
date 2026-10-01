#!/usr/bin/env bash
# Converts the generated source photos (kept outside the repo) into the WebP
# assets shipped with the app: a large variant for heroes and galleries, a
# small one for list rows and cards.
set -euo pipefail

src="${1:?usage: scripts/optimize-photos.sh <source-dir>}"
out="$(dirname "$0")/../assets/images/stores"
mkdir -p "$out"

for file in "$src"/*.png; do
  name="$(basename "$file" .png)"
  name="${name#[0-9][0-9]-}"
  width="$(sips -g pixelWidth "$file" | awk '/pixelWidth/ { print $2 }')"
  large=$(( width < 1200 ? width : 1200 ))
  cwebp -quiet -q 72 -resize "$large" 0 "$file" -o "$out/$name.webp"
  cwebp -quiet -q 70 -resize 480 0 "$file" -o "$out/$name-thumb.webp"
done
