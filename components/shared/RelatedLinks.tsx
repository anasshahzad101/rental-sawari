import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Related" / "Popular searches" link block — sits at the bottom of city
 * pages, car pages, guides, and area pages. Boosts internal linking, which
 * is the cheapest SEO win for a directory site.
 */

export interface LinkGroup {
  title: string;
  links: Array<{ label: string; href: string; sub?: string }>;
}

interface RelatedLinksProps {
  groups: LinkGroup[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RelatedLinks({
  groups,
  title = "Popular searches",
  subtitle,
  className,
}: RelatedLinksProps) {
  return (
    <section className={cn("bg-stone-50 border-t border-stone-200", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-stone-600">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            "mt-8 grid gap-6",
            groups.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : groups.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {g.title}
              </h3>
              <ul className="mt-3 space-y-1.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-baseline gap-1 text-sm text-stone-700 hover:text-brand"
                    >
                      <span>{l.label}</span>
                      {l.sub && (
                        <span className="text-xs text-stone-400">{l.sub}</span>
                      )}
                      <ArrowUpRight className="h-3 w-3 text-stone-300 group-hover:text-brand transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
