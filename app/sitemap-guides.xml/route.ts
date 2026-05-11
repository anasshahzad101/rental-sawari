import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { guides } from "@/data/guides";

export const dynamic = "force-static";

export function GET() {
  const body = buildUrlset(
    guides.map((g) => ({
      loc: `${SITE}/guides/${g.slug}`,
      lastmod: new Date(g.publishedDate).toISOString(),
      changefreq: "monthly",
      priority: 0.7,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
