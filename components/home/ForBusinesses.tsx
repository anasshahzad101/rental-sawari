import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForBusinesses() {
  return (
    <section className="bg-brand relative overflow-hidden">
      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -left-10 -bottom-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              For Business Owners
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Own a rent-a-car business?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/85 max-w-xl">
              List your fleet free. Get WhatsApp leads directly. Reach 50,000+
              monthly customers searching for rentals in your city.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <Button asChild variant="accent" size="xl" className="w-full sm:w-auto text-base">
              <Link href="/list-your-business">
                List Your Business Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-xs text-white/70 sm:text-right">
              Free basic listing · No setup fees · Featured listings from PKR
              5,000/month
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
