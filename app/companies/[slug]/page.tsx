import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  BadgeCheck,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Shield,
  Receipt,
} from "lucide-react";
import { companies, getCompanyBySlug } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { InquiryForm } from "@/components/companies/InquiryForm";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { CompanyAvatar } from "@/components/companies/CompanyAvatar";
import { TrackVendorView } from "@/components/analytics/TrackVendorView";
import {
  buildWhatsAppLink,
  DEFAULT_WHATSAPP_MESSAGE,
  formatPKR,
  citySlug,
} from "@/lib/utils";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = getCompanyBySlug(params.slug);
  if (!c) return { title: "Company not found" };
  // Thin-content guard: pages with very few reviews are pre-rendered for
  // direct access but kept out of the Google index until they accumulate
  // signal. They flip to indexable automatically as reviewCount grows.
  const isThin = c.reviewCount < 5;
  return {
    title: `${c.name} — Car Rental in ${c.city} · ${c.rating.toFixed(1)}★`,
    description: `${c.name} is a verified car rental company in ${c.area}, ${c.city}. Services: ${c.servicesOffered.join(", ")}. WhatsApp contact in one tap.`,
    alternates: { canonical: `/companies/${c.slug}` },
    robots: isThin
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const company = getCompanyBySlug(params.slug);
  if (!company) notFound();

  const waLink = buildWhatsAppLink(
    company.whatsapp,
    DEFAULT_WHATSAPP_MESSAGE,
    { source: "profile", companySlug: company.slug },
  );

  const related = companies
    .filter((c) => c.city === company.city && c.slug !== company.slug)
    .slice(0, 3);

  // Note: AggregateRating intentionally omitted. Ratings are sourced from
  // Google Maps, not from reviews collected on rentalsawari.com — emitting
  // them as our own AggregateRating violates Google's review-snippet policy
  // and risks a manual action. We surface the rating + Google source link
  // visually instead. When the UGC review system ships (PENDING_TASKS §3.3)
  // and we have ≥1 real review per vendor, add `aggregateRating` back here
  // sourced from our own DB only.
  const provinceFor: Record<string, string> = {
    // Federal capital
    Islamabad: "Islamabad Capital Territory",
    // Punjab
    Lahore: "Punjab",
    Rawalpindi: "Punjab",
    Faisalabad: "Punjab",
    Multan: "Punjab",
    Sialkot: "Punjab",
    Gujranwala: "Punjab",
    Gujrat: "Punjab",
    Sargodha: "Punjab",
    Sheikhupura: "Punjab",
    Bahawalpur: "Punjab",
    "Rahim Yar Khan": "Punjab",
    Chakwal: "Punjab",
    Okara: "Punjab",
    "Dera Ghazi Khan": "Punjab",
    Kasur: "Punjab",
    Narowal: "Punjab",
    Mianwali: "Punjab",
    // Sindh
    Karachi: "Sindh",
    // Khyber Pakhtunkhwa
    Peshawar: "Khyber Pakhtunkhwa",
    // Balochistan
    Quetta: "Balochistan",
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `https://rentalsawari.com/companies/${company.slug}#business`,
    name: company.name,
    url: `https://rentalsawari.com/companies/${company.slug}`,
    image: "https://rentalsawari.com/logo-mark.png",
    telephone: company.phone,
    priceRange: "PKR 3,500–35,000",
    address: {
      "@type": "PostalAddress",
      streetAddress: company.area,
      addressLocality: company.city,
      addressRegion: provinceFor[company.city] ?? company.city,
      addressCountry: "PK",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: [
      { "@type": "City", name: company.city },
      { "@type": "AdministrativeArea", name: provinceFor[company.city] ?? "Pakistan" },
    ],
    ...(company.about ? { description: company.about } : {}),
    ...(company.website || company.googleMapsUrl
      ? {
          sameAs: [company.website, company.googleMapsUrl].filter(
            (x): x is string => Boolean(x),
          ),
        }
      : {}),
    makesOffer: company.servicesOffered.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s },
    })),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackVendorView companySlug={company.slug} city={company.city} />

      {/* Hero strip */}
      <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              {
                label: company.city,
                href: `/rent-a-car-${citySlug(company.city)}`,
              },
              { label: company.name },
            ]}
          />

          <div className="mt-5 flex flex-col sm:flex-row items-start gap-5">
            <CompanyAvatar
              name={company.name}
              logoUrl={company.logo}
              size="lg"
              className="rounded-2xl"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
                  {company.name}
                </h1>
                {company.verified && (
                  <Badge variant="verified">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {company.featured && <Badge variant="featured">Featured</Badge>}
              </div>

              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-stone-600">
                <MapPin className="h-4 w-4 text-brand" />
                {company.area}, {company.city}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-900">
                    {company.rating.toFixed(1)}
                  </span>
                  <span className="text-stone-500">
                    ({company.reviewCount} reviews)
                  </span>
                </span>
                {company.responseTime && (
                  <span className="inline-flex items-center gap-1 text-stone-600">
                    <Clock className="h-4 w-4" />
                    {company.responseTime}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-brand underline-offset-2 hover:underline truncate max-w-[14rem]"
                    data-track="outbound"
                    data-company={company.slug}
                    data-destination="website"
                  >
                    {company.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>

              <div className="mt-5 hidden sm:flex flex-wrap gap-3">
                <Button asChild variant="whatsapp" size="lg">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="whatsapp"
                    data-company={company.slug}
                    data-company-name={company.name}
                    data-city={company.city}
                    data-area={company.area}
                    data-featured={company.featured ? "true" : "false"}
                    data-rating={company.rating}
                    data-review-count={company.reviewCount}
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="primary" size="lg">
                  <a
                    href={`tel:${company.phone}`}
                    data-track="phone"
                    data-company={company.slug}
                    data-company-name={company.name}
                    data-city={company.city}
                    data-area={company.area}
                    data-featured={company.featured ? "true" : "false"}
                    data-rating={company.rating}
                    data-review-count={company.reviewCount}
                  >
                    <Phone className="h-5 w-5" />
                    Call
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body: 2-col layout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left: cars + services */}
          <div className="lg:col-span-2 space-y-8">
            {/* About — only when we have a real description */}
            {company.about && (
              <div>
                <h2 className="text-xl font-bold text-stone-900">About</h2>
                <p className="mt-3 text-stone-700 leading-relaxed">
                  {company.about}
                </p>
              </div>
            )}

            {/* Fleet */}
            {company.topCars && company.topCars.length > 0 ? (
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Fleet &amp; Prices
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Prices are per day. Contact for weekly / monthly rates.
                </p>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.topCars.map((car) => (
                    <li
                      key={car.name}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-900">
                          {car.name}
                        </span>
                        <Badge variant="muted" className="text-[10px]">
                          {car.withDriver ? "With Driver" : "Self-Drive"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xl font-extrabold text-brand">
                        {formatPKR(car.pricePerDay)}
                        <span className="ml-1 text-xs font-medium text-stone-500">
                          /day
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 sm:p-6">
                <h2 className="text-xl font-bold text-stone-900">
                  Fleet &amp; Prices
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  {company.name} hasn&apos;t shared their fleet list on RentalSawari
                  yet. Send them a WhatsApp message with the car you need and
                  your dates — they usually reply with a quote within the hour.
                </p>
                <Button
                  asChild
                  variant="whatsapp"
                  size="md"
                  className="mt-4"
                >
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="whatsapp"
                    data-company={company.slug}
                    data-company-name={company.name}
                    data-city={company.city}
                    data-area={company.area}
                    data-featured={company.featured ? "true" : "false"}
                    data-rating={company.rating}
                    data-review-count={company.reviewCount}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask for a quote
                  </a>
                </Button>
              </div>
            )}

            {/* Services */}
            <div>
              <h2 className="text-xl font-bold text-stone-900">Services Offered</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {company.servicesOffered.map((s) => (
                  <li key={s}>
                    <Badge variant="brand" className="text-sm py-1.5 px-3">
                      {s}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust */}
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                What to expect
              </h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TrustItem
                  Icon={Shield}
                  title="Verified company"
                  body="CNIC and business address confirmed by RentalSawari."
                />
                <TrustItem
                  Icon={Receipt}
                  title="No booking fees"
                  body="RentalSawari is free for renters. You pay the company directly."
                />
                <TrustItem
                  Icon={Clock}
                  title="Fast response"
                  body={
                    company.responseTime ??
                    "Most companies reply on WhatsApp within an hour."
                  }
                />
                <TrustItem
                  Icon={MessageCircle}
                  title="Direct contact"
                  body="WhatsApp or call the company — no middleman."
                />
              </ul>
            </div>
          </div>

          {/* Right: inquiry + contact */}
          <aside className="space-y-4">
            <InquiryForm
              companyName={company.name}
              companySlug={company.slug}
              city={company.city}
            />

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Contact directly
              </h3>
              <div className="mt-3 space-y-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 border border-stone-200"
                  data-track="whatsapp"
                  data-company={company.slug}
                  data-company-name={company.name}
                  data-city={company.city}
                  data-area={company.area}
                  data-featured={company.featured ? "true" : "false"}
                  data-rating={company.rating}
                  data-review-count={company.reviewCount}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                    <MessageCircle className="h-4 w-4 text-whatsapp" />
                    WhatsApp
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {company.whatsapp}
                  </span>
                </a>
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 border border-stone-200"
                  data-track="phone"
                  data-company={company.slug}
                  data-company-name={company.name}
                  data-city={company.city}
                  data-area={company.area}
                  data-featured={company.featured ? "true" : "false"}
                  data-rating={company.rating}
                  data-review-count={company.reviewCount}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                    <Phone className="h-4 w-4 text-brand" />
                    Phone
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    {company.phone}
                  </span>
                </a>
                {company.googleMapsUrl && (
                  <a
                    href={company.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 border border-stone-200"
                    data-track="outbound"
                    data-company={company.slug}
                    data-destination="google_maps"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <MapPin className="h-4 w-4 text-brand" />
                      View on Google Maps
                    </span>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related companies */}
      {related.length > 0 && (
        <section className="bg-stone-50 border-t border-stone-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-xl font-bold text-stone-900">
              Other rentals in {company.city}
            </h2>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((c) => (
                <li key={c.slug}>
                  <CompanyCard company={c} showFeaturedBadge={false} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href={`/rent-a-car-${citySlug(company.city)}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                See all rentals in {company.city} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      <MobileStickyCTA
        whatsapp={company.whatsapp}
        phone={company.phone}
        message={`Hi ${company.name}, I'm interested in renting a car.`}
        companySlug={company.slug}
        companyName={company.name}
        city={company.city}
        area={company.area}
        featured={company.featured}
        rating={company.rating}
        reviewCount={company.reviewCount}
      />
      <div className="md:hidden h-20" aria-hidden="true" />
    </PageShell>
  );
}

function TrustItem({
  Icon,
  title,
  body,
}: {
  Icon: typeof Shield;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-sm font-bold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-600 leading-relaxed">{body}</p>
    </li>
  );
}
