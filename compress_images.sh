#!/bin/bash

# Usage: ./compress_images.sh [resize_width]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${SCRIPT_DIR}/frontend/src/assets/store/"
RESIZE_DIM="$1"

find "$TARGET_DIR" -type f -name "*.png" | while read png_file; do
    dir=$(dirname "$png_file")
    filename=$(basename "$png_file" .png)
    output_file="${dir}/${filename}.webp"

    if [ -n "$RESIZE_DIM" ]; then
        ffmpeg -i "$png_file" -vf "scale=${RESIZE_DIM}:-1" -c:v libwebp -quality 85 -y "$output_file" 2>/dev/null
    else
        ffmpeg -i "$png_file" -c:v libwebp -quality 85 -y "$output_file" 2>/dev/null
    fi

    if [ $? -eq 0 ]; then
        echo "✓ ${filename}.png → ${filename}.webp"
        rm "$png_file"
    fi
done

echo "Done!"

