"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, CalendarPlus, ChartColumn, Ellipsis, MessageSquareText, TriangleAlert } from "lucide-react";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { fmtDay, fmtDayShort, fmtNum } from "@/lib/admin/format";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Button, IconButton } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { useIsDesktop } from "@/components/admin/ui/hooks";
import { WhatsAppIcon } from "@/components/admin/ui/icons";
import { Sheet } from "@/components/admin/ui/Modal";
import { Menu, Popover } from "@/components/admin/ui/Popover";
import { PlanBadge } from "@/components/admin/ui/StatusPill";
import { useToast } from "@/components/admin/ui/Toast";
import { undoVersionAction } from "../../../_actions/listings";
import { extendPlanAction, switchToFreeAction } from "../../../_actions/plans";
import { DaysPill } from "./bits";
import { ExtendPanel, type ExtendChoice } from "./ExtendPanel";
import { MonthlyDialog, ReminderDialog } from "./MessageDialogs";
import { daysInfo, endPhrase, ended, FIRST_ROWS, planRange, type MonthOption, type PlanItem } from "./plan-utils";

type Extend = (p: PlanItem, c: ExtendChoice) => Promise<string | null>;

/* ── Table geometry ─────────────────────────────────────────────────────
   Full design grid from 1440 px; a tighter one (icon-only Reminder) between
   1024 and 1439, scrolling sideways inside the card when even that is too
   wide. */
const GRID =
  "grid items-center gap-3 px-5 grid-cols-[minmax(160px,1fr)_116px_140px_120px_76px_84px_208px] min-[1440px]:grid-cols-[minmax(0,1fr)_116px_150px_120px_76px_84px_272px]";

const OUTLINE_BTN =
  "inline-flex flex-none items-center justify-center rounded-control border border-line bg-white font-semibold text-ink outline-none transition-colors hover:bg-fill active:bg-line";

// ── Extend: popover on desktop ─────────────────────────────────────────

function ExtendPopover({ item, today, onExtend, trigger }: { item: PlanItem; today: string; onExtend: Extend; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      trigger={trigger}
      aria-label={`Extend ${item.name}`}
      className="w-[380px] max-w-[calc(100vw-32px)] p-4"
    >
      <ExtendPanel
        item={item}
        today={today}
        onCancel={() => setOpen(false)}
        onSubmit={async (c) => {
          const err = await onExtend(item, c);
          if (!err) setOpen(false);
          return err;
        }}
      />
    </Popover>
  );
}

// ── Ended-but-still-Featured banner ────────────────────────────────────

function EndedBanner({
  item,
  today,
  busy,
  onSwitch,
  onExtend,
  onExtendSheet,
}: {
  item: PlanItem;
  today: string;
  busy: boolean;
  onSwitch: () => void;
  onExtend: Extend;
  onExtendSheet: () => void;
}) {
  const isDesktop = useIsDesktop();
  const day = item.planEnd ? fmtDayShort(item.planEnd) : "";
  return (
    <div
      role="status"
      className="flex flex-col gap-2.5 rounded-[14px] border border-wait-border bg-wait-fill px-4 py-3.5 lg:flex-row lg:items-center lg:gap-3.5 lg:px-5 lg:py-4"
    >
      <div className="flex min-w-0 flex-1 gap-2 lg:items-center lg:gap-3.5">
        <TriangleAlert size={20} strokeWidth={1.75} className="mt-px flex-none text-wait-text lg:mt-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[15px]/[22px] font-medium text-ink [text-wrap:pretty]">
          <span className="lg:hidden">
            <b className="font-bold">{item.name}:</b> plan ended {day} but the listing is still Featured. Nothing changes until you choose.
          </span>
          <span className="hidden font-bold lg:block">{item.name}</span>
          <span className="hidden text-ink-2 lg:block">
            Plan ended {day} but the listing is still Featured. Nothing changes until you choose.
          </span>
        </p>
      </div>
      <div className="flex gap-2 lg:flex-none">
        <Button variant="secondary" className="flex-1 px-3 lg:flex-none lg:px-4" loading={busy} loadingText="Switching…" onClick={onSwitch}>
          Switch to Free
        </Button>
        {isDesktop ? (
          <ExtendPopover
            item={item}
            today={today}
            onExtend={onExtend}
            trigger={
              <Button variant="primary" icon={CalendarPlus}>
                Extend plan
              </Button>
            }
          />
        ) : (
          <Button variant="primary" className="flex-1 px-3" onClick={onExtendSheet}>
            Extend plan
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Desktop table ──────────────────────────────────────────────────────

function PlanRowDesktop({
  item,
  today,
  onReminder,
  onMonthly,
  onExtend,
  onSwitch,
}: {
  item: PlanItem;
  today: string;
  onReminder: () => void;
  onMonthly: () => void;
  onExtend: Extend;
  onSwitch: () => void;
}) {
  return (
    <div className={cx(GRID, "num h-[60px] border-b border-fill text-[15px]/[22px] font-medium", ended(item) ? "bg-[#FFFBFA]" : "bg-white")}>
      <span className="flex min-w-0 items-center gap-3">
        <Avatar name={item.name} logoUrl={item.logoUrl} size={40} />
        <span className="flex min-w-0 flex-col">
          <Link
            href={`/admin/listings/${item.id}`}
            title={item.name}
            className="truncate font-semibold text-ink outline-none hover:text-brand-700 hover:underline"
          >
            {item.name}
          </Link>
          <span className="truncate text-[13px]/[18px] font-medium text-muted">{item.city}</span>
        </span>
      </span>
      <span>
        <PlanBadge plan={item.plan} />
      </span>
      <span className="text-[13px]/[18px] font-medium text-ink-2">{planRange(item)}</span>
      <span>
        <DaysPill days={item.daysLeft} />
      </span>
      <span className="text-right">{fmtNum(item.opened)}</span>
      <b className="text-right font-bold">{fmtNum(item.contacted)}</b>
      <span className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onReminder}
          title="Renewal reminder"
          aria-label={`Renewal reminder for ${item.name}`}
          className={cx(OUTLINE_BTN, "h-10 w-10 gap-1.5 text-[14px]/[20px] min-[1440px]:w-auto min-[1440px]:px-2.5")}
        >
          <WhatsAppIcon size={16} className="text-whatsapp-hover" />
          <span className="hidden min-[1440px]:inline">Reminder</span>
        </button>
        <IconButton icon={MessageSquareText} iconSize={18} variant="secondary" label="Monthly stats message" onClick={onMonthly} />
        <ExtendPopover
          item={item}
          today={today}
          onExtend={onExtend}
          trigger={
            <button type="button" className={cx(OUTLINE_BTN, "h-10 px-2.5 text-[14px]/[20px]")}>
              Extend
            </button>
          }
        />
        <Menu
          width={220}
          trigger={<IconButton icon={Ellipsis} iconSize={18} variant="secondary" label="More: Switch to Free" className="aria-expanded:bg-fill" />}
          items={[{ key: "free", label: "Switch to Free", icon: ArrowDownToLine, onSelect: onSwitch }]}
        />
      </span>
    </div>
  );
}

// ── Mobile card ────────────────────────────────────────────────────────

function PlanCardMobile({
  item,
  onReminder,
  onExtend,
  onMore,
}: {
  item: PlanItem;
  onReminder: () => void;
  onExtend: () => void;
  onMore: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={item.name} logoUrl={item.logoUrl} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/admin/listings/${item.id}`} className="truncate text-[16px]/[22px] font-semibold text-ink outline-none">
            {item.name}
          </Link>
          <span className="num truncate text-[13px]/[18px] font-medium text-muted">
            {PLAN_LABEL[item.plan]} · {endPhrase(item)}
          </span>
        </div>
        <DaysPill days={item.daysLeft} short />
      </div>
      <div className="num flex items-baseline gap-5 text-[12px]/[16px] font-medium text-muted">
        <span>
          <b className="text-[16px]/[22px] font-bold text-ink">{fmtNum(item.opened)}</b> opened
        </span>
        <span>
          <b className="text-[16px]/[22px] font-bold text-ink">{fmtNum(item.contacted)}</b> contacted
        </span>
        <span className="ml-auto">this plan</span>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onReminder} className={cx(OUTLINE_BTN, "h-11 flex-1 gap-1.5 text-[15px]/[20px]")}>
          <WhatsAppIcon size={16} className="text-whatsapp-hover" />
          Reminder
        </button>
        <button type="button" onClick={onExtend} className={cx(OUTLINE_BTN, "h-11 flex-1 text-[15px]/[20px]")}>
          Extend
        </button>
        <button type="button" onClick={onMore} aria-label={`More for ${item.name}`} className={cx(OUTLINE_BTN, "size-11")}>
          <Ellipsis size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** "Featured Plus · ends 15 Oct · 3 days left" for the mobile actions sheet. */
function sheetSub(p: PlanItem): string {
  if (!p.planEnd || p.daysLeft == null) return `${PLAN_LABEL[p.plan]} · no end date`;
  if (p.daysLeft < 0) {
    const n = -p.daysLeft;
    return `${PLAN_LABEL[p.plan]} · ended ${fmtDayShort(p.planEnd)} · ${n} ${n === 1 ? "day" : "days"} ago`;
  }
  return `${PLAN_LABEL[p.plan]} · ends ${fmtDayShort(p.planEnd)} · ${daysInfo(p.daysLeft).long.toLowerCase()}`;
}

// ── The page body ──────────────────────────────────────────────────────

export function PlansView({ items, today, months }: { items: PlanItem[]; today: string; months: MonthOption[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  const [reminderFor, setReminderFor] = useState<PlanItem | null>(null);
  const [monthlyFor, setMonthlyFor] = useState<PlanItem | null>(null);
  const [extendFor, setExtendFor] = useState<PlanItem | null>(null);
  const [actionsFor, setActionsFor] = useState<PlanItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const total = items.length;
  const shown = showAll ? items : items.slice(0, FIRST_ROWS);
  const endedItems = items.filter(ended);

  function undoer(vid: number | null) {
    if (!vid) return undefined;
    return async () => {
      const u = await undoVersionAction(vid);
      if (!u.ok) toast({ message: u.error, icon: null });
      router.refresh();
    };
  }

  async function switchToFree(p: PlanItem) {
    if (busyId != null) return;
    setBusyId(p.id);
    const r = await switchToFreeAction(p.id);
    setBusyId(null);
    if (!r.ok) {
      toast({ message: r.error, icon: null });
      return;
    }
    router.refresh();
    toast({ message: `${p.name} switched to Free`, undo: undoer(r.versionId) });
  }

  const extend: Extend = async (p, c) => {
    const r = await extendPlanAction(p.id, c);
    if (!r.ok) return r.error;
    router.refresh();
    toast({ message: `${p.name} extended to ${fmtDay(r.end)}`, undo: undoer(r.versionId) });
    return null;
  };

  const countText =
    total <= FIRST_ROWS
      ? `${fmtNum(total)} Featured ${total === 1 ? "listing" : "listings"}`
      : `${fmtNum(shown.length)} of ${fmtNum(total)} Featured listings`;

  return (
    <>
      {endedItems.map((p) => (
        <EndedBanner
          key={p.id}
          item={p}
          today={today}
          busy={busyId === p.id}
          onSwitch={() => void switchToFree(p)}
          onExtend={extend}
          onExtendSheet={() => setExtendFor(p)}
        />
      ))}

      {/* Desktop: table */}
      <div className="hidden min-w-0 overflow-hidden rounded-card border border-line bg-white shadow-card lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[1016px]">
            <div className={cx(GRID, "min-h-12 border-b border-line bg-page text-overline uppercase text-muted")}>
              <span>Listing</span>
              <span>Plan</span>
              <span>Start – end</span>
              <span className="text-brand-700">
                Days left ↑
              </span>
              <span className="text-right">
                Opened
              </span>
              <span className="text-right">
                Contacted
              </span>
              <span>
                <span className="min-[1440px]:hidden">Actions</span>
                <span className="hidden min-[1440px]:inline">This plan period · actions</span>
              </span>
            </div>
            {shown.map((p) => (
              <PlanRowDesktop
                key={p.id}
                item={p}
                today={today}
                onReminder={() => setReminderFor(p)}
                onMonthly={() => setMonthlyFor(p)}
                onExtend={extend}
                onSwitch={() => void switchToFree(p)}
              />
            ))}
          </div>
        </div>
        <div className="num flex min-h-14 items-center justify-between gap-4 px-5 py-2 text-[13px]/[18px] font-medium text-muted">
          <span>{countText} · Opened and Contacted count from each plan&apos;s start date</span>
          {total > FIRST_ROWS ? (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="flex-none rounded-md text-[15px]/[20px] font-semibold text-brand-700 outline-none hover:text-brand-800 hover:underline"
            >
              {showAll ? "Show fewer" : `Show all ${fmtNum(total)}`}
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {shown.map((p) => (
          <PlanCardMobile
            key={p.id}
            item={p}
            onReminder={() => setReminderFor(p)}
            onExtend={() => setExtendFor(p)}
            onMore={() => setActionsFor(p)}
          />
        ))}
        {total > FIRST_ROWS ? (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="num flex h-12 items-center justify-center rounded-control text-[15px]/[22px] font-semibold text-brand-700 outline-none active:bg-fill"
          >
            {showAll ? "Show fewer" : `Show all ${fmtNum(total)}`}
          </button>
        ) : null}
      </div>

      {/* Mobile: plan actions sheet */}
      <Sheet open={!!actionsFor} onClose={() => setActionsFor(null)} aria-label={actionsFor ? `${actionsFor.name} plan actions` : "Plan actions"}>
        {actionsFor ? (
          <div className="pb-1">
            <div className="text-[17px]/[24px] font-bold text-ink">{actionsFor.name}</div>
            <div className="num mb-2 text-[13px]/[18px] font-medium text-muted">{sheetSub(actionsFor)}</div>
            <div role="menu" className="flex flex-col text-[16px]/[24px] font-medium text-ink">
              {(
                [
                  { key: "rem", label: "Renewal reminder", icon: <WhatsAppIcon size={20} className="text-whatsapp-hover" />, run: () => setReminderFor(actionsFor) },
                  { key: "msg", label: "Monthly stats message", icon: <MessageSquareText size={20} strokeWidth={1.75} aria-hidden="true" />, run: () => setMonthlyFor(actionsFor) },
                  { key: "ext", label: "Extend plan", icon: <CalendarPlus size={20} strokeWidth={1.75} aria-hidden="true" />, run: () => setExtendFor(actionsFor) },
                  { key: "free", label: "Switch to Free", icon: <ArrowDownToLine size={20} strokeWidth={1.75} aria-hidden="true" />, run: () => void switchToFree(actionsFor) },
                ] as const
              ).map((a) => (
                <button
                  key={a.key}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsFor(null);
                    a.run();
                  }}
                  className="flex h-[52px] items-center gap-3 border-b border-fill text-left outline-none active:bg-fill"
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
              <Link
                role="menuitem"
                href={`/admin/listings/${actionsFor.id}`}
                onClick={() => setActionsFor(null)}
                className="flex h-[52px] items-center gap-3 text-ink outline-none active:bg-fill"
              >
                <ChartColumn size={20} strokeWidth={1.75} aria-hidden="true" />
                Open listing stats
              </Link>
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* Mobile: extend sheet */}
      <Sheet open={!!extendFor} onClose={() => setExtendFor(null)} aria-label="Extend plan">
        {extendFor ? (
          <ExtendPanel
            sheet
            item={extendFor}
            today={today}
            onCancel={() => setExtendFor(null)}
            onSubmit={async (c) => {
              const err = await extend(extendFor, c);
              if (!err) setExtendFor(null);
              return err;
            }}
          />
        ) : null}
      </Sheet>

      <ReminderDialog item={reminderFor} onClose={() => setReminderFor(null)} />
      <MonthlyDialog item={monthlyFor} months={months} onClose={() => setMonthlyFor(null)} />
    </>
  );
}
