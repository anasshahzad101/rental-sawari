/**
 * Date ranges for the stats pages. The range lives in the URL
 * (?range=last30&compare=1, or ?range=custom&from=…&to=…) so a page can be
 * reloaded or shared and still show the same numbers. Client-safe.
 *
 * The previous period is always the same number of days immediately before.
 */
import type { RangeInfo } from "./types";
import { addDays, addMonths, dayDiff, fmtDayShort, fmtRange, pktDay } from "./format";

export const RANGE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "last90", label: "Last 90 days" },
  { key: "custom", label: "Custom" },
] as const;

export type RangeKey = (typeof RANGE_PRESETS)[number]["key"];

export const DEFAULT_RANGE: RangeKey = "last30";

function isDay(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Start and end days for a preset, relative to `today` (PKT). */
export function presetDays(key: RangeKey, today: string, from?: string, to?: string): [string, string] {
  switch (key) {
    case "today":
      return [today, today];
    case "yesterday":
      return [addDays(today, -1), addDays(today, -1)];
    case "last7":
      return [addDays(today, -6), today];
    case "thisMonth":
      return [`${today.slice(0, 8)}01`, today];
    case "lastMonth": {
      const first = addMonths(`${today.slice(0, 8)}01`, -1);
      return [first, addDays(`${today.slice(0, 8)}01`, -1)];
    }
    case "last90":
      return [addDays(today, -89), today];
    case "custom": {
      let a = isDay(from) ? from : addDays(today, -29);
      let b = isDay(to) ? to : today;
      if (b > today) b = today;
      if (a > b) [a, b] = [b, a];
      return [a, b];
    }
    case "last30":
    default:
      return [addDays(today, -29), today];
  }
}

/** The hint shown on the right of each preset row ("13 Sep – 12 Oct"). */
export function presetHint(key: RangeKey, today: string): string {
  if (key === "custom") return "Pick dates";
  const [a, b] = presetDays(key, today);
  return a === b ? fmtDayShort(a) : fmtRange(a, b, { year: false });
}

export function buildRange(key: RangeKey, start: string, end: string, compare: boolean): RangeInfo {
  const days = dayDiff(start, end) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(days - 1));
  const label = RANGE_PRESETS.find((p) => p.key === key)?.label ?? "Custom";
  return {
    key,
    label,
    start,
    end,
    days,
    text: fmtRange(start, end),
    shortText: fmtRange(start, end, { year: false }),
    compare,
    prevStart,
    prevEnd,
    prevText: fmtRange(prevStart, prevEnd),
  };
}

type Params = Record<string, string | string[] | undefined> | URLSearchParams | undefined;

function get(p: Params, k: string): string | undefined {
  if (!p) return undefined;
  if (p instanceof URLSearchParams) return p.get(k) ?? undefined;
  const v = p[k];
  return Array.isArray(v) ? v[0] : v;
}

/** Read the range from URL params, falling back to the last 30 days. */
export function parseRange(params: Params, today: string = pktDay()): RangeInfo {
  const raw = get(params, "range");
  const key = (RANGE_PRESETS.some((p) => p.key === raw) ? raw : DEFAULT_RANGE) as RangeKey;
  const compare = get(params, "compare") !== "0";
  const [a, b] = presetDays(key, today, get(params, "from"), get(params, "to"));
  return buildRange(key, a, b, compare);
}

/** Query string for a range ("range=last30&compare=1"). */
export function rangeQuery(r: { key: string; start: string; end: string; compare: boolean }): string {
  const q = new URLSearchParams();
  q.set("range", r.key);
  if (r.key === "custom") {
    q.set("from", r.start);
    q.set("to", r.end);
  }
  q.set("compare", r.compare ? "1" : "0");
  return q.toString();
}
