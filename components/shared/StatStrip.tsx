import { cn } from "@/lib/utils";

/**
 * A horizontal strip of big-number stats. Used as the first content row
 * on index pages (/cities, /cars) to give scannable scale signals before
 * the long-form copy.
 */

export interface Stat {
  label: string;
  value: string;
  hint?: string;
}

interface StatStripProps {
  stats: Stat[];
  className?: string;
}

export function StatStrip({ stats, className }: StatStripProps) {
  return (
    <section className={cn("border-b border-stone-200 bg-white", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div
          className={cn(
            "grid gap-4 sm:gap-6",
            stats.length === 3
              ? "grid-cols-3"
              : stats.length === 4
                ? "grid-cols-2 md:grid-cols-4"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
          )}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-4 sm:px-5 sm:py-5"
            >
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500">
                {s.label}
              </p>
              {s.hint && (
                <p className="mt-1 text-xs text-stone-500">{s.hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
