import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { areas } from "@/data/areas";
import { companies } from "@/data/companies";

export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();
  const body = buildUrlset(
    areas
      .filter((a) => {
        // Drop areas with fewer than 3 matching vendors — those pages are
        // noindexed anyway and we don't want to clutter the sitemap.
        const matches = companies.filter(
          (c) =>
            c.city === a.cityName &&
            a.matchers.some((m) =>
              c.area.toLowerCase().includes(m.toLowerCase()),
            ),
        );
        return matches.length >= 3;
      })
      .map((a) => ({
        loc: `${SITE}/rent-a-car-${a.slug}`,
        lastmod: now,
        changefreq: "weekly" as const,
        priority: 0.7,
      })),
  );
  return new Response(body, { headers: xmlHeaders });
}
