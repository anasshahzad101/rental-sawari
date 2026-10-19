import { CAR_TYPES, SERVICES } from "../constants";
import { normalizePhone } from "../format";
import type { CarMode, CarRow } from "../types";

/** Input cleaning shared by the public forms and the admin forms. */

export function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

/** Multi-line text: keep line breaks, collapse runs of spaces. */
export function text(v: unknown, max = 3000): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function url(v: unknown): string | null {
  const s = str(v, 500);
  if (!s) return null;
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes(".") ? withScheme : null;
  } catch {
    return null;
  }
}

export function phone(v: unknown): string | null {
  return normalizePhone(typeof v === "string" ? v : "");
}

export function services(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const allowed = new Set<string>(SERVICES);
  return Array.from(new Set(v.filter((s): s is string => typeof s === "string" && allowed.has(s))));
}

/** Canonical car name: matches a known type case-insensitively, else as typed. */
export function carName(v: unknown): string {
  const s = str(v, 80);
  const known = CAR_TYPES.find((c) => c.toLowerCase() === s.toLowerCase());
  return known ?? s;
}

export function cars(v: unknown): CarRow[] {
  if (!Array.isArray(v)) return [];
  const out: CarRow[] = [];
  for (const r of v.slice(0, 40)) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const name = carName(o.name);
    const price = Math.round(Number(o.pricePerDay));
    if (!name) continue;
    const mode: CarMode = o.mode === "self" ? "self" : "driver";
    out.push({ name, pricePerDay: Number.isFinite(price) && price > 0 ? Math.min(price, 10_000_000) : 0, mode });
  }
  return out;
}

export function int(v: unknown, max = 100000): number | null {
  if (v == null || v === "") return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : null;
}

/**
 * Company-name guard (SEO action plan §1.4): at least 3 characters and must
 * start with a letter or digit — Latin or Urdu/Arabic. Blocks broken scraped
 * names like "& Travels" from entering the store and becoming page titles.
 */
export function isValidCompanyName(name: string): boolean {
  return name.length >= 3 && /^[\p{L}\p{N}]/u.test(name);
}
