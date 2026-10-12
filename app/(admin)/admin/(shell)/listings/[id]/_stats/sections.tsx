import * as React from "react";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import type { Listing } from "@/lib/admin/types";
import type { ListingStats, MonthStats } from "@/lib/admin/repo/analytics";
import { MIN_OPENS, STAT_INFO } from "@/lib/admin/constants";
import { countDelta, fmtDay, fmtNum, fmtPct, fmtPhone, plural, rateDelta, ratio } from "@/lib/admin/format";
import { Card } from "@/components/admin/ui/Card";
import { cx } from "@/components/admin/ui/cx";
import { QuietNote } from "@/components/admin/ui/Banner";
import { StatCard } from "@/components/admin/ui/StatCard";
import { InfoTooltip, type InfoContent } from "@/components/admin/ui/Tooltip";
import { WhatsAppPreview } from "@/components/admin/ui/WhatsAppPreview";
import { BarList, type BarListRow } from "@/components/admin/charts/BarList";
import { CompletenessRing } from "@/components/admin/charts/CompletenessRing";
import { DevicesBar, Donut, type DonutSlice } from "@/components/admin/charts/Donut";
import { Funnel } from "@/components/admin/charts/Funnel";
import { HeatLegend, Heatmap } from "@/components/admin/charts/Heatmap";
import { LineChart } from "@/components/admin/charts/LineChart";
import { WebsiteClicksFooter } from "@/components/admin/charts/MethodTotals";
import { busiestSummary } from "./busiest";
import { ContactBars } from "./ContactBars";

/**
 * The twelve blocks of Listing › Stats, in the design's order. Server
 * components; the interactive charts are the kit's client components.
 */

type S = ListingStats;

// ⓘ for section titles. Where §6 has a definition it is used word for word.
const FUNNEL_INFO: InfoContent = {
  title: "Open rate and contact rate",
  body: `Open rate: ${STAT_INFO.openRate.body} Contact rate: ${STAT_INFO.contactRate.body}`,
};
const OVER_TIME_INFO: InfoContent = {
  title: "Over time",
  body: "Shown, Opened and Contacted for each day, Pakistan time. The dashed line is Opened in the previous period.",
};
const BUSIEST_INFO: InfoContent = {
  title: "Busiest times",
  body: "When people opened this listing, by day of the week and hour, Pakistan time.",
};

const DEVICE_COLOR: Record<string, string> = { phone: "#0F766E", desktop: "#14B8A6", tablet: "#99F6E4" };
const METHODS = [
  { key: "wa", label: "WhatsApp", color: "#25D366" },
  { key: "call", label: "Call", color: "#0F766E" },
  { key: "form", label: "Inquiry form", color: "#EA580C" },
] as const;

/** Hide a StatCard's sparkline below 1024 px (the mobile design drops it on some cards). */
const NO_MOBILE_SPARK = "max-lg:[&>.mt-auto]:hidden";

function Muted({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx("text-[15px]/[22px] font-medium text-muted", className)}>{children}</p>;
}

function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px]" style={{ background: color }} />;
}

function prevName(s: S): string {
  return s.range.days === 1 ? "the day before" : `previous ${fmtNum(s.range.days)} days`;
}

// ── Notes above the cards ────────────────────────────────────────────────

export function StatsNotes({ s }: { s: S }) {
  const since = fmtDay(s.trackingStart);
  let quiet: string | null = null;
  if (s.untrackedDays > 0) {
    if (s.untrackedDays >= s.range.days) {
      quiet = `Counting since ${since}. Nothing was counted in this range.`;
    } else {
      const lead =
        s.untrackedDays === 1 ? "The first day of this range has no numbers" : `The first ${fmtNum(s.untrackedDays)} days of this range have no numbers`;
      const tail = s.range.compare ? ", and comparison is off because there's no earlier period to compare with." : ".";
      quiet = `Counting since ${since}. ${lead}${tail}`;
    }
  } else if (s.range.compare && !s.comparable) {
    quiet = `Counting since ${since}. Comparison is off because the earlier period starts before that.`;
  }

  const opened = s.totals.opened;
  const low = !s.enough
    ? `${opened ? `Only ${plural(opened, "open")} in this period.` : "No opens in this period."} Rates and comparisons show once a listing has ${MIN_OPENS} opens; the counts below are exact.`
    : null;

  if (!quiet && !low) return null;
  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {quiet ? <QuietNote>{quiet}</QuietNote> : null}
      {low ? (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-control border border-line bg-fill px-4 py-3 text-[16px]/[24px] font-medium text-ink-2 lg:text-[15px]/[22px]"
        >
          <Info size={20} strokeWidth={1.75} className="flex-none text-quiet-text" aria-hidden="true" />
          <span className="num min-w-0">{low}</span>
        </div>
      ) : null}
    </div>
  );
}

// ── 1. Stat cards ────────────────────────────────────────────────────────

export function StatCards({ s }: { s: S }) {
  const { totals: t, prevTotals: p, range, enough, series } = s;
  const tracked = (a: number[]) => a.filter((_, i) => !series.untracked[i]);
  const vs = prevName(s);
  const compareText = `vs ${vs}`;
  const tip = (a: string, b: string) => `vs ${vs} (${range.prevText}) · ${a} → ${b}`;
  const comparing = s.comparable && !!p;
  const rangeText = `${range.shortText} · comparison off`;

  const count = (cur: number, prev: number | undefined) =>
    !enough
      ? { notEnough: "count" as const }
      : !comparing
        ? { rangeText }
        : { delta: countDelta(cur, prev ?? 0), deltaTooltip: tip(fmtNum(prev ?? 0), fmtNum(cur)), compareText };

  const rate = ratio(t.contacted, t.opened);
  const prevRate = p && p.opened >= MIN_OPENS ? ratio(p.contacted, p.opened) : null;
  const rateValue = { value: fmtPct(rate), base: `${fmtNum(t.contacted)} of ${fmtNum(t.opened)}` };
  const rateCard = !enough
    ? { notEnough: "rate" as const, note: `${plural(t.contacted, "contact")} from ${plural(t.opened, "open")}. Needs ${MIN_OPENS} opens.` }
    : !comparing
      ? { ...rateValue, rangeText }
      : prevRate == null
        ? { ...rateValue, rangeText: "Previous period: not enough data" }
        : { ...rateValue, delta: rateDelta(rate, prevRate), deltaTooltip: tip(fmtPct(prevRate), fmtPct(rate)), compareText };

  // Daily contact rate for the sparkline (a day without opens keeps the last rate).
  let last = 0;
  const rateSpark = series.opened.map((o, i) => {
    if (o) last = series.contacted[i] / o;
    return last;
  });

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
      <StatCard label="Shown" info="shown" value={fmtNum(t.shown)} {...count(t.shown, p?.shown)} spark={tracked(series.shown)} />
      <StatCard label="Opened" info="opened" value={fmtNum(t.opened)} {...count(t.opened, p?.opened)} spark={tracked(series.opened)} />
      <StatCard
        label="Contacted"
        info="contacted"
        value={fmtNum(t.contacted)}
        {...count(t.contacted, p?.contacted)}
        spark={enough ? tracked(series.contacted) : undefined}
        sparkColor="#EA580C"
      />
      <StatCard label="Contact rate" info="contactRate" {...rateCard} spark={enough ? tracked(rateSpark) : undefined} className={NO_MOBILE_SPARK} />
      <StatCard
        label="Website clicks"
        info="web"
        value={fmtNum(t.web)}
        {...count(t.web, p?.web)}
        note={enough ? <span className="max-lg:hidden">Clicks on the company&apos;s own website link. Not counted as contacts.</span> : undefined}
      />
      <StatCard
        label="Unique visitors"
        info="visitors"
        value={fmtNum(t.visitors)}
        {...count(t.visitors, p?.visitors)}
        spark={enough ? tracked(series.visitors) : undefined}
        className={NO_MOBILE_SPARK}
      />
    </div>
  );
}

// ── 2. Funnel ────────────────────────────────────────────────────────────

export function FunnelCard({ s }: { s: S }) {
  return (
    <Card title="From shown to contacted" info={FUNNEL_INFO} headerClassName="mb-2.5 lg:mb-5">
      {/* The kit's 5-column funnel needs ~1,280 px; between 1,024 and 1,280 use its vertical layout. */}
      <Funnel
        shown={s.totals.shown}
        opened={s.totals.opened}
        contacted={s.totals.contacted}
        enough={s.enough}
        className="lg:max-xl:[&>div:first-child]:!hidden lg:max-xl:[&>div:last-child]:!flex"
      />
    </Card>
  );
}

// ── 3. Over time ─────────────────────────────────────────────────────────

export function OverTimeCard({ s }: { s: S }) {
  const { series, range } = s;
  const prev = s.enough && s.comparable ? series.prevOpened : undefined;
  return (
    <Card>
      <LineChart
        title="Over time"
        info={OVER_TIME_INFO}
        subtitle={`Per day · ${range.text}`}
        days={series.days}
        opened={series.opened}
        contacted={series.contacted}
        shown={series.shown}
        prevOpened={prev}
        prevDays={prev ? series.prevDays : undefined}
        untracked={series.untracked}
        prevLabel={range.days === 1 ? "Opened, the day before" : `Opened, previous ${fmtNum(range.days)} days`}
      />
    </Card>
  );
}

// ── 4. How they contacted ────────────────────────────────────────────────

export function ContactMethodsCard({ s }: { s: S }) {
  const t = s.totals;
  const vals = { wa: t.wa, call: t.call, form: t.form };
  const total = t.wa + t.call + t.form;
  const share = (v: number) => (total ? `${(v / total) * 100}%` : "0%");
  // The per-day columns start at the first tracked day.
  const from = Math.max(0, s.series.untracked.findIndex((u) => !u));
  const cut = <T,>(a: T[]): T[] => a.slice(from);

  return (
    <Card title="How they contacted" info="contacted" headerClassName="mb-0 lg:mb-0">
      {/* Desktop: three totals */}
      <div className="mb-3 mt-4 hidden grid-cols-3 gap-4 lg:grid">
        {METHODS.map((m) => (
          <div key={m.key} className="min-w-0">
            <div className="flex items-center gap-1.5 text-label text-ink-2">
              <Swatch color={m.color} />
              <span className="truncate">{m.label}</span>
            </div>
            <div className="num text-[28px]/[32px] font-extrabold text-ink">{fmtNum(vals[m.key])}</div>
            <div className="num text-label text-muted">{total ? fmtPct(vals[m.key] / total) : "—"}</div>
          </div>
        ))}
      </div>

      {/* Mobile: 100% bar, then one row per method */}
      <div className="lg:hidden">
        <div className="mb-2 mt-3.5 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
          {total ? (
            <>
              {t.wa ? <span style={{ width: share(t.wa), background: "#25D366" }} /> : null}
              {t.call ? <span style={{ width: share(t.call), background: "#0F766E" }} /> : null}
              {t.form ? <span className="flex-1" style={{ background: "#EA580C" }} /> : null}
            </>
          ) : (
            <span className="flex-1 bg-fill" />
          )}
        </div>
        <div className="num flex flex-col text-[15px]/[22px] font-medium text-ink">
          {METHODS.map((m) => (
            <div key={m.key} className="flex h-10 items-center gap-2">
              <Swatch color={m.color} />
              {m.label}
              <b className="ml-auto font-bold">{fmtNum(vals[m.key])}</b>
            </div>
          ))}
        </div>
      </div>

      {total ? (
        <ContactBars className="mt-2 lg:mt-0" days={cut(s.series.days)} wa={cut(s.series.wa)} call={cut(s.series.call)} form={cut(s.series.form)} />
      ) : (
        <Muted className="py-6 text-center">No contacts in this period.</Muted>
      )}

      <WebsiteClicksFooter
        count={t.web}
        note="· not counted as contacts"
        info={null}
        className="mt-2 border-t border-fill pt-2.5 lg:mt-3.5 lg:pt-3.5"
      />
    </Card>
  );
}

// ── 5. Against the city ──────────────────────────────────────────────────

type Tone = "good" | "bad" | "quiet";
const TONE: Record<Tone, string> = { good: "text-good-text", bad: "text-bad-text", quiet: "text-quiet-text" };

interface Cmp {
  text: string; // "1.5× the city average"
  short: string; // "1.5× the city" (mobile)
  tone: Tone;
}

function times(x: number): string {
  return x >= 9.95 ? `${Math.round(x)}×` : `${x.toFixed(1)}×`;
}

/** mine ÷ city as "1.5× the city average", green above, red below, grey when about the same. */
function multiple(mine: number, city: number, word: "average" | "median"): Cmp {
  const shortWord = word === "average" ? "the city" : "the median";
  if (!city) {
    return mine > 0
      ? { text: `Above the city ${word}`, short: `above ${shortWord}`, tone: "good" }
      : { text: `Same as the city ${word}`, short: `same as ${shortWord}`, tone: "quiet" };
  }
  const m = mine / city;
  if (m >= 1.05) return { text: `${times(m)} the city ${word}`, short: `${times(m)} ${shortWord}`, tone: "good" };
  if (m <= 0.95) return { text: `${times(m)} the city ${word}`, short: `${times(m)} ${shortWord}`, tone: "bad" };
  return { text: `About the city ${word}`, short: `about ${shortWord}`, tone: "quiet" };
}

const NOT_ENOUGH: Cmp = { text: "Not enough data yet", short: "Not enough data yet", tone: "quiet" };

function CmpHeader({ label, cmp }: { label: string; cmp: Cmp }) {
  return (
    <>
      <div className="hidden justify-between gap-3 text-[13px]/[18px] font-semibold text-ink-2 lg:flex">
        <span>{label}</span>
        <span className={cx("text-right", TONE[cmp.tone])}>{cmp.text}</span>
      </div>
      <div className="text-[13px]/[18px] font-semibold text-ink-2 lg:hidden">
        {label} · <span className={TONE[cmp.tone]}>{cmp.short}</span>
      </div>
    </>
  );
}

function CmpRow({ label, mobileLabel, value, pct, mine }: { label: string; mobileLabel?: string; value: string; pct: number; mine?: boolean }) {
  return (
    <div
      className={cx(
        "num grid grid-cols-[110px_minmax(0,1fr)_52px] items-center gap-2.5 text-[15px]/[22px] font-medium lg:grid-cols-[150px_minmax(0,1fr)_56px] lg:gap-3",
        mine ? "text-ink" : "text-quiet-text",
      )}
    >
      <span className="truncate">
        {mobileLabel ? (
          <>
            <span className="max-lg:hidden">{label}</span>
            <span className="lg:hidden">{mobileLabel}</span>
          </>
        ) : (
          label
        )}
      </span>
      <span className="block h-2.5 overflow-hidden rounded-full bg-fill">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: mine ? "#0F766E" : "#A8A29E" }} />
      </span>
      <span className={cx("whitespace-nowrap text-right", mine && "font-bold")}>{value}</span>
    </div>
  );
}

function pair(a: number, b: number): [number, number] {
  const max = Math.max(a, b);
  return max ? [(a / max) * 100, (b / max) * 100] : [0, 0];
}

export function CityCard({ s }: { s: S }) {
  const t = s.totals;
  const c = s.city;
  const rate = ratio(t.contacted, t.opened) ?? 0;
  const avg = c.avgRate;

  const rateCmp: Cmp = !s.enough
    ? NOT_ENOUGH
    : avg == null
      ? { text: "No city average yet", short: "no city average yet", tone: "quiet" }
      : multiple(rate, avg, "average");
  const openCmp: Cmp = !s.enough ? NOT_ENOUGH : multiple(t.opened, c.medianOpened, "median");
  const [rMine, rCity] = pair(rate, avg ?? 0);
  const [oMine, oCity] = pair(t.opened, c.medianOpened);

  // With no opens and no contacts the position is only a tie-break, so don't show one.
  const active = t.opened > 0 || t.contacted > 0;
  const rank = active ? c.rank : null;
  let where: string;
  if (c.rank == null) where = "Hidden listings are not ranked.";
  else if (!active) where = "No opens or contacts in this period, so there is no rank.";
  else if (c.of <= 1) where = `The only live listing in ${c.name}.`;
  else {
    const pos = c.topPct != null && c.topPct <= 50 ? `Top ${c.topPct}% of the city.` : "In the lower half of the city.";
    where = `In ${c.name} by contacts. ${pos}`;
  }

  return (
    <Card title="Against the city" info="rank" className="flex flex-col gap-3 lg:gap-5" headerClassName="mb-0 lg:mb-0">
      {/* Rank block */}
      <div className="hidden items-center gap-4 rounded-control bg-brand-50 p-4 lg:flex">
        <div className="flex flex-none flex-col">
          <span className="text-label text-brand-700">Rank in city</span>
          {rank != null ? (
            <span className="num text-stat text-brand-700">
              #{fmtNum(rank)} <span className="text-[17px]/[24px] font-semibold">of {fmtNum(c.of)}</span>
            </span>
          ) : (
            <span className="text-[22px]/[38px] font-extrabold text-brand-700">Not ranked</span>
          )}
        </div>
        <span className="text-[15px]/[22px] font-medium text-ink-2 [text-wrap:pretty]">{where}</span>
      </div>
      <div className="num flex items-baseline gap-2 rounded-control bg-brand-50 px-3.5 py-3 text-brand-700 lg:hidden">
        {rank != null ? (
          <>
            <b className="text-[28px]/[32px] font-extrabold">#{fmtNum(rank)}</b>
            <span className="text-[15px]/[22px] font-semibold">
              of {fmtNum(c.of)} in {c.name}
            </span>
          </>
        ) : (
          <span className="text-[15px]/[22px] font-semibold">
            Not ranked · {c.rank == null ? "hidden listings are not ranked" : "no opens or contacts in this period"}
          </span>
        )}
      </div>

      {/* Contact rate against the city average */}
      <div className="flex flex-col gap-2">
        <CmpHeader label="Contact rate" cmp={rateCmp} />
        {s.enough ? <CmpRow label="This listing" value={fmtPct(rate)} pct={rMine} mine /> : null}
        {avg != null ? (
          <CmpRow label={`${c.name} average`} mobileLabel="City average" value={fmtPct(avg)} pct={s.enough ? rCity : 100} />
        ) : null}
      </div>

      {/* Opened against the city median */}
      <div className="flex flex-col gap-2">
        <CmpHeader label="Opened" cmp={openCmp} />
        <CmpRow label="This listing" value={fmtNum(t.opened)} pct={oMine} mine />
        <CmpRow label={`${c.name} median`} mobileLabel="City median" value={fmtNum(c.medianOpened)} pct={oCity} />
      </div>
    </Card>
  );
}

// ── 6. Where it appears in lists ─────────────────────────────────────────

const LIST_COLS = "grid-cols-[minmax(0,1fr)_96px_96px_104px_84px] xl:grid-cols-[minmax(0,1fr)_140px_140px_140px_120px]";

function listsFootnote(opened: number, fromLists: number): string | null {
  if (!opened) return null;
  const rest = Math.max(0, opened - fromLists);
  if (!fromLists) return `None of the ${plural(opened, "open")} came from list pages. They came straight to the listing or from a guide.`;
  if (!rest) return opened === 1 ? "The only open came from a list page." : `All ${fmtNum(opened)} opens came from list pages.`;
  return `${plural(fromLists, "open")} came from list pages. The other ${fmtNum(rest)} came straight to the listing or from a guide.`;
}

export function ListsCard({ s }: { s: S }) {
  const note = listsFootnote(s.totals.opened, s.opensFromLists);
  const pos = (v: number | null) => (v == null ? "—" : v.toFixed(1));
  return (
    <Card
      padded={false}
      className="overflow-hidden"
      title="Where it appears in lists"
      info="avgPosition"
      subtitle={<span className="max-lg:hidden">Average position: 1 is the top of the list</span>}
      headerClassName="mb-2"
    >
      {s.lists.length ? (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className={cx("grid h-10 items-center gap-4 border-y border-line bg-page px-6 text-overline uppercase text-muted", LIST_COLS)}>
              <span>List page</span>
              <span className="text-right">Times shown ↓</span>
              <span className="text-right">Avg position</span>
              <span className="text-right">Opens from it</span>
              <span className="text-right">Open rate</span>
            </div>
            {s.lists.map((l) => (
              <div
                key={l.page}
                className={cx("num grid h-14 items-center gap-4 border-b border-fill px-6 text-[15px]/[22px] font-medium text-ink", LIST_COLS)}
              >
                <span className="truncate font-semibold" title={l.label}>
                  {l.label}
                </span>
                <span className="text-right">{fmtNum(l.shown)}</span>
                <span className={cx("text-right", l.avgPos != null && l.avgPos <= 1.5 && "font-semibold text-good-text")}>{pos(l.avgPos)}</span>
                <b className="text-right font-bold">{fmtNum(l.opens)}</b>
                <span className={cx("text-right", !s.enough && "text-muted")}>{s.enough ? fmtPct(l.openRate) : "—"}</span>
              </div>
            ))}
            {note ? <div className="num px-6 py-3.5 text-label text-muted">{note}</div> : null}
          </div>

          {/* Mobile list */}
          <div className="lg:hidden">
            {s.lists.map((l) => (
              <div key={l.page} className="flex flex-col gap-0.5 border-t border-fill px-4 py-2.5">
                <span className="text-[15px]/[22px] font-semibold text-ink">{l.label}</span>
                <span className="num text-label text-muted">
                  {fmtNum(l.shown)} shown · position{" "}
                  <span className={cx(l.avgPos != null && l.avgPos <= 1.5 && "font-semibold text-good-text")}>{pos(l.avgPos)}</span> ·{" "}
                  <b className="font-bold text-ink">{plural(l.opens, "open")}</b>
                </span>
              </div>
            ))}
            {note ? <div className="num border-t border-fill px-4 pb-3.5 pt-2.5 text-label text-muted">{note}</div> : <div className="h-1" />}
          </div>
        </>
      ) : (
        <Muted className="px-4 pb-4 lg:px-6 lg:pb-6">Not shown on any list page in this period.</Muted>
      )}
    </Card>
  );
}

// ── 7–8. Where visitors came from · Which page sent them ────────────────

export function SourcesCard({ s }: { s: S }) {
  const rows: BarListRow[] = s.sources.filter((r) => r.count > 0).map((r) => ({ key: r.key, label: r.label, count: r.count }));
  return (
    <Card
      title="Where visitors came from"
      info="source"
      subtitle={<span className="max-lg:hidden">Share of {plural(s.totals.opened, "open")}</span>}
      headerClassName="mb-1 lg:mb-2"
    >
      {rows.length ? <BarList rows={rows} labelWidth="170px" mobileTop={4} /> : <Muted>No opens in this period.</Muted>}
    </Card>
  );
}

export function EntriesCard({ s }: { s: S }) {
  let rows: BarListRow[] = s.entries.map((r) => ({ key: r.key, label: r.label, count: r.count }));
  if (rows.length > 8) {
    const rest = rows.slice(7);
    rows = [...rows.slice(0, 7), { key: "(other)", label: `${rest.length} other pages`, count: rest.reduce((t, r) => t + r.count, 0) }];
  }
  return (
    <Card
      title="Which page sent them"
      info="entry"
      subtitle={<span className="max-lg:hidden">The RentalSawari page they were on just before</span>}
      headerClassName="mb-1 lg:mb-2"
    >
      {rows.length ? <BarList rows={rows} labelWidth="minmax(0,2fr)" mobileTop={4} /> : <Muted>No opens in this period.</Muted>}
    </Card>
  );
}

// ── 9–10. Busiest times · Devices ────────────────────────────────────────

export function BusiestCard({ s }: { s: S }) {
  const total = s.heat.reduce((t, v) => t + v, 0);
  const summary = s.enough ? busiestSummary(s.heat) : null;
  return (
    <Card
      title="Busiest times"
      info={BUSIEST_INFO}
      subtitle={<span className="max-lg:hidden">Opens by day and hour · PKT</span>}
      actions={total ? <HeatLegend className="max-lg:hidden" /> : undefined}
      headerClassName="mb-3 lg:mb-4"
    >
      {total ? (
        <>
          <Heatmap values={s.heat} legend={false} />
          <div className="mt-4 border-t border-fill pt-3.5 text-label text-ink-2">
            Busiest:{" "}
            {summary ? <b className="font-bold text-ink">{summary}</b> : <span className="font-semibold text-quiet-text">Not enough data yet</span>}
          </div>
        </>
      ) : (
        <Muted>No opens in this period.</Muted>
      )}
    </Card>
  );
}

export function DevicesCard({ s }: { s: S }) {
  const slices: DonutSlice[] = s.devices.map((d) => ({ key: d.key, label: d.label, value: d.count, color: DEVICE_COLOR[d.key] ?? "#A8A29E" }));
  const opened = s.totals.opened;
  return (
    <Card
      title="Devices"
      info="device"
      subtitle={<span className="max-lg:hidden">Share of {plural(opened, "open")}</span>}
      headerClassName="mb-0 lg:mb-2"
    >
      {opened ? (
        <>
          <Donut slices={slices} className="mx-auto max-lg:hidden" />
          <DevicesBar slices={slices} className="lg:hidden" />
        </>
      ) : (
        <Muted className="mt-3 lg:mt-0">No opens in this period.</Muted>
      )}
    </Card>
  );
}

// ── 11. Profile completeness ─────────────────────────────────────────────

export function CompletenessCard({ listing, s }: { listing: Listing; s: S }) {
  const c = s.completeness;
  const n = c.missing.length;
  const missingText = n ? `${plural(n, "thing")} missing` : "Nothing missing";
  const href = (field: string) => `/admin/listings/${listing.id}?tab=edit&focus=${field}`;
  const row = (m: (typeof c.missing)[number], mobile: boolean) => (
    <Link
      key={m.key}
      href={href(m.field)}
      className={cx(
        "flex items-center gap-2.5 rounded-control border border-line bg-white px-3 font-semibold text-ink outline-none transition-colors hover:bg-page hover:text-ink hover:no-underline focus-visible:shadow-focus",
        mobile ? "h-12 text-[16px]/[22px]" : "h-11 text-[15px]/[22px]",
      )}
    >
      <span aria-hidden="true" className="size-5 flex-none rounded-md border-[1.5px] border-[#A8A29E]" />
      <span className="min-w-0 truncate">{m.label}</span>
      <ArrowRight size={16} strokeWidth={1.75} className="ml-auto flex-none text-brand-700" aria-hidden="true" />
    </Link>
  );
  const done = <QuietNote tone="good">Every part of the profile is filled in.</QuietNote>;

  return (
    <section className="min-w-0 rounded-card border border-line bg-white p-4 shadow-card lg:p-6">
      {/* Desktop */}
      <div className="hidden lg:block">
        <h3 className="flex items-center gap-1.5 text-card-title text-ink">
          Profile completeness
          <InfoTooltip info="completeness" />
        </h3>
        <div className="mt-5 flex items-center gap-6">
          <CompletenessRing pct={c.pct} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-label text-muted">{missingText}</span>
            {c.missing.map((m) => row(m, false))}
            {n ? <span className="text-label text-muted">Each opens the Edit tab at that field.</span> : done}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="flex items-center gap-4">
          <CompletenessRing pct={c.pct} size={72} />
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 text-card-title-m text-ink">
              Profile completeness
              <InfoTooltip info="completeness" />
            </h3>
            <div className="text-label text-muted">{missingText}</div>
          </div>
        </div>
        {n ? <div className="mt-3 flex flex-col gap-2">{c.missing.map((m) => row(m, true))}</div> : <div className="mt-3">{done}</div>}
      </div>
    </section>
  );
}

// ── 12. Monthly stats message ────────────────────────────────────────────

export function MonthlyCard({ listing, month, message }: { listing: Listing; month: MonthStats; message: string }) {
  const to = listing.whatsapp || listing.phone;
  return (
    <Card>
      <WhatsAppPreview
        title={
          <span className="flex items-center justify-between gap-3">
            <span>Monthly stats message</span>
            <span className="text-label text-muted max-lg:hidden">{month.monthLabel}</span>
          </span>
        }
        toNumber={to}
        toLabel={
          <>
            <span className="lg:hidden">{month.monthLabel} · to </span>
            <span className="max-lg:hidden">To </span>
            {fmtPhone(to)}
          </>
        }
        message={message}
      />
    </Card>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────

export function StatsFooter({ s }: { s: S }) {
  return (
    <p className="num flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-label text-muted">
      <span>Bots and your own visits are not counted.</span>
      <span>Counting since {fmtDay(s.trackingStart)}.</span>
    </p>
  );
}
