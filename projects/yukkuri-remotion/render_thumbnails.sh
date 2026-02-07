#!/bin/bash

# Configuration
OUTPUT_BASE="/Users/kato/clawd/projects/yukkuri-remotion/FINAL_VIDEOS"

# All prefectures currently in V3
PREFECTURES=(
    "aomori" "iwate" "miyagi" "akita" "yamagata" "fukushima"
    "niigata" "toyama" "ishikawa" "fukui" "yamanashi" "nagano" "gifu" "shizuoka" "aichi"
)

cd /Users/kato/clawd/projects/yukkuri-remotion/video

for PREF in "${PREFECTURES[@]}"; do
    # Determine region directory
    if [[ "aomori iwate miyagi akita yamagata fukushima" =~ "$PREF" ]]; then
        REGION="tohoku"
    else
        REGION="chubu"
    fi

    mkdir -p "$OUTPUT_BASE/$REGION/thumbnails"
    echo "--- Generating Thumbnail for $PREF ---"
    npx remotion still "$PREF-Thumbnail" "$OUTPUT_BASE/$REGION/thumbnails/${PREF}_thumb.png" --overwrite --quiet
done

echo "All thumbnails generated!"
