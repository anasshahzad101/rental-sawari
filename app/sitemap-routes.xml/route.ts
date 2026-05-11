import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { routes } from "@/data/routes";

export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();
  const body = buildUrlset(
    routes.map((r) => ({
      loc: `${SITE}/rent-a-car-${r.slug}`,
      lastmod: now,
      changefreq: "monthly" as const,
      priority: 0.7,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
