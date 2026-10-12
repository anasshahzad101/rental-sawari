import * as React from "react";
import { cx } from "../ui/cx";

export interface CompletenessRingProps {
  /** 0–100. */
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}

/** Profile completeness ring: #F5F5F4 track, teal progress with a round cap, % in the middle. */
export function CompletenessRing({ pct, size = 112, stroke = 12, color = "#0F766E", className }: CompletenessRingProps) {
  // Drawn on the design's 112 box (r 46) and scaled to `size`.
  const box = 112;
  const r = box / 2 - stroke / 2 - 4;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className={cx("relative flex-none", className)} style={{ width: size, height: size }} role="img" aria-label={`${Math.round(p)}% complete`}>
      <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke="#F5F5F4" strokeWidth={stroke} />
        {p > 0 ? (
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}`}
            transform={`rotate(-90 ${box / 2} ${box / 2})`}
          />
        ) : null}
      </svg>
      <span
        className="num absolute inset-0 grid place-items-center font-extrabold leading-none text-ink"
        style={{ fontSize: size >= 100 ? 24 : 17 }}
      >
        {Math.round(p)}%
      </span>
    </div>
  );
}
