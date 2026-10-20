/**
 * IndexNow — instant indexing pings for Bing, Yandex, Naver, Seznam, and Yep.
 * (Google does not participate in IndexNow; keep using GSC + sitemaps there.)
 *
 * Ownership is proven by the key file hosted at the site root:
 *   /public/{INDEXNOW_KEY}.txt  →  https://rentalsawari.com/{key}.txt
 * The key is not a credential in the usual sense — it only works together
 * with that hosted file, so keeping it in the repo is fine.
 */

export const INDEXNOW_KEY = "dcd9992f37007b9f194c9e76931f6ac0";
const HOST = "rentalsawari.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Absolute URL for a company profile page. */
export function companyUrl(slug: string): string {
  return `https://${HOST}/companies/${slug}`;
}

/**
 * Submit URLs to IndexNow. Best-effort: failures are swallowed so an
 * indexing outage can never break an admin write. A 4s timeout bounds the
 * added latency on listing mutations.
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const list = urls.filter(Boolean);
  if (!list.length) return;
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, urlList: list }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Fire-and-forget: indexing is a side effect, never a blocker.
  }
}
