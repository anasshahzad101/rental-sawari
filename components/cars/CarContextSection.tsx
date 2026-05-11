import { Sparkles, Fuel, AlertCircle } from "lucide-react";
import type { CarContext } from "@/data/carContext";

/**
 * Pakistan-context panel for a car model page. Three answer-shaped cards
 * (best for / fuel economy / quirks) rendered as a clean grid with icons.
 */

interface CarContextSectionProps {
  carName: string;
  context: CarContext;
}

export function CarContextSection({
  carName,
  context,
}: CarContextSectionProps) {
  const items = [
    {
      Icon: Sparkles,
      heading: `What is the ${carName} best for in Pakistan?`,
      body: context.bestFor,
      tone: "brand" as const,
    },
    {
      Icon: Fuel,
      heading: `How fuel-efficient is the ${carName}?`,
      body: context.fuelEconomy,
      tone: "brand" as const,
    },
    {
      Icon: AlertCircle,
      heading: `What should I know before renting a ${carName}?`,
      body: context.quirks,
      tone: "accent" as const,
    },
  ];

  return (
    <section className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Pakistan context
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Renting the {carName} in Pakistan
          </h2>
          <p className="mt-3 text-stone-600">
            Local knowledge from RentalSawari&apos;s vendor data — what the {carName}
            is actually used for here, how it performs, and what to watch out for.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {items.map(({ Icon, heading, body, tone }) => (
            <li
              key={heading}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  tone === "accent"
                    ? "bg-accent/10 text-accent"
                    : "bg-brand/10 text-brand"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-stone-900 leading-snug">
                {heading}
              </h3>
              <p className="mt-2 text-sm text-stone-700 leading-relaxed">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
