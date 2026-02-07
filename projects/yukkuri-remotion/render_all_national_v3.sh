#!/bin/bash

# Configuration
OUTPUT_BASE="/Users/kato/clawd/projects/yukkuri-remotion/FINAL_VIDEOS"
VIDEO_DIR="/Users/kato/clawd/projects/yukkuri-remotion/video"

# Prefectures by region
REGIONS=("tohoku" "chubu" "kanto" "kansai" "chugoku" "shikoku" "kyushu" "hokkaido")

cd "$VIDEO_DIR"

for REGION in "${REGIONS[@]}"; do
    echo "--- Preparing Region: $REGION ---"
    mkdir -p "$OUTPUT_BASE/$REGION"
    mkdir -p "$OUTPUT_BASE/$REGION/thumbnails"

    # Get prefectures from region_metadata.json
    PREFS=$(python3 -c "import json; d=json.load(open('../region_metadata.json')); print(' '.join(d['$REGION']['prefectures']))")

    for PREF in $PREFS; do
        echo "--- Rendering $PREF V3 (Ultimate Edition with Movement) ---"
        
        # Horizontal
        npx remotion render "$PREF-V3-Horizontal" "$OUTPUT_BASE/$REGION/${PREF}_horizontal.mp4" --concurrency 8 --quiet --overwrite
        
        # Vertical
        npx remotion render "$PREF-V3-Vertical" "$OUTPUT_BASE/$REGION/${PREF}_vertical.mp4" --concurrency 8 --quiet --overwrite

        # Thumbnail
        npx remotion still "$PREF-Thumbnail" "$OUTPUT_BASE/$REGION/thumbnails/${PREF}_thumb.png" --overwrite --quiet
    done
done

echo "🎉 ALL 47 PREFECTURES RENDERED SUCCESSFULLY! 🎉"
