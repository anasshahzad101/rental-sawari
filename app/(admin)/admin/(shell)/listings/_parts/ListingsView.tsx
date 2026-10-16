"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  EyeOff,
  ListFilter,
  Plus,
  SearchX,
  X,
} from "lucide-react";
import { PLAN_LABEL, SITE_HOST } from "@/lib/admin/constants";
import { fmtDay, fmtNum, fmtPct, fmtWhen, pktDay } from "@/lib/admin/format";
import type { Plan } from "@/lib/admin/types";
import { setListingStatusAction, undoVersionAction } from "@/app/(admin)/admin/_actions/listings";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Button } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { SearchInput } from "@/components/admin/ui/Field";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { PlanBadge, VerifiedMark } from "@/components/admin/ui/StatusPill";
import { useToast } from "@/components/admin/ui/Toast";
import { Sparkline } from "@/components/admin/charts/Sparkline";
import { FilterDropdown, ToggleChip, type Opt } from "./FilterBar";
import { FiltersSheet, SortSheet } from "./MobileSheets";
import {
  DEFAULT_DIR,
  EMPTY_FILTERS,
  SORTS,
  activeCount,
  contactRate,
  dirWords,
  enough,
  filterRows,
  index,
  openRate,
  pageList,
  parseState,
  sortRows,
  unpack,
  writeState,
  type FilterState,
  type LRow,
  type Packed,
  type SortKey,
} from "./model";
import { RowMenu, SalesDialog } from "./RowActions";

const PAGE = 12;
const MOBILE_STEP = 25;
const COLS = "grid-cols-[minmax(0,1fr)_104px_64px_64px_64px_80px_76px_60px_80px_72px_100px]";

const HEAD: { key?: SortKey; label: string; left?: boolean }[] = [
  { label: "Listing", left: true },
  { label: "Plan", left: true },
  { key: "shown", label: "Shown" },
  { key: "opened", label: "Opened" },
  { key: "openRate", label: "Open rate" },
  { key: "contacted", label: "Contacted" },
  { key: "contactRate", label: "Contact rate" },
  { key: "avgPos", label: "Avg pos." },
  { key: "rank", label: "Rank in city" },
  { label: "Trend" },
  { key: "updated", label: "Last updated" },
];

const place = (r: LRow) => (r.area ? `${r.city} · ${r.area}` : r.city);
const canon = (s: FilterState) => writeState(new URLSearchParams(), s).toString();

function countOpts(values: string[], label: (v: string) => string = (v) => v): Opt[] {
  const m = new Map<string, number>();
  for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return Array.from(m, ([value, count]) => ({ value, label: label(value), count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

function HiddenPill({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-[22px] flex-none items-center gap-1 rounded-full border border-line bg-fill px-2 text-[12px]/[16px] font-semibold text-quiet-text",
        className,
      )}
    >
      <EyeOff size={12} strokeWidth={1.75} aria-hidden="true" />
      Hidden
    </span>
  );
}

const NED = "Not enough data yet";

/** Rate cell: "—" for hidden, "Not enough data yet" under 30 opens, else 14.6%. */
function RateCell({ r, kind }: { r: LRow; kind: "open" | "contact" }) {
  if (r.hidden) return <span className="text-right">—</span>;
  if (!enough(r)) return <span className="text-right text-[13px]/[18px] font-semibold text-quiet-text">{NED}</span>;
  const v = kind === "open" ? openRate(r) : contactRate(r);
  return <span className="text-right">{v == null ? "—" : fmtPct(v)}</span>;
}

/** Why nothing matched ("Okara has 9 listings, none of them on Featured Plus."). */
function emptyBody(s: FilterState, rows: LRow[]): string {
  const parts: { adj: string; verb: string }[] = [];
  if (s.area) parts.push({ adj: `in ${s.area}`, verb: `are in ${s.area}` });
  if (s.plan) parts.push({ adj: `on ${PLAN_LABEL[s.plan]}`, verb: `are on ${PLAN_LABEL[s.plan]}` });
  if (s.verified) parts.push(s.verified === "yes" ? { adj: "verified", verb: "are verified" } : { adj: "unverified", verb: "are unverified" });
  if (s.status) parts.push({ adj: s.status, verb: `are ${s.status}` });
  if (s.under50) parts.push({ adj: "with a profile under 50%", verb: "have a profile under 50%" });
  if (s.zero) parts.push({ adj: "with zero opens", verb: "have zero opens" });
  if (s.q.trim()) parts.push({ adj: `matching “${s.q.trim()}”`, verb: `match “${s.q.trim()}”` });
  const join = (a: string[]) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
  if (s.city) {
    const n = rows.filter((r) => r.city === s.city).length;
    if (!n) return `There are no listings in ${s.city} yet.`;
    return `${s.city} has ${fmtNum(n)} ${n === 1 ? "listing" : "listings"}, none of them ${join(parts.map((p) => p.adj))}.`;
  }
  if (!parts.length) return "Try a different filter.";
  return `Out of ${fmtNum(rows.length)} listings, none ${join(parts.map((p) => p.verb))}.`;
}

export interface ListingsViewProps {
  /** Every listing with its numbers for the range (see `Packed`). */
  data: Packed[];
  /** "range=last30&compare=1": kept on row links and the CSV export. */
  rangeQ: string;
  /** "Last 30 days" (mobile count line). */
  rangeLabel: string;
}

export function ListingsView({ data, rangeQ, rangeLabel }: ListingsViewProps) {
  const rows = useMemo(() => data.map(unpack), [data]);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const spStr = sp?.toString() ?? "";
  const { toast } = useToast();

  // ── State ⇄ URL ──
  const [st, setSt] = useState<FilterState>(() => parseState(new URLSearchParams(spStr)));
  const stRef = useRef(st);
  stRef.current = st;

  // Outside navigation (global search "See all", back/forward): take the URL.
  useEffect(() => {
    if (spStr !== new URLSearchParams(window.location.search).toString()) return; // a stale echo of our own write
    const fromUrl = parseState(new URLSearchParams(spStr));
    if (canon(fromUrl) !== canon(stRef.current)) setSt(fromUrl);
  }, [spStr]);

  // Our state → the URL, keeping the range and anything else.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const before = p.toString();
    const after = writeState(p, st).toString();
    if (after === before) return;
    window.history.replaceState(null, "", after ? `${pathname}?${after}` : pathname);
  }, [st, pathname]);

  const update = useCallback((patch: Partial<FilterState>) => {
    setSt((s) => ({ ...s, ...patch, page: patch.page ?? 1 }));
  }, []);
  const clearAll = () => setSt((s) => ({ ...s, ...EMPTY_FILTERS, page: 1 }));

  // ── Data ──
  const indexed = useMemo(() => index(rows), [rows]);
  const filtered = useMemo(() => filterRows(indexed, st), [indexed, st]);
  const sorted = useMemo(() => sortRows(filtered, st.sort, st.dir), [filtered, st.sort, st.dir]);
  const n = sorted.length;
  const pageCount = Math.max(1, Math.ceil(n / PAGE));
  const page = Math.min(st.page, pageCount);
  const pageRows = sorted.slice((page - 1) * PAGE, page * PAGE);

  const [mobileN, setMobileN] = useState(MOBILE_STEP);
  useEffect(() => setMobileN(MOBILE_STEP), [filtered, st.sort, st.dir]);

  const live = filtered.reduce((c, r) => c + (r.hidden ? 0 : 1), 0);
  const hiddenN = n - live;
  const countLine = `${fmtNum(n)} ${n === 1 ? "listing" : "listings"}${n ? ` · ${hiddenN ? `${fmtNum(live)} live, ${fmtNum(hiddenN)} hidden` : "all live"}` : ""}`;

  // ── Filter options (counts over every listing) ──
  const cityOpts = useMemo(() => countOpts(rows.map((r) => r.city)), [rows]);
  const areaOpts = useMemo(() => countOpts(rows.filter((r) => !st.city || r.city === st.city).map((r) => r.area)), [rows, st.city]);
  const planOpts = useMemo<Opt[]>(
    () => (["free", "city", "plus"] as Plan[]).map((p) => ({ value: p, label: PLAN_LABEL[p], count: rows.filter((r) => r.plan === p).length })),
    [rows],
  );
  const verifiedOpts = useMemo<Opt[]>(
    () => [
      { value: "yes", label: "Verified", count: rows.filter((r) => r.verified).length },
      { value: "no", label: "Not verified", count: rows.filter((r) => !r.verified).length },
    ],
    [rows],
  );
  const statusOpts = useMemo<Opt[]>(
    () => [
      { value: "live", label: "Live", count: rows.filter((r) => !r.hidden).length },
      { value: "hidden", label: "Hidden", count: rows.filter((r) => r.hidden).length },
    ],
    [rows],
  );
  const anyActive = activeCount(st) > 0 || !!st.q.trim();

  // ── Navigation ──
  const href = (r: LRow) => `/admin/listings/${r.id}?${rangeQ}`;
  const openRow = (r: LRow, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) window.open(href(r), "_blank");
    else router.push(href(r));
  };

  const tableRef = useRef<HTMLDivElement>(null);
  const goPage = (p: number) => {
    update({ page: Math.max(1, Math.min(pageCount, p)) });
    const el = tableRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sortBy = (key: SortKey) =>
    setSt((s) => ({ ...s, sort: key, dir: s.sort === key ? (s.dir === "desc" ? "asc" : "desc") : DEFAULT_DIR[key], page: 1 }));

  // ── Row actions ──
  const [hideRow, setHideRow] = useState<LRow | null>(null);
  const [salesRow, setSalesRow] = useState<LRow | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  async function setStatus(r: LRow, status: "live" | "hidden") {
    const res = await setListingStatusAction(r.id, status);
    if (!res.ok) {
      toast({ message: res.error, icon: null });
      return;
    }
    router.refresh();
    const vid = res.versionId;
    toast({
      message: status === "hidden" ? `${r.name} hidden from the site` : `${r.name} is live again`,
      undo: vid
        ? async () => {
            const u = await undoVersionAction(vid);
            if (!u.ok) toast({ message: u.error, icon: null });
            router.refresh();
          }
        : undefined,
    });
  }

  const rowActions = {
    onView: (r: LRow) => window.open(`/companies/${r.slug}`, "_blank", "noopener,noreferrer"),
    onCopy: (r: LRow) => {
      const url = `https://${SITE_HOST}/companies/${r.slug}`;
      void navigator.clipboard?.writeText(url).then(
        () => toast({ message: "Page link copied" }),
        () => toast({ message: url, icon: null }),
      );
    },
    onSales: (r: LRow) => setSalesRow(r),
    onHide: (r: LRow) => setHideRow(r),
    onShow: (r: LRow) => void setStatus(r, "live"),
  };

  // ── Active filter chips (mobile row; desktop uses the dropdowns) ──
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (st.city) chips.push({ key: "city", label: `City: ${st.city}`, clear: () => update({ city: "", area: "" }) });
  if (st.area) chips.push({ key: "area", label: `Area: ${st.area}`, clear: () => update({ area: "" }) });
  if (st.plan) chips.push({ key: "plan", label: `Plan: ${PLAN_LABEL[st.plan]}`, clear: () => update({ plan: "" }) });
  if (st.verified) chips.push({ key: "verified", label: `Verified: ${st.verified === "yes" ? "Yes" : "No"}`, clear: () => update({ verified: "" }) });
  if (st.status) chips.push({ key: "status", label: `Status: ${st.status === "live" ? "Live" : "Hidden"}`, clear: () => update({ status: "" }) });
  if (st.under50) chips.push({ key: "under50", label: "Profile under 50%", clear: () => update({ under50: false }) });
  if (st.zero) chips.push({ key: "zero", label: "Zero opens", clear: () => update({ zero: false }) });

  const sortLabel = SORTS.find((s) => s.key === st.sort)?.label ?? "Contacted";

  const empty = (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-1 rounded-card border border-line bg-white px-4 py-8 text-center shadow-card">
      <div className="mb-3 grid size-14 place-items-center rounded-full bg-fill text-quiet-text">
        <SearchX size={26} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="text-[17px]/[24px] font-bold text-ink">No listings match these filters</div>
      <div className="max-w-[460px] text-body-m text-muted lg:text-body">{emptyBody(st, rows)}</div>
      <Button variant="secondary" onClick={clearAll} className="mt-4">
        Clear filters
      </Button>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
      {/* Toolbar, row 1 */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={st.q}
          onChange={(v) => update({ q: v })}
          placeholder="Filter by name, phone or area"
          aria-label="Filter listings by name, phone or area"
          className="lg:max-w-[420px] lg:flex-1"
        />
        <div className="ml-auto hidden flex-none gap-2 lg:flex">
          <Button variant="secondary" size="lg" icon={Download} href={`/api/admin/export/listings?${rangeQ}`} className="lg:px-4">
            Export CSV
          </Button>
          <Button variant="primary" size="lg" icon={Plus} href="/admin/listings/new" className="lg:px-4">
            Add listing
          </Button>
        </div>
      </div>

      {/* Toolbar, row 2 (desktop): filter chips */}
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <FilterDropdown
          name="City"
          value={st.city}
          activeLabel={`City: ${st.city}`}
          options={cityOpts}
          onChange={(v) => update({ city: v, area: "" })}
          allLabel="All cities"
          searchable
          searchPlaceholder="Find a city"
        />
        <FilterDropdown
          name="Area"
          value={st.area}
          activeLabel={`Area: ${st.area}`}
          options={areaOpts}
          onChange={(v) => update({ area: v })}
          allLabel="All areas"
          searchable
          searchPlaceholder={st.city ? `Find an area in ${st.city}` : "Find an area"}
          heading={st.city ? `Areas in ${st.city}` : "Areas in every city"}
          emptyText="No area by that name"
          width={300}
        />
        <FilterDropdown
          name="Plan"
          value={st.plan}
          activeLabel={st.plan ? `Plan: ${PLAN_LABEL[st.plan]}` : ""}
          options={planOpts}
          onChange={(v) => update({ plan: v as FilterState["plan"] })}
          allLabel="All plans"
          width={240}
        />
        <FilterDropdown
          name="Verified"
          value={st.verified}
          activeLabel={`Verified: ${st.verified === "yes" ? "Yes" : "No"}`}
          options={verifiedOpts}
          onChange={(v) => update({ verified: v as FilterState["verified"] })}
          allLabel="Verified or not"
          width={240}
        />
        <FilterDropdown
          name="Status"
          value={st.status}
          activeLabel={`Status: ${st.status === "live" ? "Live" : "Hidden"}`}
          options={statusOpts}
          onChange={(v) => update({ status: v as FilterState["status"] })}
          allLabel="Live and hidden"
          width={240}
        />
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-line" />
        <ToggleChip label="Profile under 50%" on={st.under50} onToggle={() => update({ under50: !st.under50 })} />
        <ToggleChip label="Zero opens" on={st.zero} onToggle={() => update({ zero: !st.zero })} />
        {anyActive ? (
          <button type="button" onClick={clearAll} className="ml-1 text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline">
            Clear all
          </button>
        ) : null}
        <span className="num ml-auto text-label text-muted">{countLine}</span>
      </div>

      {/* Toolbar (mobile): sort + filters, active chips, count */}
      <div className="flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSortOpen(true)}
          className="flex h-11 min-w-0 flex-1 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-[14px]/[20px] font-medium text-ink outline-none active:bg-fill"
        >
          <ArrowDownWideNarrow size={18} strokeWidth={1.75} className="flex-none text-brand-700" aria-hidden="true" />
          <span className="truncate">
            {sortLabel}, {dirWords(st.sort, st.dir).toLowerCase()}
          </span>
          <ChevronDown size={16} strokeWidth={1.75} className="ml-auto flex-none text-muted" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex h-11 flex-none items-center gap-1.5 rounded-control border border-line bg-white px-3 text-[14px]/[20px] font-semibold text-ink outline-none active:bg-fill"
        >
          <ListFilter size={18} strokeWidth={1.75} aria-hidden="true" />
          Filters
          {activeCount(st) ? (
            <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1.5 text-[12px]/[16px] font-bold text-white">
              {activeCount(st)}
            </span>
          ) : null}
        </button>
      </div>
      {chips.length ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide lg:hidden">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.clear}
              aria-label={`Remove ${c.label}`}
              className="inline-flex h-9 flex-none items-center gap-1.5 rounded-full border border-ours-border bg-ours-fill pl-3.5 pr-2 text-[14px]/[20px] font-semibold text-brand-700"
            >
              {c.label}
              <X size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="flex-none px-1 text-[14px]/[20px] font-semibold text-brand-700">
            Clear all
          </button>
        </div>
      ) : null}
      <div className="num flex justify-between text-label text-muted lg:hidden">
        <span>{`${fmtNum(n)} ${n === 1 ? "listing" : "listings"}`}</span>
        <span>{rangeLabel}</span>
      </div>

      {n === 0 ? (
        empty
      ) : (
        <>
          {/* Desktop table */}
          <div ref={tableRef} className="hidden scroll-mt-4 overflow-hidden rounded-card border border-line bg-white shadow-card lg:block">
            <div className="overflow-x-auto">
              <div role="table" aria-label="Listings" aria-rowcount={n} className="min-w-[1086px]">
                <div role="rowgroup">
                  <div
                    role="row"
                    className={cx(
                      "text-overline grid min-h-12 items-center gap-2 border-b border-line bg-page px-5 uppercase text-muted",
                      COLS,
                    )}
                  >
                    {HEAD.map((h) => {
                      if (!h.key) {
                        return (
                          <span key={h.label} role="columnheader" className={h.left ? "" : "text-right"}>
                            {h.label}
                          </span>
                        );
                      }
                      const on = st.sort === h.key;
                      const Arrow = st.dir === "desc" ? ArrowDown : ArrowUp;
                      return (
                        <span
                          key={h.key}
                          role="columnheader"
                          aria-sort={on ? (st.dir === "desc" ? "descending" : "ascending") : "none"}
                          className="flex justify-end"
                        >
                          <button
                            type="button"
                            onClick={() => sortBy(h.key!)}
                            className={cx(
                              "-mx-1 inline-flex items-center justify-end gap-0.5 rounded-md px-1 py-1 text-right uppercase outline-none transition-colors",
                              on ? "text-brand-700" : "hover:text-ink-2",
                            )}
                          >
                            <span>{h.label}</span>
                            {on ? <Arrow size={14} strokeWidth={2.5} className="flex-none" aria-hidden="true" /> : null}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div role="rowgroup">
                  {pageRows.map((r) => {
                    const trendColor = r.hidden || !enough(r) ? "#A8A29E" : "#0F766E";
                    return (
                      <div
                        key={r.id}
                        role="row"
                        onClick={(e) => {
                          // Ignore clicks from portals (menus, dialogs) and from links/buttons in the row.
                          if (!e.currentTarget.contains(e.target as Node)) return;
                          if ((e.target as HTMLElement).closest("a,button")) return;
                          openRow(r, e);
                        }}
                        className={cx(
                          "num group grid h-14 cursor-pointer items-center gap-2 border-b border-fill px-5 text-[15px]/[22px] font-medium transition-colors last:border-b-0",
                          COLS,
                          r.hidden ? "bg-page text-muted hover:bg-fill" : "bg-white text-ink hover:bg-fill",
                        )}
                      >
                        <span role="cell" className="flex min-w-0 items-center gap-3">
                          <Avatar
                            name={r.name}
                            logoUrl={r.logo}
                            size={40}
                            className={r.hidden ? (r.logo ? "opacity-60" : "bg-fill text-muted") : undefined}
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className={cx("flex min-w-0 items-center", r.hidden ? "gap-1.5" : "gap-1")}>
                              <Link
                                href={href(r)}
                                className="truncate text-[15px]/[22px] font-semibold outline-none hover:underline focus-visible:underline"
                              >
                                {r.name}
                              </Link>
                              {r.hidden ? <HiddenPill /> : r.verified ? <VerifiedMark className="text-good-text" /> : null}
                            </span>
                            <span className="truncate text-[13px]/[18px] font-medium text-muted">{place(r)}</span>
                          </span>
                          <RowMenu row={r} {...rowActions} />
                        </span>
                        <span role="cell">
                          <PlanBadge plan={r.plan} />
                        </span>
                        <span role="cell" className="text-right">
                          {r.hidden ? "—" : fmtNum(r.shown)}
                        </span>
                        <span role="cell" className="text-right">
                          {fmtNum(r.opened)}
                        </span>
                        <span role="cell" className="flex justify-end">
                          <RateCell r={r} kind="open" />
                        </span>
                        <span role="cell" className="text-right font-bold">
                          {fmtNum(r.contacted)}
                        </span>
                        <span role="cell" className="flex justify-end">
                          <RateCell r={r} kind="contact" />
                        </span>
                        <span role="cell" className="text-right">
                          {r.hidden || r.avgPos == null ? "—" : r.avgPos.toFixed(1)}
                        </span>
                        <span role="cell" className="text-right text-[14px]">
                          {r.hidden || r.rank == null ? "—" : `#${fmtNum(r.rank)} of ${fmtNum(r.of ?? 0)}`}
                        </span>
                        <span role="cell" className="flex justify-end">
                          <span className="block w-[72px]" style={{ opacity: r.hidden ? 0.35 : 1 }}>
                            <Sparkline
                              values={r.spark.length ? r.spark : [0, 0]}
                              width={80}
                              height={24}
                              fluid
                              area={false}
                              strokeWidth={1.5}
                              color={trendColor}
                            />
                          </span>
                        </span>
                        <span role="cell" className="text-right text-[13px]/[18px] font-medium text-muted">
                          {fmtWhen(r.updatedAt, { short: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Pagination */}
            <div className="num flex h-[60px] items-center justify-between border-t border-fill px-5 text-label text-muted">
              <span>
                {fmtNum((page - 1) * PAGE + 1)}–{fmtNum(Math.min(n, page * PAGE))} of {fmtNum(n)}
              </span>
              {pageCount > 1 ? (
                <nav aria-label="Pages" className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => goPage(page - 1)}
                    className="grid size-10 place-items-center rounded-[10px] border border-line text-ink outline-none transition-colors hover:bg-fill disabled:cursor-not-allowed disabled:text-[#A8A29E] disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  {pageList(page, pageCount).map((p, i) =>
                    p === "gap" ? (
                      <span key={`g${i}`} className="px-1.5">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        aria-current={p === page ? "page" : undefined}
                        onClick={() => goPage(p)}
                        className={cx(
                          "grid size-10 place-items-center rounded-[10px] text-[14px]/[14px] outline-none transition-colors",
                          p === page ? "bg-brand-50 font-bold text-brand-700" : "font-medium text-ink-2 hover:bg-fill",
                        )}
                      >
                        {fmtNum(p)}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={page >= pageCount}
                    onClick={() => goPage(page + 1)}
                    className="grid size-10 place-items-center rounded-[10px] border border-line text-ink outline-none transition-colors hover:bg-fill disabled:cursor-not-allowed disabled:text-[#A8A29E] disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </nav>
              ) : null}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {sorted.slice(0, mobileN).map((r) => {
              const rate = contactRate(r);
              return (
                <Link
                  key={r.id}
                  href={href(r)}
                  className={cx(
                    "flex flex-col gap-3 rounded-card border border-line px-4 py-3.5 shadow-card outline-none active:bg-fill",
                    r.hidden ? "bg-page text-muted" : "bg-white text-ink",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Avatar
                      name={r.name}
                      logoUrl={r.logo}
                      size={40}
                      className={r.hidden ? (r.logo ? "opacity-60" : "bg-fill text-muted") : undefined}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-[16px]/[22px] font-semibold">{r.name}</span>
                        {!r.hidden && r.verified ? <VerifiedMark className="text-good-text" /> : null}
                      </span>
                      <span className="truncate text-[13px]/[18px] font-medium text-muted">{place(r)}</span>
                    </span>
                    {r.hidden ? <HiddenPill className="h-6 px-[9px]" /> : <PlanBadge plan={r.plan} />}
                  </span>
                  {r.hidden ? (
                    <span className="num text-[13px]/[18px] font-medium">
                      {r.hiddenAt ? `Hidden on ${fmtDay(pktDay(r.hiddenAt))} · not on the site` : "Hidden · not on the site"}
                    </span>
                  ) : (
                    <span className="num grid grid-cols-3 gap-2 border-t border-fill pt-3 text-[12px]/[16px] font-medium text-muted">
                      <span className="flex flex-col">
                        <b className="text-[17px]/[24px] font-bold text-ink">{fmtNum(r.opened)}</b>
                        Opened
                      </span>
                      <span className="flex flex-col">
                        <b className="text-[17px]/[24px] font-bold text-ink">{fmtNum(r.contacted)}</b>
                        Contacted
                      </span>
                      <span className="flex flex-col">
                        {rate == null ? (
                          <b className="py-[3px] text-[13px]/[18px] font-semibold text-quiet-text">{NED}</b>
                        ) : (
                          <b className="text-[17px]/[24px] font-bold text-ink">{fmtPct(rate)}</b>
                        )}
                        Contact rate
                      </span>
                    </span>
                  )}
                </Link>
              );
            })}
            {n > mobileN ? (
              <Button variant="secondary" fullWidth onClick={() => setMobileN((m) => m + MOBILE_STEP)}>
                Show {fmtNum(Math.min(MOBILE_STEP, n - mobileN))} more
              </Button>
            ) : null}
          </div>
        </>
      )}

      {/* Overlays */}
      <ConfirmDialog
        open={!!hideRow}
        onClose={() => setHideRow(null)}
        tone="danger"
        icon={EyeOff}
        title={hideRow ? `Hide ${hideRow.name}?` : ""}
        body="It will disappear from the site but stay in the admin. You can show it again any time."
        actionLabel="Hide listing"
        loadingLabel="Hiding…"
        onConfirm={() => (hideRow ? setStatus(hideRow, "hidden") : undefined)}
      />
      <SalesDialog row={salesRow} onClose={() => setSalesRow(null)} />
      <SortSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        sort={st.sort}
        dir={st.dir}
        onSort={(key) => update({ sort: key })}
        onDir={(dir) => update({ dir })}
      />
      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        st={st}
        onChange={update}
        onClear={clearAll}
        cityOpts={cityOpts}
        areaOpts={areaOpts}
        planOpts={planOpts}
        verifiedOpts={verifiedOpts}
        statusOpts={statusOpts}
        count={n}
      />
    </div>
  );
}
