import { cities } from "@/data/cities";
import { carTypes } from "@/data/carTypes";
import { getCompanies } from "@/lib/admin/repo/public";

/**
 * CSV download for /pakistan-car-rental-price-index-2026 (SEO plan §2.4).
 * Same aggregation as the page; served with an attachment header.
 */

export const revalidate = 3600;

export async function GET() {
  const companies = await getCompanies();
  const rows: string[] = [];

  rows.push("city,vendors,avg_rating,total_reviews,from_price_pkr," +
    carTypes.map((c) => `${c.name.toLowerCase().replace(/\s+/g, "_")}_avg_pkr`).join(","));

  for (const city of cities) {
    const cos = companies.filter((c) => c.city === city.name);
    if (!cos.length) continue;
    const ratedCount = cos.filter((c) => c.rating > 0);
    const avgRating = ratedCount.length
      ? (ratedCount.reduce((a, c) => a + c.rating, 0) / ratedCount.length).toFixed(2)
      : "";
    const reviews = cos.reduce((a, c) => a + c.reviewCount, 0);
    const catAvgs = carTypes.map((car) => {
      const prices = cos
        .flatMap((c) => c.topCars ?? [])
        .filter((t) => t.name.toLowerCase() === car.name.toLowerCase() && t.pricePerDay > 0)
        .map((t) => t.pricePerDay);
      return prices.length
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 100) * 100
        : "";
    });
    rows.push([`"${city.name}"`, cos.length, avgRating, reviews, city.startingPrice, ...catAvgs].join(","));
  }

  return new Response(rows.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pakistan-car-rental-price-index-2026.csv"',
    },
  });
}
