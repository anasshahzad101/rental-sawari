import Link from "next/link";
import { Compass, MapPin, Car as CarIcon, BookOpen } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { cities } from "@/data/cities";
import { popularCarTypes } from "@/data/carTypes";
import { guides } from "@/data/guides";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Compass className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-brand">
            404
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            We can&apos;t find that page
          </h1>
          <p className="mt-3 text-stone-600 max-w-xl mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Here&apos;s where most renters end up:
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/">Back to Homepage</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cities">Browse All Cities</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MapPin className="h-4 w-4" />
            </span>
            <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-stone-900">
              Browse by city
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {cities.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/rent-a-car-${c.slug}`}
                    className="text-stone-700 hover:text-brand"
                  >
                    Rent a car in {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <CarIcon className="h-4 w-4" />
            </span>
            <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-stone-900">
              Browse by car
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {popularCarTypes.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/cars/${c.slug}`}
                    className="text-stone-700 hover:text-brand"
                  >
                    Rent a {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <BookOpen className="h-4 w-4" />
            </span>
            <h2 className="mt-3 text-sm font-bold uppercase tracking-wider text-stone-900">
              Popular guides
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {guides.slice(0, 5).map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="text-stone-700 hover:text-brand line-clamp-2"
                  >
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
