import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  BadgeCheck,
  MessageCircle,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { companies } from "@/data/companies";
import type { Company } from "@/lib/types";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CompanyAvatar } from "@/components/companies/CompanyAvatar";
import { TrackCompareView } from "@/components/analytics/TrackCompareView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildWhatsAppLink,
  DEFAULT_WHATSAPP_MESSAGE,
  cn,
  citySlug,
} from "@/lib/utils";
import { socialMeta } from "@/lib/seo";

/**
 * Comparison page — rentalsawari.com/compare/{slugA}-vs-{slugB}
 *
 * We only pre-render the top-N most valuable pairs per city. The rest 404
 * intentionally — the combinatorial explosion of 1,085-choose-2 = 588k pages
 * isn't worth the index bloat. The N we pre-render covers high-intent
 * comparison queries ("zayed-tours-vs-fast-track-tours") that target users
 * deep in evaluation.
 */

const TOP_PER_CITY = 5;

function buildComparisonPairs(): Array<{ a: Company; b: Company }> {
  const pairs: Array<{ a: Company; b: Company }> = [];
  const seen = new Set<string>();
  const cities = [...new Set(companies.map((c) => c.city))];
  for (const city of cities) {
    const top = [...companies]
      .filter((c) => c.city === city)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, TOP_PER_CITY);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        const key = [top[i].slug, top[j].slug].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ a: top[i], b: top[j] });
      }
    }
  }
  return pairs;
}

const PAIRS = buildComparisonPairs();

export function generateStaticParams() {
  return PAIRS.map(({ a, b }) => ({ pair: `${a.slug}-vs-${b.slug}` }));
}

function findPair(pairSlug: string): { a: Company; b: Company } | null {
  // Pair slug format: "{slugA}-vs-{slugB}". We resolve by splitting on the
  // first occurrence of "-vs-" — works because vendor slugs never contain "-vs-".
  const idx = pairSlug.indexOf("-vs-");
  if (idx === -1) return null;
  const slugA = pairSlug.slice(0, idx);
  const slugB = pairSlug.slice(idx + 4);
  const a = companies.find((c) => c.slug === slugA);
  const b = companies.find((c) => c.slug === slugB);
  if (!a || !b) return null;
  return { a, b };
}

export function generateMetadata({
  params,
}: {
  params: { pair: string };
}): Metadata {
  const pair = findPair(params.pair);
  if (!pair) return { title: "Comparison not found" };
  const { a, b } = pair;
  const title = `${a.name} vs ${b.name} — Which Rent-a-Car is Better in ${a.city}?`;
  const description = `Side-by-side comparison of ${a.name} (${a.rating.toFixed(1)}★, ${a.reviewCount} reviews) and ${b.name} (${b.rating.toFixed(1)}★, ${b.reviewCount} reviews) in ${a.city}. Real data, real ratings, direct WhatsApp.`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${a.slug}-vs-${b.slug}` },
    ...socialMeta({ title, description, path: `/compare/${a.slug}-vs-${b.slug}` }),
  };
}

export default function ComparePage({ params }: { params: { pair: string } }) {
  const pair = findPair(params.pair);
  if (!pair) notFound();
  const { a, b } = pair;

  // Which one "wins" on each dimension. Useful for AI-extractable answer.
  const verdict = {
    rating: a.rating > b.rating ? a : b.rating > a.rating ? b : null,
    reviewCount: a.reviewCount > b.reviewCount ? a : b,
    services: a.servicesOffered.length > b.servicesOffered.length ? a : b.servicesOffered.length > a.servicesOffered.length ? b : null,
  };

  // Common services
  const commonServices = a.servicesOffered.filter((s) =>
    b.servicesOffered.includes(s),
  );
  const aOnly = a.servicesOffered.filter((s) => !b.servicesOffered.includes(s));
  const bOnly = b.servicesOffered.filter((s) => !a.servicesOffered.includes(s));

  const compareJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${a.name} or ${b.name} better in ${a.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Based on Google reviews: ${a.name} has ${a.reviewCount} reviews at ${a.rating.toFixed(1)}★; ${b.name} has ${b.reviewCount} reviews at ${b.rating.toFixed(1)}★. ${verdict.reviewCount.name} has the larger review base, while ${verdict.rating?.name ?? "both vendors"} ${verdict.rating ? "has the higher rating" : "share the same rating"}. Contact both via WhatsApp for current pricing.`,
        },
      },
      {
        "@type": "Question",
        name: `What services do ${a.name} and ${b.name} both offer?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: commonServices.length
            ? `Both offer: ${commonServices.join(", ")}.`
            : `${a.name} and ${b.name} have no overlapping advertised services; each specialises in different rental categories.`,
        },
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <TrackCompareView vendorA={a.slug} vendorB={b.slug} city={a.city} />

      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: a.city, href: `/rent-a-car-${citySlug(a.city)}` },
          { label: `${a.name} vs ${b.name}` },
        ]}
        eyebrow={`Comparison · ${a.city}`}
        title={`${a.name} vs ${b.name}`}
        subtitle={`Side-by-side comparison of two rent-a-car companies in ${a.city}, based on verified Google review data and advertised services.`}
      />

      {/* Answer-first verdict block */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border-l-4 border-brand bg-brand/5 p-5 sm:p-6 text-stone-800 leading-relaxed">
          <p className="text-base sm:text-lg">
            <strong>Quick verdict:</strong> {verdict.reviewCount.name} has
            the larger review base ({verdict.reviewCount.reviewCount} vs{" "}
            {verdict.reviewCount.slug === a.slug ? b.reviewCount : a.reviewCount}
            ).{" "}
            {verdict.rating
              ? `${verdict.rating.name} has the higher Google rating (${verdict.rating.rating.toFixed(1)}★).`
              : `Both vendors share a ${a.rating.toFixed(1)}★ rating.`}{" "}
            Both operate in {a.city}. Message both on WhatsApp before deciding —
            current pricing varies by season and car model.
          </p>
        </div>
      </section>

      {/* Side-by-side comparison */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <VendorColumn vendor={a} verdict={verdict} />
          <VendorColumn vendor={b} verdict={verdict} />
        </div>
      </section>

      {/* Service comparison */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl font-extrabold text-stone-900">
            Service comparison
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <ServiceCard
              title="Both offer"
              services={commonServices}
              tone="brand"
            />
            <ServiceCard
              title={`Only ${a.name.split(" ").slice(0, 2).join(" ")}`}
              services={aOnly}
              tone="accent"
            />
            <ServiceCard
              title={`Only ${b.name.split(" ").slice(0, 2).join(" ")}`}
              services={bOnly}
              tone="accent"
            />
          </div>
        </div>
      </section>

      {/* Side-by-side stats table */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl font-extrabold text-stone-900">
          At-a-glance comparison
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-stone-100">
                <th className="border border-stone-200 px-3 py-2 text-left">Dimension</th>
                <th className="border border-stone-200 px-3 py-2 text-left">{a.name}</th>
                <th className="border border-stone-200 px-3 py-2 text-left">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Google rating" valueA={`${a.rating.toFixed(1)}★`} valueB={`${b.rating.toFixed(1)}★`} />
              <Row label="Review count" valueA={a.reviewCount.toString()} valueB={b.reviewCount.toString()} />
              <Row label="Area" valueA={a.area} valueB={b.area} />
              <Row label="City" valueA={a.city} valueB={b.city} />
              <Row label="Services count" valueA={a.servicesOffered.length.toString()} valueB={b.servicesOffered.length.toString()} />
              <Row label="Verified" valueA={a.verified ? "Yes" : "No"} valueB={b.verified ? "Yes" : "No"} />
              <Row label="Website" valueA={a.website ? "Yes" : "—"} valueB={b.website ? "Yes" : "—"} />
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-brand">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Still unsure? Ask both directly.
          </h2>
          <p className="mt-2 text-white/85 text-sm sm:text-base">
            Most Pakistani vendors reply on WhatsApp within an hour. Get two
            quotes in 10 minutes.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={buildWhatsAppLink(a.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp"
                data-company={a.slug}
                data-company-name={a.name}
                data-city={a.city}
                data-area={a.area}
                data-featured={a.featured ? "true" : "false"}
                data-rating={a.rating}
                data-review-count={a.reviewCount}
              >
                <MessageCircle className="h-4 w-4" />
                Message {a.name.split(" ")[0]}
              </a>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={buildWhatsAppLink(b.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp"
                data-company={b.slug}
                data-company-name={b.name}
                data-city={b.city}
                data-area={b.area}
                data-featured={b.featured ? "true" : "false"}
                data-rating={b.rating}
                data-review-count={b.reviewCount}
              >
                <MessageCircle className="h-4 w-4" />
                Message {b.name.split(" ")[0]}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

interface VerdictMap {
  rating: Company | null;
  reviewCount: Company;
  services: Company | null;
}

function VendorColumn({
  vendor,
  verdict,
}: {
  vendor: Company;
  verdict: VerdictMap;
}) {
  const wins: string[] = [];
  if (verdict.rating?.slug === vendor.slug) wins.push("Higher rating");
  if (verdict.reviewCount.slug === vendor.slug) wins.push("More reviews");
  if (verdict.services?.slug === vendor.slug) wins.push("More services");
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <CompanyAvatar name={vendor.name} logoUrl={vendor.logo} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-stone-900 truncate">
            {vendor.name}
          </h3>
          <p className="text-xs text-stone-500 inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {vendor.area}, {vendor.city}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-bold">{vendor.rating.toFixed(1)}</span>
          <span className="text-stone-500">({vendor.reviewCount} reviews)</span>
        </span>
        {vendor.verified && (
          <Badge variant="verified">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      {wins.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {wins.map((w) => (
            <li key={w}>
              <Badge variant="brand">{w}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button asChild variant="primary" size="md">
          <Link href={`/companies/${vendor.slug}`}>View profile</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <a href={`tel:${vendor.phone}`}>
            <Phone className="h-4 w-4" />
            Call
          </a>
        </Button>
      </div>

      {vendor.website && (
        <a
          href={vendor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-brand"
        >
          <ExternalLink className="h-3 w-3" />
          {vendor.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      )}
    </article>
  );
}

function ServiceCard({
  title,
  services,
  tone,
}: {
  title: string;
  services: string[];
  tone: "brand" | "accent";
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
        {title}
      </h3>
      {services.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">None</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {services.map((s) => (
            <li key={s}>
              <Badge variant={tone}>{s}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) {
  return (
    <tr className="odd:bg-stone-50">
      <td className="border border-stone-200 px-3 py-2 font-semibold">{label}</td>
      <td className={cn("border border-stone-200 px-3 py-2")}>{valueA}</td>
      <td className={cn("border border-stone-200 px-3 py-2")}>{valueB}</td>
    </tr>
  );
}
