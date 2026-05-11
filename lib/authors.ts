/**
 * Author profiles used for visible bylines + Article author schema.
 *
 * Each Person entry produces Schema.org Person JSON-LD with credentials,
 * affiliation, and sameAs references. AI engines preferentially cite
 * sources with named experts — a real human author is meaningful signal.
 *
 * TODO: replace the placeholder name / LinkedIn URL with your real details
 *       before launch. The `sameAs` array is what AI engines crawl to verify
 *       you exist outside this domain.
 */

export interface Author {
  slug: string;
  name: string;
  jobTitle: string;
  bio: string;
  url: string;
  sameAs: string[];
  knowsAbout: string[];
}

export const authors: Record<string, Author> = {
  hassan: {
    slug: "hassan",
    name: "Hassan",
    jobTitle: "Founder, RentalSawari Pakistan",
    bio: "Hassan is the founder of RentalSawari, Pakistan's verified rent-a-car directory. He spent over a year personally vetting Pakistani rental vendors before launching the site and writes from first-hand experience renting across Lahore, Islamabad, Karachi, and the Northern Areas.",
    url: "https://rentalsawari.com/about",
    sameAs: [
      // TODO: add your real LinkedIn / Twitter / GitHub URLs here.
      "https://www.linkedin.com/in/rentalsawari-founder",
    ],
    knowsAbout: [
      "car rental Pakistan",
      "rent a car Lahore",
      "Northern Areas tourism",
      "Pakistani vehicle market",
      "self-drive car rental",
      "Karakoram Highway",
    ],
  },
};

export function authorPersonJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://rentalsawari.com/about#${author.slug}`,
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.bio,
    url: author.url,
    sameAs: author.sameAs,
    knowsAbout: author.knowsAbout,
    worksFor: { "@id": "https://rentalsawari.com/#organization" },
  };
}
