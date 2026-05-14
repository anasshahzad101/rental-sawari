/**
 * Google AdSense configuration. The base script lives in app/layout.tsx
 * (loaded site-wide for verification + Auto Ads). This file only manages
 * the *manual* ad-slot placements — the strategic spots where we want a
 * specific ad unit, not random Auto Ads.
 *
 * To activate each slot:
 *   1. Go to AdSense → Ads → By ad unit → Create new
 *   2. Choose "Display ad", responsive, size "Auto"
 *   3. Name it something readable (e.g. "RentalSawari · homepage middle")
 *   4. Copy the data-ad-slot value (looks like "1234567890")
 *   5. Paste it into the corresponding slot below
 *
 * Leave a slot as `undefined` to suppress that ad until you have a unit.
 * The AdSlot component renders nothing when the slot ID is missing — no
 * empty boxes, no layout shift.
 *
 * Where each slot appears:
 *   - homepage   → between Featured Rentals and Use Cases on `/`
 *   - guideBody  → end of every guide article body, before "Related guides"
 *   - useCase    → after the FAQ on every use-case page (wedding, airport, ...)
 *   - indexPage  → after the feature grid on /cities and /cars
 *
 * Surfaces WITHOUT ads (deliberately — protects featured-listing revenue):
 *   - /companies/[slug]            company profiles
 *   - /rent-a-car-*                city, area, route pages
 *   - /rent-a-[car]-in-[city]      city × car pages
 *   - /compare/[pair]              vendor comparisons
 *   - /list-your-business, /pricing, /owner-login, /contact
 *
 * Important: in the AdSense dashboard, add a "Site exclusion" URL group
 * for the surfaces above so Auto Ads (if you ever enable them) don't
 * place ads on conversion pages.
 */

export const ADSENSE_CLIENT = "ca-pub-4703255031750777";

export const ADSENSE_SLOTS = {
  // Set each to a real slot ID once you create the ad unit in AdSense.
  // Until set, the corresponding placement renders nothing.
  homepage: undefined as string | undefined,
  guideBody: undefined as string | undefined,
  useCase: undefined as string | undefined,
  indexPage: undefined as string | undefined,
};
