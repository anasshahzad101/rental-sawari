import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { getCompanies } from "@/lib/admin/repo/public";
import type { Company } from "@/lib/types";

export const dynamic = "force-static";
// Listings change in the admin; refresh the sitemap at most hourly.
export const revalidate = 3600;

const TOP_PER_CITY = 5;

function comparisonPairSlugs(companies: Company[]): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  const cities = [...new Set(companies.map((c) => c.city))];
  for (const city of cities) {
    const top = [...companies]
      .filter((c) => c.city === city)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, TOP_PER_CITY);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        const key = [top[i].slug, top[j].slug].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        slugs.push(`${top[i].slug}-vs-${top[j].slug}`);
      }
    }
  }
  return slugs;
}

export async function GET() {
  const companies = await getCompanies();
  const now = new Date().toISOString();
  const body = buildUrlset(
    comparisonPairSlugs(companies).map((slug) => ({
      loc: `${SITE}/compare/${slug}`,
      lastmod: now,
      changefreq: "monthly",
      priority: 0.5,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
