#!/usr/bin/env node
/**
 * Bulk-submit every URL in the site's sitemaps to IndexNow.
 *
 * Usage:
 *   node scripts/indexnow-submit-all.mjs [baseUrl]
 *
 *   baseUrl defaults to https://rentalsawari.com — point it at
 *   http://localhost:3000 to test against a local dev server.
 *
 * The script reads the sitemap index, fetches each child sitemap, collects
 * every <loc>, and POSTs them to api.indexnow.org in chunks of 10,000
 * (the protocol's per-request cap).
 */

const BASE = (process.argv[2] || "https://rentalsawari.com").replace(/\/$/, "");
const HOST = new URL(BASE).host;
const KEY = "dcd9992f37007b9f194c9e76931f6ac0"; // matches public/{KEY}.txt
const ENDPOINT = "https://api.indexnow.org/indexnow";
const CHUNK = 10_000;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const indexXml = await fetchText(`${BASE}/sitemap.xml`);
let sitemapUrls = extractLocs(indexXml);

// If sitemap.xml is itself a urlset (not an index), treat it as the only sitemap.
if (!sitemapUrls.length || !sitemapUrls.some((u) => u.includes("sitemap"))) {
  sitemapUrls = [`${BASE}/sitemap.xml`];
}

const allUrls = new Set();
for (const sm of sitemapUrls) {
  const xml = await fetchText(sm);
  for (const loc of extractLocs(xml)) allUrls.add(loc);
  console.log(`${sm.split("/").pop()}: ${allUrls.size} URLs so far`);
}

const urls = [...allUrls];
console.log(`\nSubmitting ${urls.length} URLs for host ${HOST} …`);

for (let i = 0; i < urls.length; i += CHUNK) {
  const batch = urls.slice(i, i + CHUNK);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, urlList: batch }),
  });
  console.log(`batch ${i / CHUNK + 1}: ${batch.length} URLs -> HTTP ${res.status}`);
  if (!res.ok && res.status !== 202) {
    console.error("Unexpected response — check key file is live at", `${BASE}/${KEY}.txt`);
    process.exit(1);
  }
}
console.log("Done. 200 = received, 202 = key validation pending (normal on first run).");
