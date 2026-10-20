import type { Metadata } from "next";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { socialMeta } from "@/lib/seo";

/**
 * /verified-badge — the embeddable "Verified Vendor" badge program
 * (SEO plan §3.2). Vendors copy a snippet that links back to their
 * RentalSawari profile — the engine behind niche-relevant backlinks.
 */

const PATH = "/verified-badge";
const TITLE = "Verified Vendor Badge — Show You're Verified on RentalSawari";
const DESCRIPTION =
  "Embed the free Verified Vendor badge on your website or Facebook page and link it to your RentalSawari profile. Copy-paste HTML for any site.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, path: PATH }),
};

const htmlSnippet = (slug: string) =>
  `<a href="https://rentalsawari.com/companies/${slug}" target="_blank" rel="noopener">
  <img src="https://rentalsawari.com/badges/verified-vendor.svg"
       alt="Verified Vendor on RentalSawari" width="240" height="64">
</a>`;

const markdownSnippet = (slug: string) =>
  `[![Verified Vendor on RentalSawari](https://rentalsawari.com/badges/verified-vendor.svg)](https://rentalsawari.com/companies/${slug})`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-stone-900 p-4 text-xs leading-relaxed text-stone-100">
      <code>{code}</code>
    </pre>
  );
}

export default function VerifiedBadgePage() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Verified Badge" }]}
        eyebrow="For listed vendors"
        title="Show your Verified badge"
        subtitle="Free for every verified vendor. Embed it on your website, Facebook page, or WhatsApp catalog — it links straight to your RentalSawari profile."
      />

      {/* Badge preview */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 flex flex-col items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG badge preview */}
          <img
            src="/badges/verified-vendor.svg"
            alt="Verified Vendor on RentalSawari"
            width="240"
            height="64"
          />
          <div className="flex flex-wrap justify-center gap-3 text-xs text-stone-500">
            <span className="rounded-full bg-white border border-stone-200 px-3 py-1">SVG — sharp at any size</span>
            <span className="rounded-full bg-white border border-stone-200 px-3 py-1">Under 1 KB</span>
            <span className="rounded-full bg-white border border-stone-200 px-3 py-1">Served from our CDN</span>
          </div>
        </div>
      </section>

      {/* How to embed */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
          How to add it to your site
        </h2>
        <ol className="mt-4 space-y-6 text-sm text-stone-700">
          <li>
            <p className="font-semibold text-stone-900">1. Find your company slug.</p>
            <p className="mt-1">
              Open your RentalSawari profile — the slug is the last part of the
              URL. For example, in{" "}
              <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">
                rentalsawari.com/companies/<strong>city-cabs-lahore</strong>
              </code>{" "}
              the slug is <strong>city-cabs-lahore</strong>.
            </p>
          </li>
          <li>
            <p className="font-semibold text-stone-900">2. Copy the HTML snippet and replace <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">YOUR-SLUG</code>.</p>
            <div className="mt-2">
              <CodeBlock code={htmlSnippet("YOUR-SLUG")} />
            </div>
            <p className="mt-2">
              Paste it anywhere HTML is allowed: your website footer, sidebar,
              contact page, or about section.
            </p>
          </li>
          <li>
            <p className="font-semibold text-stone-900">3. On Facebook, WhatsApp, or a blog? Use the Markdown/image form.</p>
            <div className="mt-2">
              <CodeBlock code={markdownSnippet("YOUR-SLUG")} />
            </div>
            <p className="mt-2">
              For Facebook posts and WhatsApp catalogs, you can also save the
              badge image directly from{" "}
              <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">
                rentalsawari.com/badges/verified-vendor.svg
              </code>{" "}
              and attach it with a link to your profile in the caption.
            </p>
          </li>
        </ol>
      </section>

      {/* Why bother */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
          Why embed it?
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-stone-700">
          <li className="flex gap-3">
            <span className="text-brand font-bold">→</span>
            <span><strong>More direct inquiries.</strong> The badge links to your profile, where renters message you on WhatsApp in one tap — no commission, no middleman.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand font-bold">→</span>
            <span><strong>Trust signal.</strong> The Verified badge tells customers your CNIC, address, and number were checked — before they ever call.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand font-bold">→</span>
            <span><strong>Better Google ranking for your own site.</strong> A link from a ranked directory page helps your website appear higher for searches in your city.</span>
          </li>
        </ul>
        <p className="mt-6 text-sm text-stone-600">
          Not listed yet?{" "}
          <a href="/list-your-business" className="font-semibold text-brand hover:underline">
            List your business free
          </a>{" "}
          — verification takes 1–2 working days.
        </p>
      </section>
    </PageShell>
  );
}
