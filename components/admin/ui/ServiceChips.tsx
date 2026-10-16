"use client";

import * as React from "react";
import { Check, Plus } from "lucide-react";
import { SERVICES } from "@/lib/admin/constants";
import { cx } from "./cx";

export interface ServiceChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: readonly string[];
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** Pick-any chips: 40 px (44 mobile); selected teal with a check, unselected white with a plus. */
export function ServiceChips({ value, onChange, options = SERVICES, disabled, className, ...rest }: ServiceChipsProps) {
  const set = new Set(value);
  const toggle = (s: string) => {
    if (set.has(s)) {
      onChange(value.filter((v) => v !== s));
      return;
    }
    // Keep the canonical order; keep any value that isn't one of the options.
    onChange([...options.filter((o) => o === s || set.has(o)), ...value.filter((v) => !options.includes(v))]);
  };
  return (
    <div role="group" aria-label={rest["aria-label"] ?? "Services"} className={cx("flex flex-wrap gap-2", className)}>
      {options.map((s) => {
        const on = set.has(s);
        const Icon = on ? Check : Plus;
        return (
          <button
            key={s}
            type="button"
            role="checkbox"
            aria-checked={on}
            disabled={disabled}
            onClick={() => toggle(s)}
            className={cx(
              "inline-flex h-11 select-none items-center gap-1.5 rounded-full border px-3.5 text-[15px]/[20px] outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 lg:h-10",
              on ? "border-brand-200 bg-brand-50 font-semibold text-brand-700" : "border-line bg-white font-medium text-ink-2 hover:bg-fill",
            )}
          >
            <Icon size={16} strokeWidth={2.25} className="flex-none" aria-hidden="true" />
            {s}
          </button>
        );
      })}
    </div>
  );
}
