import * as React from "react";
import { CalendarClock, ShieldCheck } from "lucide-react";
import { CITIES } from "@/lib/admin/constants";
import { fmtDay, fmtNum, pktDay } from "@/lib/admin/format";
import { rangeQuery } from "@/lib/admin/ranges";
import { getOverview } from "@/lib/admin/repo/analytics";
import { inboxCounts } from "@/lib/admin/repo/inbox";
import type { RangeInfo } from "@/lib/admin/types";
import { Banner, QuietNote } from "@/components/admin/ui/Banner";
import { Card } from "@/components/admin/ui/Card";
import { cx } from "@/components/admin/ui/cx";
import { Donut } from "@/components/admin/charts/Donut";
import { HeatLegend, Heatmap } from "@/components/admin/charts/Heatmap";
import { LineChart } from "@/components/admin/charts/LineChart";
import { busiestText } from "./busiest";
import { NeedsYouDesktop, NeedsYouMobile } from "./NeedsYou";
import { OverviewStats } from "./OverviewStats";
import { FeaturedVsFreeCard, MethodsCard, TopCitiesCard, TopListingsCard } from "./Sections";
import { SourcesList } from "./SourcesList";

/**
 * Everything under the Overview top bar. Desktop order follows the design;
 * on mobile the same blocks are re-ordered with `order-*` (the two-column
 * rows become `display: contents`): Needs you, stats, chart, contacts by
 * method, top listings, top cities, sources, devices, busiest times,
 * Featured against Free, footer note.
 */

const DEVICE_COLOR: Record<string, string> = { phone: "#0F766E", desktop: "#14B8A6", tablet: "#99F6E4" };

function FooterNote({ trackingStart, className }: { trackingStart: string; className?: string }) {
  return (
    <div className={cx("num text-label text-muted", className)}>
      <div className="hidden justify-center gap-4 pb-1 pt-2 lg:flex">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
          Bots and your own visits are not counted.
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock size={16} strokeWidth={1.75} aria-hidden="true" />
          Counting since {fmtDay(trackingStart)}.
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 py-2 text-center lg:hidden">
        <span>Bots and your own visits are not counted.</span>
        <span>Counting since {fmtDay(trackingStart)}.</span>
      </div>
    </div>
  );
}

export async function OverviewContent({ range }: { range: RangeInfo }) {
  const [data, counts] = await Promise.all([getOverview(range), inboxCounts()]);
  const q = rangeQuery(range);
  const ts = data.trackingStart;
  const today = pktDay();
  const t = data.totals;
  const s = data.series;

  const allZero = t.opened + t.contacted + t.shown + t.web + t.visitors === 0;
  const firstDay = allZero && range.end >= ts && (range.start >= ts || ts === today);
  const sinceText = ts === today ? "Counting since today" : `Counting since ${fmtDay(ts)}`;

  const needs = { counts, zeroOpens: data.zeroOpens, zeroHref: `/admin/listings?zero=1&${q}` };

  // Quiet note under the chart when part of the range (or the comparison) predates tracking.
  let trackNote: string | null = null;
  if (data.untrackedDays > 0) {
    const n = data.untrackedDays;
    trackNote = `Counting since ${fmtDay(ts)}. ${n === 1 ? "The first day of this range has" : `The first ${fmtNum(n)} days of this range have`} no numbers${
      range.compare ? ", and comparison is off because there's no earlier period to compare with" : ""
    }.`;
  } else if (range.compare && !data.comparable) {
    trackNote = `Counting since ${fmtDay(ts)}, so there's no full earlier period to compare with yet. Comparison is off.`;
  }

  const chart = (
    <Card className="order-3 lg:order-none">
      <LineChart
        title="Opened and contacted"
        info={{
          title: "Opened and contacted",
          body: "Opened: how many times someone opened a listing's own page. Contacted: WhatsApp clicks + Call clicks + Inquiry forms sent. Whole site, per day.",
        }}
        subtitle={`Per day, whole site · ${range.text}`}
        days={s.days}
        opened={s.opened}
        contacted={s.contacted}
        prevOpened={s.prevOpened.length ? s.prevOpened : undefined}
        prevDays={s.prevOpened.length ? s.prevDays : undefined}
        untracked={s.untracked}
        prevLabel={range.days === 1 ? "Opened, previous day" : `Opened, previous ${range.days} days`}
      />
      {trackNote && !firstDay ? <QuietNote className="mt-3">{trackNote}</QuietNote> : null}
    </Card>
  );

  if (firstDay) {
    return (
      <>
        <Banner tone="info" icon={CalendarClock} title={`${sinceText}.`}>
          Numbers will fill in as visitors arrive.
        </Banner>
        <OverviewStats range={range} totals={t} prevTotals={null} comparable={false} series={s} firstDayNote={sinceText} />
        <NeedsYouMobile {...needs} />
        {chart}
        <NeedsYouDesktop {...needs} />
        <FooterNote trackingStart={ts} />
      </>
    );
  }

  const busy = busiestText(data.heat);
  const periodText = range.key === "custom" ? range.text : range.label.toLowerCase();
  const top = data.topListings.map((r) => ({
    id: r.listing.id,
    name: r.listing.name,
    city: r.listing.city,
    area: r.listing.area,
    logoUrl: r.listing.logoUrl,
    plan: r.listing.plan,
    opened: r.opened,
    contacted: r.contacted,
    spark: r.spark.filter((_, i) => !s.untracked[i]),
  }));

  return (
    <>
      <NeedsYouMobile {...needs} className="order-1" />
      <NeedsYouDesktop {...needs} />

      <OverviewStats
        range={range}
        totals={t}
        prevTotals={data.prevTotals}
        comparable={data.comparable}
        series={s}
        className="order-2 lg:order-none"
      />

      {chart}

      <div className="contents lg:grid lg:grid-cols-2 lg:gap-6">
        <MethodsCard totals={t} days={s.days} wa={s.wa} call={s.call} form={s.form} className="order-4 lg:order-none" />
        <TopCitiesCard rows={data.topCities} other={data.otherCities} citiesOnSite={CITIES.length} className="order-6 lg:order-none" />
      </div>

      <TopListingsCard rows={top} query={q} className="order-5 lg:order-none" />

      <div className="contents lg:grid lg:grid-cols-2 lg:gap-6">
        <Card
          title="Where visitors came from"
          info="source"
          subtitle={<span className="max-lg:hidden">{`Share of ${fmtNum(t.opened)} opens`}</span>}
          className="order-7 lg:order-none"
          headerClassName="max-lg:mb-1.5"
        >
          {t.opened ? (
            <SourcesList rows={data.sources.map((r) => ({ key: r.key, label: r.label, count: r.count }))} total={t.opened} />
          ) : (
            <p className="py-6 text-center text-body text-muted">No opens in this range yet.</p>
          )}
        </Card>
        <FeaturedVsFreeCard
          featured={data.featured}
          free={data.free}
          multiple={data.multiple}
          periodText={periodText}
          className="order-10 lg:order-none"
        />
      </div>

      <div className="contents lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <Card
          title="Busiest times"
          info={{
            title: "Busiest times",
            body: "When people opened listings, by day of the week and hour of the day, in Pakistan time (PKT). Darker cells had more opens.",
          }}
          subtitle={
            <>
              <span className="lg:hidden">Tap a cell · PKT</span>
              <span className="max-lg:hidden">Opens by day and hour, whole site · PKT</span>
            </>
          }
          actions={<HeatLegend className="max-lg:hidden" />}
          className="order-9 lg:order-none"
        >
          <Heatmap values={data.heat} legend={false} />
          {busy ? (
            <div className="mt-4 border-t border-fill pt-3.5 text-label text-ink-2">
              Busiest: <span className="font-bold text-ink">{busy}</span>
            </div>
          ) : null}
        </Card>
        <Card
          title="Devices"
          info="device"
          subtitle={<span className="max-lg:hidden">{`Share of ${fmtNum(t.opened)} opens`}</span>}
          className="order-8 lg:order-none"
          headerClassName="mb-0 lg:mb-0"
        >
          <Donut
            slices={data.devices.map((d) => ({ key: d.key, label: d.label, value: d.count, color: DEVICE_COLOR[d.key] ?? "#A8A29E" }))}
            className="mx-auto mt-1 lg:mx-0 lg:mt-2"
          />
        </Card>
      </div>

      <FooterNote trackingStart={ts} className="order-11 lg:order-none" />
    </>
  );
}
