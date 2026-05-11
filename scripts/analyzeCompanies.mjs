// Extract aggregate stats from data/companies.ts to feed the data-backed
// guides. Outputs JSON we can paste into guide content / use as fixture.

import fs from "node:fs";

// We import the file contents and parse for the fields we need.
const src = fs.readFileSync("data/companies.ts", "utf8");

// Quick & dirty regex parse — the file is auto-generated so the format is stable.
const records = [];
const blockRe = /\{[\s\S]*?slug: "([^"]+)"[\s\S]*?name: "([^"]+)"[\s\S]*?city: "([^"]+)"[\s\S]*?area: "([^"]*)"[\s\S]*?rating: ([\d.]+)[\s\S]*?reviewCount: (\d+)[\s\S]*?verified: (true|false)[\s\S]*?featured: (true|false)[\s\S]*?servicesOffered: \[([^\]]*)\]/g;
let m;
while ((m = blockRe.exec(src)) !== null) {
  const services = m[9]
    .split(",")
    .map((s) => s.replace(/"/g, "").trim())
    .filter(Boolean);
  records.push({
    slug: m[1],
    name: m[2],
    city: m[3],
    area: m[4],
    rating: parseFloat(m[5]),
    reviewCount: parseInt(m[6], 10),
    verified: m[7] === "true",
    featured: m[8] === "true",
    services,
  });
}

console.log(`Parsed ${records.length} companies\n`);

// Per-city stats
const cities = [...new Set(records.map((r) => r.city))];
console.log("Per-city stats:");
console.log("city          n    avg rating  total reviews  max reviews");
for (const c of cities) {
  const inCity = records.filter((r) => r.city === c);
  const n = inCity.length;
  const avgR = inCity.reduce((a, r) => a + r.rating, 0) / n;
  const totalReviews = inCity.reduce((a, r) => a + r.reviewCount, 0);
  const maxReviews = Math.max(...inCity.map((r) => r.reviewCount));
  console.log(
    `${c.padEnd(13)} ${String(n).padStart(4)}  ${avgR.toFixed(2).padStart(9)}  ${String(totalReviews).padStart(12)}  ${String(maxReviews).padStart(11)}`,
  );
}

// Service-coverage stats
console.log("\nService coverage (% of companies offering each):");
const allServices = [
  ...new Set(records.flatMap((r) => r.services)),
].sort();
for (const s of allServices) {
  const count = records.filter((r) => r.services.includes(s)).length;
  const pct = ((count / records.length) * 100).toFixed(1);
  console.log(`  ${s.padEnd(20)} ${count.toString().padStart(4)}  (${pct}%)`);
}

// Top 10 nationwide by review count
console.log("\nTop 10 nationwide by review count:");
const top10 = [...records].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);
for (const c of top10) {
  console.log(`  ${c.rating.toFixed(1)}★ · ${c.reviewCount.toString().padStart(5)} reviews · ${c.name} (${c.city})`);
}

// Rating distribution
console.log("\nRating distribution:");
const buckets = { "5.0": 0, "4.5-4.9": 0, "4.0-4.4": 0, "3.5-3.9": 0, "<3.5": 0 };
for (const r of records) {
  if (r.rating >= 5.0) buckets["5.0"]++;
  else if (r.rating >= 4.5) buckets["4.5-4.9"]++;
  else if (r.rating >= 4.0) buckets["4.0-4.4"]++;
  else if (r.rating >= 3.5) buckets["3.5-3.9"]++;
  else buckets["<3.5"]++;
}
for (const [k, v] of Object.entries(buckets)) {
  const pct = ((v / records.length) * 100).toFixed(1);
  console.log(`  ${k.padEnd(10)} ${v.toString().padStart(4)}  (${pct}%)`);
}

// Top 5 per city
console.log("\nTop 3 per city by review count:");
for (const c of cities) {
  const top = records
    .filter((r) => r.city === c)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3);
  console.log(`\n${c}:`);
  for (const t of top) {
    console.log(`  ${t.rating.toFixed(1)}★ · ${t.reviewCount} reviews · ${t.name} (${t.area})`);
  }
}
