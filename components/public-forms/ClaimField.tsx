import * as React from "react";
import { cx } from "@/components/admin/ui/cx";
import { FieldError } from "@/components/admin/ui/Field";

/** "Changed" pill: teal-50 fill, #99F6E4 border, teal 700 12/16, 20 px tall. */
export function ChangedPill({ children = "Changed" }: { children?: React.ReactNode }) {
  return (
    <span className="num inline-flex h-5 flex-none items-center rounded-full border border-brand-200 bg-brand-50 px-[7px] text-[12px]/[16px] font-bold text-brand-700">
      {children}
    </span>
  );
}

export interface ClaimFieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
  changed?: boolean;
  /** Pill text instead of "Changed" ("3 changed"). */
  changedText?: React.ReactNode;
  onReset?: () => void;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Label row (600 13 #44403C) with a "Changed" pill and a "Reset" link once the value differs from the listing. */
export function ClaimField({ label, htmlFor, optional, changed, changedText, onReset, error, hint, className, children }: ClaimFieldProps) {
  const Label = htmlFor ? "label" : "span";
  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex min-h-5 items-center gap-2 text-[13px]/[18px] font-semibold text-ink-2">
        <Label {...(htmlFor ? { htmlFor } : {})}>
          {label}
          {optional ? <span className="font-medium text-muted"> · optional</span> : null}
        </Label>
        {changed ? <ChangedPill>{changedText ?? "Changed"}</ChangedPill> : null}
        {changed && onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="-my-2 ml-auto py-2 text-[13px]/[18px] font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>
      {children}
      {error ? <FieldError>{error}</FieldError> : hint ? <span className="text-[13px]/[18px] font-medium text-muted">{hint}</span> : null}
    </div>
  );
}
