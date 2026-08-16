#!/bin/bash
set -e
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
declare -A fonts=(
  [cormorant-300]="Cormorant+Garamond:ital,wght@0,300"
  [cormorant-400]="Cormorant+Garamond:ital,wght@0,400"
  [cormorant-500]="Cormorant+Garamond:ital,wght@0,500"
  [cormorant-600]="Cormorant+Garamond:ital,wght@0,600"
  [inter-400]="Inter:wght@400"
  [inter-500]="Inter:wght@500"
)
for name in "${!fonts[@]}"; do
  fam="${fonts[$name]}"
  css=$(curl -s -A "$USER_AGENT" "https://fonts.googleapis.com/css2?family=$fam&display=swap")
  woff=$(echo "$css" | grep -oE "https://fonts.gstatic.com/[^)]*\.woff2" | head -1)
  if [ -n "$woff" ]; then
    curl -s -A "$USER_AGENT" "$woff" -o "$name.woff2"
    echo "saved $name.woff2 ($(wc -c < $name.woff2) bytes)"
  else
    echo "NO WOFF for $name"
  fi
done
