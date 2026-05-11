import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { cities } from "@/data/cities";
import { carTypes } from "@/data/carTypes";
import { companies } from "@/data/companies";

export const dynamic = "force-static";

const MIN_VENDORS = 3;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function countVendors(carSlug: string, cityName: string): number {
  return companies.filter(
    (c) =>
      c.city === cityName &&
      (c.topCars ?? []).some((tc) => slugify(tc.name) === carSlug),
  ).length;
}

export function GET() {
  const now = new Date().toISOString();
  const urls: { loc: string; lastmod: string; changefreq: "weekly"; priority: number }[] = [];
  for (const car of carTypes) {
    for (const city of cities) {
      if (countVendors(car.slug, city.name) >= MIN_VENDORS) {
        urls.push({
          loc: `${SITE}/rent-a-${car.slug}-in-${city.slug}`,
          lastmod: now,
          changefreq: "weekly",
          priority: 0.7,
        });
      }
    }
  }
  return new Response(buildUrlset(urls), { headers: xmlHeaders });
}
