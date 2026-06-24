import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Fuel, MapPin } from "lucide-react";
import { cities } from "@/data/cities";
import { carTypes } from "@/data/carTypes";
import { carContext } from "@/data/carContext";
import { companies } from "@/data/companies";
import { guides } from "@/data/guides";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BottomCTA } from "@/components/shared/BottomCTA";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { FAQSection } from "@/components/shared/FAQSection";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { socialMeta } from "@/lib/seo";

const SITE = "https://rentalsawari.com";
const MIN_VENDORS = 3;

/**
 * City × car combination pages.
 *
 * URL pattern (per CTM spec): `/rent-a-{car-slug}-in-{city-slug}`
 * e.g. /rent-a-toyota-corolla-in-lahore
 *
 * We only pre-render combinations that have at least MIN_VENDORS verified
 * vendors offering that car in that city. Below-threshold combinations
 * return 404 — the spec explicitly forbids empty pages.
 */

interface ComboKey {
  carSlug: string;
  citySlug: string;
}

function slugifyCarName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function vendorsFor(carSlug: string, cityName: string) {
  return companies
    .filter(
      (c) =>
        c.city === cityName &&
        (c.topCars ?? []).some((tc) => slugifyCarName(tc.name) === carSlug),
    )
    .sort((a, b) => b.reviewCount - a.reviewCount);
}

function validCombos(): ComboKey[] {
  const out: ComboKey[] = [];
  for (const car of carTypes) {
    for (const city of cities) {
      if (vendorsFor(car.slug, city.name).length >= MIN_VENDORS) {
        out.push({ carSlug: car.slug, citySlug: city.slug });
      }
    }
  }
  return out;
}

function parseSlug(slug: string): { carSlug: string; citySlug: string } | null {
  // Pattern: "{car}-in-{city}". The car slug itself may contain hyphens
  // (e.g. "toyota-corolla"), so we split on the literal `-in-` and trust
  // that no car or city contains "-in-" itself.
  const idx = slug.indexOf("-in-");
  if (idx === -1) return null;
  return {
    carSlug: slug.slice(0, idx),
    citySlug: slug.slice(idx + 4),
  };
}

export function generateStaticParams() {
  return validCombos().map(({ carSlug, citySlug }) => ({
    slug: `${carSlug}-in-${citySlug}`,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const parsed = parseSlug(params.slug);
  if (!parsed) return { title: "Not found" };
  const car = carTypes.find((c) => c.slug === parsed.carSlug);
  const city = cities.find((c) => c.slug === parsed.citySlug);
  if (!car || !city) return { title: "Not found" };
  const vendors = vendorsFor(car.slug, city.name);
  const title = `Rent a ${car.name} in ${city.name} — ${vendors.length} Vendors | RentalSawari`;
  const description = `Compare ${car.name} rentals in ${city.name} from ${vendors.length} verified vendors. Real prices, direct WhatsApp, no booking fees.`;
  return {
    title,
    description,
    alternates: { canonical: `/rent-a-${car.slug}-in-${city.slug}` },
    ...socialMeta({
      title,
      description,
      path: `/rent-a-${car.slug}-in-${city.slug}`,
      image: car.image,
    }),
  };
}

export default function CarInCityPage({
  params,
}: {
  params: { slug: string };
}) {
  const parsed = parseSlug(params.slug);
  if (!parsed) notFound();
  const car = carTypes.find((c) => c.slug === parsed.carSlug);
  const city = cities.find((c) => c.slug === parsed.citySlug);
  if (!car || !city) notFound();

  const vendors = vendorsFor(car.slug, city.name);
  if (vendors.length < MIN_VENDORS) notFound();

  const cheapestOffer = Math.min(
    ...vendors.flatMap((v) =>
      (v.topCars ?? [])
        .filter((tc) => slugifyCarName(tc.name) === car.slug)
        .map((tc) => tc.pricePerDay),
    ),
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${car.name} Rental in ${city.name}`,
    description: `Rent a ${car.name} in ${city.name} from ${vendors.length} verified rental companies.`,
    brand: { "@type": "Brand", name: car.name.split(" ")[0] },
    model: car.name,
    image: car.image,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: cheapestOffer,
      highPrice: Math.round(cheapestOffer * 1.5),
      priceCurrency: "PKR",
      offerCount: vendors.length,
      availability: "https://schema.org/InStock",
      areaServed: { "@type": "City", name: city.name },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: city.name,
        item: `${SITE}/rent-a-car-${city.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Rent a ${car.name} in ${city.name}`,
      },
    ],
  };

  const faqs = [
    {
      q: `How much does it cost to rent a ${car.name} in ${city.name}?`,
      a: `${car.name} rentals in ${city.name} start from ${formatPKR(cheapestOffer)}/day across the ${vendors.length} verified vendors on RentalSawari. Prices vary by vehicle year, service (with driver vs self-drive), and rental duration. Multi-day rentals typically discount 10-25%.`,
    },
    {
      q: `Which vendor has the best-rated ${car.name} in ${city.name}?`,
      a: `${vendors[0].name} in ${vendors[0].area} has the highest review count (${vendors[0].reviewCount} Google reviews at ${vendors[0].rating.toFixed(1)}★). Other top options include ${vendors.slice(1, 3).map((v) => v.name).join(" and ")}. Message 2-3 on WhatsApp to compare current quotes.`,
    },
    {
      q: `Is the ${car.name} available for self-drive in ${city.name}?`,
      a: `Self-drive availability for the ${car.name} depends on the vendor and vehicle class. Filter the listings below to see which vendors offer self-drive specifically. Standard self-drive deposits are PKR 25,000-100,000 depending on car age.`,
    },
    {
      q: `What documents do I need to rent a ${car.name} in ${city.name}?`,
      a: "Original CNIC, a valid Pakistani driving licence (for self-drive), and a refundable security deposit. Foreign visitors should bring an International Driving Permit and passport with valid Pakistan visa.",
    },
    {
      q: `Can I take a ${car.name} on a long-distance trip from ${city.name}?`,
      a: `Yes — most vendors allow inter-city trips. Confirm the per-day mileage cap (typically 200-300 km) and out-of-city surcharge (PKR 2,000-4,000) in your WhatsApp inquiry.`,
    },
  ];

  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title={`Looking for a ${car.name} rental in ${city.name}?`}
          subtitle="Message a verified vendor on WhatsApp directly. No booking fees, no commissions."
          primary={{
            label: "Browse Vendors",
            href: "#vendors",
          }}
        />
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: city.name, href: `/rent-a-car-${city.slug}` },
          { label: `${car.name} in ${city.name}` },
        ]}
        eyebrow={`${car.category} · ${city.name}`}
        title={`Rent a ${car.name} in ${city.name}`}
        subtitle={`${vendors.length} verified vendors offer the ${car.name} in ${city.name}. Starting from ${formatPKR(cheapestOffer)}/day.`}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <Users className="h-4 w-4 text-brand" />
            <span className="font-semibold">{car.capacity} seats</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <Fuel className="h-4 w-4 text-brand" />
            <span>{car.category}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <MapPin className="h-4 w-4 text-brand" />
            <span>
              <span className="font-semibold">{vendors.length}</span> vendors in {city.name}
            </span>
          </div>
        </div>
      </PageHeader>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="prose">
            <p className="answer-block">
              <strong>
                The {car.name} rents from {formatPKR(cheapestOffer)}/day in{" "}
                {city.name}
              </strong>{" "}
              across {vendors.length} verified RentalSawari vendors. Top-rated:{" "}
              {vendors
                .slice(0, 3)
                .map((v) => v.name)
                .join(", ")}
              . Filter below by service type to narrow to with-driver, self-drive,
              wedding, or airport-pickup vendors.
            </p>
            {carContext[car.slug] && (
              <>
                <h2>About the {car.name} in {city.name}</h2>
                <p>{carContext[car.slug].summary}</p>
                <h2>Best use cases</h2>
                <p>{carContext[car.slug].bestFor}</p>
                <h2>Fuel economy</h2>
                <p>{carContext[car.slug].fuelEconomy}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="vendors" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            {car.name} vendors in {city.name}
          </h2>
          <Badge variant="muted">{vendors.length}</Badge>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {vendors.slice(0, 30).map((c) => (
            <li key={c.slug}>
              <CompanyCard company={c} />
            </li>
          ))}
        </ul>
      </section>

      <FAQSection
        title={`FAQ — Renting a ${car.name} in ${city.name}`}
        items={faqs}
      />

      <RelatedLinks
        title="More for renters"
        groups={[
          {
            title: `Other cars in ${city.name}`,
            links: carTypes
              .filter((c) => c.slug !== car.slug)
              .slice(0, 6)
              .map((c) => ({
                label: `Rent a ${c.name} in ${city.name}`,
                href: `/rent-a-${c.slug}-in-${city.slug}`,
              })),
          },
          {
            title: `Same car, other cities`,
            links: cities
              .filter((c) => c.slug !== city.slug)
              .slice(0, 6)
              .map((c) => ({
                label: `${car.name} in ${c.name}`,
                href: `/rent-a-${car.slug}-in-${c.slug}`,
              })),
          },
          {
            title: "Guides",
            links: guides.slice(0, 4).map((g) => ({
              label: g.title,
              href: `/guides/${g.slug}`,
            })),
          },
        ]}
      />
    </PageShell>
  );
}
