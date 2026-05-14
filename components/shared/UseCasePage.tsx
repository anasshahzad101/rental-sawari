import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "./PageShell";
import { PageHeader } from "./PageHeader";
import { BottomCTA } from "./BottomCTA";
import { FAQSection } from "./FAQSection";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { companies } from "@/data/companies";
import { ADSENSE_SLOTS } from "@/lib/adsense";

export interface UseCasePageProps {
  slug: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  Icon: LucideIcon;
  image: string;
  imageAlt: string;
  bullets: string[];
  body: string;
  serviceMatch: string;
  faqs?: Array<{ q: string; a: string }>;
}

export function UseCasePage(props: UseCasePageProps) {
  const matchingVendors = companies
    .filter((c) => c.servicesOffered.includes(props.serviceMatch))
    .slice(0, 6);

  // Service schema — declares this page as a service offering with a vendor
  // catalogue. Helps AI engines understand the page intent and the supply.
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: props.title,
    description: props.subtitle,
    serviceType: props.title,
    provider: {
      "@id": "https://rentalsawari.com/#organization",
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    url: `https://rentalsawari.com/${props.slug}`,
    ...(matchingVendors.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `Verified ${props.title.toLowerCase()} vendors`,
        itemListElement: matchingVendors.map((v, i) => ({
          "@type": "Offer",
          position: i + 1,
          itemOffered: {
            "@type": "Service",
            name: `${v.name} — ${props.title.toLowerCase()}`,
            url: `https://rentalsawari.com/companies/${v.slug}`,
            areaServed: { "@type": "City", name: v.city },
          },
        })),
      },
    }),
  };

  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title={`Need ${props.title.toLowerCase()}?`}
          subtitle="Contact a verified rental company directly. No booking fees."
          primary={{ label: "Browse Vendors", href: "#vendors" }}
        />
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: props.title }]}
        eyebrow={props.eyebrow}
        title={props.title}
        subtitle={props.subtitle}
      />

      {/* Body + image */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <props.Icon className="h-6 w-6" />
            </span>
            <p className="mt-5 text-base sm:text-lg text-stone-700 leading-relaxed">
              {props.body}
            </p>
            <ul className="mt-6 space-y-2.5">
              {props.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm sm:text-base text-stone-700">
                  <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="primary" size="lg" className="mt-6">
              <a href="#vendors">
                Browse Verified Vendors
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <figure className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-stone-200">
            <Image
              src={props.image}
              alt={props.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </figure>
        </div>
      </section>

      {/* Vendors */}
      <section id="vendors" className="bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Verified vendors for {props.title.toLowerCase()}
          </h2>

          {matchingVendors.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-stone-900">
                No vendors listed yet for this category
              </p>
              <p className="mt-1 text-sm text-stone-600">
                <Link href="/cities" className="font-semibold text-brand hover:underline">
                  Browse by city
                </Link>{" "}
                to find a company that suits your needs.
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {matchingVendors.map((c) => (
                <li key={c.slug}>
                  <CompanyCard company={c} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {props.faqs && props.faqs.length > 0 && (
        <FAQSection items={props.faqs} />
      )}

      <AdSlot slot={ADSENSE_SLOTS.useCase} />
    </PageShell>
  );
}
