"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hookFlush, notePage, sessionSource, trackContact, trackShown, trackWebsite, trackingOff } from "@/lib/track";

/**
 * Mounted once in the public layout. Feeds the admin's listing stats:
 *  - remembers page changes (for "which page sent them"),
 *  - counts listing cards (any element with data-rs-card="{slug}") the first
 *    time each becomes half visible on a page, with its position in the
 *    page's list,
 *  - counts WhatsApp / Call / website clicks from the existing data-track
 *    attributes (the same ones Google Analytics reads).
 * See lib/track.ts for what is sent and what never is.
 */
export function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    hookFlush();
    if (trackingOff()) return;
    sessionSource();
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      const slug = el?.dataset.company;
      if (!el || !slug) return;
      const kind = el.dataset.track;
      if (kind === "whatsapp") trackContact(slug, "wa");
      else if (kind === "phone") trackContact(slug, "call");
      else if (kind === "outbound" && (el.dataset.destination ?? "website") === "website") trackWebsite(slug);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!pathname) return;
    notePage(pathname);
    if (trackingOff() || typeof IntersectionObserver === "undefined") return;

    const counted = new Set<string>();
    const page = pathname;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const slug = el.dataset.rsCard;
          io.unobserve(el);
          if (!slug || counted.has(slug)) continue;
          counted.add(slug);
          const all = Array.from(document.querySelectorAll<HTMLElement>("[data-rs-card]"));
          trackShown(slug, page, all.indexOf(el) + 1);
        }
      },
      { threshold: 0.5 },
    );
    const watch = (root: ParentNode) => root.querySelectorAll<HTMLElement>("[data-rs-card]").forEach((el) => io.observe(el));
    watch(document);
    // Cards can appear later (client-side filters, "show more").
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.dataset.rsCard) io.observe(n);
          watch(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
