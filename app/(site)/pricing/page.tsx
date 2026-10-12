import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Sparkles, Star } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { BottomCTA } from "@/components/shared/BottomCTA";
import { FAQSection } from "@/components/shared/FAQSection";
import { pricingFAQs } from "@/data/faqs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — List Your Rent-A-Car Business on RentalSawari Pakistan",
  description:
    "Free basic listings forever. Featured placement starts at PKR 5,000/month with city, car, and homepage placement options.",
  alternates: { canonical: "/pricing" },
};

interface Tier {
  name: string;
  price: string;
  period?: string;
  description: string;
  cta: { label: string; href: string };
  features: Array<{ label: string; included: boolean }>;
  highlight?: boolean;
  badge?: string;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "PKR 0",
    period: "/month",
    description: "Get found. Free forever for verified companies.",
    cta: { label: "Get Started Free", href: "/list-your-business" },
    features: [
      { label: "City directory listing", included: true },
      { label: "WhatsApp + phone contact", included: true },
      { label: "Verified badge", included: true },
      { label: "Up to 5 cars displayed", included: true },
      { label: "Homepage placement", included: false },
      { label: "Featured city placement", included: false },
      { label: "Priority verification", included: false },
    ],
  },
  {
    name: "Featured City",
    price: "PKR 5,000",
    period: "/month",
    description: "Top placement on one city page. Best for single-city operators.",
    cta: { label: "Start Featured", href: "/list-your-business?plan=city" },
    features: [
      { label: "Everything in Free", included: true },
      { label: "Top placement on 1 city page", included: true },
      { label: "Featured badge", included: true },
      { label: "Up to 10 cars displayed", included: true },
      { label: "Priority verification", included: true },
      { label: "Homepage placement", included: false },
      { label: "Featured on car type pages", included: false },
    ],
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Featured Plus",
    price: "PKR 12,000",
    period: "/month",
    description: "Maximum visibility. Homepage + multiple city placements.",
    cta: { label: "Talk to Sales", href: "/contact" },
    features: [
      { label: "Everything in Featured City", included: true },
      { label: "Homepage featured placement", included: true },
      { label: "Featured on up to 3 city pages", included: true },
      { label: "Featured on car type pages", included: true },
      { label: "Up to 20 cars displayed", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Monthly performance report", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title="Not sure which plan is right?"
          subtitle="Start free, upgrade anytime. Most companies start with a free listing and upgrade after their first month of leads."
          primary={{ label: "Get Started Free", href: "/list-your-business" }}
          secondary={{ label: "Contact Sales", href: "/contact" }}
        />
      }
    >
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
        eyebrow="Pricing"
        title="Simple pricing for rental companies"
        subtitle="Free basic listings forever. Pay only when you want more visibility."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-2xl border bg-white p-6 sm:p-8 shadow-sm",
                tier.highlight
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-stone-200"
              )}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  <Sparkles className="h-3 w-3" />
                  {tier.badge}
                </span>
              )}
              <h2 className="text-lg font-bold text-stone-900">{tier.name}</h2>
              <p className="mt-1 text-sm text-stone-600">{tier.description}</p>
              <p className="mt-5 text-3xl sm:text-4xl font-extrabold text-stone-900">
                {tier.price}
                {tier.period && (
                  <span className="ml-1 text-base font-medium text-stone-500">
                    {tier.period}
                  </span>
                )}
              </p>

              <Button
                asChild
                variant={tier.highlight ? "accent" : "primary"}
                size="lg"
                className="mt-5 w-full"
              >
                <Link href={tier.cta.href}>{tier.cta.label}</Link>
              </Button>

              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f.label}
                    className="flex items-start gap-2 text-sm"
                  >
                    {f.included ? (
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-stone-300 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        f.included ? "text-stone-700" : "text-stone-400"
                      )}
                    >
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </section>

      <FAQSection items={pricingFAQs} />
    </PageShell>
  );
}
