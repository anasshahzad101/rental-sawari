import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

const BASE = "https://rentalsawari.com";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  // Schema.org BreadcrumbList JSON-LD. Only includes items with explicit hrefs
  // plus the final (current) item — Google's docs require the current page
  // to have a name even if its `item` URL is omitted.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-stone-500">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li
                key={`${item.label}-${i}`}
                className="inline-flex items-center gap-1"
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-semibold text-stone-900" : ""}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-stone-400"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
