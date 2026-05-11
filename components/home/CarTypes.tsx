import Image from "next/image";
import Link from "next/link";
import { popularCarTypes } from "@/data/carTypes";
import { SectionHeading } from "./SectionHeading";
import { formatPKR } from "@/lib/utils";

export function CarTypes() {
  // Show 8 popular cars on the homepage.
  const cars = popularCarTypes.slice(0, 8);

  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeading
          title="Browse by Car"
          subtitle="From economy cars to luxury SUVs"
        />

        {/* Mobile: horizontal scroll */}
        <ul className="md:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
          {cars.map((car) => (
            <li
              key={car.slug}
              className="snap-start shrink-0 w-[160px]"
            >
              <CarCard car={car} />
            </li>
          ))}
        </ul>

        {/* Desktop: grid */}
        <ul className="hidden md:grid md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {cars.map((car) => (
            <li key={car.slug}>
              <CarCard car={car} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CarCard({ car }: { car: (typeof popularCarTypes)[number] }) {
  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group block rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-stone-100">
        <Image
          src={car.image}
          alt={car.name}
          fill
          sizes="(min-width: 768px) 25vw, 160px"
          className="object-cover"
        />
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
          {car.category}
        </p>
        <h3 className="mt-0.5 text-sm font-bold text-stone-900 leading-tight">
          {car.name}
        </h3>
        <p className="mt-1 text-xs font-semibold text-brand">
          From {formatPKR(car.startingPrice)}/day
        </p>
      </div>
    </Link>
  );
}
