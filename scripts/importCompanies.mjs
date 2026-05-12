/**
 * One-shot importer: turns Google Maps Extractor CSVs into data/companies.ts
 *
 * Run from the project root:
 *   node scripts/importCompanies.mjs
 *
 * Source files live outside the repo at:
 *   C:/Users/Admin/Downloads/Google Maps Extractor/<city>.csv
 *
 * Re-run any time the CSVs are refreshed. Hand-edits to data/companies.ts
 * will be overwritten — keep tweaks in this script.
 */

import fs from "node:fs";
import path from "node:path";

// ---------- config ----------

const CSV_DIR = "C:/Users/Admin/Downloads/Google Maps Extractor";
const OUT_FILE = "data/companies.ts";

// Order matters: defines display order across all-cities views.
const CITIES = [
  { file: "Lahore.csv", display: "Lahore" },
  { file: "islamabad.csv", display: "Islamabad" },
  { file: "karachi.csv", display: "Karachi" },
  { file: "Rawalpindi.csv", display: "Rawalpindi" },
  { file: "faisalabad.csv", display: "Faisalabad" },
  { file: "multan.csv", display: "Multan" },
  { file: "Peshawar.csv", display: "Peshawar" },
  { file: "quetta.csv", display: "Quetta" },
];

// Multi-city CSV — one file containing rows for many cities, distinguished
// by the `query` column. Cities listed below get imported with the indicated
// display name; cities NOT listed here get dropped (e.g. Raiwind because
// Google Maps treated it loosely and the results are Lahore-overflow).
const MULTI_CITY_CSV = "Multiple cities data.csv";

const MULTI_CITY_QUERY_MAP = {
  // query keyword (lowercased) → display name
  sialkot: "Sialkot",
  gujranwala: "Gujranwala",
  gujrat: "Gujrat",
  sargodha: "Sargodha",
  sheikhupura: "Sheikhupura",
  bahawalpur: "Bahawalpur",
  "rahim yar khan": "Rahim Yar Khan",
  chakwal: "Chakwal",
  okara: "Okara",
  "dera ghazi khan": "Dera Ghazi Khan",
  kasur: "Kasur",
  narowal: "Narowal",
  mianwali: "Mianwali",
  // raiwind: intentionally omitted — those rows are Lahore vendors mis-tagged.
};

const FEATURED_PER_CITY = {
  // Top 3 nationally — featured-fleet city pages
  Lahore: 2,
  Islamabad: 2,
  Karachi: 2,
  // Tier 2
  Rawalpindi: 1,
  Faisalabad: 1,
  Multan: 1,
  Peshawar: 1,
  Quetta: 1,
  // Newly added (Punjab tier)
  Sialkot: 1,
  Gujranwala: 1,
  Gujrat: 1,
  Sargodha: 1,
  Sheikhupura: 1,
  Bahawalpur: 1,
  "Rahim Yar Khan": 1,
  Chakwal: 1,
  Okara: 1,
  "Dera Ghazi Khan": 1,
  Kasur: 1,
  Narowal: 1,
  Mianwali: 1,
};

// Categories worth keeping. Everything else (hotels, dealers, etc.) is dropped.
const KEEP_CATEGORIES = [
  /car rental/i,
  /car leasing/i,
  /transportation service/i,
  /rental car return location/i,
];

// Area-name hints to extract from the address. First match wins.
const AREA_HINTS = [
  "DHA Phase 1", "DHA Phase 2", "DHA Phase 3", "DHA Phase 4", "DHA Phase 5",
  "DHA Phase 6", "DHA Phase 7", "DHA Phase 8", "DHA",
  "Gulberg", "Johar Town", "Model Town", "Cantt", "Cantonment", "Saddar",
  "Bahria Town", "Bahria",
  "F-6", "F-7", "F-8", "F-10", "F-11", "G-8", "G-9", "G-10", "G-11", "G-13",
  "I-8", "I-9", "I-10", "Blue Area",
  // Newly added Punjab tier
  "Civil Lines", "Pasrur Road", "Daska Road", "Sambrial",
  "G.T. Road", "GT Road",
  "Satellite Town", "Wahdat Colony", "Gulshan Ravi",
  "People's Colony", "Peoples Colony",
  "Model Town Link Road",
  "Aziz Bhatti Town", "Khaiqaani Town",
  "Clifton", "PECHS", "Gulshan", "North Nazimabad", "Korangi", "Malir",
  "University Town", "Hayatabad",
  "Madina Town", "Peoples Colony", "Susan Road", "D-Ground",
  "Jinnah Town", "Satellite Town", "Samungli Road",
  "Gulgasht", "Bosan Road",
  "Defence", "Garden Town", "Faisal Town", "Wapda Town", "Township",
];

// Description → service-tag patterns. Order matters: first hit wins for tie-breaking.
const SERVICE_PATTERNS = [
  { tag: "With Driver",     re: /\b(with driver|chauffeur|chauffeur-driven|driver service)\b/i },
  { tag: "Self-Drive",      re: /\b(self[\s-]?drive|self[\s-]?driven|without driver)\b/i },
  { tag: "Airport Pickup",  re: /\b(airport (pick[- ]?up|transfer|service))\b/i },
  { tag: "Wedding",         re: /\b(wedding|baraat|rukhsati|barat)\b/i },
  { tag: "Tourist Tours",   re: /\b(tour|tourist|sight[- ]?seeing|northern|hunza|skardu|naran|kaghan|murree)\b/i },
  { tag: "Corporate Monthly", re: /\b(corporate|monthly|long[- ]?term|business client)\b/i },
  { tag: "Luxury",          re: /\b(luxury|premium|mercedes|land cruiser|prado v8|audi|bmw)\b/i },
];

// ---------- CSV parser ----------

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

function readCSV(file) {
  const csv = fs.readFileSync(path.join(CSV_DIR, file), "utf8");
  const rows = parseCSV(csv);
  const headers = rows[0];
  return rows.slice(1)
    .filter((r) => r.length === headers.length)
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

// ---------- transforms ----------

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function cleanName(name, city) {
  // Strip trailing redundant "Lahore", " - Lahore", "in Lahore" etc.
  const trimmed = name
    .replace(new RegExp(`\\s*(?:[-,–]\\s*)?(?:in\\s+)?${city}\\s*$`, "i"), "")
    .trim();
  return trimmed || name.trim();
}

function extractArea(address) {
  if (!address) return null;
  for (const hint of AREA_HINTS) {
    const re = new RegExp(`\\b${hint.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (re.test(address)) return hint;
  }
  // Fallback: first comma-separated chunk that's not the street number.
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  for (const p of parts) {
    if (/^\d+[a-z]?$/i.test(p)) continue; // pure street number
    if (p.length < 3 || p.length > 40) continue;
    if (/(pakistan|punjab|sindh|balochistan|kpk|kp)/i.test(p)) continue;
    return p;
  }
  return null;
}

function normalisePhone(raw) {
  if (!raw) return "";
  // Keep leading + and digits only.
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("92")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+92" + cleaned.slice(1);
  return cleaned;
}

function deriveServices(description) {
  const found = new Set();
  const text = description || "";
  for (const { tag, re } of SERVICE_PATTERNS) {
    if (re.test(text)) found.add(tag);
  }
  if (found.size === 0) found.add("With Driver");
  return Array.from(found);
}

function cleanDescription(desc) {
  if (!desc) return undefined;
  // Trim whitespace and collapse runs of newlines.
  const cleaned = desc.replace(/\s+/g, " ").trim();
  if (cleaned.length < 30) return undefined;
  // Cap to a useful length for the profile page.
  return cleaned.length > 600 ? cleaned.slice(0, 597).trimEnd() + "…" : cleaned;
}

// ---------- main ----------

const allCompanies = [];
const stats = {};
const globalSlugs = new Set();

for (const { file, display } of CITIES) {
  const rows = readCSV(file);
  const cityEntries = [];

  for (const r of rows) {
    const cat = r.main_category || "";
    if (!KEEP_CATEGORIES.some((re) => re.test(cat))) continue;
    if (/true/i.test(r.is_temporarily_closed || "")) continue;

    const phone = normalisePhone(r.phone || "");
    if (!phone || phone.length < 10) continue;

    const rating = parseFloat(r.rating);
    const reviewCount = parseInt(r.reviews, 10) || 0;
    // Drop absolute spam: no rating, no reviews.
    if (isNaN(rating) && reviewCount === 0) continue;

    const name = cleanName(r.name || "", display);
    if (!name) continue;

    let slug = slugify(name);
    if (!slug) continue;
    if (globalSlugs.has(slug)) slug = `${slug}-${display.toLowerCase()}`;
    let suffix = 2;
    while (globalSlugs.has(slug)) {
      slug = `${slugify(name)}-${display.toLowerCase()}-${suffix++}`;
    }
    globalSlugs.add(slug);

    cityEntries.push({
      slug,
      name,
      city: display,
      area: extractArea(r.address || "") || display,
      rating: isNaN(rating) ? 0 : Number(rating.toFixed(1)),
      reviewCount,
      verified: true,
      featured: false, // assigned below
      whatsapp: phone,
      phone,
      servicesOffered: deriveServices(r.description),
      about: cleanDescription(r.description),
      website: (r.website || "").trim() || undefined,
      googleMapsUrl: (r.link || "").trim() || undefined,
    });
  }

  // Mark featured: top N by review count for this city.
  const featuredCount = FEATURED_PER_CITY[display] || 1;
  [...cityEntries]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, featuredCount)
    .forEach((e) => { e.featured = true; });

  // Sort city entries: featured first, then by review count.
  cityEntries.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.reviewCount - a.reviewCount;
  });

  stats[display] = cityEntries.length;
  allCompanies.push(...cityEntries);
}

// ---------- multi-city CSV ----------
//
// Single file with rows for many cities. We group rows by query, look up
// the display name in MULTI_CITY_QUERY_MAP, skip queries not in the map
// (e.g. Raiwind), then process each city's slice with the same pipeline.

function deriveCityFromQuery(query) {
  if (!query) return null;
  // Match patterns like "car rental in lahore, punjab, pakistan".
  const m = query
    .toLowerCase()
    .match(/(?:car rental|rent a car|rent-a-car)\s+(?:in\s+)?([^,]+)/);
  return m ? m[1].trim() : null;
}

if (fs.existsSync(path.join(CSV_DIR, MULTI_CITY_CSV))) {
  const rows = readCSV(MULTI_CITY_CSV);
  // Bucket by display city.
  const buckets = new Map();
  let droppedQueries = new Map();
  for (const r of rows) {
    const city = deriveCityFromQuery(r.query || "");
    const display = MULTI_CITY_QUERY_MAP[city];
    if (!display) {
      droppedQueries.set(city || "(blank)", (droppedQueries.get(city || "(blank)") || 0) + 1);
      continue;
    }
    if (!buckets.has(display)) buckets.set(display, []);
    buckets.get(display).push(r);
  }

  if (droppedQueries.size > 0) {
    console.log("Multi-city CSV — dropped queries:");
    [...droppedQueries.entries()].forEach(([q, n]) =>
      console.log(`  ${String(n).padStart(4)}  ${q}`),
    );
  }

  for (const [display, cityRows] of buckets) {
    const cityEntries = [];
    for (const r of cityRows) {
      const cat = r.main_category || "";
      if (!KEEP_CATEGORIES.some((re) => re.test(cat))) continue;
      if (/true/i.test(r.is_temporarily_closed || "")) continue;
      const phone = normalisePhone(r.phone || "");
      if (!phone || phone.length < 10) continue;
      const rating = parseFloat(r.rating);
      const reviewCount = parseInt(r.reviews, 10) || 0;
      if (isNaN(rating) && reviewCount === 0) continue;

      const name = cleanName(r.name || "", display);
      if (!name) continue;

      let slug = slugify(name);
      if (!slug) continue;
      if (globalSlugs.has(slug)) slug = `${slug}-${display.toLowerCase().replace(/\s+/g, "-")}`;
      let suffix = 2;
      while (globalSlugs.has(slug)) {
        slug = `${slugify(name)}-${display.toLowerCase().replace(/\s+/g, "-")}-${suffix++}`;
      }
      globalSlugs.add(slug);

      cityEntries.push({
        slug,
        name,
        city: display,
        area: extractArea(r.address || "") || display,
        rating: isNaN(rating) ? 0 : Number(rating.toFixed(1)),
        reviewCount,
        verified: true,
        featured: false,
        whatsapp: phone,
        phone,
        servicesOffered: deriveServices(r.description),
        about: cleanDescription(r.description),
        website: (r.website || "").trim() || undefined,
        googleMapsUrl: (r.link || "").trim() || undefined,
      });
    }

    const featuredCount = FEATURED_PER_CITY[display] || 1;
    [...cityEntries]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, featuredCount)
      .forEach((e) => { e.featured = true; });
    cityEntries.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.reviewCount - a.reviewCount;
    });

    stats[display] = cityEntries.length;
    allCompanies.push(...cityEntries);
  }
}

// ---------- emit data/companies.ts ----------

function tsLiteral(v) {
  if (v === undefined) return undefined;
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") return v.toString();
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return `[${v.map(tsLiteral).join(", ")}]`;
  return JSON.stringify(v);
}

const lines = [];
lines.push("import type { Company } from \"@/lib/types\";");
lines.push("");
lines.push("// Auto-generated by scripts/importCompanies.mjs from Google Maps Extractor CSVs.");
lines.push("// Do not hand-edit — re-run the script and tune it instead.");
lines.push(`// Last import: ${new Date().toISOString()}`);
lines.push("");
lines.push("export const companies: Company[] = [");
for (const c of allCompanies) {
  lines.push("  {");
  lines.push(`    slug: ${tsLiteral(c.slug)},`);
  lines.push(`    name: ${tsLiteral(c.name)},`);
  lines.push(`    city: ${tsLiteral(c.city)},`);
  lines.push(`    area: ${tsLiteral(c.area)},`);
  lines.push(`    rating: ${c.rating},`);
  lines.push(`    reviewCount: ${c.reviewCount},`);
  lines.push(`    verified: ${c.verified},`);
  lines.push(`    featured: ${c.featured},`);
  lines.push(`    whatsapp: ${tsLiteral(c.whatsapp)},`);
  lines.push(`    phone: ${tsLiteral(c.phone)},`);
  lines.push(`    servicesOffered: ${tsLiteral(c.servicesOffered)},`);
  if (c.about) lines.push(`    about: ${tsLiteral(c.about)},`);
  if (c.website) lines.push(`    website: ${tsLiteral(c.website)},`);
  if (c.googleMapsUrl) lines.push(`    googleMapsUrl: ${tsLiteral(c.googleMapsUrl)},`);
  lines.push("  },");
}
lines.push("];");
lines.push("");
lines.push("export const featuredCompanies = companies.filter((c) => c.featured);");
lines.push("");
lines.push("export function getCompanyBySlug(slug: string) {");
lines.push("  return companies.find((c) => c.slug === slug);");
lines.push("}");
lines.push("");

fs.writeFileSync(OUT_FILE, lines.join("\n"));

// ---------- report ----------

console.log("Wrote", OUT_FILE);
console.log("Total companies:", allCompanies.length);
console.log("Per city:");
for (const [city, n] of Object.entries(stats)) {
  console.log(`  ${city.padEnd(12)} ${n}`);
}
const featured = allCompanies.filter((c) => c.featured);
console.log("Featured:", featured.length);
featured.forEach((f) => {
  console.log(`  [${f.city}] ${f.name} (${f.rating}★, ${f.reviewCount} reviews)`);
});
