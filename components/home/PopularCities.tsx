import Image from "next/image";
import Link from "next/link";
import { cities } from "@/data/cities";
import { SectionHeading } from "./SectionHeading";
import { formatPKR } from "@/lib/utils";

export function PopularCities() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <SectionHeading
        title="Browse by City"
        subtitle="Find verified rental companies in your city"
      />

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/rent-a-car-${city.slug}`}
              className="group relative block aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <Image
                src={city.heroImage}
                alt={`Rent a car in ${city.name}, Pakistan`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/30 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {city.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/90">
                  {city.listingCount} rentals · From {formatPKR(city.startingPrice)}
                  /day
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
