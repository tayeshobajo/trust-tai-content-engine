#!/usr/bin/env bash
# stitch-film.sh — Download clips + narration from Supabase Storage and produce a final film
# Usage: ./scripts/stitch-film.sh <production-id> [--narrated] [output-path]
set -euo pipefail

PRODUCTION_ID="${1:?Usage: stitch-film.sh <production-id> [--narrated] [output-path]}"
NARRATED=false
OUTPUT_PATH=""

shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --narrated) NARRATED=true; shift ;;
    *) OUTPUT_PATH="$1"; shift ;;
  esac
done

if [ -z "$OUTPUT_PATH" ]; then
  if $NARRATED; then
    OUTPUT_PATH="public/rendered-videos/$PRODUCTION_ID/full-film-narrated.mp4"
  else
    OUTPUT_PATH="public/rendered-videos/$PRODUCTION_ID/full-film.mp4"
  fi
fi

STORAGE_BASE="https://kjznbpsvffiysavovgfo.supabase.co/storage/v1/object/public/rendered-videos"
TMP_DIR=$(mktemp -d)
CONCAT_FILE="$TMP_DIR/concat.txt"

trap 'rm -rf "$TMP_DIR"' EXIT

echo "=== Stitching film for $PRODUCTION_ID (narrated: $NARRATED) ==="

SHOTS_FOUND=0
for i in $(seq 1 20); do
  VIDEO_URL="$STORAGE_BASE/$PRODUCTION_ID/shot-$i.mp4"
  VIDEO_FILE="$TMP_DIR/shot-$i.mp4"

  HTTP_CODE=$(curl -s -o "$VIDEO_FILE" -w "%{http_code}" --connect-timeout 10 --max-time 60 "$VIDEO_URL")

  if [ "$HTTP_CODE" = "200" ] && [ -s "$VIDEO_FILE" ]; then
    SHOTS_FOUND=$((SHOTS_FOUND + 1))

    if $NARRATED; then
      AUDIO_URL="$STORAGE_BASE/$PRODUCTION_ID/narration-$i.mp3"
      AUDIO_FILE="$TMP_DIR/narration-$i.mp3"
      MIXED_FILE="$TMP_DIR/shot-$i-mixed.mp4"

      AUDIO_CODE=$(curl -s -o "$AUDIO_FILE" -w "%{http_code}" --connect-timeout 10 --max-time 30 "$AUDIO_URL")

      if [ "$AUDIO_CODE" = "200" ] && [ -s "$AUDIO_FILE" ]; then
        ffmpeg -y -i "$VIDEO_FILE" -i "$AUDIO_FILE" \
          -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k \
          -shortest -af "apad=whole_dur=5" "$MIXED_FILE" 2>/dev/null
        echo "  ✓ shot-$i (video + narration)"
        echo "file '$TMP_DIR/shot-$i-mixed.mp4'" >> "$CONCAT_FILE"
      else
        echo "  ✓ shot-$i (video only — no narration found)"
        echo "file '$TMP_DIR/shot-$i.mp4'" >> "$CONCAT_FILE"
      fi
    else
      SIZE=$(du -h "$VIDEO_FILE" | cut -f1)
      echo "  ✓ shot-$i ($SIZE)"
      echo "file '$TMP_DIR/shot-$i.mp4'" >> "$CONCAT_FILE"
    fi
  else
    rm -f "$VIDEO_FILE"
    [ "$SHOTS_FOUND" -gt 0 ] && break
  fi
done

[ "$SHOTS_FOUND" -eq 0 ] && { echo "ERROR: No clips found"; exit 1; }

echo ""
echo "=== Concatenating $SHOTS_FOUND clips ==="
mkdir -p "$(dirname "$OUTPUT_PATH")"
ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$OUTPUT_PATH" 2>&1 | tail -2

DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT_PATH" 2>/dev/null || echo "?")
SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
echo ""
echo "=== Done ==="
echo "Output: $OUTPUT_PATH"
echo "Duration: ${DUR}s | Size: $SIZE | Clips: $SHOTS_FOUND"
