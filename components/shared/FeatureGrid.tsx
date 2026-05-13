import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 3- or 4-up feature card grid. Replaces wall-of-prose intros on index
 * pages with scannable icon + headline + body cards.
 */

export interface Feature {
  Icon: LucideIcon;
  title: string;
  body: string;
  tone?: "brand" | "accent";
}

interface FeatureGridProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  features: Feature[];
  className?: string;
}

export function FeatureGrid({
  eyebrow,
  title,
  subtitle,
  features,
  className,
}: FeatureGridProps) {
  return (
    <section
      className={cn("bg-stone-50 border-b border-stone-200", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {(eyebrow || title || subtitle) && (
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-stone-600 max-w-2xl">{subtitle}</p>
            )}
          </div>
        )}
        <ul
          className={cn(
            "grid gap-4 sm:gap-5",
            eyebrow || title || subtitle ? "mt-8" : "",
            features.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-3",
          )}
        >
          {features.map(({ Icon, title: t, body, tone = "brand" }) => (
            <li
              key={t}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <span
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl",
                  tone === "accent"
                    ? "bg-accent/10 text-accent"
                    : "bg-brand/10 text-brand",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-stone-900 leading-snug">
                {t}
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
