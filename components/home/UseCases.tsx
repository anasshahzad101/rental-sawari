import Link from "next/link";
import {
  Heart,
  Plane,
  Mountain,
  Briefcase,
  Car as CarIcon,
  MapPin,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useCases } from "@/data/useCases";
import { SectionHeading } from "./SectionHeading";

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Plane,
  Mountain,
  Briefcase,
  Car: CarIcon,
  MapPin,
};

export function UseCases() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <SectionHeading
        title="Looking for Something Specific?"
        subtitle="Common reasons people rent — each with a curated list of verified vendors."
      />

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {useCases.map((u) => {
          const Icon = iconMap[u.icon] ?? CarIcon;
          return (
            <li key={u.slug}>
              <Link
                href={`/${u.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6 transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand ring-1 ring-stone-200">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-stone-900">
                  {u.title}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed flex-1">
                  {u.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
                  Browse <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
