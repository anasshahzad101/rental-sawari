import * as React from "react";
import { BadgeCheck, CircleDashed, EyeOff, Flag, MapPin, TriangleAlert } from "lucide-react";
import type { Plan } from "@/lib/admin/types";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { fmtDayShort } from "@/lib/admin/format";
import { cx } from "./cx";
import type { IconComponent } from "./icons";

export type StatusKind =
  | "new"
  | "waiting"
  | "notVerified"
  | "verified"
  | "approved"
  | "updated"
  | "rejected"
  | "resolved"
  | "live"
  | "hidden"
  | "dismissed"
  | "urgent"
  | "duplicate"
  | "cityNotOnSite"
  | "daysLeft"
  | "ended"
  | "flagged";

type Tone = "teal" | "amber" | "green" | "red" | "grey" | "urgent";

const TONE: Record<Tone, { pill: string; dot: string }> = {
  teal: { pill: "border border-ours-border bg-ours-fill text-ours-text", dot: "bg-ours-solid" },
  amber: { pill: "border border-wait-border bg-wait-fill text-wait-text", dot: "bg-wait-solid" },
  green: { pill: "border border-good-border bg-good-fill text-good-text", dot: "bg-good-solid" },
  red: { pill: "border border-bad-border bg-bad-fill text-bad-text", dot: "bg-bad-solid" },
  grey: { pill: "border border-quiet-border bg-quiet-fill text-quiet-text", dot: "bg-quiet-solid" },
  urgent: { pill: "bg-bad-solid font-bold text-white", dot: "bg-white" },
};

interface KindDef {
  tone: Tone;
  label: string;
  /** null = no leading mark; "dot" = 6 px dot; otherwise an icon. */
  mark: "dot" | null | IconComponent;
}

const KINDS: Record<StatusKind, KindDef> = {
  new: { tone: "teal", label: "New", mark: "dot" },
  waiting: { tone: "amber", label: "Waiting for verification", mark: "dot" },
  notVerified: { tone: "amber", label: "Not verified", mark: null },
  verified: { tone: "green", label: "Verified", mark: "dot" },
  approved: { tone: "green", label: "Approved", mark: "dot" },
  updated: { tone: "green", label: "Updated", mark: "dot" },
  rejected: { tone: "red", label: "Rejected", mark: "dot" },
  resolved: { tone: "grey", label: "Resolved", mark: "dot" },
  dismissed: { tone: "grey", label: "Dismissed", mark: "dot" },
  live: { tone: "green", label: "Live", mark: "dot" },
  hidden: { tone: "grey", label: "Hidden", mark: EyeOff },
  urgent: { tone: "urgent", label: "Urgent", mark: Flag },
  duplicate: { tone: "amber", label: "Possible duplicate", mark: TriangleAlert },
  cityNotOnSite: { tone: "amber", label: "City not on site", mark: MapPin },
  daysLeft: { tone: "amber", label: "days left", mark: "dot" },
  ended: { tone: "red", label: "Ended", mark: "dot" },
  flagged: { tone: "red", label: "Flagged", mark: Flag },
};

export interface StatusPillProps {
  kind: StatusKind;
  /** Overrides the default label. */
  label?: React.ReactNode;
  /** For `daysLeft`: "3 days left". */
  days?: number;
  /** For `ended`: the end day (YYYY-MM-DD) → "Ended 5 Oct". */
  date?: string;
  /** Overrides the leading mark (null hides it). */
  icon?: IconComponent | null;
  /** 26 px (md) or 24 px in dense lists (sm). */
  size?: "md" | "sm";
  className?: string;
}

/** Status pills and flags: 26 px (24 dense), 600 13, 6 px dot. */
export function StatusPill({ kind, label, days, date, icon, size = "md", className }: StatusPillProps) {
  const def = KINDS[kind];
  const tone = TONE[def.tone];
  let text: React.ReactNode = label ?? def.label;
  if (label == null && kind === "daysLeft" && days != null) {
    text = days <= 0 ? "Ends today" : `${days} ${days === 1 ? "day" : "days"} left`;
  }
  if (label == null && kind === "ended" && date) text = `Ended ${fmtDayShort(date)}`;
  const mark = icon === undefined ? def.mark : icon;
  const sm = size === "sm";
  return (
    <span
      className={cx(
        "num inline-flex flex-none items-center whitespace-nowrap rounded-full font-semibold",
        sm ? "h-6 gap-[5px] px-[9px] text-[12px]/[16px]" : "h-[26px] gap-1.5 px-2.5 text-[13px]/[18px]",
        mark && mark !== "dot" && !sm && "gap-[5px]",
        tone.pill,
        className,
      )}
    >
      {mark === "dot" ? (
        <span aria-hidden="true" className={cx("size-1.5 flex-none rounded-full", tone.dot)} />
      ) : mark ? (
        React.createElement(mark, {
          size: 14,
          strokeWidth: kind === "urgent" ? 2.25 : 1.75,
          className: "flex-none",
          "aria-hidden": true,
        })
      ) : null}
      {text}
    </span>
  );
}

const PLAN_CLS: Record<Plan, string> = {
  free: "border border-quiet-border bg-quiet-fill font-semibold text-quiet-text",
  city: "border border-accent-200 bg-accent-50 font-semibold text-accent-700",
  plus: "border border-accent-600 bg-accent-600 font-bold text-white",
};

export interface PlanBadgeProps {
  plan: Plan;
  /** 24 px (md) or 22 px inline in search results (sm). */
  size?: "md" | "sm";
  className?: string;
}

/** Free (grey) · Featured City (orange tint) · Featured Plus (solid orange, white 700). Fully round. */
export function PlanBadge({ plan, size = "md", className }: PlanBadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex flex-none items-center whitespace-nowrap rounded-full text-[12px]/[16px]",
        size === "sm" ? "h-[22px] px-2" : "h-6 px-2.5",
        PLAN_CLS[plan],
        className,
      )}
    >
      {PLAN_LABEL[plan]}
    </span>
  );
}

export interface VerifiedBadgeProps {
  verified: boolean;
  /** 24 px (sm, listing header) or 26 px (md, pill lists). */
  size?: "md" | "sm";
  className?: string;
}

/** Listing-level "Verified" (badge-check, green) or "Not verified" (amber). */
export function VerifiedBadge({ verified, size = "sm", className }: VerifiedBadgeProps) {
  const sm = size === "sm";
  return (
    <span
      className={cx(
        "inline-flex flex-none items-center whitespace-nowrap rounded-full font-semibold",
        sm ? "h-6 gap-1 px-[9px] text-[12px]/[16px]" : "h-[26px] gap-[5px] px-2.5 text-[13px]/[18px]",
        verified ? "border border-good-border bg-good-fill text-good-text" : "border border-wait-border bg-wait-fill text-wait-text",
        className,
      )}
    >
      {verified ? (
        <BadgeCheck size={sm ? 14 : 15} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
      ) : sm ? (
        <CircleDashed size={14} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
      ) : null}
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}

/** Small inline green badge-check next to a name. */
export function VerifiedMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <BadgeCheck
      size={size}
      strokeWidth={1.75}
      className={cx("inline-block flex-none text-good-solid", className)}
      aria-label="Verified"
      role="img"
    />
  );
}
