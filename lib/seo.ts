import type { Metadata } from "next";

/**
 * SEO helpers — single source of truth for OpenGraph + Twitter card metadata.
 *
 * Next.js does NOT deep-merge the `openGraph`/`twitter` objects from the root
 * layout into a page's metadata: if a page declares `openGraph` without an
 * `images` field, the root's og-image is dropped entirely. `socialMeta()`
 * guarantees every page that opts in restates a complete, consistent card so
 * that can never silently regress.
 */

export const SITE_URL = "https://rentalsawari.com";

/**
 * Normalise an image reference to an absolute URL for OpenGraph + JSON-LD.
 * Already-absolute `http(s)` URLs (Wikimedia, placehold.co, a CDN) pass
 * through untouched; site-relative paths get the canonical origin prefixed.
 * Falls back to the default share image when nothing is supplied.
 */
export function absoluteImage(src?: string): string {
  if (!src) return `${SITE_URL}/og-image.png`;
  if (src.startsWith("http")) return src;
  return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/**
 * Build a complete, consistent OpenGraph + Twitter card for a page.
 * Spread the result into a page's `Metadata` alongside title/description/
 * canonical, e.g. `return { title, description, alternates, ...socialMeta({…}) }`.
 */
export function socialMeta(opts: {
  title: string;
  description: string;
  /** Canonical path, e.g. "/cars/toyota-corolla". */
  path: string;
  /** Page-specific image; defaults to /og-image.png when omitted. */
  image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const img = absoluteImage(opts.image);
  return {
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: `${SITE_URL}${opts.path}`,
      siteName: "RentalSawari",
      type: "website",
      images: [{ url: img, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [img],
    },
  };
}
