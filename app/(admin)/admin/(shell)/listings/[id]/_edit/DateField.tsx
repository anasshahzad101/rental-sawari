"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { fmtDay } from "@/lib/admin/format";
import { shellClasses } from "@/components/admin/ui/Field";
import { cx } from "@/components/admin/ui/cx";

export interface DateFieldProps {
  /** YYYY-MM-DD or "". */
  value: string;
  onChange: (day: string) => void;
  changed?: boolean;
  invalid?: boolean;
  id?: string;
  placeholder?: string;
  "aria-label"?: string;
}

/**
 * A day field that reads "1 Oct 2026" (calendar icon, 44 / 48 px). A native
 * date input sits invisibly on top, so a click or tap opens the browser's
 * own date picker.
 */
export function DateField({ value, onChange, changed, invalid, id, placeholder = "Choose a date", ...rest }: DateFieldProps) {
  return (
    <div className={cx("relative flex h-12 w-full items-center gap-1.5 px-3 lg:h-11 lg:gap-2 lg:px-3.5", shellClasses({ invalid, changed }))}>
      <Calendar size={18} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" />
      <span
        aria-hidden="true"
        className={cx(
          "num min-w-0 flex-1 truncate text-[16px]/[24px] lg:text-[15px]/[22px]",
          value ? "font-medium text-ink" : "text-[#A8A29E]",
        )}
      >
        {value ? fmtDay(value) : placeholder}
      </span>
      <input
        id={id}
        type="date"
        value={value}
        aria-label={rest["aria-label"]}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => {
          const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
          try {
            el.showPicker?.();
          } catch {
            // Older browsers open their picker on their own.
          }
        }}
        className="absolute inset-0 size-full cursor-pointer opacity-0 focus-visible:!shadow-none"
      />
    </div>
  );
}
