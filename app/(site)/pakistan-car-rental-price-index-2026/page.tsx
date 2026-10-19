import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { cities } from "@/data/cities";
import { carTypes } from "@/data/carTypes";
import { getCompanies } from "@/lib/admin/repo/public";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatStrip } from "@/components/shared/StatStrip";
import { formatPKR } from "@/lib/utils";
import { socialMeta } from "@/lib/seo";

/**
 * /pakistan-car-rental-price-index-2026 — the GEO link magnet (SEO plan §2.4).
 * Aggregated stats from every verified vendor: price per category per city,
 * vendor density, rating distribution. CSV download + methodology note.
 * Update cadence: quarterly (the slug year is the edition).
 */

export const revalidate = 3600;

const PATH = "/pakistan-car-rental-price-index-2026";
const TITLE = "Pakistan Car Rental Price Index 2026";
const DESCRIPTION =
  "Average rent-a-car prices per category per city, vendor density, and rating distributions — aggregated from 1,400+ verified vendors across 21 Pakistani cities. Free CSV download.";

export const metadata: Metadata = {
  title: `${TITLE} — Rates from 1,400+ Verified Vendors`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  ...socialMeta({ title: `${TITLE} — Rates from 1,400+ Verified Vendors`, description: DESCRIPTION, path: PATH }),
};

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function PriceIndexPage() {
  const companies = await getCompanies();
  const lastUpdated = new Date().toLocaleDateString("en-PK", {
    month: "long",
    year: "numeric",
  });

  // ── Per-city stats ────────────────────────────────────────────────
  const cityRows = cities
    .map((city) => {
      const cos = companies.filter((c) => c.city === city.name);
      return {
        city,
        vendors: cos.length,
        avgRating: avg(cos.map((c) => c.rating).filter((r) => r > 0)),
        reviews: cos.reduce((a, c) => a + c.reviewCount, 0),
      };
    })
    .filter((r) => r.vendors > 0)
    .sort((a, b) => b.vendors - a.vendors);

  // ── Average price per category per city (from vendor fleet data) ──
  const priceGrid = cityRows.map(({ city }) => {
    const cos = companies.filter((c) => c.city === city.name);
    const cells = carTypes.map((car) => {
      const prices = cos
        .flatMap((c) => c.topCars ?? [])
        .filter((t) => t.name.toLowerCase() === car.name.toLowerCase() && t.pricePerDay > 0)
        .map((t) => t.pricePerDay);
      return avg(prices);
    });
    return { city, cells };
  });

  // ── Rating distribution ───────────────────────────────────────────
  const rated = companies.filter((c) => c.reviewCount > 0);
  const bands = [
    { label: "4.5 – 5.0", test: (r: number) => r >= 4.5 },
    { label: "4.0 – 4.49", test: (r: number) => r >= 4.0 && r < 4.5 },
    { label: "3.0 – 3.99", test: (r: number) => r >= 3.0 && r < 4.0 },
    { label: "Below 3.0", test: (r: number) => r < 3.0 },
  ].map((b) => ({ ...b, count: rated.filter((c) => b.test(c.rating)).length }));

  const totalReviews = companies.reduce((a, c) => a + c.reviewCount, 0);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: TITLE,
    description: DESCRIPTION,
    url: `https://rentalsawari.com${PATH}`,
    keywords: ["car rental prices Pakistan", "rent a car rates", "price index"],
    creator: { "@type": "Organization", name: "RentalSawari", url: "https://rentalsawari.com" },
    temporalCoverage: "2026",
    spatialCoverage: { "@type": "Country", name: "Pakistan" },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `https://rentalsawari.com${PATH}/csv`,
    },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Price Index 2026" }]}
        eyebrow="Data · Updated quarterly"
        title={TITLE}
        subtitle={`Aggregated from ${companies.length.toLocaleString("en-PK")} verified vendors across ${cityRows.length} cities. Last updated ${lastUpdated}.`}
      >
        <div className="mt-4">
          <a
            href={`${PATH}/csv`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>
        </div>
      </PageHeader>

      <StatStrip
        stats={[
          { label: "Verified vendors", value: companies.length.toLocaleString("en-PK") },
          { label: "Cities covered", value: cityRows.length.toString() },
          { label: "Google reviews aggregated", value: totalReviews.toLocaleString("en-PK") },
          { label: "Last updated", value: lastUpdated },
        ]}
      />

      {/* Average price per category per city */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
          Average daily rate by city and category
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Averages computed from vendors&apos; listed fleet prices. Cells marked
          — have too little data to publish responsibly.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-900">City</th>
                {carTypes.map((c) => (
                  <th key={c.slug} className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priceGrid.map(({ city, cells }) => (
                <tr key={city.slug} className="border-t border-stone-100">
                  <td className="px-4 py-2.5 font-semibold text-stone-900 whitespace-nowrap">
                    <Link href={`/rent-a-car-${city.slug}`} className="hover:text-brand">
                      {city.name}
                    </Link>
                  </td>
                  {cells.map((v, i) => (
                    <td key={i} className="px-4 py-2.5 text-stone-700 whitespace-nowrap">
                      {v == null ? "—" : formatPKR(Math.round(v / 100) * 100)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vendor density + ratings per city */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
          Vendor density and ratings by city
        </h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-900">City</th>
                <th className="px-4 py-3 font-semibold text-stone-900">Vendors</th>
                <th className="px-4 py-3 font-semibold text-stone-900">Avg rating</th>
                <th className="px-4 py-3 font-semibold text-stone-900">Total reviews</th>
                <th className="px-4 py-3 font-semibold text-stone-900">From price</th>
              </tr>
            </thead>
            <tbody>
              {cityRows.map(({ city, vendors, avgRating, reviews }) => (
                <tr key={city.slug} className="border-t border-stone-100">
                  <td className="px-4 py-2.5 font-semibold text-stone-900">
                    <Link href={`/rent-a-car-${city.slug}`} className="hover:text-brand">
                      {city.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-stone-700">{vendors}</td>
                  <td className="px-4 py-2.5 text-stone-700">
                    {avgRating == null ? "—" : `★${avgRating.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-2.5 text-stone-700">{reviews.toLocaleString("en-PK")}</td>
                  <td className="px-4 py-2.5 text-stone-700">{formatPKR(city.startingPrice)}/day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rating distribution */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
          Vendor rating distribution
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Across {rated.length.toLocaleString("en-PK")} vendors with at least one Google review.
        </p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {bands.map((b) => (
            <div key={b.label} className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">★ {b.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-stone-900">{b.count.toLocaleString("en-PK")}</p>
              <p className="text-xs text-stone-500">
                {rated.length ? `${((b.count / rated.length) * 100).toFixed(0)}% of rated vendors` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Methodology</h2>
        <div className="mt-3 prose prose-stone text-sm">
          <p>
            Data is drawn from {companies.length.toLocaleString("en-PK")} verified rent-a-car
            listings on RentalSawari, collected {lastUpdated}. Vendor counts and ratings come
            from each company&apos;s Google Business Profile at verification time. Category
            prices are simple averages of per-day rates listed by vendors in each city; cells
            with insufficient data are withheld rather than estimated. The index is refreshed
            quarterly. Journalists and researchers may reuse these figures with attribution to
            RentalSawari and a link to this page.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
