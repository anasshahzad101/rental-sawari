"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft, Sparkles } from "lucide-react";
import { business } from "@/lib/business";
import { buildWhatsAppLink, cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

/**
 * Floating four-question assistant. It qualifies the visitor (need, city, car,
 * timeline) and then hands off to WhatsApp with a pre-filled summary, or to the
 * matching city listings page.
 *
 * Deliberately no LLM and no backend: every answer is a tap, the whole thing
 * runs client-side, and the payoff is the same WhatsApp handoff the rest of the
 * site uses (so the `ref` attribution pattern is preserved).
 *
 * The option lists mirror data/cities.ts, data/carTypes.ts and data/useCases.ts
 * but are duplicated here on purpose — importing those modules would pull their
 * full descriptions into the client bundle. Keep the slugs in sync.
 */

interface Option {
  label: string;
  /** Short value used in the WhatsApp message. */
  value: string;
  /** Slug used to build the browse link, where relevant. */
  slug?: string;
}

const NEEDS: Option[] = [
  { label: "Car with driver", value: "a car with driver" },
  { label: "Self-drive", value: "a self-drive car" },
  { label: "Airport pickup", value: "an airport pickup" },
  { label: "Wedding car", value: "a wedding car" },
  { label: "Tour package", value: "a tour package" },
  { label: "Monthly / corporate", value: "a monthly corporate rental" },
];

const CITIES: Option[] = [
  { label: "Lahore", value: "Lahore", slug: "lahore" },
  { label: "Islamabad", value: "Islamabad", slug: "islamabad" },
  { label: "Karachi", value: "Karachi", slug: "karachi" },
  { label: "Rawalpindi", value: "Rawalpindi", slug: "rawalpindi" },
  { label: "Faisalabad", value: "Faisalabad", slug: "faisalabad" },
  { label: "Multan", value: "Multan", slug: "multan" },
  { label: "Peshawar", value: "Peshawar", slug: "peshawar" },
  { label: "Quetta", value: "Quetta", slug: "quetta" },
];

const CARS: Option[] = [
  { label: "Toyota Corolla", value: "Toyota Corolla" },
  { label: "Honda Civic", value: "Honda Civic" },
  { label: "Suzuki Cultus", value: "Suzuki Cultus" },
  { label: "Toyota Prado", value: "Toyota Prado" },
  { label: "Toyota Hiace", value: "Toyota Hiace" },
  { label: "Land Cruiser V8", value: "Toyota Land Cruiser V8" },
  { label: "Coaster / bus", value: "Toyota Coaster" },
  { label: "Not sure yet", value: "not sure which car" },
];

const TIMELINES: Option[] = [
  { label: "Today or tomorrow", value: "today or tomorrow" },
  { label: "This week", value: "this week" },
  { label: "This month", value: "this month" },
  { label: "Just checking prices", value: "just checking prices" },
];

const STEPS = [
  { key: "need", question: "What do you need?", options: NEEDS },
  { key: "city", question: "Which city?", options: CITIES },
  { key: "car", question: "Which car?", options: CARS },
  { key: "when", question: "When do you need it?", options: TIMELINES },
] as const;

type AnswerKey = (typeof STEPS)[number]["key"];

export function HelpWidget() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Partial<Record<AnswerKey, Option>>>(
    {},
  );

  const done = step >= STEPS.length;

  function openWidget() {
    setOpen(true);
    trackEvent("chat_open", { page: window.location.pathname });
  }

  function choose(key: AnswerKey, option: Option) {
    const next = { ...answers, [key]: option };
    setAnswers(next);
    setStep((s) => s + 1);
    trackEvent("chat_answer", { step: key, value: option.value });
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function reset() {
    setAnswers({});
    setStep(0);
  }

  const city = answers.city;
  const summaryMessage = [
    `Hi RentalSawari, I need ${answers.need?.value ?? "a rental car"}`,
    city ? ` in ${city.value}` : "",
    answers.car && !answers.car.value.startsWith("not sure")
      ? `. Preferred car: ${answers.car.value}`
      : "",
    answers.when ? `. Timeline: ${answers.when.value}` : "",
    ".",
  ].join("");

  const whatsappHref = buildWhatsAppLink(
    business.whatsappNumber,
    summaryMessage,
    { source: "chat-widget" },
  );

  const browseHref = city ? `/rent-a-car-${city.slug}` : "/cities";

  if (!open) {
    return (
      <button
        type="button"
        onClick={openWidget}
        aria-label="Open the rental assistant"
        className={cn(
          "fixed right-4 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3",
          "text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark",
          "bottom-20 md:bottom-5",
        )}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold">Let us help you</span>
          <span className="block text-[11px] font-medium text-white/80">
            Free · takes 30 seconds
          </span>
        </span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Rental assistant"
      className={cn(
        "fixed right-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden",
        "rounded-2xl border border-stone-200 bg-white shadow-2xl",
        "bottom-20 md:bottom-5",
      )}
    >
      <div className="bg-brand px-4 py-3 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Sparkles className="h-4 w-4" />
              Let us help you
            </p>
            <p className="mt-0.5 text-[11px] text-white/80">
              Four quick questions and we&apos;ll take it from there.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                "h-1 flex-1 rounded-full transition",
                i < step ? "bg-white" : "bg-white/30",
              )}
            />
          ))}
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {!done ? (
          <>
            <p className="text-sm font-bold text-stone-900">
              {STEPS[step].question}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STEPS[step].options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => choose(STEPS[step].key, option)}
                  className={cn(
                    "rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-semibold",
                    "text-stone-800 transition hover:border-brand hover:bg-brand/5 hover:text-brand",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-stone-900">
              Here&apos;s what we have
            </p>
            <dl className="mt-3 space-y-2 rounded-xl bg-stone-50 p-3">
              <SummaryRow label="Need" value={answers.need?.label} />
              <SummaryRow label="City" value={answers.city?.label} />
              <SummaryRow label="Car" value={answers.car?.label} />
              <SummaryRow label="Timeline" value={answers.when?.label} />
            </dl>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("chat_whatsapp_click", {
                  city: answers.city?.value,
                  need: answers.need?.value,
                })
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" />
              Continue on WhatsApp
            </a>

            <Link
              href={browseHref}
              onClick={() => {
                setOpen(false);
                trackEvent("chat_browse_click", { city: answers.city?.value });
              }}
              className="mt-2 flex w-full items-center justify-center rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-brand hover:text-brand"
            >
              Or browse {answers.city?.label ?? "all"} rentals
            </Link>

            <button
              type="button"
              onClick={reset}
              className="mt-3 w-full text-center text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Start over
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="font-medium uppercase tracking-wide text-stone-500">
        {label}
      </dt>
      <dd className="font-bold text-stone-900">{value}</dd>
    </div>
  );
}
