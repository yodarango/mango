const fs = require("fs");
const path = require("path");

// Root and output relative to this script file
const ROOT_DIR = path.join(__dirname, ".");
const OUTPUT_FILE = path.join(__dirname, "daily_vocab.json");

function walkDir(dir, fileCallback) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      walkDir(fullPath, fileCallback);
    } else if (item.isFile() && item.name.endsWith(".json")) {
      fileCallback(fullPath, item.name);
    }
  }
}

function processFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const directoryName = relativePath.split(path.sep)[0]; // "II" or "III"

  let countNeeded = 0;

  if (directoryName === "II") {
    countNeeded = 2;
  } else if (directoryName === "III") {
    countNeeded = 3;
  } else {
    // File is not inside II or III folder → ignore
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let data;

  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON:", filePath);
    return null;
  }

  if (!Array.isArray(data)) {
    console.error("JSON root is not an array in file:", filePath);
    return null;
  }

  const nullUsed = data.filter((obj) => obj.used === null);
  const selected = nullUsed.slice(0, countNeeded);

  return {
    file: relativePath, // "II/file1.json"
    items: selected,
  };
}

function main() {
  const results = [];

  walkDir(ROOT_DIR, (filePath) => {
    const result = processFile(filePath);
    if (result && result.items.length > 0) {
      results.push(result);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf-8");
  console.log("Done! Output written to", OUTPUT_FILE);
}

main();
