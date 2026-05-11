const items = [
  { slug: "uc-airport",          article: "Jinnah_International_Airport" },
  { slug: "uc-northern",         article: "Passu_Cones" },
  { slug: "uc-corporate",        article: "Centaurus" },
  { slug: "uc-self-drive",       article: "M-2_motorway_(Pakistan)" },
  { slug: "uc-tourist",          article: "Lahore_Fort" },
  { slug: "guide-lahore-prices", article: "Mall_Road,_Lahore" },
  { slug: "guide-self-drive",    article: "M-2_motorway_(Pakistan)" },
  { slug: "guide-documents",     article: "Driving_licence_in_Pakistan" },
  { slug: "guide-tourist",       article: "Shalimar_Gardens,_Lahore" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};

for (const { slug, article } of items) {
  await sleep(1000); // be polite
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${article}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RentRidePakistan-Setup/1.0 (one-time content import)",
      },
    });
    const text = await res.text();
    let src = null;
    try {
      const j = JSON.parse(text);
      src =
        (j.originalimage && j.originalimage.source) ||
        (j.thumbnail && j.thumbnail.source) ||
        null;
    } catch {
      src = `(non-JSON: ${text.slice(0, 60)})`;
    }
    results[slug] = src;
    console.log(`${slug.padEnd(24)} ${src ?? "(no image)"}`);
  } catch (e) {
    console.log(`${slug}: ${e.message}`);
    results[slug] = null;
  }
}

console.log("\n---JSON---");
console.log(JSON.stringify(results, null, 2));
