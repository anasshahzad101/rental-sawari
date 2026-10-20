import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getCompanies } from "@/lib/admin/repo/public";
import { cities } from "@/data/cities";
import { authors } from "@/lib/authors";
import { business } from "@/lib/business";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { socialMeta } from "@/lib/seo";

/**
 * /press — press kit for journalists and researchers (SEO plan §3.1).
 * Brand assets, key stats, founder bio, and ready-to-cite data.
 */

export const revalidate = 3600;

const PATH = "/press";
const TITLE = "Press Kit — RentalSawari Pakistan";
const DESCRIPTION =
  "Brand assets, key statistics, founder bio, and citable data about RentalSawari — Pakistan's verified rent-a-car directory with 1,400+ vendors across 21 cities.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  robots: { index: true, follow: true },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
};

const LOGOS = [
  { file: "/logo-full.png", label: "Full logo (horizontal)", note: "Primary — use on light backgrounds" },
  { file: "/logo-mark.png", label: "Logo mark (square)", note: "Avatars, app icons, square crops" },
  { file: "/logo.png", label: "Logo (standard)", note: "General use" },
];

export default async function PressPage() {
  const companies = await getCompanies();
  const totalReviews = companies.reduce((a, c) => a + c.reviewCount, 0);
  const founder = authors.hassan;
  const cityCount = new Set(companies.map((c) => c.city)).size;

  const stats = [
    { label: "Verified vendors", value: companies.length.toLocaleString("en-PK") },
    { label: "Cities covered", value: cityCount.toString() },
    { label: "Google reviews aggregated", value: totalReviews.toLocaleString("en-PK") },
    { label: "Booking fees charged", value: "PKR 0" },
  ];

  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Press" }]}
        eyebrow="For journalists & researchers"
        title="Press Kit"
        subtitle="Everything you need to cover RentalSawari — brand assets, key numbers, founder bio, and citable market data."
      />

      {/* Boilerplate */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">About RentalSawari</h2>
        <div className="mt-3 prose prose-stone text-sm">
          <p>
            RentalSawari is Pakistan&apos;s verified rent-a-car directory,
            listing {companies.length.toLocaleString("en-PK")} rental companies
            across {cityCount} cities — from Lahore and Islamabad to tier-2
            markets like Sialkot, Bahawalpur, and Dera Ghazi Khan. Every listed
            company is verified (business address, working number) before going
            live. RentalSawari shows real per-day prices in PKR and connects
            renters to vendors directly on WhatsApp — it never takes bookings,
            deposits, or commissions. Basic listings are free for vendors,
            forever.
          </p>
        </div>
      </section>

      {/* Key stats */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Key figures</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-2xl font-extrabold text-stone-900">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-stone-600">
          For deeper numbers — average rental prices per car category per city,
          vendor density, rating distributions — see the{" "}
          <a href="/pakistan-car-rental-price-index-2026" className="font-semibold text-brand hover:underline">
            Pakistan Car Rental Price Index 2026
          </a>{" "}
          (free CSV, updated quarterly). Figures may be cited with attribution
          to RentalSawari and a link.
        </p>
      </section>

      {/* Brand assets */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Brand assets</h2>
        <div className="mt-4 space-y-4">
          {LOGOS.map((l) => (
            <div
              key={l.file}
              className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50 border border-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.file} alt={l.label} className="max-h-10 max-w-10 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{l.label}</p>
                  <p className="text-xs text-stone-500">{l.note}</p>
                </div>
              </div>
              <a
                href={l.file}
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-brand hover:text-brand transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> PNG
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Brand colour: teal <code className="rounded bg-stone-100 px-1 py-0.5">#0F766E</code>.
          Please don&apos;t recolor, stretch, or redraw the mark.
        </p>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Founder</h2>
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm font-bold text-stone-900">{founder.name}</p>
          <p className="text-xs font-semibold text-brand">{founder.jobTitle}</p>
          <p className="mt-3 text-sm text-stone-700">{founder.bio}</p>
          <p className="mt-3 text-xs text-stone-500">
            Available for comment on Pakistan&apos;s rental market, domestic
            tourism, Eid and wedding-season travel demand, and the Northern
            Areas tourism economy.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">Press contact</h2>
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700">
          <p>
            Email:{" "}
            <a href={`mailto:${business.email}`} className="font-semibold text-brand hover:underline">
              {business.email}
            </a>
          </p>
          <p className="mt-1">
            Phone / WhatsApp:{" "}
            <a href={`tel:${business.phoneE164}`} className="font-semibold text-brand hover:underline">
              {business.phoneDisplay}
            </a>
          </p>
          <p className="mt-1">Hours: {business.hours}</p>
          <p className="mt-3 text-xs text-stone-500">
            We typically respond within one working day. For data requests,
            mention the Price Index — custom cuts of the dataset are available
            for accredited journalists.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
