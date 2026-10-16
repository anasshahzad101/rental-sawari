/**
 * Chart maths ported from design/charts.js. Pure functions, client-safe.
 */

/** One decimal, as the SVG paths in the design use. */
export const f1 = (n: number): string => (Math.round(n * 10) / 10).toFixed(1);

/**
 * The axis step: the first of 1, 2, 2.5, 3, 4, 5 × 10ⁿ that gives four steps
 * covering `max` (charts.js `niceSteps`). The axis runs 0 … step × 4.
 */
export function niceStep(max: number): number {
  if (!(max > 0)) return 1;
  const mags = [1, 2, 2.5, 3, 4, 5];
  for (let p = 0; p < 9; p++) {
    for (const m of mags) {
      const st = m * Math.pow(10, p);
      if (st * 4 >= max) return st;
    }
  }
  return max / 4;
}

/**
 * X-axis tick indices. A 28–31 day range gets the design's 0/7/14/21/28
 * (0/14/28 compact); anything else gets `count` evenly spaced ticks.
 */
export function pickTicks(n: number, compact: boolean): number[] {
  if (n <= 0) return [];
  if (n >= 28 && n <= 31) return compact ? [0, 14, 28] : [0, 7, 14, 21, 28];
  const count = Math.min(n, compact ? 3 : 5);
  if (count <= 1) return [0];
  if (n <= count) return Array.from({ length: n }, (_, i) => i);
  const out: number[] = [];
  for (let k = 0; k < count; k++) out.push(Math.round((k * (n - 1)) / (count - 1)));
  return Array.from(new Set(out));
}

/** Rough width of a 12 px Inter tabular label. */
export const labelWidth = (s: string): number => s.length * 7;

/** charts.js `spark`: line and area paths, 2 px inset, 3 px top/bottom room. */
export function sparkPaths(values: number[], W: number, H: number): { line: string; area: string } {
  if (!values.length) return { line: "", area: "" };
  const a = values.length === 1 ? [values[0], values[0]] : values;
  const mn = Math.min(...a);
  const mx = Math.max(...a);
  const x = (i: number) => (i / (a.length - 1)) * (W - 4) + 2;
  const y = (v: number) => H - 3 - ((v - mn) / (mx - mn || 1)) * (H - 6);
  const line = a.map((v, i) => `${i ? "L" : "M"}${f1(x(i))},${f1(y(v))}`).join("");
  return { line, area: `${line}L${f1(x(a.length - 1))},${H}L2,${H}Z` };
}

/** Sum consecutive 7-day buckets (Week view). The last bucket may be short. */
export function weekBuckets(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let s = 0; s < n; s += 7) out.push([s, Math.min(n - 1, s + 6)]);
  return out;
}

export function sumRange(a: number[] | undefined, s: number, e: number): number {
  if (!a) return 0;
  let t = 0;
  for (let i = s; i <= e; i++) t += a[i] ?? 0;
  return t;
}

/** Heatmap colour by value ÷ max. */
export function heatColor(v: number, max: number): string {
  if (!v || !max) return "#F5F5F4";
  const r = v / max;
  if (r < 0.12) return "#F0FDFA";
  if (r < 0.3) return "#CCFBF1";
  if (r < 0.5) return "#99F6E4";
  if (r < 0.75) return "#14B8A6";
  return "#0F766E";
}

/** "8–9 PM", "11 AM–12 PM" (charts.js `hrange`). */
export function hourRange(h: number): string {
  const a = h % 12 || 12;
  const b = (h + 1) % 12 || 12;
  const sa = h < 12 ? "AM" : "PM";
  const sb = (h + 1) % 24 < 12 ? "AM" : "PM";
  return sa === sb ? `${a}–${b} ${sa}` : `${a} ${sa}–${b} ${sb}`;
}

/** "9 PM" */
export function hourLabel(h: number): string {
  return `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * One month of calendar cells, Monday first (charts.js `cal`). Days are
 * YYYY-MM-DD strings; `start`/`end` is the selected range (end may be null
 * while picking), `today` caps selectable days.
 */
export interface CalCell {
  day: string | null;
  n: string;
  inRange: boolean;
  edge: boolean;
  future: boolean;
  /** Band corner rounding: [left, right]. */
  roundL: boolean;
  roundR: boolean;
}

export function calendarCells(year: number, month0: number, start: string | null, end: string | null, today: string): CalCell[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const dim = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const out: CalCell[] = [];
  for (let i = 0; i < lead; i++) out.push({ day: null, n: "", inRange: false, edge: false, future: false, roundL: false, roundR: false });
  const S = start;
  const E = end ?? start;
  for (let d = 1; d <= dim; d++) {
    const day = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = (new Date(Date.UTC(year, month0, d)).getUTCDay() + 6) % 7;
    const inRange = !!S && !!E && day >= S && day <= E;
    const edge = day === S || day === E;
    out.push({
      day,
      n: String(d),
      inRange,
      edge,
      future: day > today,
      roundL: day === S || dow === 0 || d === 1,
      roundR: day === E || dow === 6 || d === dim,
    });
  }
  return out;
}
