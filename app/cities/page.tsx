import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, ShieldCheck, Banknote } from "lucide-react";
import { cities } from "@/data/cities";
import { companies } from "@/data/companies";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQSection } from "@/components/shared/FAQSection";
import { StatStrip } from "@/components/shared/StatStrip";
import { FeatureGrid } from "@/components/shared/FeatureGrid";
import { citiesIndexFAQs } from "@/data/faqs";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rent a Car in Pakistan — Browse All Cities",
  description:
    "Browse verified rent-a-car companies in every major Pakistani city — Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta and more.",
  alternates: { canonical: "/cities" },
};

export default function CitiesIndex() {
  const totalVendors = companies.length;
  const totalReviews = companies.reduce((a, c) => a + c.reviewCount, 0);

  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Cities" }]}
        eyebrow="Browse"
        title="All Cities"
        subtitle="Find verified rent-a-car companies in your city. Real prices, direct WhatsApp, no booking fees."
      />

      <StatStrip
        stats={[
          { label: "Cities live", value: cities.length.toString() },
          { label: "Verified vendors", value: totalVendors.toLocaleString("en-PK") },
          {
            label: "Total Google reviews",
            value:
              totalReviews >= 1000
                ? `${(totalReviews / 1000).toFixed(0)}k+`
                : totalReviews.toString(),
          },
          { label: "Booking fees", value: "PKR 0" },
        ]}
      />

      <FeatureGrid
        eyebrow="Why a city-first directory"
        title="Renting a car in Pakistan is hyper-local"
        subtitle="The same model rents for 30% less in Faisalabad than Islamabad. The right vendor for a Lahore wedding isn't the right vendor for a Northern Areas trip. We break the country down by city so the listings you see are actually rentable."
        features={[
          {
            Icon: Banknote,
            title: "Real per-city prices",
            body: "Each city page shows actual per-day rates in PKR. No 'call for quote' games, no hidden fees.",
          },
          {
            Icon: MessageCircle,
            title: "Direct WhatsApp contact",
            body: "Tap any listing's WhatsApp button to message the vendor with a pre-filled inquiry. No middleman.",
          },
          {
            Icon: ShieldCheck,
            title: "Verified vendors only",
            body: "Every listed company is checked — CNIC, business address, working number. The Verified badge means we confirmed all three.",
          },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8 flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
              All {cities.length} cities
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Sorted by vendor count. Each city links to a directory of all
              verified rentals in that city.
            </p>
          </div>
          <Link
            href="/guides/pakistan-car-rental-market-data-2026"
            className="text-sm font-semibold text-brand hover:underline"
          >
            See full market data →
          </Link>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[...cities]
            .sort((a, b) => b.listingCount - a.listingCount)
            .map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/rent-a-car-${city.slug}`}
                  className="group block rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                    <Image
                      src={city.heroImage}
                      alt={`Rent a car in ${city.name}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/15 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight">
                          {city.name}
                        </h2>
                        <p className="text-xs text-white/80">{city.nameUrdu}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-stone-900">
                        <MapPin className="h-3 w-3 text-brand" />
                        {city.listingCount}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-stone-900">
                        {city.listingCount} verified rentals
                      </p>
                      <p className="text-sm font-bold text-brand">
                        From {formatPKR(city.startingPrice)}/day
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-stone-500 line-clamp-1">
                      {city.popularAreas.join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <FAQSection items={citiesIndexFAQs} />
    </PageShell>
  );
}
