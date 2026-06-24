/**
 * Helpers for building Sitemap XML. We use route handlers (not Next.js's
 * built-in app/sitemap.ts convention) because the spec requires a
 * sitemap-index referencing multiple named sub-sitemaps:
 *
 *   /sitemap.xml             — index
 *   /sitemap-pages.xml       — static marketing pages
 *   /sitemap-cities.xml      — city listing pages
 *   /sitemap-areas.xml       — area-within-city listing pages
 *   /sitemap-cars.xml        — car type pages
 *   /sitemap-car-in-city.xml — city × car combination pages
 *   /sitemap-routes.xml      — intercity route pages
 *   /sitemap-companies.xml   — individual vendor profiles
 *   /sitemap-guides.xml      — editorial articles
 *   /sitemap-compare.xml     — comparison pages
 *
 * Keep this list, app/sitemap.xml/route.ts (the index) and app/robots.ts
 * in sync whenever a sub-sitemap is added or removed.
 */

export const SITE = "https://rentalsawari.com";

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: number;
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildUrlset(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : "";
      const changefreq = e.changefreq
        ? `<changefreq>${e.changefreq}</changefreq>`
        : "";
      const priority =
        e.priority !== undefined
          ? `<priority>${e.priority.toFixed(1)}</priority>`
          : "";
      return `<url><loc>${escape(e.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

export function buildSitemapIndex(
  sitemaps: Array<{ loc: string; lastmod?: string }>,
): string {
  const items = sitemaps
    .map((s) => {
      const lastmod = s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : "";
      return `<sitemap><loc>${escape(s.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

export const xmlHeaders = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=3600, must-revalidate",
};
