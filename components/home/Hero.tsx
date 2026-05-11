import { CheckCircle2 } from "lucide-react";
import { SearchBar } from "./SearchBar";

const trustBadges = [
  "Verified Companies",
  "Real Prices",
  "Direct WhatsApp",
  "No Booking Fees",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-stone-50 via-white to-white"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-32 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_center,_rgba(15,118,110,0.10),_transparent_60%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            1,000+ verified companies · 8 cities
          </span>

          <h1 className="font-extrabold tracking-tight text-stone-900 text-4xl sm:text-5xl lg:text-6xl max-w-3xl">
            Rent a Car Anywhere in Pakistan
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg text-stone-600">
            Compare 1,000+ verified rent-a-car companies across 8 cities. Real
            prices. Direct WhatsApp contact. No booking fees.
          </p>

          <div className="mt-8 sm:mt-10 w-full flex justify-center">
            <SearchBar />
          </div>

          <ul className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-stone-600">
            {trustBadges.map((label) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-4 w-4 text-brand"
                  aria-hidden="true"
                />
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
