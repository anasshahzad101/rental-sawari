/**
 * Client-side analytics event helpers. Safe no-ops when gtag isn't loaded
 * (server side, ad-blocker, etc).
 *
 * Event taxonomy (mirror in GA4 custom events / conversions):
 *
 * Lead events (mark as conversions in GA4):
 *   whatsapp_click       — primary lead signal
 *   phone_click          — primary lead signal
 *   inquiry_submit       — qualified lead
 *   contact_submit       — general inquiry
 *   list_business_submit — vendor signup (B2B conversion)
 *
 * Engagement events:
 *   vendor_view          — fires after 3s on /companies/{slug}
 *   vendor_compare       — fires on /compare/{pair}
 *   search_submit        — hero search bar
 *   filter_change        — city listings filter bar
 *   select_content       — clicks on city/car/use-case/guide cards (GA4 standard)
 *   outbound_click       — vendor website / Google Maps URL clicks
 *   guide_read           — 75%+ scroll on a guide article
 *   faq_open             — FAQ accordion item opens
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  // Strip undefined/null keys so they don't clutter GA reports.
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
  );
  window.gtag("event", eventName, clean);
}

// ────── Lead events ────────────────────────────────────────────────────

interface CompanyLeadContext {
  companySlug: string;
  companyName: string;
  city: string;
  area?: string;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  sourcePage?: string;
}

export function trackWhatsAppClick(ctx: CompanyLeadContext) {
  trackEvent("whatsapp_click", {
    company_slug: ctx.companySlug,
    company_name: ctx.companyName,
    city: ctx.city,
    area: ctx.area,
    featured: ctx.featured,
    rating: ctx.rating,
    review_count: ctx.reviewCount,
    source_page: ctx.sourcePage,
  });
}

export function trackPhoneClick(ctx: CompanyLeadContext) {
  trackEvent("phone_click", {
    company_slug: ctx.companySlug,
    company_name: ctx.companyName,
    city: ctx.city,
    area: ctx.area,
    featured: ctx.featured,
    rating: ctx.rating,
    review_count: ctx.reviewCount,
    source_page: ctx.sourcePage,
  });
}

export function trackInquirySubmit(
  companySlug: string,
  city: string,
  hasPickupDate: boolean,
) {
  trackEvent("inquiry_submit", {
    company_slug: companySlug,
    city,
    has_pickup_date: hasPickupDate,
  });
}

export function trackContactSubmit(subject: string) {
  trackEvent("contact_submit", { subject });
}

export function trackListBusinessSubmit(city: string, fleet: string) {
  // Fleet bucket: <5, 5-19, 20+
  const n = parseInt(fleet, 10);
  const bucket = isNaN(n) ? "unknown" : n < 5 ? "<5" : n < 20 ? "5-19" : "20+";
  trackEvent("list_business_submit", { city, fleet_size_bucket: bucket });
}

// ────── Engagement events ──────────────────────────────────────────────

export function trackVendorView(
  companySlug: string,
  city: string,
  sourcePage?: string,
) {
  trackEvent("vendor_view", {
    company_slug: companySlug,
    company_city: city,
    source_page: sourcePage,
  });
}

export function trackVendorCompare(
  vendorA: string,
  vendorB: string,
  city: string,
) {
  trackEvent("vendor_compare", { vendor_a: vendorA, vendor_b: vendorB, city });
}

export function trackSearchSubmit(
  city: string | null,
  carType: string | null,
  rentalType: string,
) {
  trackEvent("search_submit", {
    city: city || "(any)",
    car_type: carType || "(any)",
    rental_type: rentalType,
  });
}

export function trackFilterChange(name: string, value: string) {
  trackEvent("filter_change", { filter_name: name, filter_value: value || "(cleared)" });
}

export function trackSelectContent(
  contentType: "city" | "car" | "use_case" | "guide" | "company",
  itemId: string,
) {
  // GA4 standard event name
  trackEvent("select_content", {
    content_type: contentType,
    item_id: itemId,
  });
}

export function trackOutboundClick(
  companySlug: string,
  destination: "website" | "google_maps",
  url: string,
) {
  trackEvent("outbound_click", {
    company_slug: companySlug,
    destination,
    url,
  });
}

export function trackGuideRead(guideSlug: string, readTimeMin: number) {
  trackEvent("guide_read", { guide_slug: guideSlug, read_time_min: readTimeMin });
}

export function trackFaqOpen(question: string, page: string) {
  trackEvent("faq_open", { question, page });
}
