"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { fmtDayLong, fmtDayShort, fmtNum } from "@/lib/admin/format";
import { cx } from "../ui/cx";
import { useElementWidth } from "../ui/hooks";
import { f1, labelWidth, niceStep, pickTicks } from "./scale";

export interface StackedBarProps {
  days: string[];
  wa: number[];
  call: number[];
  form: number[];
  /** Plot height (default 200 desktop / 150 compact). */
  height?: number;
  className?: string;
}

const COL = { wa: "#25D366", call: "#0F766E", form: "#EA580C" };

/** Per-day WhatsApp / Call / Form stacked columns, 1 px gap between segments. */
export function StackedBar({ days, wa, call, form, height, className }: StackedBarProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const compact = width != null && width < 440;
  const H = height ?? (compact ? 150 : 200);
  const W = width ?? 0;
  const n = days.length;
  const totals = useMemo(() => days.map((_, i) => (wa[i] ?? 0) + (call[i] ?? 0) + (form[i] ?? 0)), [days, wa, call, form]);
  const stp = niceStep(Math.max(1, ...totals));
  const T = 8;
  const B = 28;
  const L = Math.max(compact ? 24 : 28, labelWidth(fmtNum(stp * 4)) + 10);
  const pw = Math.max(1, W - L);
  const ph = H - T - B;
  const base = T + ph;
  const y = (v: number) => (v / (stp * 4)) * ph;
  const bwid = pw / Math.max(1, n);
  const bw = bwid * 0.62;

  const paths = useMemo(() => {
    if (!W) return null;
    const seg = (i: number, v0: number, v: number) => {
      if (!v) return "";
      const x0 = L + i * bwid + (bwid - bw) / 2;
      const g = v0 ? 1 : 0;
      const yb = base - y(v0) - g;
      const yt = base - y(v0 + v);
      if (yt >= yb) return "";
      return `M${f1(x0)},${f1(yb)}V${f1(yt)}H${f1(x0 + bw)}V${f1(yb)}Z`;
    };
    return {
      wa: wa.map((v, i) => seg(i, 0, v)).join(""),
      call: call.map((v, i) => seg(i, wa[i] ?? 0, v)).join(""),
      form: form.map((v, i) => seg(i, (wa[i] ?? 0) + (call[i] ?? 0), v)).join(""),
      grid: [0, 1, 2, 3, 4].map((k) => `M${L},${f1(base - y(stp * k))}H${W}`).join(""),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H, wa, call, form, L, stp, n]);

  const ticks = pickTicks(n, compact);
  const tipW = 200;
  const hx = hover != null ? L + (hover + 0.5) * bwid : 0;

  return (
    <div ref={ref} className={cx("relative w-full", className)} style={{ height: H }}>
      {W && paths ? (
        <>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute left-0 top-0 block" aria-hidden="true">
            <path d={paths.grid} fill="none" stroke="#E7E5E4" strokeWidth={1} />
            {hover != null ? (
              <rect x={f1(L + hover * bwid)} y={T} width={f1(bwid)} height={ph} fill="#F5F5F4" />
            ) : null}
            <path d={paths.wa} fill={COL.wa} />
            <path d={paths.call} fill={COL.call} />
            <path d={paths.form} fill={COL.form} />
          </svg>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} className="num absolute left-0 text-right text-[12px]/[16px] font-medium text-muted" style={{ top: base - y(stp * k) - 8, width: L - 8 }}>
              {fmtNum(stp * k)}
            </div>
          ))}
          {ticks.map((i) => (
            <div
              key={`x${i}`}
              className="absolute w-[60px] text-center text-[12px]/[16px] font-medium text-muted"
              style={{ top: base + 8, left: Math.max(0, Math.min(L + (i + 0.5) * bwid - 30, W - 60)) }}
            >
              {fmtDayShort(days[i])}
            </div>
          ))}
          <div
            className="absolute inset-0 touch-pan-y"
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const r = e.currentTarget.getBoundingClientRect();
              const i = Math.floor((e.clientX - r.left - L) / bwid);
              setHover(i >= 0 && i < n ? i : null);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setHover(null);
            }}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const i = Math.floor((e.clientX - r.left - L) / bwid);
              setHover(i >= 0 && i < n ? (hover === i ? null : i) : null);
            }}
          />
          {hover != null ? (
            <div
              className="num pointer-events-none absolute z-10 flex flex-col gap-1 rounded-control border border-line bg-white px-3 py-2.5 text-[13px]/[18px] font-medium text-ink-2 shadow-[0_12px_32px_-12px_rgba(28,25,23,0.3),0_2px_4px_rgba(28,25,23,0.04)]"
              style={{
                width: tipW,
                top: T,
                left: hx + 12 + tipW < W ? hx + 12 : Math.max(0, hx - 12 - tipW),
              }}
            >
              <div className="text-[13px]/[18px] font-bold text-ink">{fmtDayLong(days[hover])}</div>
              {(
                [
                  ["WhatsApp", wa[hover], COL.wa],
                  ["Call", call[hover], COL.call],
                  ["Inquiry form", form[hover], COL.form],
                ] as const
              ).map(([label, v, c]) => (
                <div key={label} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: c }} />
                  {label}
                  <span className="ml-auto font-bold text-ink">{fmtNum(v ?? 0)}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-fill pt-1">
                Total
                <span className="ml-auto font-bold text-ink">{fmtNum(totals[hover])}</span>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
