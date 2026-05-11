import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  MessageCircle,
  ShieldCheck,
  Receipt,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListBusinessForm } from "@/components/forms/ListBusinessForm";
import { FAQSection } from "@/components/shared/FAQSection";
import { listYourBusinessFAQs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "List Your Rent-A-Car Business — Free Listing on RentalSawari Pakistan",
  description:
    "Reach 50,000+ monthly customers searching for rentals in your city. Free basic listing, no setup fees. WhatsApp leads delivered directly to your phone.",
  alternates: { canonical: "/list-your-business" },
};

const benefits = [
  {
    Icon: MessageCircle,
    title: "WhatsApp leads, directly",
    body: "Customers click through to your WhatsApp. No middleman, no commission, no leads farmed to competitors.",
  },
  {
    Icon: Receipt,
    title: "No booking fees",
    body: "RentalSawari is free for renters and free for basic listings. We make money on featured placements only.",
  },
  {
    Icon: TrendingUp,
    title: "50,000+ monthly customers",
    body: "Growing weekly. Customers find us via Google searches for 'rent a car Lahore', 'wedding car Islamabad', etc.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified badge",
    body: "Listings with verified CNICs and business addresses get a badge. Customers trust verified vendors first.",
  },
];

const steps = [
  {
    n: "1",
    title: "Submit your application",
    body: "Tell us about your company. Takes 2 minutes.",
  },
  {
    n: "2",
    title: "We verify in 24 hours",
    body: "We check your CNIC and business address. WhatsApp confirmation when done.",
  },
  {
    n: "3",
    title: "Listing goes live",
    body: "Your company appears in your city's directory. WhatsApp leads start arriving.",
  },
];

export default function ListYourBusinessPage() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List Your Business" },
        ]}
        eyebrow="For Business Owners"
        title="List your rent-a-car business free"
        subtitle="Reach 50,000+ monthly customers searching for rentals across Pakistan. No booking fees, no commissions — just WhatsApp leads."
      />

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {benefits.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm"
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
      </section>

      {/* Steps */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 text-center">
            How it works
          </h2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, title, body }) => (
              <li
                key={n}
                className="relative rounded-2xl bg-white border border-stone-200 p-6 shadow-sm"
              >
                <span className="absolute -top-4 left-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-bold text-sm">
                  {n}
                </span>
                <h3 className="text-base font-bold text-stone-900">{title}</h3>
                <p className="mt-2 text-sm text-stone-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured pricing pitch + form */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                Free forever, or upgrade for more leads
              </h2>
              <p className="mt-3 text-stone-600">
                Basic listings stay free for life. Featured placements
                multiply your visibility on city, car, and use-case pages.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Free Listing
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-stone-900">
                PKR 0<span className="text-base font-medium text-stone-500">/month</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
                <li>✓ City directory listing</li>
                <li>✓ WhatsApp + phone contact</li>
                <li>✓ Verified badge after verification</li>
                <li>✓ Up to 5 cars displayed</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Featured
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-stone-900">
                PKR 5,000–12,000
                <span className="text-base font-medium text-stone-500">/month</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
                <li>✓ Top placement on city pages</li>
                <li>✓ Featured on the homepage</li>
                <li>✓ Featured badge on every card</li>
                <li>✓ Up to 20 cars displayed</li>
                <li>✓ Priority verification</li>
              </ul>
              <Link
                href="/pricing"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                See full pricing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ListBusinessForm />
          </div>
        </div>
      </section>

      <FAQSection items={listYourBusinessFAQs} />
    </PageShell>
  );
}
