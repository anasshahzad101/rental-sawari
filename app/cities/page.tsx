import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cities } from "@/data/cities";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQSection } from "@/components/shared/FAQSection";
import { citiesIndexFAQs } from "@/data/faqs";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rent a Car in Pakistan — Browse All Cities",
  description:
    "Browse verified rent-a-car companies in every major Pakistani city — Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta.",
  alternates: { canonical: "/cities" },
};

export default function CitiesIndex() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Cities" }]}
        eyebrow="Browse"
        title="All Cities"
        subtitle="Find verified rent-a-car companies in your city. 8 cities live today, more coming weekly."
      />

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="prose">
            <p className="answer-block">
              <strong>RentalSawari operates in 8 Pakistani cities — Lahore,
              Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Peshawar,
              and Quetta — with 1,085 verified rent-a-car companies in
              total.</strong> Each city has its own vendor density, pricing
              norms, and operational quirks. Pick a city below to see real
              listings, real prices, and direct WhatsApp contact.
            </p>
            <h2>Why a city-first directory?</h2>
            <p>
              Renting a car in Pakistan is a hyper-local decision. The same
              car model rents for PKR 6,000/day in Faisalabad and PKR
              8,500/day in Islamabad. The vendor who handles your wedding
              decoration in Lahore&apos;s DHA Phase 5 isn&apos;t the right vendor
              for your Northern Areas trip from Bahria Town, Islamabad. We
              break the country down by city so the listings you see are
              actually rentable for your trip.
            </p>
            <h2>How city pages work</h2>
            <p>
              Each city page lists every verified vendor in that city, sorted
              by Google review count (real social proof, not paid placement).
              You can filter by area, car type, with-driver vs self-drive,
              and service category. Every listing has a WhatsApp button with
              a pre-filled enquiry, plus the company&apos;s phone, address,
              and average rating. We never insert a booking step — you talk
              to the vendor directly.
            </p>
            <h2>Which cities have the deepest supply?</h2>
            <p>
              Lahore (371 vendors), Islamabad (265), and Karachi (192) make
              up 76% of our directory. Smaller cities — Multan, Peshawar,
              Quetta — have 20-50 vendors each, but quality is concentrated:
              Multan has the highest average rating in Pakistan (4.88★).
              For a full breakdown see the{" "}
              <Link href="/guides/pakistan-car-rental-market-data-2026">
                market data report
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {cities.map((city) => (
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
                    className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h2 className="text-xl font-extrabold tracking-tight">
                      {city.name}
                    </h2>
                    <p className="text-xs text-white/80">{city.nameUrdu}</p>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-900">
                      {city.listingCount} rentals
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
      </div>

      <FAQSection items={citiesIndexFAQs} />
    </PageShell>
  );
}
