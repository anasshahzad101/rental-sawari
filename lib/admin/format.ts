/**
 * Formatting for the admin: Pakistan time, friendly dates, money, phones,
 * numbers, rates and deltas. Client-safe and dependency-free.
 *
 * Pakistan has no daylight saving, so PKT is always UTC+5.
 */

const PKT_MS = 5 * 3600 * 1000;
const DAY_MS = 86400000;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Days (YYYY-MM-DD in PKT) ─────────────────────────────────────────────

/** The PKT calendar day of an instant. */
export function pktDay(at: Date | string | number = new Date()): string {
  const d = new Date(new Date(at).getTime() + PKT_MS);
  return d.toISOString().slice(0, 10);
}

/** The PKT hour (0–23) of an instant. */
export function pktHour(at: Date | string | number = new Date()): number {
  return new Date(new Date(at).getTime() + PKT_MS).getUTCHours();
}

/** A day string as a Date at UTC midnight (for calendar maths only). */
export function dayDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export function addDays(day: string, n: number): string {
  return new Date(dayDate(day).getTime() + n * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from a to b (b − a). */
export function dayDiff(a: string, b: string): number {
  return Math.round((dayDate(b).getTime() - dayDate(a).getTime()) / DAY_MS);
}

/** Every day from start to end, inclusive. */
export function dayList(start: string, end: string): string[] {
  const n = dayDiff(start, end);
  const out: string[] = [];
  for (let i = 0; i <= n; i++) out.push(addDays(start, i));
  return out;
}

/** Monday = 0 … Sunday = 6 (the heatmap's row order). */
export function weekdayMon0(day: string): number {
  return (dayDate(day).getUTCDay() + 6) % 7;
}

export function addMonths(day: string, n: number): string {
  const d = dayDate(day);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const target = new Date(Date.UTC(y, m, 1));
  const dim = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), dim));
  return target.toISOString().slice(0, 10);
}

/** "6 Oct 2026" */
export function fmtDay(day: string): string {
  const d = dayDate(day);
  return `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "6 Oct" */
export function fmtDayShort(day: string): string {
  const d = dayDate(day);
  return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

/** "Fri, 9 Oct 2026" */
export function fmtDayLong(day: string): string {
  const d = dayDate(day);
  return `${DOW[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Fri, 9 Oct" */
export function fmtDayDow(day: string): string {
  const d = dayDate(day);
  return `${DOW[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

/** "September 2026" */
export function fmtMonth(day: string): string {
  const d = dayDate(day);
  const full = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${full[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * "13 Sep – 12 Oct 2026". Same month compresses to "1–31 Oct 2026".
 * `year: false` drops the year ("13 Sep – 12 Oct").
 */
export function fmtRange(start: string, end: string, opts: { year?: boolean; compressMonth?: boolean } = {}): string {
  const year = opts.year ?? true;
  const a = dayDate(start);
  const b = dayDate(end);
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  const sameMonth = sameYear && a.getUTCMonth() === b.getUTCMonth();
  if (start === end) return year ? fmtDay(start) : fmtDayShort(start);
  if (opts.compressMonth && sameMonth) {
    return `${a.getUTCDate()}–${b.getUTCDate()} ${MON[b.getUTCMonth()]}${year ? ` ${b.getUTCFullYear()}` : ""}`;
  }
  if (!sameYear) return `${fmtDay(start)} – ${fmtDay(end)}`;
  return `${fmtDayShort(start)} – ${fmtDayShort(end)}${year ? ` ${b.getUTCFullYear()}` : ""}`;
}

// ── Instants (ISO) ───────────────────────────────────────────────────────

/** "3:45 PM" in PKT. */
export function fmtTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + PKT_MS);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ap = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}

/**
 * "Today, 3:45 PM" · "Yesterday, 5:10 PM" · "6 Oct 2026, 11:20 AM".
 * `short` drops the year for older dates ("10 Oct, 9:30 AM") — list cards.
 */
export function fmtWhen(iso: string | null | undefined, opts: { short?: boolean; now?: Date } = {}): string {
  if (!iso) return "—";
  const today = pktDay(opts.now ?? new Date());
  const day = pktDay(iso);
  const t = fmtTime(iso);
  if (day === today) return `Today, ${t}`;
  if (day === addDays(today, -1)) return `Yesterday, ${t}`;
  return `${opts.short ? fmtDayShort(day) : fmtDay(day)}, ${t}`;
}

/** "Today" · "Yesterday" · "6 Oct 2026" (no time). */
export function fmtWhenDay(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "—";
  const today = pktDay(now);
  const day = pktDay(iso);
  if (day === today) return "Today";
  if (day === addDays(today, -1)) return "Yesterday";
  return fmtDay(day);
}

// ── Numbers ──────────────────────────────────────────────────────────────

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** "PKR 7,500" */
export function fmtPKR(n: number): string {
  return `PKR ${Math.round(n).toLocaleString("en-US")}`;
}

/** "PKR 7,500/day" */
export function fmtPKRDay(n: number): string {
  return `${fmtPKR(n)}/day`;
}

/** a ÷ b as a fraction, or null when b is 0. */
export function ratio(a: number, b: number): number | null {
  return b ? a / b : null;
}

/** "14.6%" (one decimal), or "—" when undefined. */
export function fmtPct(r: number | null | undefined, digits = 1): string {
  if (r == null || !isFinite(r)) return "—";
  return `${(r * 100).toFixed(digits)}%`;
}

export type DeltaDir = "up" | "down" | "flat";

export interface DeltaInfo {
  dir: DeltaDir;
  /** "+18%", "−7%", "+0.7 pts", or "no change" */
  text: string;
}

/** Count delta in %; flat under ±1%. Returns null when there is nothing to compare. */
export function countDelta(cur: number, prev: number): DeltaInfo | null {
  if (!prev) return cur ? { dir: "up", text: "New" } : null;
  const p = ((cur - prev) / prev) * 100;
  if (Math.abs(p) < 1) return { dir: "flat", text: "no change" };
  const r = Math.round(p);
  return { dir: r > 0 ? "up" : "down", text: `${r > 0 ? "+" : "−"}${Math.abs(r)}%` };
}

/** Rate delta in percentage points; flat under ±0.1 pts. */
export function rateDelta(cur: number | null, prev: number | null): DeltaInfo | null {
  if (cur == null || prev == null) return null;
  const pts = (cur - prev) * 100;
  if (Math.abs(pts) < 0.05) return { dir: "flat", text: "no change" };
  const r = Math.abs(pts).toFixed(1);
  return { dir: pts > 0 ? "up" : "down", text: `${pts > 0 ? "+" : "−"}${r} pts` };
}

// ── Phones ───────────────────────────────────────────────────────────────

/** Digits only. */
export function phoneDigits(s: string | null | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

/**
 * Normalise a Pakistani number to "+92XXXXXXXXXX". Accepts 0300-1234567,
 * 3001234567, 92300…, +92 300 …, and landlines like 051 2345678.
 * Returns null when it can't be a valid number.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  let d = phoneDigits(input);
  if (!d) return null;
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92") && d.length >= 11) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  if (d.length < 9 || d.length > 10) return null;
  return `+92${d}`;
}

/** "+92 300 1234567" (mobile) · "+92 51 2345678" (landline). */
export function fmtPhone(e164: string | null | undefined): string {
  if (!e164) return "—";
  const n = normalizePhone(e164);
  if (!n) return e164;
  const rest = n.slice(3);
  if (rest.startsWith("3") && rest.length === 10) return `+92 ${rest.slice(0, 3)} ${rest.slice(3)}`;
  return `+92 ${rest.slice(0, 2)} ${rest.slice(2)}`;
}

/** The national part without +92, for the "+92" segmented input. */
export function phoneLocal(e164: string | null | undefined): string {
  const n = normalizePhone(e164);
  if (!n) return "";
  return fmtPhone(n).replace(/^\+92 /, "");
}

export function phoneLast4(e164: string | null | undefined): string {
  return phoneDigits(e164).slice(-4);
}

/** Same number? Ignores formatting, a leading 0 and +92. */
export function samePhone(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = normalizePhone(a);
  const y = normalizePhone(b);
  return !!x && x === y;
}

export function waLink(number: string, text?: string): string {
  const d = phoneDigits(normalizePhone(number) ?? number);
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(number: string): string {
  return `tel:${normalizePhone(number) ?? number}`;
}

// ── Names ────────────────────────────────────────────────────────────────

/** Two initials, letters only: "Margalla Rent A Car" → "MR". */
export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** URL slug, same rules as the original importer. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

/** "1 change" · "8 changes" */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${fmtNum(n)} ${n === 1 ? one : many}`;
}
