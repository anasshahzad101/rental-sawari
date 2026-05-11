import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { carTypes } from "@/data/carTypes";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FAQSection } from "@/components/shared/FAQSection";
import { Badge } from "@/components/ui/badge";
import { carsIndexFAQs } from "@/data/faqs";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Car Types — Rent a Car in Pakistan",
  description:
    "Browse every car type available for rent in Pakistan, from PKR 3,500/day Mehrans to luxury Land Cruisers. Compare prices and find verified rental companies.",
  alternates: { canonical: "/cars" },
};

const categoryOrder = ["Economy", "Sedan", "Van", "SUV", "Luxury", "Coaster"] as const;

export default function CarsIndex() {
  const grouped = categoryOrder.map((cat) => ({
    cat,
    items: carTypes.filter((c) => c.category === cat),
  }));

  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Cars" }]}
        eyebrow="Browse"
        title="All Car Types"
        subtitle="From economy hatchbacks to luxury SUVs — every popular model available for rent in Pakistan."
      />

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="prose">
            <p className="answer-block">
              <strong>Pakistani rental fleets are dominated by twelve common
              car models</strong> — Suzuki Mehran and Cultus at the budget
              end, Toyota Corolla and Honda Civic in the family-sedan range,
              Toyota Hiace and Suzuki APV for vans, Toyota Fortuner and
              Prado for SUVs, and Toyota Land Cruiser V8 / Mercedes-Benz at
              the luxury end. Each has different pricing, fuel economy, and
              Pakistan-specific quirks.
            </p>
            <h2>What determines the rental cost of each car?</h2>
            <p>
              Daily rate is set by category and age. A Mehran rents from PKR
              3,500/day; a Honda Civic averages PKR 6,500-8,500/day; a Toyota
              Hiace runs PKR 9,000-10,500/day; a Land Cruiser V8 reaches PKR
              32,000-35,000/day. Within each category, newer model years
              command 15-30% premium. Multi-day rentals discount 10-30%.
            </p>
            <h2>Which car should I pick for my trip?</h2>
            <p>
              For city use and short out-of-town trips, a sedan (Corolla or
              Civic) with driver is the default. For Northern Areas travel,
              a Prado or Land Cruiser V8 is the right call — both have the
              power and ground clearance for the Karakoram Highway. For
              groups of 6-12, a Hiace with driver is the standard. For
              weddings, the rukhsati car is usually a decorated Mercedes or
              a Land Cruiser V8.
            </p>
            <h2>Pakistan-market nuances</h2>
            <p>
              Most rental vehicles in Pakistan are used imports — typically
              2-8 years old. CNG-converted units are common in the budget
              tier (Mehran, Cultus, APV) and offer significant fuel savings.
              Higher-end cars (Prado, Land Cruiser, Mercedes) are kept on
              diesel and command full premium rates. Always confirm the
              specific year and condition before paying any deposit.
            </p>
          </div>
        </div>
      </section>

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
                  {items.length} {items.length === 1 ? "car" : "cars"}
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
