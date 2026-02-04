#!/bin/bash

# Configuration
OUTPUT_DIR="/Users/kato/clawd/projects/yukkuri-remotion/FINAL_VIDEOS"
mkdir -p "$OUTPUT_DIR/chubu"
mkdir -p "$OUTPUT_DIR/tohoku"

# Prefectures to render
PREFECTURES=(
    "niigata" "toyama" "ishikawa" "fukui" "yamanashi" "nagano" "gifu" "shizuoka" "aichi"
)

cd /Users/kato/clawd/projects/yukkuri-remotion/video

for PREF in "${PREFECTURES[@]}"; do
    echo "--- Rendering $PREF V3 ---"
    
    # Horizontal
    if [ ! -f "$OUTPUT_DIR/chubu/${PREF}_horizontal.mp4" ]; then
        npx remotion render "$PREF-V3-Horizontal" "$OUTPUT_DIR/chubu/${PREF}_horizontal.mp4" --concurrency 8 --quiet --overwrite
    fi
    
    # Vertical
    if [ ! -f "$OUTPUT_DIR/chubu/${PREF}_vertical.mp4" ]; then
        npx remotion render "$PREF-V3-Vertical" "$OUTPUT_DIR/chubu/${PREF}_vertical.mp4" --concurrency 8 --quiet --overwrite
    fi
done

echo "Chubu V3 rendering complete!"
