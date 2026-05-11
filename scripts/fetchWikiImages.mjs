// Quick fetch of Wikipedia REST summary thumbnails for our image slots.
const items = [
  { slug: "karachi", article: "Karachi" },
  { slug: "rawalpindi", article: "Rawalpindi" },
  { slug: "multan", article: "Multan" },
  { slug: "peshawar", article: "Peshawar" },
  { slug: "quetta", article: "Quetta" },
  { slug: "hunza", article: "Hunza_Valley" },
  { slug: "skardu", article: "Skardu" },
  { slug: "naran", article: "Lake_Saiful_Muluk" },
  { slug: "karakoram-hero", article: "Karakoram_Highway" },
  { slug: "lahore-cultural", article: "Walled_City_of_Lahore" },
  // re-fetch the three the search agent confirmed, to verify
  { slug: "lahore", article: "Badshahi_Mosque" },
  { slug: "islamabad", article: "Faisal_Mosque" },
  { slug: "faisalabad", article: "Faisalabad" },
];

const results = {};
for (const { slug, article } of items) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${article}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const j = await res.json();
    const src =
      (j.originalimage && j.originalimage.source) ||
      (j.thumbnail && j.thumbnail.source) ||
      null;
    results[slug] = src;
    console.log(`${slug.padEnd(18)} ← ${article}`);
    console.log(`  ${src || "(no image)"}`);
  } catch (e) {
    console.log(`${slug}: ERROR ${e.message}`);
    results[slug] = null;
  }
}

console.log("\n---JSON---");
console.log(JSON.stringify(results, null, 2));
