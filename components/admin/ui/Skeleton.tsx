import * as React from "react";
import { cx } from "./cx";

export interface SkeletonProps {
  className?: string;
  /** Moving shimmer (default) or a still #F5F5F4 block. */
  shimmer?: boolean;
  style?: React.CSSProperties;
}

/** A #F5F5F4 block with the 1.4 s shimmer. Size it with classes (`h-3 w-40 rounded-md`). */
export function Skeleton({ className, shimmer = true, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cx("block rounded-lg", shimmer ? "skeleton animate-shimmer" : "bg-fill", className)}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  /** Width of the last line. */
  lastWidth?: string;
}

/** A few 12 px text lines. */
export function SkeletonText({ lines = 3, className, lastWidth = "60%" }: SkeletonTextProps) {
  return (
    <span className={cx("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded-md"
          shimmer={i === 0}
          style={{ width: i === lines - 1 && lines > 1 ? lastWidth : "100%" }}
        />
      ))}
    </span>
  );
}
