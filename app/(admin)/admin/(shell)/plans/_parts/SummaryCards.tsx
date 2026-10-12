import * as React from "react";
import { cx } from "@/components/admin/ui/cx";
import { InfoTooltip, type InfoContent } from "@/components/admin/ui/Tooltip";
import { fmtNum } from "@/lib/admin/format";

const INFO_FEATURED: InfoContent = {
  title: "Featured listings",
  body: "Live listings on Featured City (PKR 5,000/month) or Featured Plus (PKR 12,000/month). Plans are paid off-site and never switch back to Free on their own.",
};

const INFO_AVG: InfoContent = {
  title: "Avg contacts per listing",
  body: "Contacted in the last 30 days (WhatsApp clicks + Call clicks + Inquiry forms), averaged over live Featured listings and compared with live Free listings.",
};

type Tone = "plain" | "amber" | "red";

const BORDER: Record<Tone, string> = { plain: "border-line", amber: "border-wait-border", red: "border-bad-border" };
const NUMBER: Record<Tone, string> = { plain: "text-ink", amber: "text-wait-text", red: "text-bad-text" };

function SummaryCard({
  label,
  labelM,
  info,
  tone = "plain",
  value,
  valueClassName,
  beside,
  besideM,
  sub,
}: {
  label: string;
  labelM: string;
  info?: InfoContent;
  tone?: Tone;
  value: React.ReactNode;
  valueClassName?: string;
  /** Next to the number (desktop): "vs 3.8 Free". */
  beside?: React.ReactNode;
  /** Next to the number (mobile): "vs 3.8". */
  besideM?: React.ReactNode;
  /** Line under the number (desktop only). */
  sub?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex min-w-0 flex-col rounded-card border bg-white p-3.5 lg:gap-1.5 lg:p-6 lg:shadow-card",
        BORDER[tone],
      )}
    >
      <span className="flex items-center gap-1.5 text-[13px]/[18px] font-medium text-ink-2">
        <span className="lg:hidden">{labelM}</span>
        <span className="hidden lg:inline">{label}</span>
        {info ? <InfoTooltip info={info} className="max-lg:hidden" /> : null}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-1 lg:gap-x-2">
        <b className={cx("num text-stat-m lg:text-stat", NUMBER[tone], valueClassName)}>{value}</b>
        {besideM ? <span className="num text-[13px]/[18px] font-semibold text-muted lg:hidden">{besideM}</span> : null}
        {beside ? <span className="num hidden text-[15px]/[22px] font-semibold text-muted lg:inline">{beside}</span> : null}
      </div>
      {sub ? <div className="num hidden min-w-0 text-[13px]/[18px] font-medium text-muted lg:block">{sub}</div> : null}
    </div>
  );
}

/** "Capital Car Hire · Karachi Coastal Cars" (+ "+ 2 more"). */
function names(list: string[], none: string): React.ReactNode {
  if (!list.length) return none;
  const shown = list.slice(0, 2).join(" · ");
  const more = list.length - 2;
  return (
    <span className="block truncate" title={list.join(" · ")}>
      {shown}
      {more > 0 ? ` + ${more} more` : ""}
    </span>
  );
}

export interface SummaryProps {
  total: number;
  city: number;
  plus: number;
  endingSoon: string[];
  endedNames: string[];
  featuredAvg30: number;
  freeAvg30: number;
  multiple: number | null;
}

/** The four cards at the top of Featured plans (2 × 2 on mobile). */
export function SummaryCards({ total, city, plus, endingSoon, endedNames, featuredAvg30, freeAvg30, multiple }: SummaryProps) {
  const free = freeAvg30.toFixed(1);
  let compare: React.ReactNode = "last 30 days";
  if (multiple != null) {
    compare =
      multiple >= 1 ? (
        <span className="font-semibold text-good-text">{multiple.toFixed(1)}× more · last 30 days</span>
      ) : (
        <span>{multiple.toFixed(1)}× as many · last 30 days</span>
      );
  }
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
      <SummaryCard
        label="Featured listings"
        labelM="Featured"
        info={INFO_FEATURED}
        value={fmtNum(total)}
        sub={`${fmtNum(city)} Featured City · ${fmtNum(plus)} Featured Plus`}
      />
      <SummaryCard
        label="Ending in 7 days"
        labelM="Ending in 7 days"
        tone={endingSoon.length ? "amber" : "plain"}
        value={fmtNum(endingSoon.length)}
        sub={names(endingSoon, "None this week")}
      />
      <SummaryCard
        label="Ended, still marked Featured"
        labelM="Ended, still Featured"
        tone={endedNames.length ? "red" : "plain"}
        value={fmtNum(endedNames.length)}
        sub={names(endedNames, "None")}
      />
      <SummaryCard
        label="Avg contacts per listing"
        labelM="Avg contacts"
        info={INFO_AVG}
        value={fmtNum(featuredAvg30)}
        valueClassName="text-accent-700"
        beside={`vs ${free} Free`}
        besideM={`vs ${free}`}
        sub={compare}
      />
    </div>
  );
}
