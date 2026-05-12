// Quick analyzer for the multi-city Google Maps Extractor CSV.
// Reports: per-city totals, query-derived city, category breakdown.

import fs from "node:fs";

const path = "C:/Users/Admin/Downloads/Google Maps Extractor/Multiple cities data.csv";

function parseCSV(s) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const csv = fs.readFileSync(path, "utf8");
const rows = parseCSV(csv);
const headers = rows[0];
const data = rows
  .slice(1)
  .filter((r) => r.length === headers.length)
  .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));

console.log(`Total rows in CSV: ${data.length}\n`);

// Group by query (search term) — this is the primary city identifier.
const byQuery = new Map();
for (const r of data) {
  const q = (r.query || "").trim();
  byQuery.set(q, (byQuery.get(q) || 0) + 1);
}
console.log("All queries in the CSV:");
[...byQuery.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([q, n]) => console.log(`  ${String(n).padStart(4)}  ${q || "(blank)"}`));

// Derive city from query — second-to-last comma-separated component
// typically. Examples: "car rental in lahore, punjab, pakistan" → "punjab"
// (province). We need the city, which is the first or second token.
function deriveCity(query) {
  if (!query) return "(blank)";
  // Strip "car rental in " / "rent a car in " etc.
  const m = query.match(/(?:car rental|rent a car|rent-a-car)\s+(?:in\s+)?([^,]+)/i);
  if (m) return m[1].trim();
  // Fallback: take the first chunk after "in "
  const idx = query.toLowerCase().indexOf(" in ");
  if (idx >= 0) {
    const after = query.slice(idx + 4);
    return after.split(",")[0].trim();
  }
  return query;
}

const byCity = new Map();
for (const r of data) {
  const city = deriveCity(r.query || "");
  byCity.set(city, (byCity.get(city) || 0) + 1);
}
console.log("\nDerived city counts:");
[...byCity.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([city, n]) =>
    console.log(`  ${String(n).padStart(4)}  ${city}`),
  );

// Quality filters (same as the previous import):
//   - main_category contains "car rental" / "car leasing" / "transportation service"
//   - not temporarily closed
//   - has phone
//   - rating or reviewCount > 0
const KEEP_CATS = [/car rental/i, /car leasing/i, /transportation service/i, /rental car return location/i];
function passes(r) {
  if (!KEEP_CATS.some((re) => re.test(r.main_category || ""))) return false;
  if (/true/i.test(r.is_temporarily_closed || "")) return false;
  const phone = (r.phone || "").replace(/[^\d+]/g, "");
  if (!phone || phone.length < 10) return false;
  const rating = parseFloat(r.rating);
  const reviewCount = parseInt(r.reviews, 10) || 0;
  if (isNaN(rating) && reviewCount === 0) return false;
  return true;
}

const filtered = data.filter(passes);
console.log(`\nAfter quality filters: ${filtered.length} of ${data.length} (${((filtered.length / data.length) * 100).toFixed(1)}%)`);

const filteredByCity = new Map();
for (const r of filtered) {
  const city = deriveCity(r.query || "");
  filteredByCity.set(city, (filteredByCity.get(city) || 0) + 1);
}
console.log("\nFiltered (importable) per city:");
[...filteredByCity.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([city, n]) =>
    console.log(`  ${String(n).padStart(4)}  ${city}`),
  );

// Category breakdown across the file.
const byCat = new Map();
for (const r of data) {
  const c = (r.main_category || "").trim();
  byCat.set(c, (byCat.get(c) || 0) + 1);
}
console.log("\nTop main_category values (raw, all rows):");
[...byCat.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([c, n]) => console.log(`  ${String(n).padStart(4)}  ${c || "(blank)"}`));
