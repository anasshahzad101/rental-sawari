"use client";

import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { cx } from "@/components/admin/ui/cx";
import type { IconComponent } from "@/components/admin/ui/icons";

/** Milliseconds since the form mounted (sent as `elapsedMs` with every submission). */
export function useFormClock() {
  const start = useRef<number>(0);
  useEffect(() => {
    start.current = Date.now();
  }, []);
  const elapsed = useCallback(() => (start.current ? Date.now() - start.current : 0), []);
  const restart = useCallback(() => {
    start.current = Date.now();
  }, []);
  return { elapsed, restart };
}

/** Hidden honeypot. People never see or fill it; bots that fill every field do. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label>
        Leave this empty
        <input
          type="text"
          name="company_fax"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

export interface PostResult<T> {
  /** HTTP status, or 0 when the request never reached the server. */
  status: number;
  data: T | null;
}

/** POST JSON and read JSON back; never throws. */
export async function postJson<T>(url: string, body: unknown): Promise<PostResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  }
}

/** Equal 6 px segments; the first `done` are orange. */
export function StepSegments({ total, done, className }: { total: number; done: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`Step ${done} of ${total}`}
      className={cx("grid gap-1 lg:gap-1.5", className)}
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cx("h-1.5 rounded-full", i < done ? "bg-accent-600" : "bg-line")} />
      ))}
    </div>
  );
}

/** Scroll the window so `el` sits just under the sticky site header (only if it's above the fold). */
export function scrollToForm(el: HTMLElement | null, always = false) {
  if (!el || typeof window === "undefined") return;
  const top = el.getBoundingClientRect().top;
  // 80 px clears the sticky site header.
  if (!always && top >= 80 && top < window.innerHeight * 0.5) return;
  window.scrollTo({ top: Math.max(0, top + window.scrollY - 80), behavior: "smooth" });
}

/** The 64 px round icon used on success screens. */
export function SuccessMark({ icon: Icon, size = "lg" }: { icon: IconComponent; size?: "lg" | "md" }) {
  return (
    <span
      className={cx(
        "grid flex-none place-items-center rounded-full bg-good-fill text-good-text",
        size === "lg" ? "size-16" : "size-14",
      )}
    >
      <Icon size={size === "lg" ? 32 : 28} strokeWidth={1.75} aria-hidden={true} />
    </span>
  );
}

/** Sticky bottom bar for mobile steps (padding 12 16 30, top border, white). */
export function MobileBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-line bg-white px-4 pb-[30px] pt-3 lg:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
