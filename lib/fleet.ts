import type { Company } from "./types";

/**
 * Runtime fleet derivation.
 *
 * The company import (Google Maps Extractor CSVs) never captured structured
 * fleet data, so `Company.topCars` is empty across the board. Vendors do,
 * however, list the models they run in their free-text `about` (and often in
 * their name). We parse that real, vendor-stated text to decide which car
 * types a vendor offers — used to populate the /cars/[slug] listings and to
 * generate the /rent-a-{car}-in-{city} pages.
 *
 * We deliberately do NOT infer per-vendor pricing from this text. Pages quote
 * the car type's market starting rate as a "from" figure (the same number the
 * /cars/[slug] page already uses), never a fabricated per-vendor price.
 *
 * Slugs match data/carTypes.ts. Keep the two in sync when a car type is added.
 */
const CAR_PATTERNS: Array<[string, RegExp]> = [
  ["toyota-corolla", /\bcorolla\b/i],
  ["honda-civic", /\bcivic\b/i],
  ["toyota-hiace", /\bhi[\s-]?ace\b/i],
  ["suzuki-apv", /\bapv\b/i],
  ["toyota-prado", /\bprado\b/i],
  ["toyota-land-cruiser-v8", /\bland\s*cruiser\b|\bv8\b|\blc\s?(?:200|300)\b/i],
  ["suzuki-mehran", /\bmehran\b/i],
  ["suzuki-cultus", /\bcultus\b/i],
  ["toyota-fortuner", /\bfortuner\b/i],
  ["mercedes-benz", /\bmercedes\b|\bbenz\b|\b[ces][\s-]?class\b/i],
  ["suzuki-bolan", /\bbolan\b/i],
  ["toyota-coaster", /\bcoaster\b/i],
];

function haystack(company: Company): string {
  return `${company.name} ${company.about ?? ""}`;
}

/** Car-type slugs this vendor advertises in its name / about text. */
export function carsOfferedBy(company: Company): string[] {
  const hay = haystack(company);
  return CAR_PATTERNS.filter(([, re]) => re.test(hay)).map(([slug]) => slug);
}

/** Does this vendor advertise the given car-type slug? */
export function offersCar(company: Company, carSlug: string): boolean {
  const entry = CAR_PATTERNS.find(([slug]) => slug === carSlug);
  return entry ? entry[1].test(haystack(company)) : false;
}
