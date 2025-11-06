#!/usr/bin/env node
// verbs_to_json_ordered.js
// Usage: node verbs_to_json_ordered.js
//
// Expected files in the same folder:
//   ./verbs.txt
//   ./verbs_index.txt
// Output: ./verbs.json

const fs = require("fs");
const path = require("path");

/** Parse a verb line like "1. llegar (to arrive, to reach)" -> { index, spa, eng[] } */
function parseVerbLine(line, lineNum) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const m = trimmed.match(/^(\d+)\.\s*([^(]+)\(([^)]+)\)/);
  if (!m) {
    throw new Error(`Parse error on line ${lineNum}: "${line}"`);
  }

  const index = Number(m[1]);
  const spa = m[2].trim();
  const engPart = m[3].trim();
  const eng = engPart
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return { index, spa, eng };
}

/** Parse all verb-data lines */
function parseVerbsContent(content) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parsed = parseVerbLine(line, i + 1);
    if (parsed) entries.push(parsed);
  }
  return entries;
}

/** Normalize a key for matching (case-insensitive, trim, collapse spaces) */
function normKey(s) {
  return s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parse index list lines like "13. llegar" or just "llegar" */
function parseIndexList(content) {
  const lines = content.split(/\r?\n/);
  const ordered = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    const m = raw.match(/^(\d+)\.\s*(.+)$/);
    const verb = m ? m[2].trim() : raw;
    const cleaned = verb.replace(/\s+#.*$/, "").trim();
    if (cleaned) ordered.push(cleaned);
  }
  return ordered;
}

/** Main conversion: order entries by verbs_index list */
async function convertVerbsWithIndex(baseDir) {
  const verbsPath = path.join(baseDir, "daily_vocab_verbs.txt");
  const indexPath = path.join(baseDir, "verbs_index.txt");
  const outPath = path.join(baseDir, "daily_vocab_verbs.json");

  if (!fs.existsSync(verbsPath)) throw new Error("Missing verbs.txt");
  if (!fs.existsSync(indexPath)) throw new Error("Missing verbs_index.txt");

  const [verbsContent, indexContent] = await Promise.all([
    fs.promises.readFile(verbsPath, "utf8"),
    fs.promises.readFile(indexPath, "utf8"),
  ]);

  const entries = parseVerbsContent(verbsContent);
  const indexList = parseIndexList(indexContent);

  const map = new Map(entries.map((e) => [normKey(e.spa), e]));
  const ordered = [];
  const seen = new Set();

  for (const v of indexList) {
    const k = normKey(v);
    const hit = map.get(k);
    if (hit) {
      ordered.push(hit);
      seen.add(k);
    } else {
      console.warn(`⚠️ Not found in verbs.txt: "${v}"`);
    }
  }

  // Append leftovers
  for (const [k, e] of map.entries()) {
    if (!seen.has(k)) ordered.push(e);
  }

  const json = JSON.stringify(ordered, null, 2);
  await fs.promises.writeFile(outPath, json, "utf8");
  console.log(`✅ Wrote ${ordered.length} verbs to ${outPath}`);
}

// --- Main ---
(async () => {
  const baseDir = __dirname;
  try {
    await convertVerbsWithIndex(baseDir);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(2);
  }
})();
