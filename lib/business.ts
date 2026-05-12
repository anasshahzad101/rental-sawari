/**
 * Single source of truth for RentalSawari's own contact info.
 * Update here — referenced from Contact page, Owner Login WhatsApp,
 * Organization JSON-LD, Footer, and llms.txt.
 */

export const business = {
  name: "RentalSawari",
  legalName: "RentalSawari Pakistan",
  // E.164 (used by Schema.org telephone fields).
  phoneE164: "+923395400416",
  // Display format used in the visible UI.
  phoneDisplay: "+92 339 5400416",
  // wa.me requires the + stripped; no spaces.
  whatsappNumber: "923395400416",
  email: "hello@rentalsawari.com",
  hours: "Mon–Sat, 9 AM – 7 PM PKT",
  address: {
    streetAddress: "226-B, Tulip Block, Sector C, Bahria Town",
    addressLocality: "Lahore",
    addressRegion: "Punjab",
    postalCode: "53720",
    addressCountry: "PK",
    /** Human-readable composite for footers and contact cards. */
    display: "226-B, Tulip Block, Bahria Town Lahore, 53720",
  },
} as const;
