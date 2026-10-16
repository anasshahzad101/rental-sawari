"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fmtNum } from "@/lib/admin/format";
import { cx } from "../ui/cx";

export interface BarListRow {
  key: string;
  label: React.ReactNode;
  count: number;
  href?: string;
  /** Small muted line under the label. */
  sub?: React.ReactNode;
}

export interface BarListColumn {
  key: string;
  header: React.ReactNode;
  /** CSS grid width, e.g. "72px". */
  width: string;
  render: (row: BarListRow) => React.ReactNode;
  align?: "left" | "right";
}

export interface BarListProps {
  rows: BarListRow[];
  /** Denominator for bar length and %. Defaults to the sum of the rows. */
  total?: number;
  color?: string;
  showPct?: boolean;
  /** Bar length as share of the total (default) or of the biggest row. */
  scaleTo?: "total" | "max";
  /** Mobile shows this many rows, then "Show all N". */
  mobileTop?: number;
  /** "Show all 7 sources". */
  showAllLabel?: (n: number) => React.ReactNode;
  /** Columns between the bar and the count (desktop). */
  extraColumns?: BarListColumn[];
  /** Header row labels (desktop). Omit to hide the header. */
  header?: { label: React.ReactNode; count: React.ReactNode; pct?: React.ReactNode };
  /** Label column width (default 150px). */
  labelWidth?: string;
  className?: string;
}

/** label · 8 px bar on #F5F5F4 · count 600 · % 13 muted. Mobile stacks the label row above the bar. */
export function BarList({
  rows,
  total,
  color = "#0F766E",
  showPct = true,
  scaleTo = "total",
  mobileTop,
  showAllLabel = (n) => `Show all ${n}`,
  extraColumns = [],
  header,
  labelWidth = "150px",
  className,
}: BarListProps) {
  const [all, setAll] = useState(false);
  const sum = total ?? rows.reduce((t, r) => t + r.count, 0);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const denom = scaleTo === "max" ? max : Math.max(1, sum);
  const pct = (c: number) => (sum ? Math.round((c / sum) * 100) : 0);
  const width = (c: number) => `${Math.min(100, (c / denom) * 100)}%`;
  const cols = [labelWidth, "minmax(0,1fr)", ...extraColumns.map((c) => c.width), "56px", ...(showPct ? ["48px"] : [])].join(" ");
  const mobileRows = mobileTop && !all ? rows.slice(0, mobileTop) : rows;

  const bar = (c: number) => (
    <span className="block h-2 overflow-hidden rounded-full bg-fill">
      <span className="block h-full rounded-full" style={{ width: width(c), background: color }} />
    </span>
  );

  const labelEl = (r: BarListRow) => (
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{r.label}</span>
      {r.sub ? <span className="truncate text-[13px]/[18px] font-medium text-muted">{r.sub}</span> : null}
    </span>
  );

  return (
    <div className={cx("min-w-0", className)}>
      {/* Desktop */}
      <div className="hidden lg:block">
        {header ? (
          <div className="text-overline uppercase text-muted grid h-9 items-center gap-3 border-b border-line" style={{ gridTemplateColumns: cols }}>
            <span>{header.label}</span>
            <span />
            {extraColumns.map((c) => (
              <span key={c.key} className={c.align === "left" ? "" : "text-right"}>
                {c.header}
              </span>
            ))}
            <span className="text-right">{header.count}</span>
            {showPct ? <span className="text-right">{header.pct ?? "Share"}</span> : null}
          </div>
        ) : null}
        {rows.map((r) => {
          const content = (
            <>
              {labelEl(r)}
              {bar(r.count)}
              {extraColumns.map((c) => (
                <span key={c.key} className={cx("num min-w-0", c.align === "left" ? "" : "text-right")}>
                  {c.render(r)}
                </span>
              ))}
              <span className="num text-right font-semibold">{fmtNum(r.count)}</span>
              {showPct ? <span className="num text-right text-[13px] text-muted">{pct(r.count)}%</span> : null}
            </>
          );
          const cls = "grid min-h-11 items-center gap-3 text-[15px]/[22px] font-medium text-ink";
          return r.href ? (
            <Link key={r.key} href={r.href} className={cx(cls, "-mx-2 rounded-lg px-2 hover:bg-page")} style={{ gridTemplateColumns: cols }}>
              {content}
            </Link>
          ) : (
            <div key={r.key} className={cls} style={{ gridTemplateColumns: cols }}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex flex-col lg:hidden">
        {mobileRows.map((r, i) => {
          const content = (
            <>
              <span className="num flex items-baseline justify-between gap-3 text-[15px]/[22px] font-medium text-ink">
                {labelEl(r)}
                <span className="flex-none">
                  <b className="font-bold">{fmtNum(r.count)}</b>
                  {showPct ? <span className="ml-1 text-[13px] text-muted">{pct(r.count)}%</span> : null}
                </span>
              </span>
              {bar(r.count)}
            </>
          );
          const cls = cx("flex flex-col gap-1.5 py-2", i < mobileRows.length - 1 && "border-b border-fill");
          return r.href ? (
            <Link key={r.key} href={r.href} className={cls}>
              {content}
            </Link>
          ) : (
            <div key={r.key} className={cls}>
              {content}
            </div>
          );
        })}
        {mobileTop && rows.length > mobileTop ? (
          <button
            type="button"
            onClick={() => setAll((a) => !a)}
            className="mt-1 flex h-11 items-center justify-center gap-1.5 text-[15px]/[22px] font-semibold text-brand-700"
          >
            {all ? "Show fewer" : showAllLabel(rows.length)}
            {all ? <ChevronUp size={18} strokeWidth={1.75} aria-hidden="true" /> : <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
