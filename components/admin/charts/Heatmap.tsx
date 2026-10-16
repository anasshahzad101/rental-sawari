"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { fmtNum } from "@/lib/admin/format";
import { cx } from "../ui/cx";
import { useElementWidth } from "../ui/hooks";
import { heatColor, hourLabel, hourRange, WEEKDAYS } from "./scale";

export interface HeatmapProps {
  /** 168 values: Mon 0h … Mon 23h, Tue 0h … Sun 23h (PKT). */
  values: number[];
  /** Singular unit for the tooltip ("open" → "41 opens"). */
  unit?: string;
  /** Selected cell [day 0–6 (Mon first), hour]. Defaults to the busiest cell. */
  defaultSel?: [number, number];
  /** Show the Fewer→More legend above the grid (default true). */
  legend?: boolean;
  className?: string;
}

/** "Fewer ■■■■■ More" */
export function HeatLegend({ className }: { className?: string }) {
  return (
    <div className={cx("flex items-center gap-1 text-[12px]/[16px] font-medium text-muted", className)} aria-hidden="true">
      Fewer
      <span className="ml-1 size-3.5 rounded-[3px] border border-line bg-heat-1" />
      <span className="size-3.5 rounded-[3px] bg-heat-2" />
      <span className="size-3.5 rounded-[3px] bg-heat-3" />
      <span className="size-3.5 rounded-[3px] bg-heat-4" />
      <span className="mr-1 size-3.5 rounded-[3px] bg-heat-5" />
      More
    </div>
  );
}

/**
 * Busiest times: Mon–Sun × 24 h, 24 px cells (gap 3, radius 5), hover a cell
 * for "Fri 8–9 PM · 41 opens". Under 640 px it turns sideways (7 columns ×
 * 24 rows) and cells are tapped.
 */
export function Heatmap({ values, unit = "open", defaultSel, legend = true, className }: HeatmapProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const max = useMemo(() => Math.max(0, ...values), [values]);
  const peak = useMemo((): [number, number] => {
    let bi = 0;
    values.forEach((v, i) => {
      if (v > (values[bi] ?? 0)) bi = i;
    });
    return [Math.floor(bi / 24), bi % 24];
  }, [values]);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [d, h] = sel ?? defaultSel ?? peak;
  const v = (day: number, hour: number) => values[day * 24 + hour] ?? 0;
  const label = (n: number) => `${fmtNum(n)} ${unit}${n === 1 ? "" : "s"}`;
  const tip = `${WEEKDAYS[d]} ${hourRange(h)} · ${label(v(d, h))}`;

  const sideways = width != null && width < 640;
  const ready = width != null;

  // Desktop geometry: 40 px day label + 8 px gap, then 24 cells.
  const LAB = 48;
  const cw = width ? Math.max(14, Math.min(24, Math.floor((width - LAB - 23 * 3) / 24))) : 24;
  const step = cw + 3;
  // Sideways geometry: 44 px hour label + 6 px gap, then 7 columns.
  const MLAB = 50;
  const mcw = width ? Math.max(24, Math.min(36, Math.floor((width - MLAB - 18) / 7))) : 36;
  const mstep = mcw + 3;

  return (
    <div ref={ref} className={cx("min-w-0", className)}>
      {!ready ? <div style={{ height: 220 }} /> : null}

      {ready && !sideways ? (
        <>
          {/* Room above the grid for the cell tooltip (40 px under the header in the design). */}
          {legend ? <HeatLegend className="mb-10 justify-end" /> : <div className="h-6" />}
          <div
            className="relative"
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setSel(null);
            }}
          >
            {WEEKDAYS.map((day, di) => (
              <div key={day} className="mb-[3px] flex items-center gap-2" style={{ height: cw }}>
                <span className="w-10 flex-none text-[12px]/[16px] font-medium text-muted">{day}</span>
                <div className="flex gap-[3px]">
                  {Array.from({ length: 24 }, (_, hi) => {
                    const val = v(di, hi);
                    const on = di === d && hi === h;
                    return (
                      <span
                        key={hi}
                        role="img"
                        aria-label={`${day} ${hourRange(hi)}: ${label(val)}`}
                        onPointerEnter={(e) => {
                          if (e.pointerType === "mouse") setSel([di, hi]);
                        }}
                        onClick={() => setSel([di, hi])}
                        className="flex-none rounded-[5px]"
                        style={{
                          width: cw,
                          height: cw,
                          background: heatColor(val, max),
                          boxShadow: on ? "0 0 0 2px #1C1917" : undefined,
                          position: on ? "relative" : undefined,
                          zIndex: on ? 1 : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div
              className="num pointer-events-none absolute z-10 w-max rounded-lg bg-ink px-2.5 py-1.5 text-[13px]/[18px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(28,25,23,0.5)]"
              style={{ left: LAB + h * step + cw / 2, top: d * step, transform: "translate(-50%, calc(-100% - 8px))" }}
            >
              {tip}
            </div>
          </div>
          <div className="mt-1 grid text-[12px]/[16px] font-medium text-muted" style={{ marginLeft: LAB, gridTemplateColumns: `repeat(8, ${3 * step}px)` }}>
            {[0, 3, 6, 9, 12, 15, 18, 21].map((hr) => (
              <span key={hr}>{hourLabel(hr)}</span>
            ))}
          </div>
        </>
      ) : null}

      {ready && sideways ? (
        <>
          {legend ? <HeatLegend className="mb-3" /> : null}
          <div className="mb-1.5 flex gap-[3px] text-center text-[12px]/[16px] font-semibold text-muted" style={{ marginLeft: MLAB }}>
            {WEEKDAYS.map((day) => (
              <span key={day} style={{ width: mcw }}>
                {day}
              </span>
            ))}
          </div>
          <div className="relative">
            {Array.from({ length: 24 }, (_, hi) => (
              <div key={hi} className="mb-0.5 flex h-3 items-center gap-1.5">
                <span className="w-11 flex-none whitespace-nowrap text-[12px]/[12px] font-medium text-muted">{hi % 3 === 0 ? hourLabel(hi) : ""}</span>
                <div className="flex gap-[3px]">
                  {WEEKDAYS.map((day, di) => {
                    const val = v(di, hi);
                    const on = di === d && hi === h;
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-label={`${day} ${hourRange(hi)}: ${label(val)}`}
                        onClick={() => setSel([di, hi])}
                        className="h-3 flex-none rounded-[3px] outline-none"
                        style={{
                          width: mcw,
                          background: heatColor(val, max),
                          boxShadow: on ? "0 0 0 2px #1C1917" : undefined,
                          position: on ? "relative" : undefined,
                          zIndex: on ? 1 : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div
              className="num pointer-events-none absolute z-10 w-max rounded-lg bg-ink px-2.5 py-1.5 text-[13px]/[18px] font-semibold text-white"
              style={{
                left: Math.min(Math.max(MLAB + d * mstep + mcw / 2, 90), (width ?? 300) - 90),
                top: h * 14,
                transform: "translate(-50%, calc(-100% - 6px))",
              }}
            >
              {tip}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
