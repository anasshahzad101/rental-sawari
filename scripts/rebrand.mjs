// One-shot rebrand: RentRide / rentride.pk → RentalSawari / rentalsawari.com
//
// Replacements are word-safe (won't touch substrings inside unrelated identifiers)
// and case-sensitive where it matters. Run from the project root:
//   node scripts/rebrand.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out",
]);
// Files we should not touch (preserve historical scripts, lock files).
const SKIP_FILES = new Set([
  "package-lock.json",
]);
// We also skip the prior fetch scripts to keep their commit history clean.
const SKIP_PATH_PARTS = ["scripts/fetchFinal.mjs", "scripts/fetchRest.mjs", "scripts/rebrand.mjs"];

const TEXT_EXTS = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".css", ".html", ".svg",
]);

// Replacements run in order; first match wins per pass.
const replacements = [
  // Domain
  { from: /https?:\/\/rentride\.pk/g, to: "https://rentalsawari.com" },
  { from: /\brentride\.pk\b/g,        to: "rentalsawari.com" },
  // Email addresses
  { from: /@rentride\.pk\b/g,         to: "@rentalsawari.com" },
  // Brand
  { from: /\bRentRide\b/g,            to: "RentalSawari" },
  { from: /\brentride\b/g,            to: "rentalsawari" },
];

let touched = 0;
let totalEdits = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).split(path.sep).join("/");
    if (SKIP_PATH_PARTS.some((p) => rel.endsWith(p))) continue;
    if (entry.isDirectory()) { walk(full); continue; }
    if (SKIP_FILES.has(entry.name)) continue;
    const ext = path.extname(entry.name);
    if (!TEXT_EXTS.has(ext)) continue;

    const before = fs.readFileSync(full, "utf8");
    let after = before;
    let edits = 0;
    for (const { from, to } of replacements) {
      const matches = after.match(from);
      if (!matches) continue;
      edits += matches.length;
      after = after.replace(from, to);
    }
    if (after !== before) {
      fs.writeFileSync(full, after);
      touched++;
      totalEdits += edits;
      console.log(`${edits.toString().padStart(3)}  ${rel}`);
    }
  }
}

walk(ROOT);

console.log(`\nFiles touched: ${touched}`);
console.log(`Total edits:   ${totalEdits}`);
