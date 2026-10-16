/**
 * The public site's listing stats tracker (browser side). It feeds the admin
 * analytics through POST /api/t:
 *
 *   shown   — a listing card became at least half visible on a list page
 *   open    — someone opened a listing's own page
 *   contact — WhatsApp / Call click or an inquiry form sent
 *   web     — a click on the company's own website link
 *
 * It sends nothing from the owner's browser (the rs_admin cookie set at
 * admin login), nothing from automated browsers, and no personal data: a
 * random browser id the server hashes per day, where the visit came from
 * (Google, Facebook…), the RentalSawari page before, and the device type.
 *
 * Separate from lib/analytics.ts (Google Analytics), which keeps working
 * as before.
 */

import type { ContactMethod, DeviceKey, SourceKey } from "@/lib/admin/types";

type Ev =
  | { t: "s"; l: string; p: string; n: number }
  | { t: "o"; l: string; src: SourceKey; en: string; d: DeviceKey }
  | { t: "c"; l: string; m: ContactMethod; src: SourceKey; en: string; d: DeviceKey }
  | { t: "w"; l: string; src: SourceKey; en: string; d: DeviceKey };

const V_KEY = "rs_v";
const SRC_KEY = "rs_src";
const NAV_KEY = "rs_nav";
const OPEN_KEY = "rs_opened";
const OPEN_DEDUPE_MS = 30 * 60 * 1000;

let queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function ss(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function trackingOff(): boolean {
  if (typeof window === "undefined") return true;
  if (navigator.webdriver) return true;
  return /(?:^|;\s*)rs_admin=1/.test(document.cookie);
}

function visitorId(): string {
  try {
    let v = localStorage.getItem(V_KEY);
    if (!v) {
      v = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(V_KEY, v);
    }
    return v;
  } catch {
    return `nostore-${Math.random().toString(36).slice(2)}`;
  }
}

export function deviceType(): DeviceKey {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk|Kindle|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "tablet"; // iPadOS
  if (/Mobi|Android|iPhone|iPod|Windows Phone|Opera Mini|IEMobile/i.test(ua)) return "phone";
  return "desktop";
}

function classify(referrer: string, utm: string | null): SourceKey {
  const u = (utm ?? "").toLowerCase();
  if (u) {
    if (/chatgpt|openai|perplexity|copilot|gemini|claude/.test(u)) return "ai";
    if (/google/.test(u)) return "google";
    if (/bing/.test(u)) return "bing";
    if (/facebook|^fb|instagram|^ig/.test(u)) return "social";
    if (/whatsapp|^wa$/.test(u)) return "whatsapp";
  }
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (host === location.hostname.replace(/^www\./, "")) return "direct";
  if (/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|copilot\.microsoft\.com|gemini\.google\.com|bard\.google\.com|claude\.ai|you\.com|phind\.com)$/.test(host)) return "ai";
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return "google";
  if (/(^|\.)bing\.com$/.test(host)) return "bing";
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me|instagram\.com|messenger\.com)$/.test(host)) return "social";
  if (/(^|\.)(whatsapp\.com|wa\.me|l\.wl\.co)$/.test(host)) return "whatsapp";
  return "other";
}

/** Where this visit came from, decided once on the first page of the session. */
export function sessionSource(): SourceKey {
  const s = ss();
  const known = s?.getItem(SRC_KEY) as SourceKey | null;
  if (known) return known;
  const src = classify(document.referrer, new URLSearchParams(location.search).get("utm_source"));
  s?.setItem(SRC_KEY, src);
  return src;
}

/** Remember page changes so a listing open knows which page came before it. */
export function notePage(path: string) {
  const s = ss();
  if (!s) return;
  let nav: { cur: string; prev: string } = { cur: "", prev: "" };
  try {
    nav = JSON.parse(s.getItem(NAV_KEY) || "") as typeof nav;
  } catch {
    // first page
  }
  if (nav.cur === path) return;
  s.setItem(NAV_KEY, JSON.stringify({ prev: nav.cur, cur: path }));
}

/**
 * The RentalSawari page before the current one ("" when the visit started
 * here). React runs a page's effects before the layout's, so a listing page
 * can ask before notePage() has recorded it — hence the `cur !== current`
 * check. A new tab opened from a list falls back to the same-site referrer.
 */
export function previousPage(current = location.pathname): string {
  let nav = { cur: "", prev: "" };
  try {
    nav = JSON.parse(ss()?.getItem(NAV_KEY) || "") as typeof nav;
  } catch {
    // nothing recorded yet
  }
  if (nav.cur && nav.cur !== current) return nav.cur;
  if (nav.prev) return nav.prev;
  try {
    const r = document.referrer ? new URL(document.referrer) : null;
    if (r && r.hostname === location.hostname && r.pathname !== current) return r.pathname;
  } catch {
    // ignore a malformed referrer
  }
  return "";
}

function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length) return;
  const batch = queue.splice(0, 100);
  const body = JSON.stringify({ v: visitorId(), e: batch });
  let sent = false;
  try {
    sent = navigator.sendBeacon?.("/api/t", new Blob([body], { type: "text/plain" })) ?? false;
  } catch {
    sent = false;
  }
  if (!sent) {
    fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  }
  if (queue.length) flush();
}

function push(e: Ev) {
  if (trackingOff()) return;
  queue.push(e);
  if (queue.length >= 50) flush();
  else if (!timer) timer = setTimeout(flush, 2000);
}

let flushHooked = false;
export function hookFlush() {
  if (flushHooked || typeof window === "undefined") return;
  flushHooked = true;
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

function ctx() {
  return { src: sessionSource(), d: deviceType() };
}

export function trackShown(slug: string, page: string, position: number) {
  push({ t: "s", l: slug, p: page, n: position });
}

/** One open per listing per 30 minutes per tab, so refreshes don't inflate it. */
export function trackOpen(slug: string) {
  const s = ss();
  let map: Record<string, number> = {};
  try {
    map = JSON.parse(s?.getItem(OPEN_KEY) || "{}") as Record<string, number>;
  } catch {
    map = {};
  }
  const now = Date.now();
  if (map[slug] && now - map[slug] < OPEN_DEDUPE_MS) return;
  map[slug] = now;
  s?.setItem(OPEN_KEY, JSON.stringify(map));
  push({ t: "o", l: slug, en: previousPage(), ...ctx() });
}

export function trackContact(slug: string, method: ContactMethod) {
  push({ t: "c", l: slug, m: method, en: location.pathname, ...ctx() });
  if (method !== "form") flush(); // the click usually leaves the page
}

export function trackWebsite(slug: string) {
  push({ t: "w", l: slug, en: location.pathname, ...ctx() });
  flush();
}
