import Link from "next/link";
import { Compass } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 sm:py-32 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-brand">
          404
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
          We can&apos;t find that page
        </h1>
        <p className="mt-3 text-stone-600">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Try searching for a city or browsing the directory.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/">Back to Homepage</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/cities">Browse Cities</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
