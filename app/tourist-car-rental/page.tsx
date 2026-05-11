import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Mountain,
  FileText,
  ShieldCheck,
  Plane,
  ArrowRight,
  Languages,
  CreditCard,
  MapPin,
} from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BottomCTA } from "@/components/shared/BottomCTA";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { FAQSection } from "@/components/shared/FAQSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { touristFAQs } from "@/data/faqs";
import { companies } from "@/data/companies";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Renting a Car in Pakistan as a Tourist — Complete Guide & Verified Vendors",
  description:
    "Everything foreign visitors need: IDP rules, USD security deposits, NOCs for Northern Areas, English-speaking drivers, and verified rental companies catering to international tourists.",
  alternates: { canonical: "/tourist-car-rental" },
};

const touristVendors = companies
  .filter((c) =>
    c.servicesOffered.some((s) =>
      ["Tourist Tours", "Northern Areas"].includes(s)
    )
  )
  .slice(0, 6);

const destinations = [
  {
    name: "Hunza Valley",
    image: placeholder({
      width: 600,
      height: 400,
      label: "Hunza",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Hussaini_Village%2C_Gojal%2C_Upper_Hunza%2C_Gilgit-Baltistan.jpg",
      realPath: "/images/destinations/hunza.jpg",
    }),
    description:
      "Karakoram mountain village. Best visited April–October. 16-hour drive from Islamabad.",
  },
  {
    name: "Skardu",
    image: placeholder({
      width: 600,
      height: 400,
      label: "Skardu",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Shangrila_resort_skardu.jpg/1280px-Shangrila_resort_skardu.jpg",
      realPath: "/images/destinations/skardu.jpg",
    }),
    description:
      "Gateway to K2 base camp. Requires 4x4 from Islamabad or short flight + local 4x4.",
  },
  {
    name: "Naran & Kaghan",
    image: placeholder({
      width: 600,
      height: 400,
      label: "Naran-Kaghan",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Lake_SaifulMalook.jpeg/1280px-Lake_SaifulMalook.jpeg",
      realPath: "/images/destinations/naran.jpg",
    }),
    description:
      "Easier mountain getaway. 7-hour drive from Islamabad. May–September only.",
  },
  {
    name: "Lahore Cultural",
    image: placeholder({
      width: 600,
      height: 400,
      label: "Lahore",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/d/db/Badshahi_Mosqu_-_Mughal_Art_in_an_Ocean_of_Concrete.jpg",
      realPath: "/images/destinations/lahore-cultural.jpg",
    }),
    description:
      "Walled City, Badshahi Mosque, food street. Best with an English-speaking driver.",
  },
];

const essentials = [
  {
    Icon: FileText,
    title: "International Driving Permit",
    body: "An IDP issued in your home country is accepted by most reputable rental companies. Pakistan does not recognize a foreign license alone — always bring the IDP.",
  },
  {
    Icon: CreditCard,
    title: "Security deposits in USD",
    body: "Expect USD 200–500 cash deposit for sedans, USD 500–1,000 for SUVs. Verified vendors return it in full at drop-off, minus any agreed deductions.",
  },
  {
    Icon: ShieldCheck,
    title: "NOC for Northern Areas",
    body: "Travel to Gilgit-Baltistan as a foreign national requires a No-Objection Certificate. Tour operators usually handle this for you — confirm before booking.",
  },
  {
    Icon: Languages,
    title: "English-speaking drivers",
    body: "Many tourist-focused companies offer drivers who speak English. Confirm in your inquiry message — it makes the trip considerably easier.",
  },
];

export default function TouristPage() {
  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title="Planning a Pakistan trip?"
          subtitle="Contact a verified tourist-focused rental company directly on WhatsApp. No booking fees."
          primary={{ label: "Browse Tourist Vendors", href: "#vendors" }}
          secondary={{ label: "Read Full Tourist Guide", href: "/guides/foreign-tourist-car-rental-pakistan" }}
        />
      }
    >
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "For Tourists" }]}
        eyebrow="For International Visitors"
        title="Renting a Car in Pakistan as a Tourist"
        subtitle="Everything you need: documentation, security deposits, regional permits, and verified rental companies that specialize in serving foreign visitors."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <a href="#vendors">
              Browse Verified Vendors
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/guides/foreign-tourist-car-rental-pakistan">
              Read Complete Guide
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Essentials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          What you need to know
        </h2>
        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {essentials.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base sm:text-lg font-bold text-stone-900">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Destinations */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Where most tourists go
          </h2>
          <p className="mt-2 text-stone-600">
            The four most-rented routes for international visitors.
          </p>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((d) => (
              <li
                key={d.name}
                className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                  <Image
                    src={d.image}
                    alt={`${d.name}, Pakistan`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-stone-900 inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-brand" />
                    {d.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    {d.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tourist-focused vendors */}
      <section id="vendors" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Verified tourist-focused rentals
          </h2>
          <Badge variant="brand" className="text-xs">
            {touristVendors.length} vendors
          </Badge>
        </div>
        <p className="mt-2 text-stone-600">
          Companies experienced with international visitors, English-speaking
          drivers, and Northern Areas routes.
        </p>
        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {touristVendors.map((c) => (
            <li key={c.slug}>
              <CompanyCard company={c} />
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ-ish quick links */}
      <section className="bg-brand/5 border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl font-bold text-stone-900">
            Quick answers
          </h2>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickLink
              Icon={Plane}
              title="Airport pickup from Islamabad?"
              href="/airport-pickup"
              body="Fixed-fare pickups available — driver waits at arrivals."
            />
            <QuickLink
              Icon={Mountain}
              title="Tours to Hunza & Skardu?"
              href="/northern-areas-tours"
              body="4x4 specialists for Karakoram routes. Multi-day packages."
            />
          </ul>
        </div>
      </section>

      <FAQSection
        title="Foreign tourist FAQ"
        subtitle="Everything visitors to Pakistan ask before renting."
        items={touristFAQs}
      />
    </PageShell>
  );
}

function QuickLink({
  Icon,
  title,
  href,
  body,
}: {
  Icon: typeof Plane;
  title: string;
  href: string;
  body: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-4 rounded-2xl bg-white border border-stone-200 p-5 hover:border-brand transition-colors"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-stone-900 inline-flex items-center gap-1 group-hover:text-brand transition-colors">
            {title}
            <ArrowRight className="h-4 w-4" />
          </h3>
          <p className="mt-1 text-sm text-stone-600">{body}</p>
        </div>
      </Link>
    </li>
  );
}
