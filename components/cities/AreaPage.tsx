import Link from "next/link";
import { MapPin, Star, Users } from "lucide-react";
import type { Area } from "@/data/areas";
import { companies as allCompanies } from "@/data/companies";
import { cities } from "@/data/cities";
import { popularCarTypes } from "@/data/carTypes";
import { guides } from "@/data/guides";
import { PageHeader } from "@/components/shared/PageHeader";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";

const SITE = "https://rentalsawari.com";

/**
 * Renders an area-level page (e.g. /rent-a-car-dha-lahore).
 * Vendor list is filtered to companies whose `area` field matches any of
 * the area's `matchers` AND whose `city` matches the area's parent city.
 */

interface AreaPageProps {
  area: Area;
}

export function AreaPage({ area }: AreaPageProps) {
  const parentCity = cities.find((c) => c.slug === area.citySlug);
  const cityCompanies = allCompanies.filter((c) => c.city === area.cityName);
  const areaCompanies = cityCompanies
    .filter((c) =>
      area.matchers.some((m) =>
        c.area.toLowerCase().includes(m.toLowerCase()),
      ),
    )
    .sort((a, b) => b.reviewCount - a.reviewCount);

  const ratingAvg =
    areaCompanies.length > 0
      ? areaCompanies.reduce((a, c) => a + c.rating, 0) / areaCompanies.length
      : 0;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: area.cityName,
        item: `${SITE}/rent-a-car-${area.citySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${area.name} ${area.cityName}`,
      },
    ],
  };

  const itemListJsonLd =
    areaCompanies.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Verified rent-a-car companies in ${area.name}, ${area.cityName}`,
          numberOfItems: areaCompanies.length,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          itemListElement: areaCompanies.slice(0, 20).map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE}/companies/${c.slug}`,
            name: c.name,
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: area.cityName, href: `/rent-a-car-${area.citySlug}` },
          { label: area.name },
        ]}
        eyebrow={`${area.cityName} · Area`}
        title={`Rent a Car in ${area.name}, ${area.cityName}`}
        subtitle={area.tagline}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-1.5 text-stone-700">
            <MapPin className="h-4 w-4 text-brand" />
            <span className="font-semibold">{areaCompanies.length} vendors</span>
          </div>
          {parentCity && (
            <div className="inline-flex items-center gap-1.5 text-stone-700">
              <Users className="h-4 w-4 text-brand" />
              <span>
                From{" "}
                <span className="font-semibold">
                  {formatPKR(parentCity.startingPrice)}
                </span>
                /day
              </span>
            </div>
          )}
          {ratingAvg > 0 && (
            <div className="inline-flex items-center gap-1.5 text-stone-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>
                <span className="font-semibold">{ratingAvg.toFixed(1)}</span> avg
                rating
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Badge variant="muted" className="text-xs">
            Part of {area.cityName}
          </Badge>
        </div>
      </PageHeader>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="prose">
            <p className="answer-block">
              {area.tagline}
            </p>
            <h2>About renting in {area.name}, {area.cityName}</h2>
            <p>{area.description}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            Verified vendors in {area.name}
          </h2>
          <Link
            href={`/rent-a-car-${area.citySlug}`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            See all {area.cityName} →
          </Link>
        </div>
        {areaCompanies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-stone-900">
              No verified vendors specifically in {area.name} yet
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Browse all{" "}
              <Link
                href={`/rent-a-car-${area.citySlug}`}
                className="font-semibold text-brand hover:underline"
              >
                {area.cityName} rentals
              </Link>{" "}
              — many vendors based elsewhere in the city will pick up from{" "}
              {area.name}.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {areaCompanies.slice(0, 30).map((c) => (
              <li key={c.slug}>
                <CompanyCard company={c} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <RelatedLinks
        title="More from RentalSawari"
        subtitle={`Compare ${area.name} with other ${area.cityName} neighbourhoods, browse cars, and read related guides.`}
        groups={[
          {
            title: `Other ${area.cityName} areas`,
            links: [],
          },
          {
            title: "Popular cars",
            links: popularCarTypes.slice(0, 6).map((c) => ({
              label: c.name,
              href: `/cars/${c.slug}`,
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
    </>
  );
}
