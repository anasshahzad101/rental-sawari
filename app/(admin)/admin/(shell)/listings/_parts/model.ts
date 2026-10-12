/**
 * Listings table: the lean row the server sends, the filter/sort state kept
 * in the URL, and the pure filtering/sorting. Client-safe.
 */
import { MIN_OPENS, PLAN_LABEL } from "@/lib/admin/constants";
import type { Plan } from "@/lib/admin/types";

export interface LRow {
  id: number;
  slug: string;
  name: string;
  city: string;
  area: string;
  logo: string | null;
  plan: Plan;
  verified: boolean;
  hidden: boolean;
  hiddenAt: string | null;
  updatedAt: string;
  /** National digits of WhatsApp / phone / second phone ("3001234567"). */
  phones: string[];
  shown: number;
  opened: number;
  contacted: number;
  avgPos: number | null;
  rank: number | null;
  of: number | null;
  /** Opens per day, at most 30 points; [] when all zero. */
  spark: number[];
  /** Profile completeness, 0–100. */
  comp: number;
}

/**
 * The wire format: one array per listing instead of an object, which about
 * halves the page payload for ~1,400 rows. flags: 1 = verified, 2 = hidden.
 */
export type Packed = [
  id: number,
  slug: string,
  name: string,
  city: string,
  area: string,
  logo: string | null,
  plan: Plan,
  flags: number,
  hiddenAt: string | null,
  updatedAt: string,
  phones: string[],
  shown: number,
  opened: number,
  contacted: number,
  avgPos: number | null,
  rank: number | null,
  of: number | null,
  spark: number[],
  comp: number,
];

export function pack(r: LRow): Packed {
  return [
    r.id,
    r.slug,
    r.name,
    r.city,
    r.area,
    r.logo,
    r.plan,
    (r.verified ? 1 : 0) | (r.hidden ? 2 : 0),
    r.hiddenAt,
    r.updatedAt,
    r.phones,
    r.shown,
    r.opened,
    r.contacted,
    r.avgPos,
    r.rank,
    r.of,
    r.spark,
    r.comp,
  ];
}

export function unpack(p: Packed): LRow {
  const [id, slug, name, city, area, logo, plan, flags, hiddenAt, updatedAt, phones, shown, opened, contacted, avgPos, rank, of, spark, comp] = p;
  return {
    id,
    slug,
    name,
    city,
    area,
    logo,
    plan,
    verified: (flags & 1) === 1,
    hidden: (flags & 2) === 2,
    hiddenAt,
    updatedAt,
    phones,
    shown,
    opened,
    contacted,
    avgPos,
    rank,
    of,
    spark,
    comp,
  };
}

export type SortKey ="contacted" | "contactRate" | "opened" | "openRate" | "shown" | "avgPos" | "rank" | "updated";
export type Dir = "asc" | "desc";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "contacted", label: "Contacted" },
  { key: "contactRate", label: "Contact rate" },
  { key: "opened", label: "Opened" },
  { key: "openRate", label: "Open rate" },
  { key: "shown", label: "Shown" },
  { key: "avgPos", label: "Average position" },
  { key: "rank", label: "Rank in city" },
  { key: "updated", label: "Last updated" },
];

/** First click on a header: positions and ranks read best-first (low to high). */
export const DEFAULT_DIR: Record<SortKey, Dir> = {
  contacted: "desc",
  contactRate: "desc",
  opened: "desc",
  openRate: "desc",
  shown: "desc",
  avgPos: "asc",
  rank: "asc",
  updated: "desc",
};

export function dirWords(key: SortKey, dir: Dir): string {
  if (key === "updated") return dir === "desc" ? "Newest first" : "Oldest first";
  return dir === "desc" ? "High to low" : "Low to high";
}

export interface FilterState {
  q: string;
  city: string;
  area: string;
  plan: "" | Plan;
  verified: "" | "yes" | "no";
  status: "" | "live" | "hidden";
  under50: boolean;
  zero: boolean;
  sort: SortKey;
  dir: Dir;
  page: number;
}

export const EMPTY_FILTERS: Omit<FilterState, "sort" | "dir" | "page"> = {
  q: "",
  city: "",
  area: "",
  plan: "",
  verified: "",
  status: "",
  under50: false,
  zero: false,
};

const PLANS = Object.keys(PLAN_LABEL) as Plan[];

export function parseState(p: URLSearchParams): FilterState {
  const g = (k: string) => p.get(k) ?? "";
  const plan = g("plan");
  const verified = g("verified");
  const status = g("status");
  const sortRaw = g("sort");
  const sort = (SORTS.some((s) => s.key === sortRaw) ? sortRaw : "contacted") as SortKey;
  const dirRaw = g("dir");
  const dir: Dir = dirRaw === "asc" || dirRaw === "desc" ? dirRaw : DEFAULT_DIR[sort];
  const page = Math.max(1, Math.floor(Number(g("page")) || 1));
  return {
    q: g("q"),
    city: g("city"),
    area: g("area"),
    plan: (PLANS as string[]).includes(plan) ? (plan as Plan) : "",
    verified: verified === "yes" || verified === "no" ? verified : "",
    status: status === "live" || status === "hidden" ? status : "",
    under50: g("under50") === "1",
    zero: g("zero") === "1",
    sort,
    dir,
    page,
  };
}

const KEYS = ["q", "city", "area", "plan", "verified", "status", "under50", "zero", "sort", "dir", "page"] as const;

/** Write the state into `p` (other params, like the range, are kept). Defaults are left out. */
export function writeState(p: URLSearchParams, s: FilterState): URLSearchParams {
  KEYS.forEach((k) => p.delete(k));
  if (s.q.trim()) p.set("q", s.q);
  if (s.city) p.set("city", s.city);
  if (s.area) p.set("area", s.area);
  if (s.plan) p.set("plan", s.plan);
  if (s.verified) p.set("verified", s.verified);
  if (s.status) p.set("status", s.status);
  if (s.under50) p.set("under50", "1");
  if (s.zero) p.set("zero", "1");
  if (s.sort !== "contacted" || s.dir !== "desc") {
    p.set("sort", s.sort);
    p.set("dir", s.dir);
  }
  if (s.page > 1) p.set("page", String(s.page));
  return p;
}

export function sameState(a: FilterState, b: FilterState): boolean {
  return KEYS.every((k) => a[k] === b[k]);
}

export function activeCount(s: FilterState): number {
  return [s.city, s.area, s.plan, s.verified, s.status].filter(Boolean).length + (s.under50 ? 1 : 0) + (s.zero ? 1 : 0);
}

// ── Rates ────────────────────────────────────────────────────────────────

export const enough = (r: LRow) => r.opened >= MIN_OPENS;
export const openRate = (r: LRow): number | null => (r.hidden || !enough(r) || !r.shown ? null : r.opened / r.shown);
export const contactRate = (r: LRow): number | null => (r.hidden || !enough(r) ? null : r.contacted / r.opened);

// ── Filtering ────────────────────────────────────────────────────────────

/**
 * Phone part of a query: ignores spaces, dashes, a leading 0, +92 / 0092.
 * Null when the query isn't number-like or has under 3 digits.
 */
export function phoneQuery(q: string): string | null {
  const raw = q.trim();
  if (!/^\+?[\d\s()-]+$/.test(raw)) return null;
  let d = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) {
    if (d.startsWith("92")) d = d.slice(2);
  } else if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.length >= 3 ? d : null;
}

export interface Indexed extends LRow {
  _name: string;
  _area: string;
  _city: string;
}

export function index(rows: LRow[]): Indexed[] {
  return rows.map((r) => ({ ...r, _name: r.name.toLowerCase(), _area: r.area.toLowerCase(), _city: r.city.toLowerCase() }));
}

export function filterRows(rows: Indexed[], s: FilterState): Indexed[] {
  const t = s.q.trim().toLowerCase();
  const digits = t ? phoneQuery(s.q) : null;
  return rows.filter((r) => {
    if (s.city && r.city !== s.city) return false;
    if (s.area && r.area !== s.area) return false;
    if (s.plan && r.plan !== s.plan) return false;
    if (s.verified && r.verified !== (s.verified === "yes")) return false;
    if (s.status && r.hidden !== (s.status === "hidden")) return false;
    if (s.under50 && r.comp >= 50) return false;
    if (s.zero && (r.hidden || r.opened > 0)) return false;
    if (t) {
      const text = r._name.includes(t) || r._area.includes(t) || r._city.includes(t);
      const phone = !!digits && r.phones.some((p) => p.includes(digits));
      if (!text && !phone) return false;
    }
    return true;
  });
}

// ── Sorting ──────────────────────────────────────────────────────────────

function value(r: LRow, key: SortKey): number | null {
  switch (key) {
    case "contacted":
      return r.contacted;
    case "opened":
      return r.opened;
    case "shown":
      return r.hidden ? null : r.shown;
    case "openRate":
      return openRate(r);
    case "contactRate":
      return contactRate(r);
    case "avgPos":
      return r.hidden ? null : r.avgPos;
    case "rank":
      return r.hidden ? null : r.rank;
    case "updated":
      return Date.parse(r.updatedAt) || 0;
  }
}

/** Blank values ("—", "Not enough data yet") always go last. */
export function sortRows<T extends LRow>(rows: T[], key: SortKey, dir: Dir): T[] {
  const tie = (a: T, b: T) => b.contacted - a.contacted || b.opened - a.opened || a.name.localeCompare(b.name);
  return [...rows].sort((a, b) => {
    const va = value(a, key);
    const vb = value(b, key);
    if (va == null && vb == null) return tie(a, b);
    if (va == null) return 1;
    if (vb == null) return -1;
    const d = dir === "asc" ? va - vb : vb - va;
    return d || tie(a, b);
  });
}

/** Page buttons: 1 2 3 … 119 · 1 … 49 50 51 … 119 · 1 … 117 118 119. */
export function pageList(cur: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const win = cur <= 2 ? [1, 2, 3] : cur >= total - 1 ? [total - 2, total - 1, total] : [cur - 1, cur, cur + 1];
  const out: (number | "gap")[] = [];
  if (win[0] > 1) out.push(1);
  if (win[0] > 2) out.push("gap");
  out.push(...win);
  const last = win[win.length - 1];
  if (last < total - 1) out.push("gap");
  if (last < total) out.push(total);
  return out;
}
