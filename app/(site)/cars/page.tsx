import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Fuel, Users, Wrench } from "lucide-react";
import { carTypes } from "@/data/carTypes";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQSection } from "@/components/shared/FAQSection";
import { StatStrip } from "@/components/shared/StatStrip";
import { FeatureGrid } from "@/components/shared/FeatureGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { Badge } from "@/components/ui/badge";
import { carsIndexFAQs } from "@/data/faqs";
import { ADSENSE_SLOTS } from "@/lib/adsense";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Car Types — Rent a Car in Pakistan",
  description:
    "Browse every car type available for rent in Pakistan, from PKR 3,000/day Mehrans to luxury Land Cruisers. Compare prices and find verified rental companies.",
  alternates: { canonical: "/cars" },
};

const categoryOrder = [
  "Economy",
  "Sedan",
  "Van",
  "SUV",
  "Luxury",
  "Coaster",
] as const;

const categoryColor: Record<string, string> = {
  Economy: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Sedan: "bg-sky-50 text-sky-700 ring-sky-100",
  Van: "bg-violet-50 text-violet-700 ring-violet-100",
  SUV: "bg-amber-50 text-amber-700 ring-amber-100",
  Luxury: "bg-rose-50 text-rose-700 ring-rose-100",
  Coaster: "bg-stone-100 text-stone-700 ring-stone-200",
};

export default function CarsIndex() {
  const grouped = categoryOrder.map((cat) => ({
    cat,
    items: carTypes.filter((c) => c.category === cat),
  }));

  const cheapest = Math.min(...carTypes.map((c) => c.startingPrice));
  const mostExpensive = Math.max(...carTypes.map((c) => c.startingPrice));

  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Cars" }]}
        eyebrow="Browse"
        title="All Car Types"
        subtitle="From economy hatchbacks to luxury SUVs — every popular model available for rent in Pakistan."
      />

      <StatStrip
        stats={[
          { label: "Models listed", value: carTypes.length.toString() },
          { label: "Categories", value: categoryOrder.length.toString() },
          { label: "Cheapest /day", value: formatPKR(cheapest) },
          { label: "Premium /day", value: formatPKR(mostExpensive) },
        ]}
      />

      {/* Category snapshot row */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-3xl mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Price ranges
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              What you&apos;ll pay by category
            </h2>
            <p className="mt-3 text-stone-600">
              Starting daily rates across the directory. Multi-day rentals
              discount 10–30%, monthly contracts 15–30%.
            </p>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {grouped.map(({ cat, items }) => {
              if (items.length === 0) return null;
              const from = Math.min(...items.map((c) => c.startingPrice));
              return (
                <li
                  key={cat}
                  className={`rounded-2xl ring-1 px-4 py-4 ${categoryColor[cat]}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider">
                    {cat}
                  </p>
                  <p className="mt-2 text-base font-extrabold text-stone-900">
                    From {formatPKR(from)}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {items.length} {items.length === 1 ? "model" : "models"}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <FeatureGrid
        eyebrow="How to pick"
        title="Choose the right car for your trip"
        subtitle="Most Pakistani renters underspend on category and regret it. Quick framework:"
        features={[
          {
            Icon: Users,
            title: "Group size first",
            body: "1-4 passengers → sedan (Corolla, Civic). 5-7 → APV. 8-12 → Hiace. 15+ → Coaster. Don't fit 6 adults in an APV for a 6-hour trip.",
          },
          {
            Icon: Sparkles,
            title: "Match the occasion",
            body: "Weddings call for a decorated Mercedes or Land Cruiser V8. Business pickups: Civic or Corolla. Northern Areas: Prado or Land Cruiser only.",
          },
          {
            Icon: Fuel,
            title: "Check fuel + age",
            body: "CNG-converted economy cars (Mehran, Cultus) save 30-40% on fuel. SUVs and luxury are diesel and run premium fuel cost. Always confirm model year.",
          },
        ]}
      />

      <AdSlot slot={ADSENSE_SLOTS.indexPage} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {grouped.map(({ cat, items }) => {
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                  {cat}
                </h2>
                <Badge variant="muted" className="text-xs">
                  {items.length} {items.length === 1 ? "model" : "models"}
                </Badge>
              </div>
              <ul className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((car) => (
                  <li key={car.slug}>
                    <Link
                      href={`/cars/${car.slug}`}
                      className="group block rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-stone-100">
                        <Image
                          src={car.image}
                          alt={car.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-3">
                        <h3 className="text-sm font-bold text-stone-900">
                          {car.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {car.capacity} seats
                        </p>
                        <p className="mt-1 text-xs font-semibold text-brand">
                          From {formatPKR(car.startingPrice)}/day
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <FAQSection items={carsIndexFAQs} />
    </PageShell>
  );
}
