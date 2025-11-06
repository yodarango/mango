#!/usr/bin/env node
// c.js
// Usage: node c.js input.txt output.json

const fs = require("fs");
const path = require("path");

function parseLine(line, lineNum) {
  const trimmed = line.trim();
  if (!trimmed) return [];

  // Match: 1. word - translation - gender...
  const m = trimmed.match(/^(\d+)\.\s*(.+)$/);
  if (!m) {
    throw new Error(
      `Parse error on line ${lineNum}: expected "<index>. <eng> - <spa> - <gender>"`
    );
  }

  const baseIndex = Number(m[1]);
  const rest = m[2];

  // Match three parts (eng, spa, gender... possibly with /)
  const parts = rest.match(/^(.+?)\s-\s(.+?)\s-\s(.+)$/);
  if (!parts) {
    throw new Error(`Parse error on line ${lineNum}: bad format`);
  }

  const [_, engRaw, spaRaw, genderRaw] = parts;

  const eng = engRaw.trim();
  const spa = spaRaw.trim();
  const gender = genderRaw.trim();

  const entries = [];

  // If the Spanish or gender part contains "/", split into two entries
  if (spa.includes("/") || gender.includes("/")) {
    const spaParts = spa.split("/").map((s) => s.trim());
    const genderParts = gender.split("/").map((g) => g.trim());

    for (let i = 0; i < Math.max(spaParts.length, genderParts.length); i++) {
      const s = spaParts[i] || spaParts[0];
      const g = genderParts[i] || genderParts[0];
      entries.push({
        index: baseIndex + i,
        spa: s,
        eng: eng,
        gender: g.toLowerCase(),
      });
    }
  } else {
    // Normal single entry
    entries.push({
      index: baseIndex,
      spa: spa,
      eng: eng,
      gender: gender.toLowerCase(),
    });
  }

  return entries;
}

async function convertTxtToJson(inputPath, outputPath) {
  const content = await fs.promises.readFile(inputPath, "utf8");
  const lines = content.split(/\r?\n/);

  const entries = [];
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const parsed = parseLine(line, i + 1);
    entries.push(...parsed);
  });

  if (entries.length === 0) {
    throw new Error("No entries parsed from input.");
  }

  const json = JSON.stringify(entries, null, 2);

  if (outputPath) {
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, json, "utf8");
    console.log(`✅ Wrote ${entries.length} entries to ${outputPath}`);
  } else {
    process.stdout.write(json + "\n");
  }
}

// --- CLI ---
(async () => {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg) {
    console.error(
      `Usage: node ${path.basename(process.argv[1])} <input.txt> [output.json]`
    );
    process.exit(1);
  }

  // Resolve relative path based on script location
  const inputPath = path.resolve(__dirname, inputArg);
  const outputPath = outputArg ? path.resolve(__dirname, outputArg) : null;

  try {
    await convertTxtToJson(inputPath, outputPath);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(2);
  }
})();
