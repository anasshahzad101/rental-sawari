import * as React from "react";
import { fmtNum, fmtPct } from "@/lib/admin/format";
import type { StatInfoKey } from "@/lib/admin/constants";
import { cx } from "../ui/cx";
import { InfoTooltip, type InfoContent } from "../ui/Tooltip";

export interface MethodTotalsProps {
  wa: number;
  call: number;
  form: number;
  /** lg: 34/38 numbers (Listing stats) · md: 28/32 (Overview). */
  size?: "lg" | "md";
  /** Rendered between the 100% bar and the footer (usually a StackedBar). */
  chart?: React.ReactNode;
  /** Footer row, e.g. <WebsiteClicksFooter count={23} />. */
  footer?: React.ReactNode;
  className?: string;
}

const ROWS = [
  { key: "wa", label: "WhatsApp", color: "#25D366" },
  { key: "call", label: "Call", color: "#0F766E" },
  { key: "form", label: "Inquiry form", color: "#EA580C" },
] as const;

/** Totals per contact method with % of the total, then a 10 px 100% bar. */
export function MethodTotals({ wa, call, form, size = "lg", chart, footer, className }: MethodTotalsProps) {
  const total = wa + call + form;
  const vals = { wa, call, form };
  const pct = (v: number) => (total ? (v / total) * 100 : 0);
  return (
    <div className={cx("flex min-w-0 flex-col", className)}>
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        {ROWS.map((r) => (
          <div key={r.key} className="min-w-0">
            <div className="flex items-center gap-1.5 text-label text-ink-2">
              <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px]" style={{ background: r.color }} />
              <span className="truncate">{r.label}</span>
            </div>
            <div
              className={cx(
                "num text-ink",
                size === "lg" ? "text-stat-m lg:text-stat" : "text-[22px]/[28px] font-extrabold lg:text-[28px]/[32px]",
              )}
            >
              {fmtNum(vals[r.key])}
            </div>
            <div className="num text-label text-muted">{fmtPct(total ? vals[r.key] / total : null)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full lg:mt-3.5" aria-hidden="true">
        {total ? (
          <>
            {wa ? <span style={{ width: `${pct(wa)}%`, background: "#25D366" }} /> : null}
            {call ? <span style={{ width: `${pct(call)}%`, background: "#0F766E" }} /> : null}
            {form ? <span className="flex-1" style={{ background: "#EA580C" }} /> : null}
          </>
        ) : (
          <span className="flex-1 bg-fill" />
        )}
      </div>
      {chart ? <div className="mt-5 lg:mt-6">{chart}</div> : null}
      {footer ? <div className="mt-4 border-t border-fill pt-4">{footer}</div> : null}
    </div>
  );
}

/** "■ Website clicks 23 · counted separately, not as contacts  ⓘ" */
export function WebsiteClicksFooter({
  count,
  note = "· counted separately, not as contacts",
  info = "web",
  className,
}: {
  count: number;
  note?: React.ReactNode;
  info?: StatInfoKey | InfoContent | null;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-2 gap-y-1 text-label text-muted", className)}>
      <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px] bg-chart-website" />
      <span className="text-ink-2">Website clicks</span>
      <span className="num text-[15px]/[22px] font-bold text-ink">{fmtNum(count)}</span>
      <span>{note}</span>
      {info ? <InfoTooltip info={info} className="ml-auto" /> : null}
    </div>
  );
}
