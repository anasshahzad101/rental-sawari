import { BadgeCheck, Tag, MessageCircle, MapPin } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const reasons = [
  {
    Icon: BadgeCheck,
    title: "Verified Companies",
    body: "Every listing is vetted before going live — CNIC, business address, and active fleet confirmed.",
  },
  {
    Icon: Tag,
    title: "Real Prices",
    body: "No hidden fees, no 'call for quote' games. Every listing shows daily rates upfront.",
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp Direct",
    body: "Contact owners in seconds. No middleman, no commission, no booking fees.",
  },
  {
    Icon: MapPin,
    title: "Local Coverage",
    body: "8 cities, 1,000+ rental companies, growing daily — from Karachi to Hunza.",
  },
];

export function WhyUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <SectionHeading
        align="center"
        eyebrow="Why us"
        title="Why Pakistanis Choose RentalSawari"
        subtitle="Built for the way you actually find a rental — fast, direct, and without the runaround."
      />

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {reasons.map(({ Icon, title, body }) => (
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
  );
}
