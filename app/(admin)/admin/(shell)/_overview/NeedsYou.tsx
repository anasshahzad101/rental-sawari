import * as React from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, EyeOff, FilePlus2, Flag, UserCheck } from "lucide-react";
import type { InboxCounts } from "@/lib/admin/repo/inbox";
import { fmtNum, fmtWhen, plural } from "@/lib/admin/format";
import { cx } from "@/components/admin/ui/cx";
import type { IconComponent } from "@/components/admin/ui/icons";

/**
 * "Needs you": five tiles (desktop) or one card of five rows (mobile), each
 * opening the page it talks about. Counts come from the Inbox and plans, so
 * they show even on the first day of tracking.
 */

type Tone = "teal" | "red" | "amber" | "grey";

const ICON_TONE: Record<Tone, string> = {
  teal: "bg-brand-50 text-brand-700",
  red: "bg-bad-fill text-bad-text",
  amber: "bg-wait-fill text-wait-text",
  grey: "bg-fill text-quiet-text",
};

interface Item {
  key: string;
  href: string;
  icon: IconComponent;
  tone: Tone;
  count: number;
  label: string;
  mobileLabel: string;
  sub: React.ReactNode;
  mobileSub: React.ReactNode;
  /** Red border on the desktop tile (urgent reports). */
  alert?: boolean;
}

/** "Today, 11:42 AM" → "today, 11:42 AM" so it reads "Newest today, 11:42 AM". */
function lowerDay(s: string): string {
  return s.replace(/^(Today|Yesterday)/, (m) => m.toLowerCase());
}

function UrgentPill({ n, icon }: { n: number; icon?: boolean }) {
  return (
    <span className="num inline-flex h-[22px] items-center gap-1 self-start rounded-full bg-bad-solid px-2 text-[12px]/[16px] font-bold text-white">
      {icon ? <Flag size={12} strokeWidth={2.5} aria-hidden="true" /> : null}
      {fmtNum(n)} urgent
    </span>
  );
}

const muted = (text: React.ReactNode) => <span className="text-[13px]/[18px] font-medium text-muted">{text}</span>;

function buildItems(c: InboxCounts, zeroOpens: number, zeroHref: string): Item[] {
  const plans = c.plansEnding + c.plansEnded;
  const planParts: string[] = [];
  if (c.plansEnded) planParts.push(`${fmtNum(c.plansEnded)} ended`);
  if (c.plansEnding) planParts.push(`${fmtNum(c.plansEnding)} ${c.plansEnding === 1 ? "ends" : "end"} this week`);
  const planPartsM: string[] = [];
  if (c.plansEnded) planPartsM.push(`${fmtNum(c.plansEnded)} ended`);
  if (c.plansEnding) planPartsM.push(`${fmtNum(c.plansEnding)} this week`);
  const amber = (t: string) => <span className="num text-[13px]/[18px] font-semibold text-wait-text">{t}</span>;

  const requestSub = c.newestRequestAt ? muted(`Newest ${lowerDay(fmtWhen(c.newestRequestAt))}`) : muted("Nothing waiting");
  const claimWaiting = c.claims - c.claimsReady;

  return [
    {
      key: "requests",
      href: "/admin/inbox/requests",
      icon: FilePlus2,
      tone: "teal",
      count: c.requests,
      label: "New listing requests",
      mobileLabel: "New listing requests",
      sub: requestSub,
      mobileSub: requestSub,
    },
    {
      key: "claims",
      href: "/admin/inbox/claims",
      icon: UserCheck,
      tone: "teal",
      count: c.claims,
      label: "Claims",
      mobileLabel: "Claims",
      sub: c.claimsReady ? (
        <span className="num flex items-center gap-1.5 text-[13px]/[18px] font-semibold text-good-text">
          <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-good-solid" />
          {fmtNum(c.claimsReady)} ready to update
        </span>
      ) : claimWaiting ? (
        muted(`${fmtNum(claimWaiting)} waiting for verification`)
      ) : (
        muted("Nothing waiting")
      ),
      mobileSub: c.claimsReady ? (
        <span className="num text-[13px]/[18px] font-semibold text-good-text">{fmtNum(c.claimsReady)} ready to update</span>
      ) : claimWaiting ? (
        muted(`${fmtNum(claimWaiting)} waiting for verification`)
      ) : (
        muted("Nothing waiting")
      ),
    },
    {
      key: "reports",
      href: "/admin/inbox/reports",
      icon: Flag,
      tone: "red",
      count: c.reports,
      label: "Problem reports",
      mobileLabel: "Problem reports",
      alert: c.urgent > 0,
      sub: c.urgent ? <UrgentPill n={c.urgent} icon /> : muted(c.reports ? "None urgent" : "Nothing waiting"),
      mobileSub: c.urgent ? <UrgentPill n={c.urgent} /> : muted(c.reports ? "None urgent" : "Nothing waiting"),
    },
    {
      key: "plans",
      href: "/admin/plans",
      icon: CalendarClock,
      tone: "amber",
      count: plans,
      label: "Plans ending or ended",
      mobileLabel: "Plans ending or ended",
      sub: plans ? amber(planParts.join(" · ")) : muted("None this week"),
      mobileSub: plans ? amber(planPartsM.join(" · ")) : muted("None this week"),
    },
    {
      key: "zero",
      href: zeroHref,
      icon: EyeOff,
      tone: "grey",
      count: zeroOpens,
      label: "Listings with zero opens",
      mobileLabel: "Zero opens",
      sub: muted("Live, but nobody opened them"),
      mobileSub: muted("Live listings nobody opened"),
    },
  ];
}

export interface NeedsYouProps {
  counts: InboxCounts;
  zeroOpens: number;
  /** Listings filtered to Zero opens, keeping the range. */
  zeroHref: string;
  className?: string;
}

/** Desktop: heading + sub line, then 5 tiles in `repeat(5,1fr)`, gap 16. */
export function NeedsYouDesktop({ counts, zeroOpens, zeroHref, className }: NeedsYouProps) {
  const items = buildItems(counts, zeroOpens, zeroHref);
  const plans = counts.plansEnding + counts.plansEnded;
  return (
    <section className={cx("hidden lg:block", className)} aria-labelledby="needs-you-d">
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 id="needs-you-d" className="text-card-title text-ink">
          Needs you
        </h2>
        <span className="num text-label text-muted">
          {fmtNum(counts.total)} waiting in Inbox · {plural(plans, "plan")} to decide
        </span>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cx(
                "group flex min-w-0 flex-col gap-0.5 rounded-card border bg-white px-[18px] pb-[18px] pt-4 shadow-card outline-none transition-colors",
                it.alert ? "border-bad-border hover:border-[#FCA5A5]" : "border-line hover:border-line-strong",
              )}
            >
              <span className="mb-2.5 flex items-center justify-between">
                <span className={cx("grid size-9 place-items-center rounded-[10px]", ICON_TONE[it.tone])}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <ChevronRight size={18} strokeWidth={1.75} className="text-[#A8A29E] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span className="num text-[28px]/[32px] font-extrabold text-ink">{fmtNum(it.count)}</span>
              <span className="text-[15px]/[22px] font-semibold text-ink">{it.label}</span>
              {it.sub}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Mobile: one card of five 60 px rows (icon, label + sub, number, chevron). */
export function NeedsYouMobile({ counts, zeroOpens, zeroHref, className }: NeedsYouProps) {
  const items = buildItems(counts, zeroOpens, zeroHref);
  return (
    <section className={cx("flex flex-col gap-3 lg:hidden", className)} aria-labelledby="needs-you-m">
      <h2 id="needs-you-m" className="mt-1 text-card-title-m text-ink">
        Needs you
      </h2>
      <div className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cx("flex min-h-[60px] items-center gap-3 px-3.5 py-2 active:bg-fill", i < items.length - 1 && "border-b border-fill")}
            >
              <span className={cx("grid size-9 flex-none place-items-center rounded-[10px]", ICON_TONE[it.tone])}>
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className="text-[16px]/[22px] font-semibold text-ink">{it.mobileLabel}</span>
                {it.mobileSub}
              </span>
              <span className="num text-[22px]/[28px] font-extrabold text-ink">{fmtNum(it.count)}</span>
              <ChevronRight size={18} strokeWidth={1.75} className="flex-none text-[#A8A29E]" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
