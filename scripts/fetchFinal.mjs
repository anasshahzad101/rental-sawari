// Final pass for items that returned wrong/no images. Try alternate articles
// and skip SVGs (we want photographs, not logos).

const items = [
  // Centaurus constellation SVG was wrong — try the Islamabad mall directly
  { slug: "uc-corporate",        article: "The_Centaurus" },
  // M-2 motorway returned a road-sign SVG — try an actual road photo article
  { slug: "uc-self-drive",       article: "Lahore%E2%80%93Islamabad_Motorway" },
  { slug: "guide-self-drive",    article: "Lahore%E2%80%93Islamabad_Motorway" },
  // Still rate-limited from previous attempt
  { slug: "uc-airport",          article: "Jinnah_International_Airport" },
  { slug: "uc-northern",         article: "Passu_Cones" },
  // Hadn't returned any image
  { slug: "guide-lahore-prices", article: "Lahore" },         // reuse Badshahi for a Lahore-flavoured cover
  { slug: "guide-documents",     article: "Driving_in_Pakistan" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isPhotograph(url) {
  if (!url) return false;
  return !url.toLowerCase().endsWith(".svg") && !url.toLowerCase().includes(".svg.");
}

const results = {};
for (const { slug, article } of items) {
  await sleep(2000); // generous delay
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
      const candidate =
        (j.originalimage && j.originalimage.source) ||
        (j.thumbnail && j.thumbnail.source) ||
        null;
      src = isPhotograph(candidate) ? candidate : `(skipped non-photo: ${candidate})`;
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
