import "server-only";
import { DEVICE_LABEL, MIN_OPENS, SOURCE_LABEL, SOURCE_ORDER } from "../constants";
import { addDays, addMonths, dayDiff, dayList, fmtMonth, fmtNum, pktDay, weekdayMon0 } from "../format";
import { parseRange } from "../ranges";
import type { CountRow, DailySeries, DeviceKey, Listing, RangeInfo, SourceKey, Totals } from "../types";
import { pageLabel } from "./labels";
import { completeness, listAll } from "./listings";
import { loadEvents, loadShown, trackingStart, type EventRow, type ShownRow } from "./stats";

/**
 * Every number the admin shows, computed from the raw stats in one pass per
 * window. Definitions match the ⓘ copy in lib/admin/constants.ts:
 *  Shown = card impressions · Opened = listing page opens · Contacted =
 *  WhatsApp + Call + Inquiry form · Website clicks separate · Unique
 *  visitors = distinct (device, day) · Open rate = Opened ÷ Shown ·
 *  Contact rate = Contacted ÷ Opened · Rank in city = position among live
 *  listings in the same city by contacts (ties by opens).
 */

// ── Aggregation primitives ───────────────────────────────────────────────

export function emptyTotals(): Totals {
  return { shown: 0, opened: 0, visitors: 0, wa: 0, call: 0, form: 0, contacted: 0, web: 0 };
}

interface Acc {
  t: Totals;
  posSum: number;
  vis: Set<string>;
}

function acc(): Acc {
  return { t: emptyTotals(), posSum: 0, vis: new Set() };
}

function addEvent(a: Acc, e: EventRow) {
  switch (e.kind) {
    case "open":
      a.t.opened++;
      a.vis.add(`${e.day}|${e.visitor}`);
      break;
    case "wa":
      a.t.wa++;
      a.t.contacted++;
      break;
    case "call":
      a.t.call++;
      a.t.contacted++;
      break;
    case "form":
      a.t.form++;
      a.t.contacted++;
      break;
    case "web":
      a.t.web++;
      break;
  }
}

function seal(a: Acc): Totals {
  return { ...a.t, visitors: a.vis.size };
}

interface Window {
  range: RangeInfo;
  start: string;
  end: string;
  trackingStart: string;
  /** Comparison is on and the previous period lies fully inside tracking. */
  comparable: boolean;
  /** Days of the current range before tracking began. */
  untrackedDays: number;
  events: EventRow[];
  prevEvents: EventRow[];
  shown: ShownRow[];
  prevShown: ShownRow[];
}

const memo = new Map<string, { at: number; p: Promise<Window> }>();

async function loadWindow(range: RangeInfo, listingId?: number): Promise<Window> {
  const key = `${range.start}|${range.end}|${range.compare}|${listingId ?? "all"}`;
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < 30_000) return hit.p;
  const p = (async () => {
    const ts = await trackingStart();
    const from = range.compare ? range.prevStart : range.start;
    const [ev, sh] = await Promise.all([loadEvents(from, range.end, listingId), loadShown(from, range.end, listingId)]);
    const inCur = (d: string) => d >= range.start && d <= range.end;
    const inPrev = (d: string) => d >= range.prevStart && d <= range.prevEnd;
    return {
      range,
      start: range.start,
      end: range.end,
      trackingStart: ts,
      comparable: range.compare && range.prevStart >= ts,
      untrackedDays: range.start < ts ? Math.min(range.days, dayDiff(range.start, ts)) : 0,
      events: ev.filter((e) => inCur(e.day)),
      prevEvents: range.compare ? ev.filter((e) => inPrev(e.day)) : [],
      shown: sh.filter((s) => inCur(s.day)),
      prevShown: range.compare ? sh.filter((s) => inPrev(s.day)) : [],
    };
  })();
  memo.set(key, { at: Date.now(), p });
  if (memo.size > 50) memo.delete(memo.keys().next().value as string);
  p.catch(() => memo.delete(key));
  return p;
}

function totalsOf(events: EventRow[], shown: ShownRow[], filter?: (listingId: number) => boolean): Totals {
  const a = acc();
  for (const e of events) if (!filter || filter(e.listingId)) addEvent(a, e);
  for (const s of shown) if (!filter || filter(s.listingId)) a.t.shown += s.shown;
  return seal(a);
}

function perListing(events: EventRow[], shown: ShownRow[]): Map<number, Acc> {
  const m = new Map<number, Acc>();
  const get = (id: number) => {
    let a = m.get(id);
    if (!a) m.set(id, (a = acc()));
    return a;
  };
  for (const e of events) addEvent(get(e.listingId), e);
  for (const s of shown) {
    const a = get(s.listingId);
    a.t.shown += s.shown;
    a.posSum += s.posSum;
  }
  return m;
}

function series(w: Window, filter?: (id: number) => boolean): DailySeries {
  const days = dayList(w.start, w.end);
  const idx = new Map(days.map((d, i) => [d, i]));
  const n = days.length;
  const z = () => new Array<number>(n).fill(0);
  const s = { shown: z(), opened: z(), contacted: z(), wa: z(), call: z(), form: z(), web: z(), visitors: z() };
  const vis = days.map(() => new Set<string>());
  for (const e of w.events) {
    if (filter && !filter(e.listingId)) continue;
    const i = idx.get(e.day);
    if (i === undefined) continue;
    if (e.kind === "open") {
      s.opened[i]++;
      vis[i].add(e.visitor);
    } else if (e.kind === "web") s.web[i]++;
    else {
      s[e.kind][i]++;
      s.contacted[i]++;
    }
  }
  vis.forEach((v, i) => (s.visitors[i] = v.size));
  for (const r of w.shown) {
    if (filter && !filter(r.listingId)) continue;
    const i = idx.get(r.day);
    if (i !== undefined) s.shown[i] += r.shown;
  }
  const prevDays = days.map((_, i) => addDays(w.range.prevStart, i));
  const pIdx = new Map(prevDays.map((d, i) => [d, i]));
  const prevOpened = z();
  const prevContacted = z();
  for (const e of w.prevEvents) {
    if (filter && !filter(e.listingId)) continue;
    const i = pIdx.get(e.day);
    if (i === undefined) continue;
    if (e.kind === "open") prevOpened[i]++;
    else if (e.kind === "wa" || e.kind === "call" || e.kind === "form") prevContacted[i]++;
  }
  return {
    days,
    ...s,
    prevDays,
    prevOpened: w.comparable ? prevOpened : [],
    prevContacted: w.comparable ? prevContacted : [],
    untracked: days.map((d) => d < w.trackingStart),
  };
}

function countBy<K extends string>(events: EventRow[], key: (e: EventRow) => K, filter: (e: EventRow) => boolean): Map<K, number> {
  const m = new Map<K, number>();
  for (const e of events) if (filter(e)) m.set(key(e), (m.get(key(e)) ?? 0) + 1);
  return m;
}

function sources(events: EventRow[], filter: (e: EventRow) => boolean): CountRow[] {
  const m = countBy(events, (e) => e.source, (e) => e.kind === "open" && filter(e));
  return SOURCE_ORDER.map((k: SourceKey) => ({ key: k, label: SOURCE_LABEL[k], count: m.get(k) ?? 0 }))
    .filter((r) => r.count > 0 || r.key !== "other")
    .sort((a, b) => b.count - a.count || SOURCE_ORDER.indexOf(a.key as SourceKey) - SOURCE_ORDER.indexOf(b.key as SourceKey));
}

function devices(events: EventRow[], filter: (e: EventRow) => boolean): CountRow[] {
  const m = countBy(events, (e) => e.device, (e) => e.kind === "open" && filter(e));
  return (["phone", "desktop", "tablet"] as DeviceKey[]).map((k) => ({ key: k, label: DEVICE_LABEL[k], count: m.get(k) ?? 0 }));
}

/** Opens by Monday-first weekday × PKT hour: 168 values. */
function heat(events: EventRow[], filter: (e: EventRow) => boolean): number[] {
  const v = new Array<number>(168).fill(0);
  for (const e of events) if (e.kind === "open" && filter(e)) v[weekdayMon0(e.day) * 24 + e.hour]++;
  return v;
}

/** Live listings in a city ranked by contacts (ties: opens, then id). */
function cityRanks(listings: Listing[], per: Map<number, Acc>): Map<number, { rank: number; of: number }> {
  const out = new Map<number, { rank: number; of: number }>();
  const byCity = new Map<string, Listing[]>();
  for (const l of listings) {
    if (l.status !== "live") continue;
    const arr = byCity.get(l.city) ?? [];
    arr.push(l);
    byCity.set(l.city, arr);
  }
  for (const arr of Array.from(byCity.values())) {
    const sorted = [...arr].sort((a, b) => {
      const x = per.get(a.id)?.t;
      const y = per.get(b.id)?.t;
      return (y?.contacted ?? 0) - (x?.contacted ?? 0) || (y?.opened ?? 0) - (x?.opened ?? 0) || a.id - b.id;
    });
    sorted.forEach((l, i) => out.set(l.id, { rank: i + 1, of: sorted.length }));
  }
  return out;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export function enoughData(t: Totals): boolean {
  return t.opened >= MIN_OPENS;
}

// ── Overview ─────────────────────────────────────────────────────────────

export interface OverviewData {
  range: RangeInfo;
  trackingStart: string;
  comparable: boolean;
  untrackedDays: number;
  totals: Totals;
  prevTotals: Totals | null;
  series: DailySeries;
  topCities: { city: string; contacted: number; opened: number }[];
  otherCities: { count: number; contacted: number };
  topListings: { listing: Listing; opened: number; contacted: number; spark: number[] }[];
  sources: CountRow[];
  devices: CountRow[];
  heat: number[];
  featured: { count: number; avg: number };
  free: { count: number; avg: number };
  multiple: number | null;
  zeroOpens: number;
  liveCount: number;
}

export async function getOverview(range: RangeInfo): Promise<OverviewData> {
  const [w, listings] = await Promise.all([loadWindow(range), listAll()]);
  const byId = new Map(listings.map((l) => [l.id, l]));
  const per = perListing(w.events, w.shown);
  const live = listings.filter((l) => l.status === "live");

  const cityAgg = new Map<string, { contacted: number; opened: number }>();
  for (const [id, a] of Array.from(per)) {
    const l = byId.get(id);
    if (!l) continue;
    const c = cityAgg.get(l.city) ?? { contacted: 0, opened: 0 };
    c.contacted += a.t.contacted;
    c.opened += a.t.opened;
    cityAgg.set(l.city, c);
  }
  const cityRows = Array.from(cityAgg, ([city, v]) => ({ city, ...v })).sort((a, b) => b.contacted - a.contacted || b.opened - a.opened);
  const topCities = cityRows.slice(0, 5);
  const rest = cityRows.slice(5);

  const daysIdx = new Map(dayList(w.start, w.end).map((d, i) => [d, i]));
  const sparkFor = (id: number) => {
    const s = new Array<number>(daysIdx.size).fill(0);
    for (const e of w.events) if (e.listingId === id && e.kind === "open") s[daysIdx.get(e.day)!]++;
    return s;
  };
  const top = Array.from(per)
    .filter(([id]) => byId.has(id))
    .sort(([, a], [, b]) => b.t.contacted - a.t.contacted || b.t.opened - a.t.opened)
    .slice(0, 10)
    .map(([id, a]) => ({ listing: byId.get(id)!, opened: a.t.opened, contacted: a.t.contacted, spark: sparkFor(id) }));

  const feat = live.filter((l) => l.plan !== "free");
  const free = live.filter((l) => l.plan === "free");
  const avgOf = (arr: Listing[]) => (arr.length ? arr.reduce((s, l) => s + (per.get(l.id)?.t.contacted ?? 0), 0) / arr.length : 0);
  const fAvg = avgOf(feat);
  const frAvg = avgOf(free);

  const all = () => true;
  return {
    range,
    trackingStart: w.trackingStart,
    comparable: w.comparable,
    untrackedDays: w.untrackedDays,
    totals: totalsOf(w.events, w.shown),
    prevTotals: w.comparable ? totalsOf(w.prevEvents, w.prevShown) : null,
    series: series(w),
    topCities,
    otherCities: { count: rest.length, contacted: rest.reduce((s, r) => s + r.contacted, 0) },
    topListings: top,
    sources: sources(w.events, all),
    devices: devices(w.events, all),
    heat: heat(w.events, all),
    featured: { count: feat.length, avg: fAvg },
    free: { count: free.length, avg: frAvg },
    multiple: frAvg > 0 ? fAvg / frAvg : null,
    zeroOpens: live.filter((l) => !(per.get(l.id)?.t.opened ?? 0)).length,
    liveCount: live.length,
  };
}

// ── Listings table ───────────────────────────────────────────────────────

export interface ListingRow {
  listing: Listing;
  totals: Totals;
  avgPos: number | null;
  rank: { rank: number; of: number } | null;
  spark: number[];
  completeness: number;
  enough: boolean;
}

export async function getListingRows(range: RangeInfo): Promise<{ rows: ListingRow[]; trackingStart: string }> {
  const [w, listings] = await Promise.all([loadWindow(range), listAll()]);
  const per = perListing(w.events, w.shown);
  const ranks = cityRanks(listings, per);
  const days = dayList(w.start, w.end);
  const idx = new Map(days.map((d, i) => [d, i]));
  const sparks = new Map<number, number[]>();
  for (const e of w.events) {
    if (e.kind !== "open") continue;
    let s = sparks.get(e.listingId);
    if (!s) sparks.set(e.listingId, (s = new Array<number>(days.length).fill(0)));
    s[idx.get(e.day)!]++;
  }
  const zero = new Array<number>(days.length).fill(0);
  return {
    trackingStart: w.trackingStart,
    rows: listings.map((l) => {
      const a = per.get(l.id);
      const t = a ? seal(a) : emptyTotals();
      return {
        listing: l,
        totals: t,
        avgPos: a && a.t.shown ? a.posSum / a.t.shown : null,
        rank: ranks.get(l.id) ?? null,
        spark: sparks.get(l.id) ?? zero,
        completeness: completeness(l).pct,
        enough: enoughData(t),
      };
    }),
  };
}

/** Last-30-day opens and contacts per listing (global search, sales messages). */
export async function last30ById(): Promise<Map<number, Totals>> {
  const r = parseRange({ range: "last30", compare: "0" });
  const w = await loadWindow(r);
  const per = perListing(w.events, w.shown);
  return new Map(Array.from(per, ([id, a]) => [id, seal(a)]));
}

// ── One listing ──────────────────────────────────────────────────────────

export interface ListingStats {
  range: RangeInfo;
  trackingStart: string;
  comparable: boolean;
  untrackedDays: number;
  totals: Totals;
  prevTotals: Totals | null;
  enough: boolean;
  series: DailySeries;
  city: {
    name: string;
    rank: number | null;
    of: number;
    topPct: number | null;
    avgRate: number | null;
    medianOpened: number;
  };
  lists: { page: string; label: string; shown: number; avgPos: number | null; opens: number; openRate: number | null }[];
  opensFromLists: number;
  sources: CountRow[];
  entries: CountRow[];
  heat: number[];
  devices: CountRow[];
  completeness: ReturnType<typeof completeness>;
}

export async function getListingStats(listing: Listing, range: RangeInfo): Promise<ListingStats> {
  // City comparisons need every listing's numbers, so load the whole window.
  const [w, listings] = await Promise.all([loadWindow(range), listAll()]);
  const bySlug = new Map(listings.map((l) => [l.slug, l]));
  const per = perListing(w.events, w.shown);
  const ranks = cityRanks(listings, per);
  const mine = (id: number) => id === listing.id;
  const isMine = (e: EventRow) => e.listingId === listing.id;
  const totals = totalsOf(w.events, w.shown, mine);

  const cityLive = listings.filter((l) => l.city === listing.city && l.status === "live");
  const cityOpened = cityLive.map((l) => per.get(l.id)?.t.opened ?? 0);
  const cityContacted = cityLive.reduce((s, l) => s + (per.get(l.id)?.t.contacted ?? 0), 0);
  const cityOpenSum = cityOpened.reduce((s, v) => s + v, 0);
  const r = ranks.get(listing.id) ?? null;

  const pageAgg = new Map<string, { shown: number; posSum: number }>();
  for (const s of w.shown) {
    if (s.listingId !== listing.id) continue;
    const p = pageAgg.get(s.page) ?? { shown: 0, posSum: 0 };
    p.shown += s.shown;
    p.posSum += s.posSum;
    pageAgg.set(s.page, p);
  }
  const opensByEntry = countBy(w.events, (e) => e.entry, (e) => isMine(e) && e.kind === "open");
  const lists = Array.from(pageAgg, ([page, v]) => {
    const opens = opensByEntry.get(page) ?? 0;
    return {
      page,
      label: pageLabel(page, bySlug, { listPage: true }),
      shown: v.shown,
      avgPos: v.shown ? v.posSum / v.shown : null,
      opens,
      openRate: v.shown ? opens / v.shown : null,
    };
  }).sort((a, b) => b.shown - a.shown);
  const opensFromLists = lists.reduce((s, l) => s + l.opens, 0);

  const entries = Array.from(opensByEntry, ([path, count]) => ({ key: path || "(direct)", label: pageLabel(path, bySlug), count })).sort(
    (a, b) => b.count - a.count,
  );

  return {
    range,
    trackingStart: w.trackingStart,
    comparable: w.comparable,
    untrackedDays: w.untrackedDays,
    totals,
    prevTotals: w.comparable ? totalsOf(w.prevEvents, w.prevShown, mine) : null,
    enough: enoughData(totals),
    series: series(w, mine),
    city: {
      name: listing.city,
      rank: r?.rank ?? null,
      of: r?.of ?? cityLive.length,
      topPct: r ? Math.max(1, Math.ceil((r.rank / r.of) * 100)) : null,
      avgRate: cityOpenSum ? cityContacted / cityOpenSum : null,
      medianOpened: median(cityOpened),
    },
    lists,
    opensFromLists,
    sources: sources(w.events, isMine),
    entries,
    heat: heat(w.events, isMine),
    devices: devices(w.events, isMine),
    completeness: completeness(listing),
  };
}

// ── Monthly stats message ────────────────────────────────────────────────

export interface MonthStats {
  month: string; // YYYY-MM-01
  monthLabel: string; // "September 2026"
  totals: Totals;
  rank: number | null;
  of: number;
}

/** The listing's numbers for a calendar month (default: last full month). */
export async function getMonthStats(listing: Listing, month?: string): Promise<MonthStats> {
  const today = pktDay();
  const first = month && /^\d{4}-\d{2}-01$/.test(month) ? month : addMonths(`${today.slice(0, 8)}01`, -1);
  const last = addDays(addMonths(first, 1), -1);
  const range = parseRange({ range: "custom", from: first, to: last > today ? today : last, compare: "0" }, today);
  const [w, listings] = await Promise.all([loadWindow(range), listAll()]);
  const per = perListing(w.events, w.shown);
  const r = cityRanks(listings, per).get(listing.id);
  return {
    month: first,
    monthLabel: fmtMonth(first),
    totals: totalsOf(w.events, w.shown, (id) => id === listing.id),
    rank: r?.rank ?? null,
    of: r?.of ?? 0,
  };
}

export function monthlyMessage(listing: Listing, m: MonthStats): string {
  const t = m.totals;
  const parts = [
    `Assalam o Alaikum! Your RentalSawari listing, ${m.monthLabel}: ${fmtNum(t.opened)} people opened your listing and ${fmtNum(t.contacted)} contacted you (${fmtNum(t.wa)} on WhatsApp, ${fmtNum(t.call)} calls, ${fmtNum(t.form)} forms).`,
  ];
  if (m.rank) parts.push(`You ranked #${m.rank} of ${fmtNum(m.of)} in ${listing.city}.`);
  if (listing.plan !== "free") parts.push("Thank you for being a Featured partner.");
  parts.push("— RentalSawari");
  return parts.join(" ");
}

/** "Featured listings in Islamabad got 10× more contacts last month." */
export async function cityFeaturedMultiple(city: string): Promise<number | null> {
  const today = pktDay();
  const first = addMonths(`${today.slice(0, 8)}01`, -1);
  const range = parseRange({ range: "custom", from: first, to: addDays(addMonths(first, 1), -1), compare: "0" }, today);
  const [w, listings] = await Promise.all([loadWindow(range), listAll()]);
  const per = perListing(w.events, w.shown);
  const inCity = listings.filter((l) => l.city === city && l.status === "live");
  const avg = (arr: Listing[]) => (arr.length ? arr.reduce((s, l) => s + (per.get(l.id)?.t.contacted ?? 0), 0) / arr.length : 0);
  const f = avg(inCity.filter((l) => l.plan !== "free"));
  const fr = avg(inCity.filter((l) => l.plan === "free"));
  return fr > 0 && f > 0 ? f / fr : null;
}

// ── Featured plans ───────────────────────────────────────────────────────

export interface PlanRow {
  listing: Listing;
  daysLeft: number | null; // negative = ended that many days ago
  opened: number;
  contacted: number;
}

export async function getPlanRows(): Promise<{ rows: PlanRow[]; featuredAvg30: number; freeAvg30: number; multiple: number | null; trackingStart: string }> {
  const listings = await listAll();
  const today = pktDay();
  const feat = listings.filter((l) => l.plan !== "free" && l.status === "live");
  const earliest = feat.reduce((m, l) => (l.planStart && l.planStart < m ? l.planStart : m), addDays(today, -29));
  const range = parseRange({ range: "custom", from: earliest, to: today, compare: "0" }, today);
  const w = await loadWindow(range);
  const sinceStart = (l: Listing) => {
    const from = l.planStart ?? addDays(today, -29);
    const a = acc();
    for (const e of w.events) if (e.listingId === l.id && e.day >= from) addEvent(a, e);
    return seal(a);
  };
  const rows = feat
    .map((l) => {
      const t = sinceStart(l);
      return { listing: l, daysLeft: l.planEnd ? dayDiff(today, l.planEnd) : null, opened: t.opened, contacted: t.contacted };
    })
    .sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999));

  const last30 = await last30ById();
  const live = listings.filter((l) => l.status === "live");
  const avg = (arr: Listing[]) => (arr.length ? arr.reduce((s, l) => s + (last30.get(l.id)?.contacted ?? 0), 0) / arr.length : 0);
  const fAvg = avg(live.filter((l) => l.plan !== "free"));
  const frAvg = avg(live.filter((l) => l.plan === "free"));
  return { rows, featuredAvg30: fAvg, freeAvg30: frAvg, multiple: frAvg > 0 ? fAvg / frAvg : null, trackingStart: w.trackingStart };
}

export { MIN_OPENS };
