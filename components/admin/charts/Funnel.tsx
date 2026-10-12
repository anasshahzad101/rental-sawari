import * as React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { fmtNum, fmtPct } from "@/lib/admin/format";
import { cx } from "../ui/cx";
import { InfoTooltip } from "../ui/Tooltip";

export interface FunnelProps {
  shown: number;
  opened: number;
  contacted: number;
  /** False under 30 opens: rate connectors read "Not enough data yet". */
  enough: boolean;
  /** Caption under Shown (desktop). */
  shownCaption?: React.ReactNode;
  className?: string;
}

function share(a: number, b: number): number {
  return b ? Math.min(100, (a / b) * 100) : 0;
}

/**
 * Shown → Opened → Contacted with two rate connectors (teal "Open rate",
 * orange "Contact rate"). Vertical on mobile.
 */
export function Funnel({ shown, opened, contacted, enough, shownCaption = "Times the card appeared in lists", className }: FunnelProps) {
  const openRate = shown ? opened / shown : null;
  const contactRate = opened ? contacted / opened : null;
  const openW = `${Math.max(opened ? 1.5 : 0, share(opened, shown))}%`;
  const contactW = `${Math.max(contacted ? 1.5 : 0, share(contacted, opened))}%`;

  const stage = (label: string, info: "shown" | "opened" | "contacted", value: number, bar: React.ReactNode, caption?: React.ReactNode) => (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-1.5 text-label text-ink-2">
        {label}
        <InfoTooltip info={info} />
      </div>
      <div className="num text-stat text-ink">{fmtNum(value)}</div>
      {enough ? bar : null}
      {enough && caption ? <span className="num text-label text-muted">{caption}</span> : null}
    </div>
  );

  const connector = (tone: "teal" | "orange", rate: number | null, label: string, a: number, b: number) =>
    enough ? (
      <div
        className={cx(
          "flex flex-col items-center gap-1 rounded-control px-2 py-3 text-center",
          tone === "teal" ? "bg-brand-50 text-brand-700" : "bg-accent-50 text-accent-700",
        )}
      >
        <span className="num flex items-center gap-1 text-[17px]/[24px] font-bold">
          {fmtPct(rate)}
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="text-[13px]/[18px] font-semibold">{label}</span>
        <span className="num text-[12px]/[16px] font-medium text-ink-2">
          {fmtNum(a)} of {fmtNum(b)}
        </span>
      </div>
    ) : (
      <div className="rounded-control bg-fill px-2 py-3 text-center text-[13px]/[18px] font-semibold text-quiet-text">
        {label}
        <br />
        Not enough data yet
      </div>
    );

  const mConnector = (tone: "teal" | "orange", rate: number | null, label: string, a: number, b: number) =>
    enough ? (
      <div
        className={cx(
          "num flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[13px]/[18px] font-semibold",
          tone === "teal" ? "bg-brand-50 text-brand-700" : "bg-accent-50 text-accent-700",
        )}
      >
        <ArrowDown size={16} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
        {fmtPct(rate)} {label.toLowerCase()}
        <span className="ml-auto font-medium text-ink-2">
          {fmtNum(a)} of {fmtNum(b)}
        </span>
      </div>
    ) : (
      <div className="flex items-center gap-2 rounded-[10px] bg-fill px-2.5 py-1.5 text-[13px]/[18px] font-semibold text-quiet-text">
        <ArrowDown size={16} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
        {label} · Not enough data yet
      </div>
    );

  const mStage = (label: string, value: number, bar: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label text-ink-2">{label}</span>
        <span className="num text-[22px]/[28px] font-extrabold text-ink">{fmtNum(value)}</span>
      </div>
      {enough ? bar : null}
    </div>
  );

  const track = (w: string, color: string, h: string) => (
    <span className={cx("block overflow-hidden rounded-full bg-fill", h)}>
      <span className="block h-full rounded-full" style={{ width: w, background: color }} />
    </span>
  );

  return (
    <div className={className}>
      {/* Desktop */}
      <div className="hidden grid-cols-[minmax(0,1fr)_168px_minmax(0,1fr)_168px_minmax(0,1fr)] items-center gap-4 lg:grid">
        {stage("Shown", "shown", shown, <span className="block h-3 rounded-full bg-chart-shown" />, shownCaption)}
        {connector("teal", openRate, "Open rate", opened, shown)}
        {stage("Opened", "opened", opened, track(openW, "#0F766E", "h-3"), `${fmtPct(openRate)} of shown`)}
        {connector("orange", contactRate, "Contact rate", contacted, opened)}
        {stage("Contacted", "contacted", contacted, track(contactW, "#EA580C", "h-3"), `${fmtPct(contactRate)} of opened`)}
      </div>
      {/* Mobile */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {mStage("Shown", shown, <span className="block h-2.5 rounded-full bg-chart-shown" />)}
        {mConnector("teal", openRate, "Open rate", opened, shown)}
        {mStage("Opened", opened, track(openW, "#0F766E", "h-2.5"))}
        {mConnector("orange", contactRate, "Contact rate", contacted, opened)}
        {mStage("Contacted", contacted, track(contactW, "#EA580C", "h-2.5"))}
      </div>
    </div>
  );
}
