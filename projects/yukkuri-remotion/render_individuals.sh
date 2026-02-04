#!/bin/bash

# Configuration
PREFECTURES=("kanagawa" "saitama" "chiba" "ibaraki" "tochigi" "gunma")
OUTPUT_DIR=".."

cd projects/yukkuri-remotion/video

for PREF in "${PREFECTURES[@]}"; do
    echo "Rendering $PREF (Horizontal)..."
    npx remotion render "${PREF}-Horizontal" "$OUTPUT_DIR/${PREF}_horizontal.mp4" --concurrency 8 --overwrite
    
    echo "Rendering $PREF (Vertical)..."
    npx remotion render "${PREF}-Vertical" "$OUTPUT_DIR/${PREF}_vertical.mp4" --concurrency 8 --overwrite
done

echo "All individual prefectures rendered!"
