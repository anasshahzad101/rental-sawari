"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { ChartLine } from "lucide-react";
import type { StatInfoKey } from "@/lib/admin/constants";
import { fmtDayDow, fmtDayLong, fmtDayShort, fmtNum, fmtRange } from "@/lib/admin/format";
import { cx } from "../ui/cx";
import { useElementWidth } from "../ui/hooks";
import { InfoTooltip, type InfoContent } from "../ui/Tooltip";
import { Segmented } from "../ui/controls";
import { f1, labelWidth, niceStep, pickTicks, sumRange, weekBuckets } from "./scale";

export type Grain = "day" | "week";

export interface LineChartProps {
  /** YYYY-MM-DD, PKT. */
  days: string[];
  opened: number[];
  contacted: number[];
  /** Shown, drawn as columns on their own right axis. */
  shown?: number[];
  /** Same length as `days`: the matching day in the previous period. */
  prevOpened?: number[];
  prevDays?: string[];
  /** Days before tracking began (hatched, "Before tracking began"). */
  untracked?: boolean[];
  /** Plot height in px (default 300 desktop, 200 compact). */
  height?: number;
  /** Chip label for the dashed series ("Opened, previous 30 days"). Mobile says "Previous". */
  prevLabel?: string;
  /** Draw the right-hand Shown axis (default: when `shown` is given). */
  showShownAxis?: boolean;
  title?: React.ReactNode;
  info?: StatInfoKey | InfoContent;
  /** "Per day · 13 Sep – 12 Oct 2026" (desktop only). */
  subtitle?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyBody?: React.ReactNode;
  /** Day / Week switch (default shown). */
  showGrain?: boolean;
  defaultGrain?: Grain;
  /** Index hovered on first paint (the design shows day 26). Compact mode defaults to the last day. */
  defaultHover?: number;
  className?: string;
}

type SeriesKey = "shown" | "opened" | "contacted" | "prev";

const C = { opened: "#0F766E", contacted: "#EA580C", shown: "#99F6E4", prev: "#A8A29E", grid: "#E7E5E4", guide: "#44403C" };

function Swatch({ k, compact }: { k: SeriesKey; compact?: boolean }) {
  if (k === "shown") return <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px] bg-chart-shown" />;
  if (k === "prev")
    return (
      <svg aria-hidden="true" width={compact ? 12 : 16} height={4} className="flex-none">
        <path d={`M0,2H${compact ? 12 : 16}`} stroke={C.prev} strokeWidth={2} strokeDasharray={compact ? "3 2" : "4 3"} />
      </svg>
    );
  return (
    <span
      aria-hidden="true"
      className={cx("h-[3px] flex-none rounded-sm", compact ? "w-3" : "w-3.5")}
      style={{ background: k === "opened" ? C.opened : C.contacted }}
    />
  );
}

/**
 * Opened (#0F766E line + 7% area) and Contacted (#EA580C) per day on the left
 * axis, Shown as light-teal columns on a right axis, the previous period
 * dashed. Hover (or tap on mobile) shows a guide line, ring dots and a card.
 */
export function LineChart({
  days,
  opened,
  contacted,
  shown,
  prevOpened,
  prevDays,
  untracked,
  height,
  prevLabel = "Opened, previous 30 days",
  showShownAxis,
  title,
  info,
  subtitle,
  emptyTitle = "No visits counted yet",
  emptyBody = "The first day appears here as soon as someone opens a listing.",
  showGrain = true,
  defaultGrain = "day",
  defaultHover,
  className,
}: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [grain, setGrain] = useState<Grain>(defaultGrain);
  const [vis, setVis] = useState<Record<SeriesKey, boolean>>({ shown: true, opened: true, contacted: true, prev: true });
  const pid = useId().replace(/[^a-zA-Z0-9]/g, "");

  // ── Data at the chosen grain ──
  const data = useMemo(() => {
    const n = days.length;
    const skip = untracked ?? [];
    if (grain === "day") {
      return {
        n,
        label: days.map((d) => fmtDayShort(d)),
        tipDate: days.map((d) => fmtDayLong(d)),
        stripDate: days.map((d) => fmtDayLong(d)),
        prevDate: (prevDays ?? []).map((d) => fmtDayDow(d)),
        opened,
        contacted,
        shown: shown ?? null,
        prev: prevOpened ?? null,
        untracked: days.map((_, i) => !!skip[i]),
      };
    }
    const b = weekBuckets(n);
    return {
      n: b.length,
      label: b.map(([s]) => fmtDayShort(days[s])),
      tipDate: b.map(([s, e]) => (s === e ? fmtDayLong(days[s]) : fmtRange(days[s], days[e], { compressMonth: true }))),
      stripDate: b.map(([s, e]) => (s === e ? fmtDayLong(days[s]) : fmtRange(days[s], days[e], { compressMonth: true }))),
      prevDate: prevDays && prevDays.length ? b.map(([s, e]) => fmtRange(prevDays[s], prevDays[e] ?? prevDays[prevDays.length - 1], { year: false, compressMonth: true })) : [],
      opened: b.map(([s, e]) => sumRange(opened, s, e)),
      contacted: b.map(([s, e]) => sumRange(contacted, s, e)),
      shown: shown ? b.map(([s, e]) => sumRange(shown, s, e)) : null,
      prev: prevOpened ? b.map(([s, e]) => sumRange(prevOpened, s, e)) : null,
      untracked: b.map(([s, e]) => {
        for (let i = s; i <= e; i++) if (!skip[i]) return false;
        return true;
      }),
    };
  }, [grain, days, opened, contacted, shown, prevOpened, prevDays, untracked]);

  const compact = width != null && width < 640;
  const lastTracked = useMemo(() => {
    for (let i = data.n - 1; i >= 0; i--) if (!data.untracked[i]) return i;
    return null;
  }, [data]);
  const [hover, setHover] = useState<number | null>(defaultHover ?? null);
  useEffect(() => {
    setHover(compact ? (defaultHover != null && grain === "day" ? defaultHover : lastTracked) : grain === "day" ? defaultHover ?? null : null);
  }, [grain, compact, lastTracked, defaultHover]);

  const total = useMemo(() => {
    let t = 0;
    for (let i = 0; i < data.n; i++) {
      if (data.untracked[i]) continue;
      t += (data.opened[i] ?? 0) + (data.contacted[i] ?? 0) + (data.shown?.[i] ?? 0);
    }
    return t;
  }, [data]);
  const empty = data.n === 0 || (total === 0 && data.untracked.some((u) => !u));

  const hasShown = !!data.shown;
  const axisShown = hasShown && (showShownAxis ?? true);
  const hasPrev = !!data.prev && data.prev.length > 0;
  const H = height ?? (compact ? 200 : 300);

  // ── Header & chips ──
  const header =
    title != null || (showGrain && !empty) ? (
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {title != null ? (
            <div className="flex items-center gap-1.5 text-card-title-m text-ink lg:text-card-title">
              {title}
              {info ? <InfoTooltip info={info} /> : null}
            </div>
          ) : null}
          {subtitle != null ? <div className="num text-label text-muted max-lg:hidden">{subtitle}</div> : null}
        </div>
        {showGrain && !empty ? (
          <Segmented
            size="sm"
            value={grain}
            onChange={setGrain}
            aria-label="Group by"
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
            ]}
          />
        ) : null}
      </div>
    ) : null;

  const chipKeys: SeriesKey[] = [...(hasShown ? (["shown"] as const) : []), "opened", "contacted", ...(hasPrev ? (["prev"] as const) : [])];
  const chipLabel = (k: SeriesKey) =>
    k === "shown" ? "Shown" : k === "opened" ? "Opened" : k === "contacted" ? "Contacted" : compact ? "Previous" : prevLabel;

  const chips = empty ? null : (
    <div
      className={cx(
        "flex gap-2",
        compact ? "-mr-4 my-3 overflow-x-auto pr-4 scrollbar-hide" : cx("mt-4 flex-wrap", axisShown ? "mb-2" : "mb-3"),
      )}
    >
      {chipKeys.map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={vis[k]}
          onClick={() => setVis((v) => ({ ...v, [k]: !v[k] }))}
          className={cx(
            "inline-flex flex-none select-none items-center rounded-full border border-line bg-white px-3 text-[13px]/[18px] font-semibold text-ink outline-none transition-opacity",
            compact ? "h-9 gap-1.5" : "h-8 gap-2",
            !vis[k] && "opacity-45",
          )}
        >
          <Swatch k={k} compact={compact} />
          {chipLabel(k)}
        </button>
      ))}
    </div>
  );

  // ── Geometry ──
  const W = width ?? 0;
  const n = data.n;
  const T = compact ? 12 : axisShown ? 30 : 16;
  const B = compact ? 28 : 32;
  const R = compact ? (axisShown ? 40 : 8) : axisShown ? 56 : 16;
  const tracked = (i: number) => !data.untracked[i];
  const leftMax = Math.max(
    1,
    ...data.opened.map((v, i) => (tracked(i) ? v : 0)),
    ...data.contacted.map((v, i) => (tracked(i) ? v : 0)),
    ...(data.prev ?? []),
  );
  const ls = niceStep(leftMax);
  const rs = niceStep(Math.max(1, ...(data.shown ?? []).map((v, i) => (tracked(i) ? v : 0))));
  const L = Math.max(compact ? (axisShown ? 28 : 40) : axisShown ? 40 : 56, labelWidth(fmtNum(ls * 4)) + 12);
  const pw = Math.max(1, W - L - R);
  const ph = H - T - B;
  const base = T + ph;
  const bwid = pw / Math.max(1, n);
  const x = (i: number) => L + (i + 0.5) * bwid;
  const yl = (v: number) => base - (v / (ls * 4)) * ph;
  const yr = (v: number) => base - (v / (rs * 4)) * ph;
  const bw = bwid * 0.56;

  const paths = useMemo(() => {
    if (!W || empty) return null;
    const line = (vals: number[], skipUntracked: boolean) => {
      let d = "";
      let pen = false;
      vals.forEach((v, i) => {
        if (skipUntracked && data.untracked[i]) {
          pen = false;
          return;
        }
        d += `${pen ? "L" : "M"}${f1(x(i))},${f1(yl(v))}`;
        pen = true;
      });
      return d;
    };
    const area = (vals: number[]) => {
      let d = "";
      let i = 0;
      while (i < n) {
        if (data.untracked[i]) {
          i++;
          continue;
        }
        const s = i;
        while (i < n && !data.untracked[i]) i++;
        const e = i - 1;
        let seg = "";
        for (let k = s; k <= e; k++) seg += `${k === s ? "M" : "L"}${f1(x(k))},${f1(yl(vals[k]))}`;
        d += `${seg}L${f1(x(e))},${f1(base)}L${f1(x(s))},${f1(base)}Z`;
      }
      return d;
    };
    const bar = (i: number, v: number) => {
      const y = yr(v);
      const x0 = x(i) - bw / 2;
      const r = Math.min(2, bw / 2, Math.max(0, base - y));
      return `M${f1(x0)},${f1(base)}V${f1(y + r)}Q${f1(x0)},${f1(y)} ${f1(x0 + r)},${f1(y)}H${f1(x0 + bw - r)}Q${f1(x0 + bw)},${f1(y)} ${f1(x0 + bw)},${f1(y + r)}V${f1(base)}Z`;
    };
    const hatch: Array<{ x: number; w: number }> = [];
    let i = 0;
    while (i < n) {
      if (!data.untracked[i]) {
        i++;
        continue;
      }
      const s = i;
      while (i < n && data.untracked[i]) i++;
      hatch.push({ x: L + s * bwid, w: (i - s) * bwid });
    }
    return {
      grid: [0, 1, 2, 3, 4].map((k) => `M${L},${f1(yl(ls * k))}H${W - R}`).join(""),
      opened: line(data.opened, true),
      contacted: line(data.contacted, true),
      area: area(data.opened),
      prev: data.prev ? line(data.prev, false) : "",
      bars: data.shown ? data.shown.map((v, k) => (k === hover || data.untracked[k] || !v ? "" : bar(k, v))).join("") : "",
      barHi: data.shown && hover != null && data.shown[hover] ? bar(hover, data.shown[hover]) : "",
      hatch,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H, data, hover, empty, L, R, ls, rs, n]);

  const ticks = pickTicks(n, compact);
  const gx = hover != null ? x(hover) : 0;
  const tipW = 240;

  const pick = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const i = Math.floor((clientX - r.left - L) / bwid);
    if (i < 0 || i >= n) return null;
    return data.untracked[i] ? null : i;
  };

  const val = (a: number[] | null, i: number) => fmtNum(a?.[i] ?? 0);

  return (
    <div className={cx("min-w-0", className)}>
      {header}
      {chips}
      {compact && !empty && hover != null ? (
        <div className="num mb-2 flex flex-wrap gap-x-3 gap-y-1 rounded-[10px] bg-fill px-2.5 py-2 text-[13px]/[18px] font-medium text-ink-2">
          <span className="font-bold text-ink">{data.stripDate[hover]}</span>
          {vis.opened ? (
            <span>
              Opened <b className="text-ink">{val(data.opened, hover)}</b>
            </span>
          ) : null}
          {vis.contacted ? (
            <span>
              Contacted <b className="text-ink">{val(data.contacted, hover)}</b>
            </span>
          ) : null}
          {hasShown && vis.shown ? (
            <span>
              Shown <b className="text-ink">{val(data.shown, hover)}</b>
            </span>
          ) : null}
        </div>
      ) : null}

      <div ref={ref} className="relative w-full" style={{ height: H }}>
        {empty ? (
          <div className={cx("relative flex h-full flex-col justify-between", title != null && "mt-0")}>
            <span className="border-t border-dashed border-line" />
            <span className="border-t border-dashed border-line" />
            <span className="border-t border-dashed border-line" />
            <span className="border-t border-dashed border-line" />
            <span className="border-t border-line" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700">
                <ChartLine size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="text-[17px]/[24px] font-bold text-ink">{emptyTitle}</div>
              <div className="text-body-m text-muted lg:text-body">{emptyBody}</div>
            </div>
          </div>
        ) : W && paths ? (
          <>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute left-0 top-0 block overflow-visible" aria-hidden="true">
              <defs>
                <pattern id={`hatch-${pid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="8" height="8" fill="#FAFAF9" />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#E7E5E4" strokeWidth="3" />
                </pattern>
              </defs>
              {paths.hatch.map((h, k) => (
                <rect key={k} x={h.x} y={T} width={h.w} height={ph} fill={`url(#hatch-${pid})`} />
              ))}
              <path d={paths.grid} fill="none" stroke={C.grid} strokeWidth={1} />
              {hasShown ? (
                <>
                  <path d={paths.bars} fill={C.shown} opacity={vis.shown ? 0.6 : 0} />
                  <path d={paths.barHi} fill={C.shown} opacity={vis.shown ? 1 : 0} />
                </>
              ) : null}
              <path d={paths.area} fill={C.opened} fillOpacity={0.07} opacity={vis.opened ? 1 : 0} />
              {hasPrev ? (
                <path
                  d={paths.prev}
                  fill="none"
                  stroke={C.prev}
                  strokeWidth={compact ? 1.5 : 1.75}
                  strokeDasharray={compact ? "4 3" : "5 4"}
                  strokeLinejoin="round"
                  opacity={vis.prev ? 1 : 0}
                />
              ) : null}
              <path
                d={paths.opened}
                fill="none"
                stroke={C.opened}
                strokeWidth={compact ? 2 : 2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={vis.opened ? 1 : 0}
              />
              <path
                d={paths.contacted}
                fill="none"
                stroke={C.contacted}
                strokeWidth={compact ? 2 : 2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={vis.contacted ? 1 : 0}
              />
              {hover != null ? (
                <>
                  <path d={`M${f1(gx)},${T}V${f1(base)}`} fill="none" stroke={C.guide} strokeWidth={1} strokeDasharray="2 3" />
                  {hasPrev && vis.prev && !compact ? (
                    <circle cx={f1(gx)} cy={f1(yl(data.prev?.[hover] ?? 0))} r={3.5} fill="#FFFFFF" stroke={C.prev} strokeWidth={2} />
                  ) : null}
                  {vis.opened ? (
                    <circle cx={f1(gx)} cy={f1(yl(data.opened[hover] ?? 0))} r={compact ? 4 : 4.5} fill="#FFFFFF" stroke={C.opened} strokeWidth={compact ? 2 : 2.25} />
                  ) : null}
                  {vis.contacted ? (
                    <circle cx={f1(gx)} cy={f1(yl(data.contacted[hover] ?? 0))} r={compact ? 4 : 4.5} fill="#FFFFFF" stroke={C.contacted} strokeWidth={compact ? 2 : 2.25} />
                  ) : null}
                </>
              ) : null}
            </svg>

            {/* Hatch labels */}
            {paths.hatch
              .filter((h) => h.w >= 110)
              .map((h, k) => (
                <div
                  key={k}
                  className="pointer-events-none absolute text-center text-[13px]/[18px] font-semibold text-quiet-text"
                  style={{ left: h.x, width: h.w, top: T + ph * 0.38 }}
                >
                  Before tracking began
                </div>
              ))}

            {/* Axis captions */}
            {axisShown && !compact ? (
              <>
                <div className="absolute left-0 top-0 text-[12px]/[16px] font-semibold text-muted">Opened · Contacted</div>
                <div className="absolute right-0 top-0 text-right text-[12px]/[16px] font-semibold text-muted">Shown</div>
              </>
            ) : null}

            {/* Y labels */}
            {[0, 1, 2, 3, 4].map((k) => (
              <div
                key={`l${k}`}
                className="num absolute left-0 text-right text-[12px]/[16px] font-medium text-muted"
                style={{ top: yl(ls * k) - 8, width: L - 8 }}
              >
                {fmtNum(ls * k)}
              </div>
            ))}
            {axisShown
              ? [0, 1, 2, 3, 4].map((k) => (
                  <div key={`r${k}`} className="num absolute text-[12px]/[16px] font-medium text-muted" style={{ top: yl(ls * k) - 8, left: W - R + 8 }}>
                    {fmtNum(rs * k)}
                  </div>
                ))
              : null}

            {/* X labels */}
            {ticks.map((i) => (
              <div
                key={`x${i}`}
                className="absolute w-[60px] text-center text-[12px]/[16px] font-medium text-muted"
                style={{ top: base + 8, left: Math.max(0, Math.min(x(i) - 30, W - 60)) }}
              >
                {data.label[i]}
              </div>
            ))}

            {/* Hit area */}
            <div
              className="absolute inset-0 touch-pan-y"
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                setHover(pick(e.clientX, e.currentTarget));
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "mouse" || compact) return;
                setHover(grain === "day" ? defaultHover ?? null : null);
              }}
              onClick={(e) => {
                const i = pick(e.clientX, e.currentTarget);
                if (i != null) setHover(i);
              }}
            />

            {/* Tooltip card (desktop) */}
            {!compact && hover != null ? (
              <div
                className="num pointer-events-none absolute flex flex-col gap-1.5 rounded-control border border-line bg-white px-3.5 py-3 text-[13px]/[18px] font-medium text-ink-2 shadow-[0_12px_32px_-12px_rgba(28,25,23,0.3),0_2px_4px_rgba(28,25,23,0.04)]"
                style={{ left: gx < W * 0.62 ? gx + 16 : gx - 16 - tipW, top: T, width: tipW }}
              >
                <div className="mb-0.5 text-[13px]/[18px] font-bold text-ink">{data.tipDate[hover]}</div>
                {hasShown && vis.shown ? (
                  <div className="flex items-center gap-2">
                    <Swatch k="shown" />
                    Shown
                    <span className="ml-auto font-bold text-ink">{val(data.shown, hover)}</span>
                  </div>
                ) : null}
                {vis.opened ? (
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-[3px] w-2.5 rounded-sm bg-chart-opened" />
                    Opened
                    <span className="ml-auto font-bold text-ink">{val(data.opened, hover)}</span>
                  </div>
                ) : null}
                {vis.contacted ? (
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-[3px] w-2.5 rounded-sm bg-chart-contacted" />
                    Contacted
                    <span className="ml-auto font-bold text-ink">{val(data.contacted, hover)}</span>
                  </div>
                ) : null}
                {hasPrev && vis.prev ? (
                  <div className="flex items-center gap-2 border-t border-fill pt-1.5 text-muted">
                    <svg aria-hidden="true" width="10" height="4" className="flex-none">
                      <path d="M0,2H10" stroke={C.prev} strokeWidth={2} strokeDasharray="3 2" />
                    </svg>
                    <span className="min-w-0 truncate">Opened on {data.prevDate[hover] ?? "previous period"}</span>
                    <span className="ml-auto font-bold text-ink-2">{val(data.prev, hover)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
