import * as React from "react";
import type { DeltaInfo } from "@/lib/admin/format";
import { cx } from "./cx";
import { Tooltip } from "./Tooltip";

const DIR = {
  up: { text: "text-good-text", arrow: "▲", tint: "hover:bg-good-fill", open: "bg-good-fill" },
  down: { text: "text-bad-text", arrow: "▼", tint: "hover:bg-bad-fill", open: "bg-bad-fill" },
  flat: { text: "text-quiet-text", arrow: "—", tint: "hover:bg-fill", open: "bg-fill" },
} as const;

export interface DeltaProps {
  delta: DeltaInfo | null;
  /** Dark tooltip text, e.g. "vs previous 30 days (14 Aug – 12 Sep) · 151 → 187". */
  tooltip?: React.ReactNode;
  /** Under 30 opens: "Not enough data yet" in grey instead of a delta. */
  notEnough?: boolean;
  className?: string;
}

/** ▲ +18% green · ▼ −7% red · — no change grey. Never colour alone. */
export function Delta({ delta, tooltip, notEnough, className }: DeltaProps) {
  if (notEnough) {
    return <span className={cx("text-[13px]/[18px] font-semibold text-quiet-text", className)}>Not enough data yet</span>;
  }
  if (!delta) return null;
  const d = DIR[delta.dir];
  const label = delta.dir === "flat" ? "— no change" : `${d.arrow} ${delta.text}`;
  const base = cx("num whitespace-nowrap text-[13px]/[18px] font-semibold", d.text);
  if (!tooltip) return <span className={cx(base, className)}>{label}</span>;
  return (
    <Tooltip
      content={tooltip}
      className={cx(base, "-mx-1.5 -my-0.5 rounded-md px-1.5 py-0.5 transition-colors", d.tint, className)}
      openClassName={d.open}
    >
      {label}
    </Tooltip>
  );
}
