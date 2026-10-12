import * as React from "react";
import type { StatInfoKey } from "@/lib/admin/constants";
import type { DeltaInfo } from "@/lib/admin/format";
import { Sparkline } from "../charts/Sparkline";
import { cx } from "./cx";
import { Delta } from "./Delta";
import { Skeleton } from "./Skeleton";
import { InfoTooltip, type InfoContent } from "./Tooltip";

export interface StatCardProps {
  label: React.ReactNode;
  info?: StatInfoKey | InfoContent;
  /** Pre-formatted value ("1,284", "14.6%"). */
  value?: React.ReactNode;
  /** Base next to the value ("187 of 1,284"). */
  base?: React.ReactNode;
  delta?: DeltaInfo | null;
  /** Tooltip on the delta ("vs previous 30 days (14 Aug – 12 Sep) · 151 → 187"). */
  deltaTooltip?: React.ReactNode;
  /** "vs previous 30 days". Desktop only; mobile shows the delta alone. */
  compareText?: React.ReactNode;
  /** 30-point series for the sparkline. */
  spark?: number[];
  sparkColor?: string;
  /**
   * Under 30 opens. "count": the value stays, the delta becomes "Not enough
   * data yet". "rate": the value slot becomes "Not enough data yet" + note.
   */
  notEnough?: "count" | "rate" | false;
  /** 13 px muted line ("Rates show from 30 opens. This listing has 9 opens and 1 contact."). */
  note?: React.ReactNode;
  /** Shown instead of the delta when comparison is off ("13 Sep – 12 Oct · comparison off"). */
  rangeText?: React.ReactNode;
  loading?: boolean;
  /** lg: 34/38 (28/32 mobile) · md: 28/32 (22/28 mobile). */
  size?: "lg" | "md";
  className?: string;
}

/** Stat card: label + ⓘ, big number, delta row, optional sparkline. */
export function StatCard({
  label,
  info,
  value,
  base,
  delta,
  deltaTooltip,
  compareText = "vs previous 30 days",
  spark,
  sparkColor = "#0F766E",
  notEnough = false,
  note,
  rangeText,
  loading,
  size = "lg",
  className,
}: StatCardProps) {
  const shell = "flex h-full min-w-0 flex-col rounded-card border border-line bg-white p-4 shadow-card lg:p-6";

  if (loading) {
    return (
      <div className={cx(shell, "gap-3", className)} aria-busy="true" aria-label="Loading">
        <Skeleton className="h-3.5 w-24 rounded-[7px]" />
        <Skeleton className="h-[28px] w-28 lg:h-[34px] lg:w-32" />
        <Skeleton className="h-3.5 w-40 rounded-[7px]" />
        <Skeleton className="mt-auto h-8 lg:h-10" />
      </div>
    );
  }

  const valueCls = size === "lg" ? "text-stat-m lg:text-stat" : "text-[22px]/[28px] font-extrabold lg:text-[28px]/[32px]";
  const rate = notEnough === "rate";
  const grey = !!notEnough;

  return (
    <div className={cx(shell, "gap-1 lg:gap-1.5", className)}>
      <div className="flex items-center gap-1.5 text-label text-ink-2">
        <span className="min-w-0">{label}</span>
        {info ? <InfoTooltip info={info} /> : null}
      </div>

      {rate ? (
        <div className="flex min-h-8 items-center py-[5px] text-[16px]/[22px] font-bold text-quiet-text lg:min-h-[38px] lg:py-0 lg:text-[17px]/[24px]">
          Not enough data yet
        </div>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={cx("num text-ink", valueCls)}>{value}</span>
          {base != null ? <span className="num text-label text-muted">{base}</span> : null}
        </div>
      )}

      {rate ? null : notEnough === "count" ? (
        <Delta delta={null} notEnough />
      ) : rangeText != null ? (
        <div className="num text-label text-muted">{rangeText}</div>
      ) : delta ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-label text-muted">
          <Delta delta={delta} tooltip={deltaTooltip} />
          {compareText ? <span className="max-lg:hidden">{compareText}</span> : null}
        </div>
      ) : null}

      {note != null ? <div className="num text-label text-muted [text-wrap:pretty]">{note}</div> : null}

      {spark && spark.length > 1 ? (
        <div className="mt-auto pt-1.5 lg:pt-2.5">
          <Sparkline
            values={spark}
            width={200}
            height={40}
            fluid
            color={grey ? "#A8A29E" : sparkColor}
            area={!grey}
            className="h-8 lg:h-10"
          />
        </div>
      ) : null}
    </div>
  );
}
