/**
 * Client-side analytics event helpers. Safe no-ops when GA isn't loaded.
 *
 * Standard event names used across the site:
 *   - whatsapp_click  (params: company_name, city, source)
 *   - phone_click     (params: company_name, city)
 *   - city_select     (params: city)
 *   - car_select      (params: car_slug)
 *   - inquiry_submit  (params: company_name, city)
 *   - search_query    (params: q)
 *   - vendor_view     (auto on /companies/[slug] via GA enhanced measurement)
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  // Strip undefined keys so they don't clutter GA reports.
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined),
  );
  window.gtag("event", eventName, clean);
}

export function trackWhatsApp(companyName: string, city: string, source = "directory") {
  trackEvent("whatsapp_click", { company_name: companyName, city, source });
}

export function trackPhone(companyName: string, city: string) {
  trackEvent("phone_click", { company_name: companyName, city });
}
