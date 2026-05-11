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
