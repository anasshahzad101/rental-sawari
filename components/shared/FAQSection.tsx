import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FAQ section — toggleable accordion items rendered with native `<details>`
 * so the content stays in the static HTML (good for AI crawlers and works
 * without JavaScript) while collapsing visually by default.
 *
 * Emits Schema.org FAQPage + SpeakableSpecification JSON-LD.
 */

interface FAQ {
  q: string;
  a: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQ[];
  /** Tone: "default" (white card on stone-50), "muted" (stone card on white). */
  tone?: "default" | "muted";
  className?: string;
}

export function FAQSection({
  title = "Frequently asked questions",
  subtitle,
  items,
  tone = "default",
  className,
}: FAQSectionProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".faq-question", ".faq-answer"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section
        className={cn(
          tone === "muted" ? "bg-white" : "bg-stone-50 border-y border-stone-200",
          className,
        )}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-stone-600 max-w-xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <ul className="mt-10 space-y-3">
            {items.map((f, i) => (
              <li key={f.q}>
                <details
                  className={cn(
                    "group rounded-2xl bg-white border border-stone-200",
                    "shadow-sm hover:shadow-md transition-all",
                    "open:shadow-md open:border-brand/30",
                  )}
                >
                  <summary
                    className={cn(
                      "faq-question flex items-start justify-between gap-4",
                      "cursor-pointer select-none list-none",
                      "px-5 sm:px-6 py-4 sm:py-5",
                      "text-base sm:text-lg font-bold text-stone-900",
                      "marker:hidden",
                      "[&::-webkit-details-marker]:hidden",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-2xl",
                    )}
                  >
                    <span className="flex items-start gap-3 flex-1 pr-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-extrabold mt-0.5"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 leading-snug">{f.q}</span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-180 group-open:text-brand mt-1"
                    />
                  </summary>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1">
                    <div className="pl-10 sm:pl-10">
                      <p className="faq-answer text-[15px] sm:text-base text-stone-700 leading-relaxed">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
