import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Fuel, BadgeCheck } from "lucide-react";
import { carTypes, getCarTypeBySlug } from "@/data/carTypes";
import { carContext } from "@/data/carContext";
import { CarContextSection } from "@/components/cars/CarContextSection";
import { companies } from "@/data/companies";
import { cities } from "@/data/cities";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BottomCTA } from "@/components/shared/BottomCTA";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { FAQSection } from "@/components/shared/FAQSection";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { socialMeta } from "@/lib/seo";
import { offersCar } from "@/lib/fleet";

export function generateStaticParams() {
  return carTypes.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const car = getCarTypeBySlug(params.slug);
  if (!car) return { title: "Car type not found" };
  const year = new Date().getFullYear();
  const title = `Rent a ${car.name} in Pakistan (${year}) — From ${formatPKR(car.startingPrice)}/day`;
  const description = `${car.name} rental rates across Pakistan in ${year}, with driver or self-drive — from ${formatPKR(car.startingPrice)}/day. Compare verified vendors in ${cities.length}+ cities and contact owners direct on WhatsApp. No booking fees.`;
  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    ...socialMeta({ title, description, path: `/cars/${car.slug}`, image: car.image }),
  };
}

export default function CarTypePage({
  params,
}: {
  params: { slug: string };
}) {
  const car = getCarTypeBySlug(params.slug);
  if (!car) notFound();

  // Vendors that advertise this model in their listing text (see lib/fleet).
  const offerings = companies
    .filter((c) => offersCar(c, car.slug))
    .sort((a, b) => b.reviewCount - a.reviewCount);

  // We don't hold per-vendor prices, so quote the car's market starting rate.
  const startsAt = car.startingPrice;

  // Approximate brand parsing — "Toyota Corolla" → "Toyota".
  const brand = car.name.split(" ")[0];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://rentalsawari.com/cars/${car.slug}#product`,
    name: `${car.name} Rental in Pakistan`,
    description: `Rent a ${car.name} across ${cities.length} Pakistani cities from verified rental companies. ${car.capacity}-seat ${car.category.toLowerCase()}.`,
    brand: { "@type": "Brand", name: brand },
    model: car.name,
    image: car.image,
    category: car.category,
    vehicleEngine: { "@type": "EngineSpecification", fuelType: "Petrol" },
    seatingCapacity: car.capacity,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: startsAt,
      highPrice: Math.round(startsAt * 1.8),
      priceCurrency: "PKR",
      offerCount: Math.max(offerings.length, 1),
      availability: "https://schema.org/InStock",
      areaServed: { "@type": "Country", name: "Pakistan" },
    },
  };

  const carFaqs = [
    {
      q: `How much does it cost to rent a ${car.name} per day in Pakistan?`,
      a: `A ${car.name} rents from about ${formatPKR(car.startingPrice)}/day with driver, depending on the city, model year, and rental length. Multi-day and monthly bookings usually discount 10–30%. Message a vendor on WhatsApp for an exact quote — there is no booking fee.`,
    },
    {
      q: `Can I get the ${car.name} with a driver or self-drive?`,
      a: `Both. Most ${car.name} rentals in Pakistan come with an experienced driver, and many vendors also offer self-drive for renters with a valid Pakistani licence (a refundable deposit applies). Filter each city's listings by "With Driver" or "Self-Drive".`,
    },
    {
      q: `How many passengers does the ${car.name} seat?`,
      a: `The ${car.name} is a ${car.capacity}-seat ${car.category.toLowerCase()}, so plan luggage and group size accordingly — for larger groups consider a Hiace (12) or Coaster (26).`,
    },
    {
      q: `Which cities have the most ${car.name} rentals?`,
      a: `${car.name} rentals are available across ${cities.length}+ Pakistani cities, with the deepest supply in Lahore, Islamabad, and Karachi. Pick your city below to see verified vendors near you.`,
    },
    {
      q: `What documents do I need to rent a ${car.name}?`,
      a: `An original CNIC, a valid Pakistani driving licence (for self-drive), and a refundable security deposit. Foreign visitors should bring an International Driving Permit and passport with a valid Pakistan visa.`,
    },
  ];

  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title={`Own a fleet of ${car.name}s?`}
          subtitle="List your business free and start getting WhatsApp leads from customers searching for this exact car."
          primary={{ label: "List Your Business Free", href: "/list-your-business" }}
        />
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Cars", href: "/cars" },
          { label: car.name },
        ]}
        eyebrow={`${car.category} · ${car.capacity} seats`}
        title={`Rent a ${car.name} in Pakistan`}
        subtitle={`${offerings.length > 0 ? offerings.length + " verified" : "Verified"} rental companies offering the ${car.name}. Starting from ${formatPKR(startsAt)}/day.`}
      />

      {/* Hero image + facts */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-200">
            <Image
              src={car.image}
              alt={car.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              About the {car.name}
            </h2>
            <p className="mt-3 text-stone-600">
              {carContext[car.slug]?.summary ??
                `A popular ${car.category.toLowerCase()} for renting across Pakistan — comfortable for ${car.capacity} passengers and widely available with both with-driver and self-drive options depending on the rental company.`}
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              <Fact Icon={Users} label="Capacity" value={`${car.capacity} seats`} />
              <Fact Icon={Fuel} label="Category" value={car.category} />
              <Fact
                Icon={BadgeCheck}
                label="Available in"
                value={`${cities.length} cities`}
              />
              <Fact
                Icon={Users}
                label="Starts from"
                value={`${formatPKR(startsAt)}/day`}
              />
            </ul>
          </div>
        </div>
      </section>

      {carContext[car.slug] && (
        <CarContextSection
          carName={car.name}
          context={carContext[car.slug]}
        />
      )}

      {/* Offerings */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-xl font-bold text-stone-900">
            {offerings.length > 0
              ? `${offerings.length} companies offer the ${car.name}`
              : `Companies offering the ${car.name}`}
          </h2>
          {offerings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-stone-900">
                No listings yet for this car
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Check back soon, or{" "}
                <Link href="/cars" className="font-semibold text-brand hover:underline">
                  browse other car types
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {offerings.slice(0, 24).map((c) => (
                <li key={c.slug}>
                  <CompanyCard company={c} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <FAQSection
        title={`Renting a ${car.name}: FAQs`}
        subtitle={`Common questions about ${car.name} rental prices, drivers, and documents in Pakistan.`}
        items={carFaqs}
      />

      {/* Other cars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-stone-900">Browse other cars</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {carTypes
            .filter((c) => c.slug !== car.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cars/${c.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-brand hover:text-brand transition-colors"
                >
                  {c.name}
                  <Badge variant="muted" className="text-[10px]">
                    {c.category}
                  </Badge>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </PageShell>
  );
}

function Fact({
  Icon,
  label,
  value,
}: {
  Icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="inline-flex items-center gap-1.5 text-stone-500 text-xs">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-stone-900">{value}</p>
    </li>
  );
}
