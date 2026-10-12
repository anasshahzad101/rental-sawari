import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { cities } from "@/data/cities";
import { carTypes } from "@/data/carTypes";
import { getCompanies } from "@/lib/admin/repo/public";
import type { Company } from "@/lib/types";
import { offersCar } from "@/lib/fleet";

export const dynamic = "force-static";
// Listings change in the admin; refresh the sitemap at most hourly.
export const revalidate = 3600;

// Keep in sync with app/rent-a/[slug]/page.tsx validCombos() — the sitemap
// must list exactly the car-in-city pages that actually pre-render.
const MIN_VENDORS = 3;

function countVendors(companies: Company[], carSlug: string, cityName: string): number {
  return companies.filter(
    (c) => c.city === cityName && offersCar(c, carSlug),
  ).length;
}

export async function GET() {
  const companies = await getCompanies();
  const now = new Date().toISOString();
  const urls: { loc: string; lastmod: string; changefreq: "weekly"; priority: number }[] = [];
  for (const car of carTypes) {
    for (const city of cities) {
      if (countVendors(companies, car.slug, city.name) >= MIN_VENDORS) {
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
