// Pull Wikipedia REST summary images for the 13 new cities.
// Run with a delay between requests to avoid rate limits.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const items = [
  { slug: "sialkot", article: "Sialkot" },
  { slug: "gujranwala", article: "Gujranwala" },
  { slug: "gujrat", article: "Gujrat,_Pakistan" },
  { slug: "sargodha", article: "Sargodha" },
  { slug: "sheikhupura", article: "Sheikhupura" },
  { slug: "bahawalpur", article: "Bahawalpur" },
  { slug: "rahim-yar-khan", article: "Rahim_Yar_Khan" },
  { slug: "chakwal", article: "Chakwal" },
  { slug: "okara", article: "Okara,_Pakistan" },
  { slug: "dera-ghazi-khan", article: "Dera_Ghazi_Khan" },
  { slug: "kasur", article: "Kasur" },
  { slug: "narowal", article: "Narowal" },
  { slug: "mianwali", article: "Mianwali" },
];

const results = {};
for (const { slug, article } of items) {
  await sleep(1500);
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${article}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "RentalSawari-Setup/1.0",
        },
      },
    );
    const text = await res.text();
    let src = null;
    try {
      const j = JSON.parse(text);
      src =
        (j.originalimage && j.originalimage.source) ||
        (j.thumbnail && j.thumbnail.source) ||
        null;
    } catch {
      src = `(non-JSON: ${text.slice(0, 50)})`;
    }
    results[slug] = src;
    console.log(`${slug.padEnd(20)} ← ${article}`);
    console.log(`  ${src || "(no image)"}`);
  } catch (e) {
    console.log(`${slug}: ERROR ${e.message}`);
    results[slug] = null;
  }
}

console.log("\n---JSON---");
console.log(JSON.stringify(results, null, 2));
