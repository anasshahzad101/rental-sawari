import type { Metadata } from "next";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Service — RentalSawari Pakistan",
  description:
    "Terms governing use of RentalSawari Pakistan as a renter or as a listed rental company.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
        title="Terms of Service"
        subtitle="Last updated: May 2026"
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose">
          <p>
            Plain-English first draft. Final terms will be reviewed by a
            Pakistan-licensed lawyer before launch.
          </p>

          <h2>1. What RentalSawari is</h2>
          <p>
            RentalSawari is a directory of car rental companies in Pakistan.
            We list verified rental businesses and route inquiries to them.
            We are <strong>not a rental company</strong> — we don&apos;t
            own vehicles, hold deposits, or process bookings.
          </p>

          <h2>2. Renter responsibilities</h2>
          <p>When you contact a rental company through RentalSawari:</p>
          <ul>
            <li>
              You&apos;re entering into an agreement with the rental company
              directly, not with RentalSawari.
            </li>
            <li>
              Any deposit, fuel deduction, damage claim, or dispute is
              between you and the rental company.
            </li>
            <li>
              You agree to provide accurate documents and follow the
              vendor&apos;s terms.
            </li>
          </ul>

          <h2>3. Rental company responsibilities</h2>
          <p>If you list your business on RentalSawari:</p>
          <ul>
            <li>You confirm the company exists and you have authority to list it.</li>
            <li>You agree to keep prices and fleet info reasonably up to date.</li>
            <li>You agree to respond to inquiries in a reasonable time.</li>
            <li>
              You agree not to use RentalSawari leads to scam, mislead, or harm
              renters. We may revoke listings for repeated bad behaviour.
            </li>
          </ul>

          <h2>4. Featured listings</h2>
          <p>
            Featured placement is a paid service. Featured status doesn&apos;t
            change verification — every Featured listing must also be
            verified to remain visible.
          </p>

          <h2>5. Liability limits</h2>
          <p>
            RentalSawari isn&apos;t liable for disputes between renters and
            rental companies, vehicle damage or accidents, theft of
            deposits, or quality of service. Use the directory at your own
            judgement — we recommend the Verified badge for a reason.
          </p>

          <h2>6. Content</h2>
          <p>
            Listings, photos, and descriptions belong to the rental
            companies. Don&apos;t scrape, copy, or republish without
            permission.
          </p>

          <h2>7. Changes</h2>
          <p>
            We may update these terms. Material changes will be communicated
            to listed business owners by email.
          </p>

          <h2>8. Contact</h2>
          <p>
            Disputes or questions about these terms:{" "}
            <a href="mailto:legal@rentalsawari.com">legal@rentalsawari.com</a>.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
