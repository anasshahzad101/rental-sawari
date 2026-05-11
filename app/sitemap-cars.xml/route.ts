import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { carTypes } from "@/data/carTypes";

export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();
  const body = buildUrlset(
    carTypes.map((c) => ({
      loc: `${SITE}/cars/${c.slug}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.8,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
