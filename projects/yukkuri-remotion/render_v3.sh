#!/bin/bash

# Configuration
OUTPUT_DIR="../renders/v3"
mkdir -p "$OUTPUT_DIR"

PREFECTURES=(
    "aomori" "iwate" "miyagi" "akita" "yamagata" "fukushima"
    "niigata" "toyama" "ishikawa" "fukui" "yamanashi" "nagano" "gifu" "shizuoka" "aichi"
)

cd projects/yukkuri-remotion/video

for PREF in "${PREFECTURES[@]}"; do
    if [ -d "public/audio/v3/$PREF" ]; then
        echo "--- Rendering $PREF V3 ---"
        
        # Horizontal
        if [ ! -f "../../renders/v3/${PREF}_horizontal.mp4" ]; then
            npx remotion render "$PREF-V3-Horizontal" "../../renders/v3/${PREF}_horizontal.mp4" --concurrency 8 --quiet --overwrite
        fi
        
        # Vertical
        if [ ! -f "../../renders/v3/${PREF}_vertical.mp4" ]; then
            npx remotion render "$PREF-V3-Vertical" "../../renders/v3/${PREF}_vertical.mp4" --concurrency 8 --quiet --overwrite
        fi
    fi
done

echo "Tohoku & Chubu V3 rendering complete!"
