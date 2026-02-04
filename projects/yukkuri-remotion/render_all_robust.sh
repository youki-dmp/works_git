#!/bin/bash

# Configuration
OUTPUT_DIR="../renders"
mkdir -p "$OUTPUT_DIR"

# Composition IDs in Root.tsx use hyphens now
PREFECTURES=(
    "hokkaido" "aomori" "iwate" "miyagi" "akita" "yamagata" "fukushima"
    "ibaraki" "tochigi" "gunma" "saitama" "chiba" "tokyo" "kanagawa"
    "niigata" "toyama" "ishikawa" "fukui" "yamanashi" "nagano" "gifu" "shizuoka" "aichi"
    "mie" "shiga" "kyoto" "osaka" "hyogo" "nara" "wakayama"
    "tottori" "shimane" "okayama" "hiroshima" "yamaguchi"
    "tokushima" "kagawa" "ehime" "kochi"
    "fukuoka" "saga" "nagasaki" "kumamoto" "oita" "miyazaki" "kagoshima" "okinawa"
)

CITIES=("sapporo" "sendai" "saitama" "chiba" "yokohama" "kawasaki" "sagamihara" "niigata" "shizuoka" "hamamatsu" "nagoya" "kyoto" "osaka" "sakai" "kobe" "okayama" "hiroshima" "kitakyushu" "fukuoka" "kumamoto")

FIRSTS=("kongogumi" "domdom" "curry-bread")

cd projects/yukkuri-remotion/video

# Render Prefectures
for PREF in "${PREFECTURES[@]}"; do
    echo "--- Rendering $PREF ---"
    npx remotion render "$PREF-Horizontal" "$OUTPUT_DIR/${PREF}_horizontal.mp4" --concurrency 8 --quiet --overwrite
    npx remotion render "$PREF-Vertical" "$OUTPUT_DIR/${PREF}_vertical.mp4" --concurrency 8 --quiet --overwrite
done

# Render Cities
for CITY in "${CITIES[@]}"; do
    echo "--- Rendering City: $CITY ---"
    npx remotion render "city-$CITY-Horizontal" "$OUTPUT_DIR/city_${CITY}_horizontal.mp4" --concurrency 8 --quiet --overwrite
    npx remotion render "city-$CITY-Vertical" "$OUTPUT_DIR/city_${CITY}_vertical.mp4" --concurrency 8 --quiet --overwrite
done

# Render Firsts
for FIRST in "${FIRSTS[@]}"; do
    echo "--- Rendering First: $FIRST ---"
    npx remotion render "first-$FIRST-Horizontal" "$OUTPUT_DIR/first_${FIRST}_horizontal.mp4" --concurrency 8 --quiet --overwrite
    npx remotion render "first-$FIRST-Vertical" "$OUTPUT_DIR/first_${FIRST}_vertical.mp4" --concurrency 8 --quiet --overwrite
done

echo "Mass rendering complete!"
