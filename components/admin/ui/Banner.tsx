import * as React from "react";
import { CalendarClock, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cx } from "./cx";
import type { IconComponent } from "./icons";

export type BannerTone = "error" | "warning" | "info" | "success" | "neutral";

const TONE: Record<BannerTone, { box: string; icon: string; lead: string; Icon: IconComponent }> = {
  error: { box: "border-bad-border bg-bad-fill", icon: "text-bad-text", lead: "text-bad-text", Icon: CircleAlert },
  warning: { box: "border-wait-border bg-wait-fill", icon: "text-wait-text", lead: "text-wait-text", Icon: TriangleAlert },
  info: { box: "border-ours-border bg-ours-fill", icon: "text-ours-text", lead: "text-ours-text", Icon: Info },
  success: { box: "border-good-border bg-good-fill", icon: "text-good-text", lead: "text-good-text", Icon: CircleCheck },
  neutral: { box: "border-line bg-fill", icon: "text-quiet-text", lead: "text-ink", Icon: Info },
};

export interface BannerProps {
  tone: BannerTone;
  /** Bold lead in the tone colour ("Couldn't load the numbers."). */
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons. Error banners put them on the right (desktop); others below the text. */
  actions?: React.ReactNode;
  /** Override the icon (null hides it). */
  icon?: IconComponent | null;
  /** "inline" = text and actions on one row (desktop); "stacked" = actions under the text. */
  layout?: "inline" | "stacked";
  className?: string;
}

/**
 * Error (red, circle-alert, bold lead + "Try again" on the right) · Warning
 * (amber, triangle-alert, actions below) · Info (teal) · Success (green).
 */
export function Banner({ tone, title, children, actions, icon, layout, className }: BannerProps) {
  const t = TONE[tone];
  const Icon = icon === undefined ? t.Icon : icon;
  const mode = layout ?? (tone === "error" ? "inline" : "stacked");
  const text = (
    <div className="min-w-0 flex-1 text-[16px]/[24px] font-medium text-ink lg:text-[15px]/[22px]">
      {title ? <span className={cx("font-bold", t.lead)}>{title}</span> : null}
      {title && children ? " " : null}
      {children}
    </div>
  );
  const iconEl = Icon ? <Icon size={20} strokeWidth={1.75} className={cx("mt-0.5 flex-none lg:mt-px", t.icon)} aria-hidden="true" /> : null;

  if (mode === "inline") {
    return (
      <div
        role={tone === "error" ? "alert" : "status"}
        className={cx(
          "flex flex-col gap-2.5 rounded-control border px-4 py-3.5 lg:flex-row lg:items-center lg:gap-3 lg:py-2.5 lg:pr-2.5",
          t.box,
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 gap-2.5 lg:items-center lg:gap-3">
          {iconEl}
          {text}
        </div>
        {actions ? (
          <div className="flex flex-col gap-2 max-lg:[&>*]:w-full lg:flex-none lg:flex-row lg:items-center">{actions}</div>
        ) : null}
      </div>
    );
  }
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex gap-3 rounded-control border px-4 py-3.5", t.box, className)}>
      {iconEl}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {text}
        {actions ? <div className="flex flex-wrap gap-2 max-lg:flex-col max-lg:[&>*]:w-full">{actions}</div> : null}
      </div>
    </div>
  );
}

export interface QuietNoteProps {
  children: React.ReactNode;
  /** Defaults to calendar-clock. */
  icon?: IconComponent | null;
  /** Muted (default) or green ("Live on the site within a minute"). */
  tone?: "muted" | "good";
  className?: string;
}

/** Icon + 13 px muted text, no box ("Counting since 13 Aug 2026"). */
export function QuietNote({ children, icon, tone = "muted", className }: QuietNoteProps) {
  const Icon = icon === undefined ? (tone === "good" ? CircleCheck : CalendarClock) : icon;
  return (
    <p
      className={cx(
        "num flex items-start gap-2 text-[13px]/[18px] font-medium",
        tone === "good" ? "text-good-text" : "text-muted",
        className,
      )}
    >
      {Icon ? <Icon size={16} strokeWidth={1.75} className="mt-px flex-none" aria-hidden="true" /> : null}
      <span>{children}</span>
    </p>
  );
}
