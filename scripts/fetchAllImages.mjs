// Fetch Wikipedia REST API summary thumbnails for everything remaining.

const items = [
  // ----- cars (12) -----
  { slug: "toyota-corolla",         article: "Toyota_Corolla" },
  { slug: "honda-civic",            article: "Honda_Civic" },
  { slug: "toyota-hiace",           article: "Toyota_HiAce" },
  { slug: "suzuki-apv",             article: "Suzuki_APV" },
  { slug: "toyota-prado",           article: "Toyota_Land_Cruiser_Prado" },
  { slug: "toyota-land-cruiser-v8", article: "Toyota_Land_Cruiser_(J200)" },
  { slug: "suzuki-mehran",          article: "Suzuki_Mehran" },
  { slug: "suzuki-cultus",          article: "Suzuki_Cultus" },
  { slug: "toyota-fortuner",        article: "Toyota_Fortuner" },
  { slug: "mercedes-benz",          article: "Mercedes-Benz_S-Class" },
  { slug: "suzuki-bolan",           article: "Suzuki_Carry" },
  { slug: "toyota-coaster",         article: "Toyota_Coaster" },

  // ----- use-case homepage thumbnails (data/useCases.ts) -----
  { slug: "uc-wedding",      article: "Pakistani_wedding" },
  { slug: "uc-airport",      article: "Jinnah_International_Airport" },
  { slug: "uc-northern",     article: "Passu_Cones" },
  { slug: "uc-corporate",    article: "Centaurus" },
  { slug: "uc-self-drive",   article: "M-2_motorway_(Pakistan)" },
  { slug: "uc-tourist",      article: "Lahore_Fort" },

  // ----- use-case page heroes (app/<use-case>/page.tsx) — reuse but in higher-res -----
  // No need to refetch; we'll use the same URLs as above.

  // ----- guide covers (4) -----
  { slug: "guide-lahore-prices",    article: "Mall_Road,_Lahore" },
  { slug: "guide-self-drive",       article: "Motorways_of_Pakistan" },
  { slug: "guide-documents",        article: "National_Highway_Authority_(Pakistan)" },
  { slug: "guide-tourist",          article: "Shalimar_Gardens,_Lahore" },
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
    console.log(`${slug.padEnd(26)} ← ${article}`);
    console.log(`  ${src || "(no image)"}`);
  } catch (e) {
    console.log(`${slug}: ERROR ${e.message}`);
    results[slug] = null;
  }
}

console.log("\n---JSON---");
console.log(JSON.stringify(results, null, 2));
