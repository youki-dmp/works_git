#!/bin/bash

# Configuration
OUTPUT_BASE="/Users/kato/clawd/projects/yukkuri-remotion/FINAL_VIDEOS"
VIDEO_DIR="/Users/kato/clawd/projects/yukkuri-remotion/video"

# Region to render (first argument)
REGION=$1

if [ -z "$REGION" ]; then
    echo "Usage: bash render_by_region.sh <region_id>"
    echo "Example: bash render_by_region.sh kansai"
    exit 1
fi

mkdir -p "$OUTPUT_BASE/$REGION"
mkdir -p "$OUTPUT_BASE/$REGION/thumbnails"

# Get prefectures from region_metadata.json (using python to parse)
PREFS=$(python3 -c "import json; d=json.load(open('projects/yukkuri-remotion/region_metadata.json')); print(' '.join(d['$REGION']['prefectures']))")

cd "$VIDEO_DIR"

for PREF in $PREFS; do
    echo "--- Rendering $PREF V3 (Movement Enhanced) ---"
    
    # Horizontal
    if [ ! -f "$OUTPUT_BASE/$REGION/${PREF}_horizontal.mp4" ]; then
        npx remotion render "$PREF-V3-Horizontal" "$OUTPUT_BASE/$REGION/${PREF}_horizontal.mp4" --concurrency 8 --quiet --overwrite
    fi
    
    # Vertical
    if [ ! -f "$OUTPUT_BASE/$REGION/${PREF}_vertical.mp4" ]; then
        npx remotion render "$PREF-V3-Vertical" "$OUTPUT_BASE/$REGION/${PREF}_vertical.mp4" --concurrency 8 --quiet --overwrite
    fi

    # Thumbnail
    if [ ! -f "$OUTPUT_BASE/$REGION/thumbnails/${PREF}_thumb.png" ]; then
        npx remotion still "$PREF-Thumbnail" "$OUTPUT_BASE/$REGION/thumbnails/${PREF}_thumb.png" --overwrite --quiet
    fi
done

echo "Rendering for $REGION complete!"
