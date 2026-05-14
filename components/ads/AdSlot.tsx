"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";
import { cn } from "@/lib/utils";

/**
 * A single AdSense ad unit.
 *
 * - Renders nothing when `slot` is undefined → no empty box, no CLS hit
 *   before you've created the ad unit in the dashboard.
 * - Reserves a minimum height so AdSense's async fill doesn't shift content.
 * - Wraps in a labelled container ("Advertisement") so users can tell ads
 *   from organic content. Google requires this for compliance anyway.
 * - Calls `(adsbygoogle = window.adsbygoogle || []).push({})` exactly once
 *   per mount via a ref guard, even under React Strict Mode double-render.
 */

interface AdSlotProps {
  /** Slot ID from AdSense dashboard. Leave undefined to disable. */
  slot: string | undefined;
  /** AdSense ad format. "auto" = fully responsive (recommended). */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** When false, render a fixed-height instead of fluid (rare). */
  responsive?: boolean;
  /** Reserved min-height to prevent CLS while ad loads. */
  minHeight?: number;
  className?: string;
  /** Optional layout key for in-article / multiplex ads. */
  layout?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  minHeight = 100,
  className,
  layout,
}: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot) return;
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adblockers / network issues — silent fail is correct here.
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <aside
      className={cn(
        "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 my-8 sm:my-12",
        className,
      )}
      aria-label="Advertisement"
    >
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 text-center">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
        {...(layout ? { "data-ad-layout": layout } : {})}
      />
    </aside>
  );
}
