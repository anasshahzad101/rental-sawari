"use client";

import * as React from "react";
import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, CalendarRange, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { dayDiff, fmtMonth, fmtRange, pktDay } from "@/lib/admin/format";
import { buildRange, parseRange, presetDays, presetHint, RANGE_PRESETS, rangeQuery, type RangeKey } from "@/lib/admin/ranges";
import { calendarCells } from "../charts/scale";
import { Button } from "../ui/Button";
import { cx } from "../ui/cx";
import { useEscape, useOutsidePointer } from "../ui/hooks";
import { Sheet } from "../ui/Modal";
import { RadioMark, Toggle } from "../ui/controls";

const WEEK_HEAD = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface Draft {
  key: RangeKey;
  start: string;
  end: string | null;
  compare: boolean;
}

function monthOf(day: string): [number, number] {
  return [Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1];
}

function shiftMonth([y, m]: [number, number], n: number): [number, number] {
  const t = y * 12 + m + n;
  return [Math.floor(t / 12), ((t % 12) + 12) % 12];
}

const monthDay = ([y, m]: [number, number]) => `${y}-${String(m + 1).padStart(2, "0")}-01`;

/** Push a new range into the URL, keeping every other query param. */
function useApplyRange() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (d: { key: RangeKey; start: string; end: string; compare: boolean }) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    ["range", "from", "to", "compare"].forEach((k) => next.delete(k));
    const rq = new URLSearchParams(rangeQuery(d));
    rq.forEach((v, k) => next.set(k, v));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };
}

function useCurrentRange() {
  const params = useSearchParams();
  const today = pktDay();
  const qs = params?.toString() ?? "";
  const range = useMemo(() => parseRange(new URLSearchParams(qs), today), [qs, today]);
  return { range, today };
}

// ── Triggers ─────────────────────────────────────────────────────────────

function DesktopTrigger({ label, text, open, onClick }: { label: string; text: string; open?: boolean; onClick?: () => void }) {
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cx(
        "flex h-11 flex-none items-center gap-2 whitespace-nowrap rounded-control border px-3.5 text-[15px]/[20px] font-medium text-ink-2 outline-none transition-colors",
        open ? "border-[1.5px] border-brand-700 bg-brand-50" : "border-line bg-white hover:bg-fill",
      )}
    >
      <Calendar size={20} strokeWidth={1.75} className="flex-none text-brand-700" aria-hidden="true" />
      <span className="font-semibold text-ink">{label}</span>
      <span className="text-[#A8A29E]">·</span>
      <span className="num">{text}</span>
      <Chevron size={18} strokeWidth={1.75} className={cx("flex-none", open ? "text-brand-700" : "text-muted")} aria-hidden="true" />
    </button>
  );
}

function MobileTrigger({ label, text, onClick }: { label: string; text: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="flex h-12 w-full items-center gap-2 rounded-control border border-line bg-white px-3.5 text-[15px]/[20px] font-medium text-ink-2 outline-none active:bg-fill"
    >
      <Calendar size={20} strokeWidth={1.75} className="flex-none text-brand-700" aria-hidden="true" />
      <span className="whitespace-nowrap font-semibold text-ink">{label}</span>
      <span className="num truncate whitespace-nowrap text-muted">{text}</span>
      <ChevronDown size={18} strokeWidth={1.75} className="ml-auto flex-none text-muted" aria-hidden="true" />
    </button>
  );
}

/** Static trigger for Suspense fallbacks (no URL access). */
export function DateRangeTriggerFallback({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const today = pktDay();
  const [a, b] = presetDays("last30", today);
  return variant === "desktop" ? (
    <DesktopTrigger label="Last 30 days" text={fmtRange(a, b)} />
  ) : (
    <MobileTrigger label="Last 30 days" text={fmtRange(a, b, { year: false })} />
  );
}

// ── Calendar month ───────────────────────────────────────────────────────

function Month({ ym, start, end, today, onPick }: { ym: [number, number]; start: string; end: string | null; today: string; onPick: (day: string) => void }) {
  const cells = calendarCells(ym[0], ym[1], start, end, today);
  return (
    <div>
      <div className="mb-1 grid grid-cols-[repeat(7,36px)] text-center text-[12px]/[24px] font-semibold text-muted">
        {WEEK_HEAD.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(7,36px)] gap-y-1">
        {cells.map((c, i) =>
          c.day ? (
            <div
              key={c.day}
              className={cx("h-9", c.inRange && "bg-brand-50")}
              style={
                c.inRange
                  ? {
                      borderTopLeftRadius: c.roundL ? 10 : 0,
                      borderBottomLeftRadius: c.roundL ? 10 : 0,
                      borderTopRightRadius: c.roundR ? 10 : 0,
                      borderBottomRightRadius: c.roundR ? 10 : 0,
                    }
                  : undefined
              }
            >
              <button
                type="button"
                disabled={c.future}
                onClick={() => onPick(c.day!)}
                aria-pressed={c.edge}
                aria-label={c.day}
                className={cx(
                  "num grid size-9 place-items-center rounded-[10px] text-[14px]/[20px] outline-none transition-colors",
                  c.edge
                    ? "bg-brand-700 font-bold text-white"
                    : c.future
                      ? "cursor-not-allowed font-medium text-[#A8A29E]"
                      : c.inRange
                        ? "font-semibold text-brand-700 hover:bg-brand-100"
                        : "font-medium text-ink hover:bg-fill",
                )}
              >
                {c.n}
              </button>
            </div>
          ) : (
            <span key={`e${i}`} className="h-9" />
          ),
        )}
      </div>
    </div>
  );
}

// ── Desktop ──────────────────────────────────────────────────────────────

function DesktopPicker() {
  const { range, today } = useCurrentRange();
  const apply = useApplyRange();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ key: range.key as RangeKey, start: range.start, end: range.end, compare: range.compare });
  const [left, setLeft] = useState<[number, number]>(shiftMonth(monthOf(range.end), -1));
  const wrapRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setDraft({ key: range.key as RangeKey, start: range.start, end: range.end, compare: range.compare });
    setLeft(shiftMonth(monthOf(range.end), -1));
  };
  const close = () => setOpen(false);
  useOutsidePointer([wrapRef], close, open);
  useEscape(open, close);

  const right = shiftMonth(left, 1);
  const todayMonth = monthOf(today);
  const canNext = right[0] * 12 + right[1] < todayMonth[0] * 12 + todayMonth[1];
  const end = draft.end ?? draft.start;
  const info = buildRange(draft.key, draft.start, end, draft.compare);

  const pickPreset = (key: RangeKey) => {
    if (key === "custom") {
      setDraft((d) => ({ ...d, key }));
      return;
    }
    const [a, b] = presetDays(key, today);
    setDraft((d) => ({ ...d, key, start: a, end: b }));
    setLeft(shiftMonth(monthOf(b), -1));
  };

  const pickDay = (day: string) => {
    setDraft((d) => {
      if (d.end === null) {
        const [a, b] = day < d.start ? [day, d.start] : [d.start, day];
        return { ...d, key: "custom", start: a, end: b };
      }
      return { ...d, key: "custom", start: day, end: null };
    });
  };

  return (
    <div ref={wrapRef} className="relative flex-none">
      <DesktopTrigger
        label={range.label}
        text={range.text}
        open={open}
        onClick={() => {
          if (!open) reset();
          setOpen(!open);
        }}
      />
      {open ? (
        <div
          role="dialog"
          aria-label="Date range"
          className="absolute right-0 top-[54px] z-40 w-[768px] max-w-[calc(100vw-280px)] animate-pop-in overflow-hidden rounded-card border border-line bg-white shadow-pop"
        >
          <div className="flex">
            <div className="flex w-[200px] flex-none flex-col gap-0.5 border-r border-line p-3">
              {RANGE_PRESETS.map((p) => {
                const on = draft.key === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => pickPreset(p.key)}
                    aria-pressed={on}
                    className={cx(
                      "flex h-10 items-center rounded-[10px] px-3 text-left text-[15px]/[20px] outline-none transition-colors",
                      on ? "bg-brand-50 font-semibold text-brand-700" : "font-medium text-ink-2 hover:bg-fill hover:text-ink",
                    )}
                  >
                    {p.label}
                    {on ? <Check size={18} strokeWidth={1.75} className="ml-auto flex-none" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
            <div className="min-w-0 flex-1 px-5 pb-[18px] pt-4">
              <div className="mb-2.5 flex items-center">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setLeft((l) => shiftMonth(l, -1))}
                  className="grid size-9 flex-none place-items-center rounded-[10px] border border-line text-ink-2 hover:bg-fill"
                >
                  <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
                <div className="grid flex-1 grid-cols-2 gap-6 text-center text-[15px]/[22px] font-bold text-ink">
                  <span>{fmtMonth(monthDay(left))}</span>
                  <span>{fmtMonth(monthDay(right))}</span>
                </div>
                <button
                  type="button"
                  aria-label="Next month"
                  disabled={!canNext}
                  onClick={() => setLeft((l) => shiftMonth(l, 1))}
                  className="grid size-9 flex-none place-items-center rounded-[10px] border border-line text-ink-2 hover:bg-fill disabled:cursor-not-allowed disabled:text-[#A8A29E] disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-[252px_252px] justify-center gap-6">
                <Month ym={left} start={draft.start} end={draft.end} today={today} onPick={pickDay} />
                <Month ym={right} start={draft.start} end={draft.end} today={today} onPick={pickDay} />
              </div>
              <div className="mt-3.5 flex items-center gap-2 text-[13px]/[18px] font-medium text-muted">
                <CalendarRange size={18} strokeWidth={1.75} className="flex-none text-brand-700" aria-hidden="true" />
                <span className="num text-[14px]/[20px] font-semibold text-ink">{fmtRange(draft.start, end)}</span>· {dayDiff(draft.start, end) + 1}{" "}
                {dayDiff(draft.start, end) === 0 ? "day" : "days"}
                {draft.end === null ? <span className="text-muted">· pick the last day</span> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-line bg-page px-5 py-3.5">
            <Toggle checked={draft.compare} onChange={(c) => setDraft((d) => ({ ...d, compare: c }))} label="Compare with previous period" />
            <div className="flex min-w-0 flex-col">
              <span className="text-[15px]/[20px] font-semibold text-ink">Compare with previous period</span>
              <span className="num text-[13px]/[18px] font-medium text-muted">{info.prevText}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="px-[18px]"
                onClick={() => {
                  apply({ key: draft.key, start: draft.start, end, compare: draft.compare });
                  close();
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Mobile ───────────────────────────────────────────────────────────────

function MobilePicker() {
  const { range, today } = useCurrentRange();
  const apply = useApplyRange();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<RangeKey>(range.key as RangeKey);
  const [compare, setCompare] = useState(range.compare);
  const [from, setFrom] = useState(range.start);
  const [to, setTo] = useState(range.end);

  const [a, b] = key === "custom" ? presetDays("custom", today, from, to) : presetDays(key, today);
  const info = buildRange(key, a, b, compare);

  return (
    <>
      <MobileTrigger
        label={range.label}
        text={range.shortText}
        onClick={() => {
          setKey(range.key as RangeKey);
          setCompare(range.compare);
          setFrom(range.start);
          setTo(range.end);
          setOpen(true);
        }}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title="Date range" className="pb-[max(30px,env(safe-area-inset-bottom))]">
        <div role="radiogroup" aria-label="Date range" className="flex flex-col">
          {RANGE_PRESETS.map((p) => {
            const on = key === p.key;
            return (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setKey(p.key)}
                className={cx(
                  "flex h-[52px] items-center gap-3 text-left outline-none",
                  on ? "-mx-2 rounded-control bg-brand-50 px-2" : "border-b border-fill",
                )}
              >
                <RadioMark checked={on} size="lg" />
                <span className={cx("min-w-0 flex-1 text-[16px]/[24px]", on ? "font-semibold text-brand-700" : "font-medium text-ink")}>{p.label}</span>
                {p.key === "custom" ? (
                  <span className={cx("flex items-center gap-0.5 text-[13px]/[18px] font-medium", on ? "text-brand-700" : "text-muted")}>
                    Pick dates
                    <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                ) : (
                  <span className={cx("num text-[13px]/[18px] font-medium", on ? "text-brand-700" : "text-muted")}>{presetHint(p.key, today)}</span>
                )}
              </button>
            );
          })}
        </div>
        {key === "custom" ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-[13px]/[18px] font-semibold text-ink-2">
              From
              <input
                type="date"
                value={from}
                max={to || today}
                onChange={(e) => setFrom(e.target.value)}
                className="num h-12 rounded-control border border-line bg-white px-3 text-[16px]/[24px] font-normal text-ink outline-none focus:border-[1.5px] focus:border-brand-700 focus:!shadow-input-focus"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px]/[18px] font-semibold text-ink-2">
              To
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className="num h-12 rounded-control border border-line bg-white px-3 text-[16px]/[24px] font-normal text-ink outline-none focus:border-[1.5px] focus:border-brand-700 focus:!shadow-input-focus"
              />
            </label>
          </div>
        ) : null}
        <div className="mt-2 flex items-center gap-3 border-t border-line py-3.5">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[16px]/[24px] font-semibold text-ink">Compare with previous period</span>
            <span className="num text-[13px]/[18px] font-medium text-muted">{info.prevText}</span>
          </div>
          <Toggle checked={compare} onChange={setCompare} label="Compare with previous period" />
        </div>
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            apply({ key, start: a, end: b, compare });
            setOpen(false);
          }}
        >
          Apply
        </Button>
      </Sheet>
    </>
  );
}

export interface DateRangePickerProps {
  /** desktop: 44 px trigger + 768 px popover · mobile: full-width 48 px trigger + bottom sheet. */
  variant?: "desktop" | "mobile";
}

/**
 * The stats date range, kept in the URL (?range=last30&compare=1, or
 * ?range=custom&from=…&to=…). Wrap in <Suspense> on statically rendered pages
 * (it reads useSearchParams); PageTop already does.
 */
export function DateRangePicker({ variant = "desktop" }: DateRangePickerProps) {
  return variant === "desktop" ? <DesktopPicker /> : <MobilePicker />;
}
