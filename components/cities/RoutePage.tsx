import Link from "next/link";
import {
  Route,
  Clock,
  MapPin,
  Calendar,
  CalendarRange,
  Car as CarIcon,
} from "lucide-react";
import type { RouteData } from "@/data/routes";
import { companies as allCompanies } from "@/data/companies";
import { cities } from "@/data/cities";
import { popularCarTypes } from "@/data/carTypes";
import { guides } from "@/data/guides";
import { PageHeader } from "@/components/shared/PageHeader";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { FAQSection } from "@/components/shared/FAQSection";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";

const SITE = "https://rentalsawari.com";

/**
 * Renders an intercity route page. Vendor list is drawn from the FROM city
 * (those are the operators who can actually pick up + start the trip).
 */

export function RoutePage({ route }: { route: RouteData }) {
  const fromVendors = allCompanies
    .filter((c) => c.city.toLowerCase() === route.fromName.toLowerCase())
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 12);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${route.fromName} to ${route.toName} Car Rental Service`,
    description: `Rent a car for the ${route.fromName} to ${route.toName} route. ${route.distanceKm} km, ${route.hoursLow}-${route.hoursHigh} hours.`,
    serviceType: "Intercity car rental with driver",
    areaServed: [
      { "@type": "City", name: route.fromName },
      { "@type": "City", name: route.toName },
    ],
    provider: { "@id": "https://rentalsawari.com/#organization" },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: route.priceFromPKR,
      highPrice: route.priceToPKR,
      priceCurrency: "PKR",
      offerCount: fromVendors.length,
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
        name: route.fromName,
        item: `${SITE}/rent-a-car-${route.fromSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${route.fromName} to ${route.toName}`,
      },
    ],
  };

  const faqs = [
    {
      q: `How long is the drive from ${route.fromName} to ${route.toName}?`,
      a: `${route.distanceKm} km one-way, typically ${route.hoursLow}-${route.hoursHigh} hours depending on traffic and weather. The route's standard rental package handles the drive with an experienced local driver.`,
    },
    {
      q: `How much does a car rental cost for the ${route.fromName} to ${route.toName} route?`,
      a: `Verified vendors in ${route.fromName} quote ${formatPKR(route.priceFromPKR)}–${formatPKR(route.priceToPKR)} for the route, typically inclusive of vehicle, driver, fuel, and motorway tolls. Hotels, meals, and side-trip entry fees are usually separate. Multi-day packages discount 15-30%.`,
    },
    {
      q: `Which car is best for the ${route.fromName} to ${route.toName} route?`,
      a: `Most vendors recommend a ${popularCarTypes.find((c) => c.slug === route.recommendedCar)?.name ?? "Toyota Corolla"} or equivalent. The right vehicle depends on terrain, season, and group size — confirm in your WhatsApp inquiry.`,
    },
    {
      q: `When is the best time of year for the ${route.fromName} to ${route.toName} route?`,
      a: `${route.bestMonths}. Always confirm road conditions with the vendor before paying any deposit — Pakistani mountain weather can shift quickly and closures happen.`,
    },
    {
      q: `Can I make stops along the way?`,
      a: `Yes — most rental packages include 2-4 hours of total stop time along the route at no extra charge. ${route.stops.length > 0 ? `Common stops: ${route.stops.slice(0, 3).join(", ")}.` : ""} For longer detours, expect a per-stop or per-extra-km surcharge.`,
    },
  ];

  return (
    <>
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
          {
            label: route.fromName,
            href: `/rent-a-car-${route.fromSlug}`,
          },
          { label: `${route.fromName} → ${route.toName}` },
        ]}
        eyebrow="Intercity route"
        title={`Rent a Car from ${route.fromName} to ${route.toName}`}
        subtitle={`${route.distanceKm} km · ${route.hoursLow}-${route.hoursHigh} hour drive · ${formatPKR(route.priceFromPKR)}–${formatPKR(route.priceToPKR)} with driver`}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <Route className="h-4 w-4 text-brand" />
            <span>
              <span className="font-semibold">{route.distanceKm}</span> km
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <Clock className="h-4 w-4 text-brand" />
            <span>
              <span className="font-semibold">
                {route.hoursLow}–{route.hoursHigh}
              </span>{" "}
              hours
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <CarIcon className="h-4 w-4 text-brand" />
            <span>
              Best:{" "}
              <span className="font-semibold">
                {popularCarTypes.find((c) => c.slug === route.recommendedCar)?.name ??
                  "Toyota Corolla"}
              </span>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <CalendarRange className="h-4 w-4 text-brand" />
            <span>{route.bestMonths}</span>
          </div>
        </div>
      </PageHeader>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="prose">
            <p className="answer-block">
              <strong>
                {route.fromName} to {route.toName} is a {route.distanceKm} km
                drive that takes {route.hoursLow}–{route.hoursHigh} hours one-way
                and costs {formatPKR(route.priceFromPKR)}–
                {formatPKR(route.priceToPKR)} with a driver-inclusive rental.
              </strong>{" "}
              Best months: {route.bestMonths.toLowerCase()}.
            </p>
            <h2>About the {route.fromName} to {route.toName} route</h2>
            <p>{route.description}</p>
            {route.stops.length > 0 && (
              <>
                <h2>Recommended stops along the way</h2>
                <ul>
                  {route.stops.map((s) => (
                    <li key={s}>
                      <MapPin className="inline h-4 w-4 text-brand mb-1" /> {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h2>Best time of year</h2>
            <p>{route.bestMonths}. Always confirm current road conditions with the vendor before paying any deposit — Pakistani mountain weather can change abruptly.</p>
          </div>
        </div>
      </section>

      {fromVendors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Vendors in {route.fromName} who run this route
            </h2>
            <Badge variant="muted">{fromVendors.length}</Badge>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {fromVendors.map((c) => (
              <li key={c.slug}>
                <CompanyCard company={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <FAQSection
        title={`FAQ — ${route.fromName} to ${route.toName}`}
        items={faqs}
      />

      <RelatedLinks
        title="More routes & rentals"
        groups={[
          {
            title: `From ${route.fromName}`,
            links: cities
              .filter(
                (c) => c.slug !== route.fromSlug && c.slug !== route.toSlug,
              )
              .slice(0, 6)
              .map((c) => ({
                label: `${route.fromName} → ${c.name}`,
                href: `/rent-a-car-${route.fromSlug}-to-${c.slug}`,
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
            title: "Trip guides",
            links: guides.slice(0, 4).map((g) => ({
              label: g.title,
              href: `/guides/${g.slug}`,
            })),
          },
        ]}
      />
    </>
  );
}
