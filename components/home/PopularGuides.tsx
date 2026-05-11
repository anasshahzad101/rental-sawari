import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { guides } from "@/data/guides";
import { SectionHeading } from "./SectionHeading";

const dateFmt = new Intl.DateTimeFormat("en-PK", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function PopularGuides() {
  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeading
          title="Helpful Guides"
          subtitle="Everything you need to know before renting"
        />

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <Image
                    src={g.image}
                    alt={g.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    {g.category}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-stone-900 leading-snug line-clamp-2">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2 flex-1">
                    {g.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {g.readTime} min
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
    </section>
  );
}
