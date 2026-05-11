import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { guides } from "@/data/guides";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Car Rental Guides — Pakistan",
  description:
    "Honest, locally-written guides on renting a car in Pakistan. Pricing, documentation, self-drive vs driver, tourist tips.",
  alternates: { canonical: "/guides" },
};

const dateFmt = new Intl.DateTimeFormat("en-PK", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function GuidesIndex() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        eyebrow="Guides"
        title="Car Rental Guides"
        subtitle="Practical, no-fluff articles on renting a car in Pakistan — pricing, paperwork, self-drive vs driver, and tourist-specific guidance."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="relative w-full sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-stone-100">
                  <Image
                    src={g.image}
                    alt={g.title}
                    fill
                    sizes="(min-width: 640px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:py-6 sm:pr-6 sm:pl-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    {g.category}
                  </span>
                  <h2 className="mt-1.5 text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                    {g.title}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600 line-clamp-3 flex-1">
                    {g.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {g.readTime} min read
                    </span>
                    <span>·</span>
                    <time dateTime={g.publishedDate}>
                      {dateFmt.format(new Date(g.publishedDate))}
                    </time>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
