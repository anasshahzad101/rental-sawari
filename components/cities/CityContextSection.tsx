import { MapPin, Building2, Banknote, Sparkles } from "lucide-react";
import type { CityContext } from "@/data/cityContext";

/**
 * Editorial "about this city" panel — four answer-shaped cards with icons.
 * Replaces the prose-block layout: each card has a question-form H2 (for AEO)
 * but is visually a compact, scannable card.
 */

interface CityContextSectionProps {
  cityName: string;
  context: CityContext;
}

export function CityContextSection({
  cityName,
  context,
}: CityContextSectionProps) {
  const items = [
    {
      Icon: MapPin,
      heading: `Renting a car in ${cityName}`,
      body: context.intro,
    },
    {
      Icon: Building2,
      heading: `Where in ${cityName} should I rent from?`,
      body: context.whereToRent,
    },
    {
      Icon: Banknote,
      heading: `How much should I expect to pay in ${cityName}?`,
      body: context.pricingNotes,
    },
    {
      Icon: Sparkles,
      heading: `What is ${cityName} best for?`,
      body: context.bestFor,
    },
  ];

  return (
    <section className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Local context
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            What to know about renting in {cityName}
          </h2>
          <p className="mt-3 text-stone-600">
            Pakistan-specific knowledge for renters in {cityName} — neighbourhoods,
            pricing, and what local vendors do best.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {items.map(({ Icon, heading, body }) => (
            <li
              key={heading}
              className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {heading}
                  </h3>
                  <p className="mt-2 text-sm sm:text-[15px] text-stone-700 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
