import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { cities } from "@/data/cities";

export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();
  const body = buildUrlset(
    cities.map((c) => ({
      loc: `${SITE}/rent-a-car-${c.slug}`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.9,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
