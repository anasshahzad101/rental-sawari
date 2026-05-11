import type { Metadata } from "next";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy — RentalSawari Pakistan",
  description:
    "How RentalSawari collects, uses, and protects your data. Plain English, no legalese.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
        title="Privacy Policy"
        subtitle="Last updated: May 2026"
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose">
          <p>
            This is a first-draft privacy policy. We&apos;ll have it reviewed
            by a Pakistan-licensed lawyer before public launch. Use this
            page as a sketch of our actual practices, not a binding legal
            document yet.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Browsing data:</strong> pages you visit, the city and
              car type you search for. Used to improve the directory.
            </li>
            <li>
              <strong>Contact info you submit:</strong> name, phone, email
              when you use a contact form or inquiry form. Used to respond
              to you and (in the case of inquiries) forward to the rental
              company.
            </li>
            <li>
              <strong>Business owner info:</strong> if you list your
              company, we collect CNIC and address for verification, plus
              your business contact info for the public listing.
            </li>
          </ul>

          <h2>What we don&apos;t do</h2>
          <ul>
            <li>We don&apos;t sell your data to third parties.</li>
            <li>
              We don&apos;t track you across the internet with intrusive
              cookies.
            </li>
            <li>
              We don&apos;t share your phone number with rental companies
              unless you explicitly send them an inquiry.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies — essential ones for the site to function
            and (when we add it) Google Analytics for aggregate traffic
            stats. No third-party advertising trackers in v1.
          </p>

          <h2>Your data, your control</h2>
          <p>
            Want to see what we have on you? Email{" "}
            <a href="mailto:privacy@rentalsawari.com">privacy@rentalsawari.com</a>.
            Want it deleted? Same email. We respond within 7 business days.
          </p>

          <h2>Changes</h2>
          <p>
            If we materially change this policy, we&apos;ll update the date
            at the top and notify listed business owners by email.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
