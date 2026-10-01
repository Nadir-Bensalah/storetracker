#!/usr/bin/env bash
# Converts the generated source photos (kept outside the repo, see
# assets/README.md) into the WebP files shipped with the app: a large variant
# for the detail gallery and a 480 px one for lists and cards.
#   scripts/optimize-photos.sh <source-dir>
set -euo pipefail

src="${1:?usage: scripts/optimize-photos.sh <source-dir>}"
assets="$(dirname "$0")/../assets/images"
mkdir -p "$assets/stores"

for file in "$src"/*.png; do
  name="$(basename "$file" .png)"
  name="${name#[0-9][0-9]-}"                                            # drop the "01-" ordering prefix
  [[ "$name" == interieur-* ]] && name="${name#interieur-}-interior"    # interieur-fauvel -> fauvel-interior
  width="$(sips -g pixelWidth "$file" | awk '/pixelWidth/ { print $2 }')"
  large=$(( width < 1200 ? width : 1200 ))

  if [[ "$name" == onboarding-* ]]; then
    cwebp -quiet -q 72 -resize "$large" 0 "$file" -o "$assets/$name.webp"
    continue
  fi
  cwebp -quiet -q 72 -resize "$large" 0 "$file" -o "$assets/stores/$name.webp"
  cwebp -quiet -q 70 -resize 480 0 "$file" -o "$assets/stores/$name-thumb.webp"
done
