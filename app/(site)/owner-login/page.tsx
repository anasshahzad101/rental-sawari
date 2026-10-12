import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Lock } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Owner Login — RentalSawari Pakistan",
  description:
    "Existing rental company owners — sign in to manage your listing, update fleet, and view inquiries.",
  alternates: { canonical: "/owner-login" },
  robots: { index: false, follow: false },
};

export default function OwnerLoginPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Owner Login
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Owner dashboard is coming soon. For now, message us on WhatsApp
            to update your listing.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-600">
            Once it&apos;s ready, you&apos;ll be able to:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
            <li>· Update your fleet and prices</li>
            <li>· View inquiries from RentalSawari</li>
            <li>· Manage your business hours</li>
            <li>· Upgrade or pause your featured plan</li>
          </ul>

          <div className="mt-6 space-y-3">
            <Button asChild variant="whatsapp" size="lg" className="w-full">
              <a
                href={`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent("Hi, I'm a listed rental company and need to update my listing.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Message Support on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/list-your-business">
                Not listed yet? Apply here
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
