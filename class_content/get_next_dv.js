const fs = require("fs");
const path = require("path");

// ⚠️ Cambia questo percorso con la cartella principale dove sono le tue cartelle II_/III_
const ROOT_DIR = "./";
const OUTPUT_FILE = "./daily_vocab.json";

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

function processFile(filePath, fileName) {
  // 1️⃣ Prima controlliamo il prefisso del file
  if (!fileName.startsWith("II_") && !fileName.startsWith("III_")) {
    // Non è un file di vocabolario che ci interessa
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

  // 2️⃣ Assicurarsi che il JSON sia un array
  if (!Array.isArray(data)) {
    console.error("JSON root is not an array in file:", filePath);
    return null;
  }

  // 3️⃣ Filtra solo gli oggetti con used === null
  const nullUsed = data.filter((obj) => obj.used === null);

  let countNeeded = 0;

  if (fileName.startsWith("II_")) {
    countNeeded = 2;
  } else if (fileName.startsWith("III_")) {
    countNeeded = 3;
  }

  const selected = nullUsed.slice(0, countNeeded);

  return {
    file: fileName,
    items: selected,
  };
}

function main() {
  const results = [];

  walkDir(ROOT_DIR, (filePath, fileName) => {
    const result = processFile(filePath, fileName);
    if (result && result.items.length > 0) {
      results.push(result);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf-8");
  console.log("Done! Output written to", OUTPUT_FILE);
}

main();
