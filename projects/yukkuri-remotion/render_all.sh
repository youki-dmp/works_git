#!/bin/bash

# Configuration
OUTPUT_DIR="projects/yukkuri-remotion/renders"
mkdir -p "$OUTPUT_DIR"

PREFECTURES=(
    "hokkaido" "aomori" "iwate" "miyagi" "akita" "yamagata" "fukushima"
    "ibaraki" "tochigi" "gunma" "saitama" "chiba" "tokyo" "kanagawa"
    "niigata" "toyama" "ishikawa" "fukui" "yamanashi" "nagano" "gifu" "shizuoka" "aichi"
    "mie" "shiga" "kyoto" "osaka" "hyogo" "nara" "wakayama"
    "tottori" "shimane" "okayama" "hiroshima" "yamaguchi"
    "tokushima" "kagawa" "ehime" "kochi"
    "fukuoka" "saga" "nagasaki" "kumamoto" "oita" "miyazaki" "kagoshima" "okinawa"
)

REGIONS=("hokkaido" "tohoku" "kanto" "chubu" "kansai" "chugoku" "shikoku" "kyushu")

cd projects/yukkuri-remotion/video

for PREF in "${PREFECTURES[@]}"; do
    # Check if audio for this prefecture exists (check the first voice file)
    if [ -f "public/audio/$PREF/voice_0.wav" ] || [ "$PREF" == "tokyo" -a -f "public/audio/voice_0.wav" ]; then
        echo "--- Rendering $PREF ---"
        
        # Horizontal
        if [ ! -f "../../renders/${PREF}_horizontal.mp4" ]; then
            echo "Rendering $PREF (Horizontal)..."
            npx remotion render "${PREF}_Horizontal" "../../renders/${PREF}_horizontal.mp4" --concurrency 8 --quiet
        fi
        
        # Vertical
        if [ ! -f "../../renders/${PREF}_vertical.mp4" ]; then
            echo "Rendering $PREF (Vertical)..."
            npx remotion render "${PREF}_Vertical" "../../renders/${PREF}_vertical.mp4" --concurrency 8 --quiet
        fi
    else
        echo "Skipping $PREF (Audio not ready yet)"
    fi
done

# Regional series
for REGION in "${REGIONS[@]}"; do
    # Check if region audio is likely ready (just a simple check)
    if [ -d "public/audio" ]; then
         echo "--- Rendering Region: $REGION ---"
         if [ ! -f "../../renders/series_${REGION}_horizontal.mp4" ]; then
            npx remotion render "${REGION}_Series_Horizontal" "../../renders/series_${REGION}_horizontal.mp4" --concurrency 8 --quiet
         fi
         if [ ! -f "../../renders/series_${REGION}_vertical.mp4" ]; then
            npx remotion render "${REGION}_Series_Vertical" "../../renders/series_${REGION}_vertical.mp4" --concurrency 8 --quiet
         fi
    fi
done

echo "Batch rendering pass complete!"
