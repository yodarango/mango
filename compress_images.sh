#!/bin/bash

# Usage: ./compress_images.sh [resize_width]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${SCRIPT_DIR}/frontend/src/assets/avatars"
RESIZE_DIM="$1"

# Function to process a single image file
process_image() {
    local img_file="$1"
    local dir=$(dirname "$img_file")
    local base_filename=$(basename "$img_file")
    local extension="${base_filename##*.}"
    local filename="${base_filename%.*}"

    # Skip files that already have the _{resolution}.{extension} pattern
    if [[ "$filename" =~ _[0-9]+$ ]]; then
        echo "⊘ Skipping ${base_filename} (already compressed with resolution suffix)"
        return
    fi

    if [ -n "$RESIZE_DIM" ]; then
        # When resizing, create new file with dimensions in name
        output_file="${dir}/${filename}_${RESIZE_DIM}.webp"

        # Skip if output file already exists
        if [ -f "$output_file" ]; then
            echo "⊘ Skipping ${base_filename} (${filename}_${RESIZE_DIM}.webp already exists)"
            return
        fi

        ffmpeg -i "$img_file" -vf "scale=${RESIZE_DIM}:-1" -c:v libwebp -quality 85 -y "$output_file" 2>/dev/null

        if [ $? -eq 0 ]; then
            echo "✓ ${base_filename} → ${filename}_${RESIZE_DIM}.webp (original kept)"
        fi
    else
        # When not resizing, only process PNGs and replace original
        if [ "$extension" = "png" ]; then
            output_file="${dir}/${filename}.webp"

            # Skip if output file already exists
            if [ -f "$output_file" ]; then
                echo "⊘ Skipping ${base_filename} (${filename}.webp already exists)"
                return
            fi

            ffmpeg -i "$img_file" -c:v libwebp -quality 85 -y "$output_file" 2>/dev/null

            if [ $? -eq 0 ]; then
                echo "✓ ${base_filename} → ${filename}.webp"
                rm "$img_file"
            fi
        fi
    fi
}

# Process all image files
find "$TARGET_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" \) | while read img_file; do
    process_image "$img_file"
done

echo "Done!"

