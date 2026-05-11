import { buildSitemapIndex, xmlHeaders, SITE } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();
  const body = buildSitemapIndex([
    { loc: `${SITE}/sitemap-pages.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-cities.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-areas.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-cars.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-car-in-city.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-routes.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-companies.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-guides.xml`, lastmod: now },
    { loc: `${SITE}/sitemap-compare.xml`, lastmod: now },
  ]);
  return new Response(body, { headers: xmlHeaders });
}
