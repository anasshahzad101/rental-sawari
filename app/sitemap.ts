import type { MetadataRoute } from "next";
import { cities } from "@/data/cities";
import { carTypes } from "@/data/carTypes";
import { companies } from "@/data/companies";
import { guides } from "@/data/guides";

const TOP_PAIRS_PER_CITY = 5;

function comparisonPairSlugs(): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  const cities = [...new Set(companies.map((c) => c.city))];
  for (const city of cities) {
    const top = [...companies]
      .filter((c) => c.city === city)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, TOP_PAIRS_PER_CITY);
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

const BASE = "https://rentalsawari.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/cities",
    "/cars",
    "/tourist-car-rental",
    "/wedding-car-rental",
    "/airport-pickup",
    "/northern-areas-tours",
    "/corporate-monthly",
    "/self-drive-rental",
    "/tourist-packages",
    "/guides",
    "/list-your-business",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const cityRoutes = cities.map((c) => ({
    url: `${BASE}/rent-a-car-${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const carRoutes = carTypes.map((c) => ({
    url: `${BASE}/cars/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const companyRoutes = companies.map((c) => ({
    url: `${BASE}/companies/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guideRoutes = guides.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: new Date(g.publishedDate),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const compareRoutes = comparisonPairSlugs().map((slug) => ({
    url: `${BASE}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...carRoutes,
    ...companyRoutes,
    ...guideRoutes,
    ...compareRoutes,
  ];
}
