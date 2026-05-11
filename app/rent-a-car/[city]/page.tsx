import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cities } from "@/data/cities";
import { companies } from "@/data/companies";
import { carTypes, popularCarTypes } from "@/data/carTypes";
import { cityContext } from "@/data/cityContext";
import { guides } from "@/data/guides";
import { areas, getArea } from "@/data/areas";
import { routes, getRoute } from "@/data/routes";
import { CityContextSection } from "@/components/cities/CityContextSection";
import { AreaPage } from "@/components/cities/AreaPage";
import { RoutePage } from "@/components/cities/RoutePage";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BottomCTA } from "@/components/shared/BottomCTA";
import { CityListings } from "@/components/cities/CityListings";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { MapPin, Star, Users } from "lucide-react";

/**
 * Dynamic dispatcher for `/rent-a-car-{slug}` URLs.
 *
 * `slug` resolves to one of three rendering paths:
 *   1. Pure city  (e.g. "lahore")          → CityPageBody
 *   2. Area-city  (e.g. "dha-lahore")      → AreaPage
 *   3. Route      (e.g. "lahore-to-hunza") → RoutePage (handled here too;
 *      see app/data/routes.ts)
 *
 * The slug-pattern match is strict — no fall-through guessing.
 */

export function generateStaticParams() {
  return [
    ...cities.map((c) => ({ city: c.slug })),
    ...areas.map((a) => ({ city: a.slug })),
    ...routes.map((r) => ({ city: r.slug })),
  ];
}

export function generateMetadata({
  params,
}: {
  params: { city: string };
}): Metadata {
  const route = getRoute(params.city);
  if (route) {
    return {
      title: `Rent a Car from ${route.fromName} to ${route.toName} — ${route.distanceKm} km, ${route.hoursLow}-${route.hoursHigh} hrs | RentalSawari`,
      description: `${route.fromName} to ${route.toName} car rental — ${formatPKR(route.priceFromPKR)}–${formatPKR(route.priceToPKR)} with driver. Vehicle recommendation, drive time, recommended stops, best months. ${route.distanceKm} km.`,
      alternates: { canonical: `/rent-a-car-${route.slug}` },
    };
  }

  const area = getArea(params.city);
  if (area) {
    const fewVendors =
      companies.filter(
        (c) =>
          c.city === area.cityName &&
          area.matchers.some((m) =>
            c.area.toLowerCase().includes(m.toLowerCase()),
          ),
      ).length < 3;
    return {
      title: `Rent a Car in ${area.name}, ${area.cityName} | RentalSawari`,
      description: area.tagline,
      alternates: { canonical: `/rent-a-car-${area.slug}` },
      robots: fewVendors
        ? { index: false, follow: true }
        : { index: true, follow: true },
    };
  }

  const city = cities.find((c) => c.slug === params.city);
  if (!city) return { title: "Not found" };
  return {
    title: `Rent a Car in ${city.name} — ${city.listingCount} Verified Rentals from ${formatPKR(city.startingPrice)}/day`,
    description: `Compare ${city.listingCount} verified rent-a-car companies in ${city.name}. Real prices, direct WhatsApp contact, no booking fees. Areas covered: ${city.popularAreas.slice(0, 3).join(", ")} and more.`,
    alternates: { canonical: `/rent-a-car-${city.slug}` },
  };
}

export default function CityRoute({ params }: { params: { city: string } }) {
  // Route page wins first (`-to-` is the most specific pattern).
  const route = getRoute(params.city);
  if (route) {
    return (
      <PageShell>
        <RoutePage route={route} />
      </PageShell>
    );
  }

  // Area pages next (e.g. "dha-lahore" — multi-token slug).
  const area = getArea(params.city);
  if (area) {
    return (
      <PageShell
        bottomCTA={
          <BottomCTA
            title={`Own a rent-a-car business in ${area.cityName}?`}
            subtitle="List your fleet free. Get WhatsApp leads directly."
            primary={{
              label: "List Your Business Free",
              href: "/list-your-business",
            }}
          />
        }
      >
        <AreaPage area={area} />
      </PageShell>
    );
  }

  const city = cities.find((c) => c.slug === params.city);
  if (!city) notFound();

  const cityCompanies = companies.filter((c) => c.city === city.name);
  const ratingAvg =
    cityCompanies.length > 0
      ? cityCompanies.reduce((a, c) => a + c.rating, 0) / cityCompanies.length
      : 0;
  const services = Array.from(
    new Set(cityCompanies.flatMap((c) => c.servicesOffered))
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much does it cost to rent a car in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Rental rates in ${city.name} start from ${formatPKR(city.startingPrice)}/day for economy cars (Mehran, Cultus) and reach PKR 30,000+/day for luxury vehicles (Land Cruiser V8, Mercedes). Sedans average PKR 6,500-8,500/day with driver; SUVs run PKR 15,000-24,000/day.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I rent a car without a driver in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes — several verified companies in ${city.name} offer self-drive rentals. Filter the listings by "Self-Drive" to see them. Self-drive saves PKR 1,500-3,000/day vs with-driver but requires a refundable deposit of PKR 25,000-100,000.`,
        },
      },
      {
        "@type": "Question",
        name: `What documents do I need to rent a car in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most companies require an original CNIC, a valid Pakistani driving licence (for self-drive), and a refundable security deposit. Foreign visitors should bring their International Driving Permit and passport with valid Pakistan visa.",
        },
      },
      {
        "@type": "Question",
        name: `How many rent-a-car companies are listed in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `RentalSawari currently lists ${cityCompanies.length} verified rent-a-car companies in ${city.name}, all checked for active business address and working contact numbers. The most-reviewed companies appear first in the listings below.`,
        },
      },
      {
        "@type": "Question",
        name: `Which areas of ${city.name} have the most rental companies?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Popular areas: ${city.popularAreas.slice(0, 4).join(", ")}. Use the filter bar to narrow listings to a specific area, or scroll through to see all ${cityCompanies.length} verified vendors.`,
        },
      },
    ],
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".faq-question", ".faq-answer"],
    },
  };

  // ItemList schema declares the directory page's list of vendors so AI
  // engines can extract the top entries as a ranked answer.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Verified rent-a-car companies in ${city.name}`,
    description: `${cityCompanies.length} verified rental companies operating in ${city.name}, ranked by review count.`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: cityCompanies.length,
    itemListElement: cityCompanies.slice(0, 20).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://rentalsawari.com/companies/${c.slug}`,
      name: c.name,
    })),
  };

  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title={`Own a rent-a-car business in ${city.name}?`}
          subtitle="List your fleet free. Get WhatsApp leads directly from customers in your city."
          primary={{ label: "List Your Business Free", href: "/list-your-business" }}
        />
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/cities" },
          { label: city.name },
        ]}
        eyebrow="Rent a Car"
        title={`Rent a Car in ${city.name}`}
        subtitle={`${city.nameUrdu} · ${city.listingCount} verified rent-a-car companies. Compare real prices, contact owners directly via WhatsApp.`}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <MapPin className="h-4 w-4 text-brand" />
            <span className="font-semibold">{city.listingCount} rentals</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <Users className="h-4 w-4 text-brand" />
            <span>
              From <span className="font-semibold">{formatPKR(city.startingPrice)}/day</span>
            </span>
          </div>
          {ratingAvg > 0 && (
            <div className="inline-flex items-center gap-1.5 text-stone-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>
                <span className="font-semibold">{ratingAvg.toFixed(1)}</span> avg rating
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {city.popularAreas.map((area) => (
            <Badge key={area} variant="muted" className="text-xs">
              {area}
            </Badge>
          ))}
        </div>
      </PageHeader>

      {cityContext[city.slug] && (
        <CityContextSection
          cityName={city.name}
          context={cityContext[city.slug]}
        />
      )}

      <CityListings
        companies={cityCompanies}
        areas={city.popularAreas}
        carTypes={carTypes.map((c) => ({ slug: c.slug, name: c.name }))}
        services={services}
      />

      <RelatedLinks
        title={`More from RentalSawari`}
        subtitle={`Compare ${city.name} with other cities, browse popular cars, and read the guides our renters use most.`}
        groups={[
          {
            title: "Other cities",
            links: cities
              .filter((c) => c.slug !== city.slug)
              .map((c) => ({
                label: `Rent a car in ${c.name}`,
                href: `/rent-a-car-${c.slug}`,
                sub: `${c.listingCount}`,
              })),
          },
          {
            title: "Popular cars",
            links: popularCarTypes.slice(0, 6).map((c) => ({
              label: c.name,
              href: `/cars/${c.slug}`,
            })),
          },
          {
            title: "Guides for renters",
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
