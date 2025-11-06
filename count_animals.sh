#!/bin/bash

# Count and categorize animal warrior images

ANIMALS_DIR="frontend/src/assets/store/warriors/animals"

echo "## Animal Warriors Inventory"
echo ""

# Count total files
total=$(ls -1 "$ANIMALS_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "**Total Images: $total**"
echo ""

echo "### Breakdown by Category:"
echo ""
echo "| Prefix | Count | Animals |"
echo "|--------|-------|---------|"

# Count by prefix
for prefix in air big feline insect reptile sea; do
    count=$(ls -1 "$ANIMALS_DIR/${prefix}_"*.png 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        # Get list of animals (remove prefix and .png extension)
        animals=$(ls -1 "$ANIMALS_DIR/${prefix}_"*.png 2>/dev/null | xargs -n1 basename | sed "s/${prefix}_//g" | sed 's/.png//g' | tr '\n' ', ' | sed 's/, $//')
        echo "| **${prefix}_** | $count | $animals |"
    fi
done

# Count files without prefix (no underscore before first dot)
no_prefix_count=$(ls -1 "$ANIMALS_DIR"/*.png 2>/dev/null | xargs -n1 basename | grep -v '_' | wc -l | tr -d ' ')
if [ "$no_prefix_count" -gt 0 ]; then
    no_prefix_animals=$(ls -1 "$ANIMALS_DIR"/*.png 2>/dev/null | xargs -n1 basename | grep -v '_' | sed 's/.png//g' | tr '\n', ', ' | sed 's/, $//')
    echo "| **(no prefix)** | $no_prefix_count | $no_prefix_animals |"
fi

echo ""
echo "### Summary:"

# Individual counts with emojis
air_count=$(ls -1 "$ANIMALS_DIR/air_"*.png 2>/dev/null | wc -l | tr -d ' ')
big_count=$(ls -1 "$ANIMALS_DIR/big_"*.png 2>/dev/null | wc -l | tr -d ' ')
feline_count=$(ls -1 "$ANIMALS_DIR/feline_"*.png 2>/dev/null | wc -l | tr -d ' ')
insect_count=$(ls -1 "$ANIMALS_DIR/insect_"*.png 2>/dev/null | wc -l | tr -d ' ')
reptile_count=$(ls -1 "$ANIMALS_DIR/reptile_"*.png 2>/dev/null | wc -l | tr -d ' ')
sea_count=$(ls -1 "$ANIMALS_DIR/sea_"*.png 2>/dev/null | wc -l | tr -d ' ')
other_count=$(ls -1 "$ANIMALS_DIR"/*.png 2>/dev/null | xargs -n1 basename | grep -v '_' | wc -l | tr -d ' ')

echo "- 🦅 **Air animals**: $air_count"
echo "- 🐘 **Big animals**: $big_count"
echo "- 🐱 **Felines**: $feline_count"
echo "- 🐜 **Insects**: $insect_count"
echo "- 🦎 **Reptiles**: $reptile_count"
echo "- 🐠 **Sea creatures**: $sea_count"
if [ "$other_count" -gt 0 ]; then
    other_animals=$(ls -1 "$ANIMALS_DIR"/*.png 2>/dev/null | xargs -n1 basename | grep -v '_' | sed 's/.png//g' | tr '\n' ', ' | sed 's/, $//')
    echo "- 🐍 **Other**: $other_count ($other_animals)"
fi

