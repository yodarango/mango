const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, ".");

function walkDir(dir, fileCallback) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      walkDir(fullPath, fileCallback);
    } else if (item.isFile() && item.name.endsWith(".json")) {
      fileCallback(fullPath);
    }
  }
}

function resetUsedInFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON, skipping:", filePath);
    return { updated: false, reason: "invalid_json" };
  }

  if (!Array.isArray(data)) {
    // Only handle array-root JSON files, to avoid corrupting other JSON shapes
    return { updated: false, reason: "not_array_root" };
  }

  let changedCount = 0;

  for (const item of data) {
    if (
      item &&
      typeof item === "object" &&
      Object.prototype.hasOwnProperty.call(item, "used")
    ) {
      if (item.used !== null) changedCount += 1;
      item.used = null;
    }
  }

  if (changedCount === 0) {
    return { updated: false, reason: "no_changes" };
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  return { updated: true, changedCount };
}

function main() {
  let filesScanned = 0;
  let filesUpdated = 0;
  let totalFieldsChanged = 0;

  walkDir(ROOT_DIR, (filePath) => {
    filesScanned += 1;

    const result = resetUsedInFile(filePath);
    if (result.updated) {
      filesUpdated += 1;
      totalFieldsChanged += result.changedCount;

      const rel = path.relative(ROOT_DIR, filePath);
      console.log(
        `Updated: ${rel} (used reset on ${result.changedCount} items)`
      );
    }
  });

  console.log("\nDone!");
  console.log("JSON files scanned:", filesScanned);
  console.log("JSON files updated:", filesUpdated);
  console.log("Total items changed:", totalFieldsChanged);
}

main();
