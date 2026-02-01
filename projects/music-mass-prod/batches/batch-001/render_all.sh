#!/bin/bash

# Configuration
PROJECT_DIR="projects/remotion-video-gen/video-project"
RENDER_DIR="../../music-mass-prod/batches/batch-001/renders"

# Composition IDs from Root.tsx
COMPS=(
    "shinjuku-neon-rain-1"
    "kyoto-sunset-zen-1"
    "midnight-konbini-1"
    "school-rooftop-breeze-1"
    "tokyo-subway-dreams-1"
)

echo "Starting mass render for Batch 001..."

cd "$PROJECT_DIR"

for COMP in "${COMPS[@]}"; do
    OUTPUT="$RENDER_DIR/$COMP.mp4"
    echo "----------------------------------------"
    echo "Rendering: $COMP"
    echo "Output: $OUTPUT"
    
    npx remotion render "$COMP" "$OUTPUT" --concurrency 8
    
    if [ $? -eq 0 ]; then
        echo "Successfully rendered $COMP"
    else
        echo "Error rendering $COMP"
    fi
done

echo "Batch 001 rendering complete!"
