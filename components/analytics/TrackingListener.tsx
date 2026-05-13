"use client";

import { useEffect } from "react";
import {
  trackWhatsAppClick,
  trackPhoneClick,
  trackOutboundClick,
  trackFaqOpen,
  trackSelectContent,
} from "@/lib/analytics";

/**
 * One global click listener attached to <body>. Reads `data-track` and the
 * supporting `data-*` attributes off the clicked element (or its nearest
 * ancestor with data-track) and fires the corresponding GA4 event.
 *
 * This keeps server components server-side — no need to wrap every
 * CompanyCard in a Client Component to fire events. Just add a few
 * `data-track="..."` attributes to existing <a> tags.
 *
 * Also wires up native <details> `toggle` events for FAQ accordion tracking
 * (which can't be done via data attributes alone).
 */

interface DataAttrs {
  [key: string]: string | undefined;
}

function attrsFrom(el: HTMLElement): DataAttrs {
  const out: DataAttrs = {};
  for (const a of el.attributes) {
    if (a.name.startsWith("data-")) out[a.name.slice(5)] = a.value;
  }
  return out;
}

function sourcePageFromPath(path: string): string {
  if (path === "/") return "homepage";
  if (path.startsWith("/companies/")) return "company";
  if (path.startsWith("/compare/")) return "compare";
  if (path.startsWith("/rent-a-car-")) return "city_or_area";
  if (path.startsWith("/cars/")) return "car";
  if (path.startsWith("/guides/")) return "guide";
  if (
    [
      "/wedding-car-rental",
      "/airport-pickup",
      "/northern-areas-tours",
      "/corporate-monthly",
      "/self-drive-rental",
      "/tourist-packages",
      "/tourist-car-rental",
    ].includes(path)
  ) {
    return "use_case";
  }
  if (path === "/cities") return "cities_index";
  if (path === "/cars") return "cars_index";
  return "other";
}

export function TrackingListener() {
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const trackEl = target.closest<HTMLElement>("[data-track]");
      if (!trackEl) return;
      const attrs = attrsFrom(trackEl);
      const eventName = attrs.track;
      if (!eventName) return;

      const source = sourcePageFromPath(window.location.pathname);

      switch (eventName) {
        case "whatsapp":
          trackWhatsAppClick({
            companySlug: attrs.company || "",
            companyName: attrs["company-name"] || "",
            city: attrs.city || "",
            area: attrs.area,
            featured: attrs.featured === "true",
            rating: attrs.rating ? Number(attrs.rating) : undefined,
            reviewCount: attrs["review-count"]
              ? Number(attrs["review-count"])
              : undefined,
            sourcePage: source,
          });
          break;

        case "phone":
          trackPhoneClick({
            companySlug: attrs.company || "",
            companyName: attrs["company-name"] || "",
            city: attrs.city || "",
            area: attrs.area,
            featured: attrs.featured === "true",
            rating: attrs.rating ? Number(attrs.rating) : undefined,
            reviewCount: attrs["review-count"]
              ? Number(attrs["review-count"])
              : undefined,
            sourcePage: source,
          });
          break;

        case "outbound":
          trackOutboundClick(
            attrs.company || "",
            (attrs.destination as "website" | "google_maps") || "website",
            (trackEl as HTMLAnchorElement).href || "",
          );
          break;

        case "select-content":
          trackSelectContent(
            (attrs["content-type"] as
              | "city"
              | "car"
              | "use_case"
              | "guide"
              | "company") || "company",
            attrs["item-id"] || "",
          );
          break;
      }
    };

    // FAQ accordion — fire on each open. We use the native <details> toggle
    // event with `open === true`.
    const toggleHandler = (ev: Event) => {
      const el = ev.target as HTMLDetailsElement;
      if (!el || !(el instanceof HTMLDetailsElement)) return;
      if (!el.open) return;
      const summary = el.querySelector(".faq-question")?.textContent?.trim();
      if (!summary) return;
      trackFaqOpen(summary, window.location.pathname);
    };

    document.addEventListener("click", handler, { capture: true });
    document.addEventListener("toggle", toggleHandler, { capture: true });
    return () => {
      document.removeEventListener("click", handler, { capture: true });
      document.removeEventListener("toggle", toggleHandler, { capture: true });
    };
  }, []);

  return null;
}
