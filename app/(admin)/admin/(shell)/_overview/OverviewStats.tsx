import * as React from "react";
import { MIN_OPENS } from "@/lib/admin/constants";
import { countDelta, fmtNum, fmtPct, fmtRange, rateDelta, ratio } from "@/lib/admin/format";
import type { DailySeries, RangeInfo, Totals } from "@/lib/admin/types";
import { StatCard } from "@/components/admin/ui/StatCard";
import { cx } from "@/components/admin/ui/cx";

/**
 * The four stat cards: Opened · Unique visitors · Contacted (orange
 * sparkline) · Contact rate ("x of y", delta in points).
 *
 * Rules: under 30 opens, deltas (and the rate) read "Not enough data yet";
 * when the previous period can't be compared, the range text replaces the
 * delta; on the first day the cards read 0 with "Counting since today".
 */

export interface OverviewStatsProps {
  range: RangeInfo;
  totals: Totals;
  prevTotals: Totals | null;
  comparable: boolean;
  series: DailySeries;
  /** First day after launch: zero cards + note. */
  firstDayNote?: string | null;
  className?: string;
}

export function OverviewStats({ range, totals: t, prevTotals: p, comparable, series, firstDayNote, className }: OverviewStatsProps) {
  const grid = cx("grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6", className);

  if (firstDayNote) {
    const note = <span className="max-lg:hidden">{firstDayNote}</span>;
    return (
      <div className={grid}>
        <StatCard label="Opened" info="opened" value="0" note={note} />
        <StatCard label="Unique visitors" info="visitors" value="0" note={note} />
        <StatCard label="Contacted" info="contacted" value="0" note={note} />
        <StatCard label="Contact rate" info="contactRate" notEnough="rate" note={<span className="max-lg:hidden">Rates show from 30 opens</span>} />
      </div>
    );
  }

  const enough = t.opened >= MIN_OPENS;
  const prevEnough = !!p && p.opened >= MIN_OPENS;
  const cmp = comparable && !!p;
  const compareText = range.days === 1 ? "vs previous day" : `vs previous ${range.days} days`;
  const prevShort = fmtRange(range.prevStart, range.prevEnd, { year: false });
  const tip = (a: string, b: string) => `${compareText} (${prevShort}) · ${a} → ${b}`;
  const rangeText = cmp ? undefined : `${range.shortText} · comparison off`;

  // Sparklines skip the days before tracking began.
  const keep = (arr: number[]) => arr.filter((_, i) => !series.untracked[i]);
  const opened = keep(series.opened);
  const contacted = keep(series.contacted);
  const visitors = keep(series.visitors);
  const rate = opened.map((o, i) => (o ? contacted[i] / o : 0));

  const count = (cur: number, prev: number | undefined) =>
    enough
      ? cmp
        ? { delta: countDelta(cur, prev ?? 0), deltaTooltip: tip(fmtNum(prev ?? 0), fmtNum(cur)), compareText }
        : { rangeText }
      : { notEnough: "count" as const };

  const cr = ratio(t.contacted, t.opened);
  const pcr = p ? ratio(p.contacted, p.opened) : null;

  return (
    <div className={grid}>
      <StatCard label="Opened" info="opened" value={fmtNum(t.opened)} spark={opened} {...count(t.opened, p?.opened)} />
      <StatCard label="Unique visitors" info="visitors" value={fmtNum(t.visitors)} spark={visitors} {...count(t.visitors, p?.visitors)} />
      <StatCard
        label="Contacted"
        info="contacted"
        value={fmtNum(t.contacted)}
        spark={contacted}
        sparkColor="#EA580C"
        {...count(t.contacted, p?.contacted)}
      />
      {enough ? (
        <StatCard
          label="Contact rate"
          info="contactRate"
          value={fmtPct(cr)}
          base={`${fmtNum(t.contacted)} of ${fmtNum(t.opened)}`}
          spark={rate}
          {...(cmp
            ? prevEnough
              ? { delta: rateDelta(cr, pcr), deltaTooltip: tip(fmtPct(pcr), fmtPct(cr)), compareText }
              : { notEnough: "count" as const }
            : { rangeText })}
        />
      ) : (
        <StatCard
          label="Contact rate"
          info="contactRate"
          notEnough="rate"
          note={
            t.opened
              ? `Rates show from ${MIN_OPENS} opens. ${t.opened === 1 ? "There is 1 open" : `There are ${fmtNum(t.opened)} opens`} in this range.`
              : `Rates show from ${MIN_OPENS} opens.`
          }
        />
      )}
    </div>
  );
}
