import * as React from "react";
import { sparkPaths } from "./scale";

export interface SparklineProps {
  values: number[];
  /** Drawing width (viewBox). With `fluid`, the SVG stretches to 100% of its box. */
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
  strokeWidth?: number;
  /** Stretch to the container width (stat cards). */
  fluid?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** 30-point trend line with an 8% area (200 × 40 in stat cards, 80 × 24 in tables). */
export function Sparkline({
  values,
  width = 200,
  height = 40,
  color = "#0F766E",
  area = true,
  strokeWidth = 1.75,
  fluid = false,
  className,
  style,
}: SparklineProps) {
  const { line, area: areaPath } = sparkPaths(values, width, height);
  return (
    <svg
      width={fluid ? "100%" : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={fluid ? "none" : undefined}
      aria-hidden="true"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {area ? <path d={areaPath} fill={color} fillOpacity={0.08} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect={fluid ? "non-scaling-stroke" : undefined}
      />
    </svg>
  );
}
