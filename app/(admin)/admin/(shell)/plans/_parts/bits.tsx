import * as React from "react";
import { cx } from "@/components/admin/ui/cx";
import { daysInfo, type DaysTone } from "./plan-utils";

const TONE: Record<DaysTone, string> = {
  red: "border-bad-border bg-bad-fill text-bad-text",
  amber: "border-wait-border bg-wait-fill text-wait-text",
  grey: "border-line bg-fill text-ink-2",
};

/**
 * Days-left pill. md: 26 px, 600 13 (table, cards) · sm: 22 px, 600 12
 * (dialog sub lines). `short` uses the card wording ("19 days", "Ended").
 */
export function DaysPill({
  days,
  short,
  size = "md",
  className,
}: {
  days: number | null;
  short?: boolean;
  size?: "md" | "sm";
  className?: string;
}) {
  const info = daysInfo(days);
  return (
    <span
      className={cx(
        "num inline-flex flex-none items-center whitespace-nowrap rounded-full border font-semibold",
        size === "md" ? "h-[26px] px-[9px] text-[13px]/[18px]" : "h-[22px] px-2 text-[12px]/[16px]",
        TONE[info.tone],
        className,
      )}
    >
      {short ? info.short : info.long}
    </span>
  );
}
