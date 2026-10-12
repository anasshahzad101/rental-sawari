/**
 * Fictional sample data for the kit page, copied from the design handoff
 * (data/sample-data.json + design/charts.js). Margalla Rent A Car, last 30
 * days = 13 Sep – 12 Oct 2026; previous period 14 Aug – 12 Sep 2026.
 */
import type { Plan } from "@/lib/admin/types";
import { addDays } from "@/lib/admin/format";
import type { SearchResult } from "@/components/admin/shell";

export const DAYS = [
  "2026-09-13", "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20",
  "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28",
  "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06",
  "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12",
];
export const PREV_DAYS = DAYS.map((d) => addDays(d, -30));
export const SHOWN = [756, 425, 392, 407, 459, 819, 739, 680, 456, 388, 466, 482, 798, 959, 656, 476, 389, 587, 545, 842, 942, 681, 501, 473, 491, 556, 720, 1045, 819, 471];
export const OPENED = [49, 30, 28, 29, 35, 53, 54, 49, 31, 27, 33, 35, 52, 62, 50, 32, 30, 38, 38, 60, 65, 48, 36, 37, 33, 40, 53, 69, 53, 35];
export const WA = [5, 2, 2, 3, 3, 6, 5, 5, 2, 3, 4, 3, 5, 6, 5, 4, 3, 2, 4, 7, 5, 3, 4, 3, 3, 4, 6, 7, 4, 3];
export const CALL = [2, 1, 1, 1, 1, 2, 3, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1];
export const FORM = [1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 2, 1, 1];
export const CONTACTED = WA.map((v, i) => v + CALL[i] + FORM[i]);
export const PREV_OPENED = [47, 46, 45, 26, 23, 29, 33, 45, 46, 46, 26, 28, 25, 32, 42, 44, 48, 29, 28, 27, 26, 43, 50, 39, 28, 28, 30, 28, 48, 53];
export const RATE = CONTACTED.map((v, i) => (OPENED[i] ? v / OPENED[i] : 0));
export const CHENAB = [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1];

// ── charts.js helpers (deterministic) ──
const rnd = (s: number) => {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
function scale(w: number[], total: number): number[] {
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  const raw = w.map((v) => (v * total) / sum);
  const fl = raw.map(Math.floor);
  const rem = total - fl.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => [v - fl[i], i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, rem)
    .forEach(([, i]) => fl[i]++);
  return fl;
}

/** Busiest-times values: Mon..Sun × 24 h, peak Fri 8–9 PM = 41 (charts.js heatValues). */
export const HEAT: number[] = (() => {
  const hc = [0.25, 0.12, 0.06, 0.04, 0.04, 0.06, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95, 1, 0.95, 0.9, 0.9, 1, 1.15, 1.5, 1.85, 2.1, 1.9, 1.3, 0.6];
  const dc = [0.8, 0.75, 0.78, 0.82, 1.45, 1.3, 1.25];
  const hw: number[] = [];
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) hw.push(Math.pow(hc[h] * dc[d], 1.35) * (0.85 + 0.3 * rnd(d * 24 + h + 700)));
  const pi = 4 * 24 + 20;
  const v = scale(
    hw.map((x, i) => (i === pi ? 0 : x)),
    1284 - 41,
  );
  v[pi] = 41;
  return v;
})();

/** "Last 90 days" (15 Jul – 12 Oct 2026): the first 29 days are before tracking began. */
export const RANGE90 = (() => {
  const start = "2026-07-15";
  const days = Array.from({ length: 90 }, (_, i) => addDays(start, i));
  const wk = [1.35, 0.85, 0.82, 0.86, 0.92, 1.4, 1.5];
  const untracked = days.map((d) => d < "2026-08-13");
  const opened = days.map((d, i) => (untracked[i] ? 0 : Math.round(38 * wk[new Date(`${d}T00:00:00Z`).getUTCDay()] * (0.85 + 0.3 * rnd(i + 11)))));
  const contacted = opened.map((o, i) => Math.round(o * (0.11 + 0.06 * rnd(i + 90))));
  return { days, opened, contacted, untracked };
})();

const LISTINGS: Array<[string, string, string, Plan, "live" | "hidden", number, number, string]> = [
  ["Shahi Rent A Car", "Lahore", "Gulberg III", "plus", "live", 2410, 268, "+923214445566"],
  ["Lahore Luxury Wheels", "Lahore", "DHA Phase 5", "city", "live", 1980, 236, "+923008889900"],
  ["Blue Line Car Rental", "Islamabad", "G-11 Markaz", "plus", "live", 1860, 224, "+923335551234"],
  ["Karachi Coastal Cars", "Karachi", "Clifton", "plus", "live", 1720, 209, "+923012223344"],
  ["Pindi Express Rent A Car", "Rawalpindi", "Bahria Town", "city", "live", 1540, 198, "+923125556677"],
  ["Islamabad Car Rental Co.", "Islamabad", "I-8 Markaz", "city", "live", 1470, 196, "+923451112233"],
  ["Green Line Rent A Car", "Islamabad", "G-9 Markaz", "free", "live", 1390, 192, "+923009998877"],
  ["Margalla Rent A Car", "Islamabad", "F-10 Markaz", "city", "live", 1284, 187, "+923001234567"],
  ["Model Town Car Rental", "Lahore", "Model Town", "city", "live", 1250, 171, "+923224443322"],
  ["Sea View Car Hire", "Karachi", "DHA Phase 6", "free", "live", 1190, 158, "+923331119988"],
  ["Capital Car Hire", "Islamabad", "Blue Area", "plus", "live", 1120, 142, "+923006667788"],
  ["Faisalabad Rent A Car", "Faisalabad", "D Ground", "free", "live", 520, 61, "+923217778899"],
  ["Karachi Prime Rent A Car", "Karachi", "Gulshan-e-Iqbal", "free", "live", 388, 41, "+923452223311"],
  ["Al Noor Car Rental", "Rawalpindi", "Saddar", "free", "live", 214, 19, "+923124448190"],
  ["Okara City Cabs", "Okara", "Depalpur Road", "free", "live", 12, 2, "+923011112222"],
  ["Chenab Car Rental", "Gujrat", "GT Road", "free", "live", 9, 1, "+923336665544"],
  ["Quick Ride Rentals", "Multan", "Cantt", "free", "hidden", 4, 0, "+923048887766"],
];

export const SEARCH_LISTINGS: SearchResult[] = LISTINGS.map(([name, city, area, plan, status, opened, contacted, whatsapp], i) => ({
  id: i + 1,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  city,
  area,
  plan,
  status,
  logoUrl: null,
  whatsapp,
  opened,
  contacted,
}));

/** Mock /api/admin/search for the kit page (name, city, area or phone). */
export async function mockSearch(q: string, signal: AbortSignal): Promise<{ results: SearchResult[]; total: number }> {
  await new Promise((r) => setTimeout(r, 250));
  if (signal.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
  const s = q.trim().toLowerCase();
  const digits = s.replace(/\D/g, "").replace(/^(0092|92|0)/, "");
  const phone = digits.length >= 3 && /^[\d\s+()-]+$/.test(s);
  const hits = SEARCH_LISTINGS.filter((l) =>
    phone ? l.whatsapp.replace(/\D/g, "").includes(digits) : `${l.name} ${l.city} ${l.area}`.toLowerCase().includes(s),
  ).sort((a, b) => b.contacted - a.contacted);
  return { results: hits.slice(0, 8), total: hits.length };
}

export const ISLAMABAD_AREAS = ["F-10 Markaz", "F-11 Markaz", "F-10/3", "G-9 Markaz", "G-11 Markaz", "I-8 Markaz", "Blue Area", "E-11", "DHA Phase 2", "Bahria Town"];

export const MONTHLY_MESSAGE =
  "Assalam o Alaikum! Your RentalSawari listing, September 2026: 1,284 people opened your listing and 187 contacted you (121 on WhatsApp, 48 calls, 18 forms). You ranked #4 of 265 in Islamabad. Thank you for being a Featured partner. — RentalSawari";

export const CONFIRM_MESSAGE =
  "Assalam o Alaikum, this is RentalSawari. Bilal Ahmed has asked to update the Margalla Rent A Car listing (new phone number, Civic price, adds Fortuner). Was this you or your team? Please reply YES or NO.";

export const ABOUT_OLD = "Margalla Rent A Car offers clean cars with driver in Islamabad and Rawalpindi. Call us for daily rates.";
export const ABOUT_NEW =
  "Margalla Rent A Car offers clean cars with driver in Islamabad, Rawalpindi and Murree. Call us for airport pickup, weddings and self-drive.";
