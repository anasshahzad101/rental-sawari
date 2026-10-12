/**
 * Fixed lists and copy shared by the admin and the public forms.
 * Client-safe. Copy here is word-for-word from the design handoff.
 */
import type { DeviceKey, Plan, ReportReason, SourceKey } from "./types";

/** The 21 cities on the site, in the order the forms list them. */
export const CITIES = [
  "Lahore",
  "Islamabad",
  "Karachi",
  "Faisalabad",
  "Rawalpindi",
  "Sialkot",
  "Multan",
  "Gujranwala",
  "Gujrat",
  "Sheikhupura",
  "Sargodha",
  "Peshawar",
  "Chakwal",
  "Bahawalpur",
  "Rahim Yar Khan",
  "Quetta",
  "Okara",
  "Dera Ghazi Khan",
  "Kasur",
  "Narowal",
  "Mianwali",
] as const;

export function isSiteCity(city: string): boolean {
  return (CITIES as readonly string[]).includes(city);
}

/** The fixed service list (chips). */
export const SERVICES = [
  "With Driver",
  "Self-Drive",
  "Wedding",
  "Airport Pickup",
  "Tourist Tours",
  "Corporate Monthly",
  "Luxury",
] as const;

/** Suggestions in the cars repeater; any other name can be typed. */
export const CAR_TYPES = [
  "Toyota Corolla",
  "Honda Civic",
  "Toyota Hiace",
  "Suzuki APV",
  "Toyota Prado",
  "Toyota Land Cruiser V8",
  "Suzuki Mehran",
  "Suzuki Cultus",
  "Toyota Fortuner",
  "Mercedes-Benz",
  "Suzuki Bolan",
  "Toyota Coaster",
] as const;

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  city: "Featured City",
  plus: "Featured Plus",
};

export const PLAN_PRICE: Record<Plan, number> = { free: 0, city: 5000, plus: 12000 };

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  wrong_number: "Wrong number",
  closed: "Business has closed",
  prices: "Prices are wrong",
  service: "Rude or bad service",
  scam: "Fake or scam listing",
  other: "Other",
};

/** How a report reads as a list-card headline. */
export const REPORT_REASON_HEADLINE: Record<ReportReason, string> = {
  wrong_number: "Wrong number: nobody answers",
  closed: "Business has closed",
  prices: "Prices are wrong",
  service: "Rude or bad service",
  scam: "Fake or scam listing",
  other: "Other problem",
};

export const REPORT_REASONS = Object.keys(REPORT_REASON_LABEL) as ReportReason[];

export const REQUEST_REJECT_REASONS = [
  "Duplicate",
  "Not a rental company",
  "Can't reach them",
  "Other",
] as const;

export const CLAIM_REJECT_REASONS = [
  "Couldn't confirm ownership",
  "Changes look wrong",
  "Other",
] as const;

export const SOURCE_LABEL: Record<SourceKey, string> = {
  google: "Google",
  direct: "Direct",
  social: "Facebook & Instagram",
  ai: "AI assistants",
  whatsapp: "WhatsApp shares",
  bing: "Bing",
  other: "Other",
};

export const SOURCE_ORDER: SourceKey[] = ["google", "direct", "social", "ai", "whatsapp", "bing", "other"];

export const DEVICE_LABEL: Record<DeviceKey, string> = {
  phone: "Phone",
  desktop: "Desktop",
  tablet: "Tablet",
};

/** Rates and comparisons only show from this many opens in the period. */
export const MIN_OPENS = 30;

/** RentalSawari's own WhatsApp (fallbacks on public forms). */
export const SITE_WHATSAPP = "923395400416";
export const SITE_HOST = "rentalsawari.com";

/** ⓘ definitions, word for word. */
export const STAT_INFO = {
  shown: {
    title: "Shown",
    body: "How many times this listing's card appeared on a RentalSawari list page (city, area, car type, car-in-city, compare, homepage featured strip).",
    aka: "Also called impressions.",
  },
  avgPosition: {
    title: "Average position",
    body: "Where the card sat in those lists on average (1 = top). Shown per list page.",
  },
  opened: {
    title: "Opened",
    body: "How many times someone opened this listing's own page.",
    aka: "Also called profile views.",
  },
  visitors: {
    title: "Unique visitors",
    body: "Different people who opened it (counted once per device per day).",
  },
  openRate: {
    title: "Open rate",
    body: "Opened ÷ Shown. How often people who saw the card clicked into it.",
    aka: "Also called click-through rate (CTR).",
  },
  contacted: {
    title: "Contacted",
    body: "WhatsApp clicks + Call clicks + Inquiry forms sent. These are the leads the listing got.",
    aka: "Also called leads.",
  },
  contactRate: {
    title: "Contact rate",
    body: "Contacted ÷ Opened. How often a visit turned into a lead.",
    aka: "Also called conversion rate.",
  },
  web: {
    title: "Website clicks",
    body: "Clicks on the company's own website link. Counted separately, not as contacts.",
  },
  source: {
    title: "Source",
    body: "Where the visitor came from before landing on RentalSawari: Google, Bing, AI assistants (ChatGPT, Perplexity, Copilot, Gemini), Facebook, Instagram, WhatsApp shares, Direct, or other websites.",
  },
  entry: {
    title: "Entry page",
    body: "The RentalSawari page the visitor was on just before opening this listing.",
  },
  device: {
    title: "Device",
    body: "Phone, desktop or tablet.",
  },
  rank: {
    title: "Rank in city",
    body: "This listing's position among all listings in the same city, sorted by contacts in the period.",
  },
  completeness: {
    title: "Profile completeness",
    body: "How much of the listing is filled in: logo, about text, cars with prices, services, website, second phone.",
  },
} as const;

export type StatInfoKey = keyof typeof STAT_INFO;
