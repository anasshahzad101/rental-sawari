import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { placeholder } from "@/lib/placeholder";

const points = [
  {
    Icon: FileText,
    text: "International Driving Permit accepted by verified vendors",
  },
  {
    Icon: ShieldCheck,
    text: "USD-denominated security deposits, fully refundable",
  },
  {
    Icon: Mountain,
    text: "Northern Areas specialists — Hunza, Skardu, Naran",
  },
];

const heroImage = placeholder({
  width: 900,
  height: 700,
  label: "Hunza Karakoram",
  realUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
  realPath: "/images/tourist-hunza.jpg",
});

export function ForTourists() {
  return (
    <section className="bg-gradient-to-br from-stone-100 to-stone-50 border-y border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Left: copy */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              For International Visitors
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
              Visiting Pakistan?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-stone-600 max-w-xl">
              Here&apos;s everything you need to know about renting a car as a
              foreign tourist — paperwork, payment in foreign currency, and
              which routes need a special NOC.
            </p>

            <ul className="mt-6 space-y-3">
              {points.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand ring-1 ring-stone-200 shrink-0">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm sm:text-base text-stone-700">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <Button asChild variant="primary" size="lg" className="mt-7">
              <Link href="/guides/foreign-tourist-car-rental-pakistan">
                Read the Tourist Guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Right: image */}
          <figure className="relative">
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-stone-200">
              <Image
                src={heroImage}
                alt="Karakoram Highway near Hunza Valley, northern Pakistan"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs text-stone-500 text-center">
              Hunza Valley · the most-rented destination for foreign visitors
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
