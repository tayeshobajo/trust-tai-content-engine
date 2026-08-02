#!/usr/bin/env bash
# stitch-film.sh — Download all clips from Supabase Storage and stitch into a single film
# Usage: ./scripts/stitch-film.sh <production-id> [output-path]
set -euo pipefail

PRODUCTION_ID="${1:?Usage: stitch-film.sh <production-id> [output-path]}"
OUTPUT_PATH="${2:-public/rendered-videos/$PRODUCTION_ID/full-film.mp4}"

STORAGE_BASE="https://kjznbpsvffiysavovgfo.supabase.co/storage/v1/object/public/rendered-videos"
TMP_DIR=$(mktemp -d)
CONCAT_FILE="$TMP_DIR/concat.txt"

trap 'rm -rf "$TMP_DIR"' EXIT

echo "=== Stitching film for $PRODUCTION_ID ==="
echo "Temp dir: $TMP_DIR"

# Discover all shot clips by trying 1-20 (practical max)
SHOTS_FOUND=0
for i in $(seq 1 20); do
  URL="$STORAGE_BASE/$PRODUCTION_ID/shot-$i.mp4"
  FILE="$TMP_DIR/shot-$i.mp4"
  
  HTTP_CODE=$(curl -s -o "$FILE" -w "%{http_code}" --connect-timeout 10 --max-time 60 "$URL")
  
  if [ "$HTTP_CODE" = "200" ] && [ -s "$FILE" ]; then
    SIZE=$(du -h "$FILE" | cut -f1)
    echo "  ✓ shot-$i.mp4 ($SIZE)"
    echo "file 'shot-$i.mp4'" >> "$CONCAT_FILE"
    SHOTS_FOUND=$((SHOTS_FOUND + 1))
  else
    rm -f "$FILE"
    if [ "$SHOTS_FOUND" -gt 0 ]; then
      echo "  — shot-$i not found, stopping (found $SHOTS_FOUND clips)"
      break
    fi
  fi
done

if [ "$SHOTS_FOUND" -eq 0 ]; then
  echo "ERROR: No clips found for $PRODUCTION_ID"
  exit 1
fi

echo ""
echo "=== Concatenating $SHOTS_FOUND clips ==="
mkdir -p "$(dirname "$OUTPUT_PATH")"

ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$OUTPUT_PATH" 2>&1 | tail -3

echo ""
echo "=== Done ==="
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT_PATH" 2>/dev/null || echo "?")
SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
echo "Output: $OUTPUT_PATH"
echo "Duration: ${DURATION}s"
echo "Size: $SIZE"
echo "Clips: $SHOTS_FOUND"
