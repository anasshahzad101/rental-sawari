import * as React from "react";
import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { cx } from "@/components/admin/ui/cx";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import type { IconComponent } from "@/components/admin/ui/icons";

/**
 * Layout pieces shared by the Inbox screens (requests, claims, reports).
 * Server-safe (no hooks): use them from page.tsx or from client parts.
 *
 * Desktop (≥1024): InboxTabs, then a split view `list | detail` (380 px or
 * 340 px list). Mobile: the list screen, or — when `?id` is in the URL — the
 * detail full screen with a back arrow and a fixed action bar at the bottom.
 */

/** Page body for an Inbox screen: 20 32 32 with a 20 px gap (desktop); 16 px sides on mobile. */
export function InboxBody({ children, mobileDetail, className }: { children: React.ReactNode; mobileDetail?: boolean; className?: string }) {
  return (
    <main
      className={cx(
        "flex min-w-0 flex-col gap-3 px-4 pb-4 lg:gap-5 lg:px-8 lg:pb-8 lg:pt-5",
        mobileDetail ? "pt-4" : "pt-1",
        className,
      )}
    >
      {children}
    </main>
  );
}

export interface InboxSplitProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  /** Which pane shows under 1024 px: the list (no `?id`) or the detail (`?id` present). */
  mobile: "list" | "detail";
  /** Desktop list column: 380 (requests, reports) or 340 (claims). */
  listWidth?: 380 | 340;
  className?: string;
}

/** `380px | 1fr` (gap 24, top-aligned) on desktop; one pane at a time on mobile. */
export function InboxSplit({ list, detail, mobile, listWidth = 380, className }: InboxSplitProps) {
  return (
    <div
      className={cx(
        "min-w-0 lg:grid lg:items-start lg:gap-6",
        listWidth === 340 ? "lg:grid-cols-[340px_minmax(0,1fr)]" : "lg:grid-cols-[380px_minmax(0,1fr)]",
        className,
      )}
    >
      <div className={cx("flex min-w-0 flex-col gap-2.5", mobile === "detail" && "max-lg:hidden")}>{list}</div>
      <div className={cx("min-w-0", mobile === "list" && "max-lg:hidden")}>{detail}</div>
    </div>
  );
}

export interface InboxListCardProps {
  href: string;
  /** Desktop only: 1.5 px border + 3 px ring (teal, or red when urgent). */
  selected?: boolean;
  /** Red-tinted border; the selected ring turns red. */
  urgent?: boolean;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

/** A list card (padding 14 16, radius 14). Links to `?id=N`. */
export function InboxListCard({ href, selected, urgent, children, className, ...rest }: InboxListCardProps) {
  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      aria-label={rest["aria-label"]}
      className={cx(
        "flex min-w-0 flex-col gap-1.5 rounded-[14px] bg-white px-4 py-3.5 text-ink outline-none transition-[background-color,box-shadow] focus-visible:shadow-focus",
        urgent ? "border-[1.5px] border-bad-border" : "border border-line",
        selected
          ? urgent
            ? "lg:border-[1.5px] lg:border-bad-solid lg:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
            : "lg:border-[1.5px] lg:border-brand-700 lg:shadow-[0_0_0_3px_rgba(15,118,110,0.12)]"
          : "hover:bg-page active:bg-fill",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Card line 1: name (600 16) + time on the right (desktop) or a chevron (mobile). */
export function InboxListCardTitle({ title, meta, className }: { title: React.ReactNode; meta?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("flex min-w-0 items-center gap-2", className)}>
      <span className="min-w-0 truncate text-[16px]/[22px] font-semibold text-ink">{title}</span>
      {meta != null ? <span className="num ml-auto hidden flex-none text-[13px]/[18px] font-medium text-muted lg:inline">{meta}</span> : null}
      <ChevronRight size={18} strokeWidth={1.75} className="ml-auto flex-none text-[#A8A29E] lg:hidden" aria-hidden="true" />
    </div>
  );
}

/** The detail pane: one white card on desktop; bare (sections stack, gap 12) on mobile. */
export function InboxDetailFrame({ children, className, "aria-label": label }: { children: React.ReactNode; className?: string; "aria-label"?: string }) {
  return (
    <section
      aria-label={label}
      className={cx(
        "flex min-w-0 flex-col gap-3 lg:gap-0 lg:rounded-card lg:border lg:border-line lg:bg-white lg:shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Desktop footer of the detail card: #FAFAF9, top border, padding 14 24. Hidden on mobile. */
export function InboxDetailFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("hidden items-center gap-2 rounded-b-card border-t border-line bg-page px-6 py-3.5 lg:flex", className)}>{children}</div>
  );
}

/**
 * Mobile action bar for a full-screen detail: padding 12 16 30, top border,
 * bar shadow. Fixed to the bottom, over the tab bar. Hidden on desktop.
 */
export function MobileActionBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      {/* Keeps the end of the page clear of a taller bar (e.g. with a locked-reason line). */}
      <div aria-hidden="true" className="h-8 flex-none lg:hidden" />
      <div
        className={cx(
          "fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-line bg-white px-4 pb-[max(30px,env(safe-area-inset-bottom))] pt-3 shadow-bar lg:hidden",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}

export interface InboxEmptyProps {
  icon?: IconComponent;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** Empty list: a white card (min 300 px tall) with the kit's EmptyState. */
export function InboxEmpty({ icon = Inbox, title, body, action, className }: InboxEmptyProps) {
  return (
    <div className={cx("flex min-h-[300px] flex-col items-center justify-center rounded-card border border-line bg-white", className)}>
      <EmptyState icon={icon} title={title} body={body} action={action} />
    </div>
  );
}
