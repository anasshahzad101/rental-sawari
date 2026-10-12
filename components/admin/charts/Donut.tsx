import * as React from "react";
import { fmtNum } from "@/lib/admin/format";
import { cx } from "../ui/cx";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface DonutProps {
  /** Up to 3 slices (Phone #0F766E · Desktop #14B8A6 · Tablet #99F6E4). */
  slices: DonutSlice[];
  /** Word under the total ("opens"). */
  centerLabel?: string;
  className?: string;
}

const CX = 156;
const CY = 130;
const R = 72;
const STROKE = 26;
const GAP = 2.5;
const C = 2 * Math.PI * R;

interface Label {
  key: string;
  line: string;
  x: number;
  anchor: "start" | "end";
  y1: number;
  y2: number;
  title: string;
  value: string;
  frac: number;
  right: boolean;
  elbowY: number;
}

function layoutLabels(slices: DonutSlice[], total: number): Label[] {
  let cum = 0;
  const out: Label[] = slices.map((s) => {
    const frac = total ? s.value / total : 0;
    const mid = (cum + frac / 2) * 2 * Math.PI;
    cum += frac;
    const sx = Math.sin(mid);
    const sy = -Math.cos(mid);
    const p1 = { x: CX + 88 * sx, y: CY + 88 * sy };
    const p2 = { x: CX + 100 * sx, y: CY + 100 * sy };
    const right = sx >= 0;
    const p3x = p2.x + (right ? 10 : -10);
    return {
      key: s.key,
      line: `M${p1.x.toFixed(1)},${p1.y.toFixed(1)}L${p2.x.toFixed(1)},${p2.y.toFixed(1)}H${p3x.toFixed(1)}`,
      x: p3x + (right ? 4 : -4),
      anchor: right ? "start" : "end",
      y1: p2.y - 3.6,
      y2: p2.y + 15.4,
      title: s.label,
      value: `${Math.round(frac * 100)}% · ${fmtNum(s.value)}`,
      frac,
      right,
      elbowY: p2.y,
    };
  });

  // Labels on the same side that would overlap: send the smaller slice the
  // other way with a short upward/downward elbow (as the design does for Tablet).
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < out.length; j++) {
      if (i === j) continue;
      const a = out[i];
      const b = out[j];
      if (a.right !== b.right || Math.abs(a.elbowY - b.elbowY) >= 38 || a.frac > b.frac) continue;
      // a is the smaller of an overlapping pair: flip it.
      let cum = 0;
      for (const s of slices) {
        const frac = total ? s.value / total : 0;
        if (s.key === a.key) {
          const mid = (cum + frac / 2) * 2 * Math.PI;
          const sx = Math.sin(mid);
          const sy = -Math.cos(mid);
          const p1 = { x: CX + 88 * sx, y: CY + 88 * sy };
          const up = sy < 0;
          const p2 = { x: p1.x + 0.5, y: p1.y + (up ? -16 : 16) };
          const right = !a.right;
          const p3x = p2.x + (right ? 19 : -19);
          out[i] = {
            ...a,
            line: `M${p1.x.toFixed(1)},${p1.y.toFixed(1)}L${p2.x.toFixed(1)},${p2.y.toFixed(1)}H${p3x.toFixed(1)}`,
            x: p3x + (right ? 4 : -4),
            anchor: right ? "start" : "end",
            y1: p2.y - 4,
            y2: p2.y + 14,
            right,
            elbowY: p2.y,
          };
          break;
        }
        cum += frac;
      }
    }
  }
  return out;
}

/** Devices donut: r 72, stroke 26, 2.5 px gaps, total in the centre, labels outside with leader lines. */
export function Donut({ slices, centerLabel = "opens", className }: DonutProps) {
  const total = slices.reduce((t, s) => t + s.value, 0);
  let cum = 0;
  const arcs = slices.map((s) => {
    const frac = total ? s.value / total : 0;
    const len = Math.max(frac > 0 ? 0.5 : 0, frac * C - (slices.length > 1 ? GAP : 0));
    const off = -cum * C;
    cum += frac;
    return { key: s.key, color: s.color, len, off };
  });
  const labels = total ? layoutLabels(slices.filter((s) => s.value > 0), total) : [];

  return (
    <svg
      viewBox="0 0 312 260"
      width="100%"
      className={cx("block max-w-[312px]", className)}
      role="img"
      aria-label={slices.map((s) => `${s.label} ${total ? Math.round((s.value / total) * 100) : 0}%`).join(", ")}
      style={{ fontFamily: "inherit" }}
    >
      <g transform={`rotate(-90 ${CX} ${CY})`} fill="none" strokeWidth={STROKE}>
        {total ? (
          arcs.map((a) => (
            <circle key={a.key} cx={CX} cy={CY} r={R} stroke={a.color} strokeDasharray={`${a.len.toFixed(1)} ${C.toFixed(1)}`} strokeDashoffset={a.off.toFixed(1)} />
          ))
        ) : (
          <circle cx={CX} cy={CY} r={R} stroke="#F5F5F4" />
        )}
      </g>
      <text x={CX} y={CY + 2} textAnchor="middle" className="num" style={{ font: "800 24px var(--font-inter), Inter, sans-serif", fill: "#1C1917" }}>
        {fmtNum(total)}
      </text>
      <text x={CX} y={CY + 22} textAnchor="middle" style={{ font: "500 13px var(--font-inter), Inter, sans-serif", fill: "#78716C" }}>
        {centerLabel}
      </text>
      {labels.map((l) => (
        <g key={l.key}>
          <path d={l.line} fill="none" stroke="#A8A29E" strokeWidth={1} />
          <text x={l.x.toFixed(1)} y={l.y1.toFixed(1)} textAnchor={l.anchor} style={{ font: "500 13px var(--font-inter), Inter, sans-serif", fill: "#44403C" }}>
            {l.title}
          </text>
          <text x={l.x.toFixed(1)} y={l.y2.toFixed(1)} textAnchor={l.anchor} className="num" style={{ font: "700 15px var(--font-inter), Inter, sans-serif", fill: "#1C1917" }}>
            {l.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Mobile devices summary: a 12 px 3-part bar, then "Phone 84%  Desktop 14%  Tablet 2%". */
export function DevicesBar({ slices, className }: { slices: DonutSlice[]; className?: string }) {
  const total = slices.reduce((t, s) => t + s.value, 0);
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  return (
    <div className={className}>
      <div className="mb-2.5 mt-3.5 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {total ? (
          slices.map((s, i) =>
            s.value ? (
              <span
                key={s.key}
                className={i === slices.length - 1 ? "flex-1" : undefined}
                style={{ width: i === slices.length - 1 ? undefined : `${(s.value / total) * 100}%`, background: s.color }}
              />
            ) : null,
          )
        ) : (
          <span className="flex-1 bg-fill" />
        )}
      </div>
      <div className="num flex justify-between gap-2 text-label text-ink-2">
        {slices.map((s) => (
          <span key={s.key}>
            {s.label} <b className="text-[15px] font-bold text-ink">{pct(s.value)}%</b>
          </span>
        ))}
      </div>
    </div>
  );
}
