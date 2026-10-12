import type { Metadata } from "next";
import { MapPin, MessageCircle, ShieldCheck, Heart } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { BottomCTA } from "@/components/shared/BottomCTA";

export const metadata: Metadata = {
  title: "About RentalSawari Pakistan",
  description:
    "RentalSawari is Pakistan's directory of verified rent-a-car companies. We make it easy for renters to find vendors and easy for vendors to find renters — directly via WhatsApp, no commission.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    Icon: ShieldCheck,
    title: "Verify before listing",
    body: "Every rental company is checked — CNIC, business address, active fleet. No copy-paste listings.",
  },
  {
    Icon: MessageCircle,
    title: "Connect directly, no commission",
    body: "RentalSawari doesn't take a cut of bookings. Renters and vendors talk directly on WhatsApp.",
  },
  {
    Icon: MapPin,
    title: "Built for Pakistan",
    body: "Pakistani prices in PKR. Pakistani routes. Pakistani context. No imported assumptions.",
  },
  {
    Icon: Heart,
    title: "Free for renters, free to list",
    body: "Renters never pay RentalSawari a fee. Basic listings are free forever. We monetise through featured placements only.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title="Questions?"
          subtitle="We're a small team. Reach out and you'll get a real reply."
          primary={{ label: "Contact Us", href: "/contact" }}
          secondary={{ label: "List Your Business", href: "/list-your-business" }}
        />
      }
    >
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="About"
        title="Pakistan's rent-a-car directory"
        subtitle="We help Pakistanis find honest, verified car rentals — and help small rental businesses get found by the people looking for them."
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose">
          <h2>Why we built this</h2>
          <p>
            Renting a car in Pakistan in 2026 is harder than it should be.
            Most rental companies don&apos;t have a website. The ones that do
            often hide prices. Aggregator sites are stuffed with old data and
            fake listings. To find a reliable vendor in Lahore for your
            sister&apos;s wedding, you ask three relatives and hope one of them
            knows someone.
          </p>
          <p>
            We started RentalSawari because the country deserves better. Real
            prices. Real reviews. Real verified businesses. WhatsApp contact
            so you talk to the owner directly — not a call centre, not a
            booking middleman.
          </p>

          <h2>What we do — and don&apos;t do</h2>
          <p>
            We do: maintain a directory of verified rental companies, surface
            them when you search by city or car type, route you to their
            WhatsApp.
          </p>
          <p>
            We don&apos;t: take bookings, hold deposits, process payments, or
            stand between you and the company. RentalSawari is a phonebook with
            a search box — not a marketplace.
          </p>

          <h2>How we make money</h2>
          <p>
            Featured listings. Companies pay PKR 5,000–12,000/month for
            premium placement on city, car-type, and homepage sections.
            That&apos;s our only revenue source today. Basic listings stay
            free forever.
          </p>
          <p>
            We disclose featured placements clearly on every page — every
            featured card shows the &quot;Featured&quot; badge. We never let
            paid placement override the verified badge — verification is
            verification, regardless of plan.
          </p>
        </div>
      </article>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 text-center">
            What we stand for
          </h2>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ Icon, title, body }) => (
              <li
                key={title}
                className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-sm"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-stone-900">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
