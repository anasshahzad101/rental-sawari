import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";
import { companies } from "@/data/companies";

export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();
  // Thin pages (fewer than 5 reviews) carry a noindex via per-page metadata
  // but we still list them in the sitemap so Google crawls and discovers
  // when their reviewCount eventually crosses the threshold.
  const body = buildUrlset(
    companies.map((c) => ({
      loc: `${SITE}/companies/${c.slug}`,
      lastmod: now,
      changefreq: "weekly",
      // Higher priority for vendors with more social proof.
      priority:
        c.reviewCount > 100
          ? 0.8
          : c.reviewCount > 20
            ? 0.6
            : c.reviewCount > 0
              ? 0.4
              : 0.3,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
