"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { ChevronDown, CircleAlert, Lock, Search, X } from "lucide-react";
import { fmtPhone, normalizePhone, phoneDigits } from "@/lib/admin/format";
import { cx } from "./cx";
import type { IconComponent } from "./icons";

// ── Field wrapper ────────────────────────────────────────────────────────

export interface FieldProps {
  label?: React.ReactNode;
  /** Adds " · optional" in 500 muted. */
  optional?: boolean;
  /** Unsaved change: 8 px teal dot + "Changed". */
  changed?: boolean;
  /** Custom text instead of "Changed" ("1 price changed"). */
  changedText?: React.ReactNode;
  /** Error message (500 13 #B91C1C with a 16 px circle-alert). */
  error?: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/** Label above (600 13 #44403C), control, then error or hint. */
export function Field({ label, optional, changed, changedText, error, hint, htmlFor, children, className, id }: FieldProps) {
  return (
    <div id={id} className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      {label != null ? (
        <label htmlFor={htmlFor} className="flex flex-wrap items-center gap-1.5 text-[13px]/[18px] font-semibold text-ink-2">
          <span>
            {label}
            {optional ? <span className="font-medium text-muted"> · optional</span> : null}
          </span>
          {changed ? (
            <>
              <span aria-hidden="true" className="size-2 rounded-full bg-brand-700" />
              <span className="font-medium text-brand-700">{changedText ?? "Changed"}</span>
            </>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <FieldError>{error}</FieldError>
      ) : hint ? (
        <span className="num text-[13px]/[18px] font-medium text-muted">{hint}</span>
      ) : null}
    </div>
  );
}

export function FieldError({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span role="alert" className={cx("flex gap-1.5 text-[13px]/[18px] font-medium text-bad-text", className)}>
      <CircleAlert size={16} strokeWidth={1.75} className="mt-px flex-none" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}

// ── Input shell (border + states) ────────────────────────────────────────

export interface ShellStateProps {
  invalid?: boolean;
  changed?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

/** Border/focus classes shared by every control. */
export function shellClasses({ invalid, changed, readOnly, disabled }: ShellStateProps) {
  return cx(
    "rounded-control border bg-white transition-shadow",
    invalid
      ? "border-[1.5px] border-bad-solid"
      : changed
        ? "border-brand-200"
        : "border-line",
    !readOnly && !disabled && !invalid && "focus-within:border-[1.5px] focus-within:border-brand-700 focus-within:shadow-input-focus",
    !readOnly && !disabled && invalid && "focus-within:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]",
    readOnly && "border-line bg-fill",
    disabled && "border-line bg-fill text-[#A8A29E]",
  );
}

/** Inner input reset (the shell draws the border and focus ring). */
export const innerInput =
  "h-full w-full min-w-0 flex-1 bg-transparent text-[16px]/[24px] text-ink outline-none placeholder:text-[#A8A29E] focus-visible:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 disabled:cursor-not-allowed lg:text-[15px]/[22px]";

// ── TextInput ────────────────────────────────────────────────────────────

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  changed?: boolean;
  /** Leading icon (18 px, muted). */
  icon?: IconComponent;
  /** Trailing content inside the field. */
  trailing?: React.ReactNode;
  /** Class for the outer shell. */
  className?: string;
  inputClassName?: string;
  /** Colour for the leading icon (default muted; e.g. text-wait-text for the Google star). */
  iconClassName?: string;
}

/** 44 px (48 mobile), radius 12, 1 px #E7E5E4; focus 1.5 px teal + soft ring; read-only grey with a lock. */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { invalid, changed, icon: Icon, trailing, className, inputClassName, iconClassName, readOnly, disabled, ...rest },
  ref,
) {
  return (
    <div
      className={cx(
        "flex h-12 w-full items-center gap-2 overflow-hidden px-3.5 lg:h-11",
        shellClasses({ invalid, changed, readOnly, disabled }),
        className,
      )}
    >
      {Icon ? <Icon size={readOnly ? 16 : 18} strokeWidth={1.75} className={cx("flex-none text-muted", iconClassName)} aria-hidden="true" /> : null}
      <input
        ref={ref}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cx(innerInput, readOnly && "font-medium text-ink-2", inputClassName)}
        {...rest}
      />
      {trailing}
      {readOnly ? <Lock size={16} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" /> : null}
    </div>
  );
});

// ── Textarea ─────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  changed?: boolean;
}

/** Min height 112, 15/24 (16 mobile). */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, changed, className, readOnly, disabled, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      readOnly={readOnly}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cx(
        "block min-h-[112px] w-full resize-y px-3.5 py-2.5 text-[16px]/[24px] text-ink outline-none placeholder:text-[#A8A29E] [text-wrap:pretty] lg:text-[15px]/[24px]",
        shellClasses({ invalid, changed, readOnly, disabled }),
        !readOnly && !disabled && !invalid && "focus:border-[1.5px] focus:border-brand-700 focus:!shadow-input-focus",
        invalid && "focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.15)]",
        className,
      )}
      {...rest}
    />
  );
});

// ── Select (native, styled) ──────────────────────────────────────────────

export type SelectOption = string | { value: string; label: string; disabled?: boolean };

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  changed?: boolean;
  icon?: IconComponent;
  className?: string;
}

/** Native select with a chevron; placeholder in #A8A29E. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, invalid, changed, icon: Icon, className, value, defaultValue, disabled, ...rest },
  ref,
) {
  const empty = (value ?? defaultValue ?? "") === "";
  return (
    <div
      className={cx(
        "relative flex h-12 w-full items-center lg:h-11",
        shellClasses({ invalid, changed, disabled }),
        className,
      )}
    >
      {Icon ? <Icon size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 text-muted" aria-hidden="true" /> : null}
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cx(
          "h-full w-full min-w-0 cursor-pointer appearance-none rounded-control bg-transparent pr-10 text-[16px]/[24px] font-medium outline-none focus-visible:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 disabled:cursor-not-allowed lg:text-[15px]/[22px]",
          Icon ? "pl-10" : "pl-3.5",
          empty && placeholder ? "font-normal text-[#A8A29E]" : "text-ink",
        )}
        {...rest}
      >
        {placeholder != null ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-ink">
              {opt.label}
            </option>
          );
        })}
      </select>
      <ChevronDown size={18} strokeWidth={1.75} className="pointer-events-none absolute right-2.5 text-muted" aria-hidden="true" />
    </div>
  );
});

// ── SearchInput ──────────────────────────────────────────────────────────

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Search field with a teal icon on focus and a clear button. */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, className, placeholder = "Search", ...rest },
  ref,
) {
  return (
    <div className={cx("group flex h-12 w-full items-center gap-2.5 pl-3.5 pr-1.5 lg:h-11 lg:pr-2", shellClasses({}), className)}>
      <Search size={20} strokeWidth={1.75} className="flex-none text-muted group-focus-within:text-brand-700" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cx(innerInput, "[&::-webkit-search-cancel-button]:appearance-none")}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear"
          onClick={() => onChange("")}
          className="grid size-8 flex-none place-items-center rounded-lg text-muted hover:bg-fill hover:text-ink"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

// ── PhoneInput ───────────────────────────────────────────────────────────

/** "+92…" → the local part shown after the fixed +92 segment ("300 1234567"). */
function toLocalDisplay(v: string | null | undefined): string {
  if (!v) return "";
  const n = normalizePhone(v);
  if (n) return fmtPhone(n).replace(/^\+92 /, "");
  return formatNational(stripToNational(v));
}

/** Digits a person typed or pasted, without +92 / 0092 / leading 0. */
function stripToNational(raw: string): string {
  let d = phoneDigits(raw);
  if (raw.trim().startsWith("+") && d.startsWith("92")) d = d.slice(2);
  else if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

function formatNational(d: string): string {
  if (d.startsWith("3") && d.length > 3) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (!d.startsWith("3") && d.length > 2 && d.length >= 9) return `${d.slice(0, 2)} ${d.slice(2)}`;
  return d;
}

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "defaultValue"> {
  /** E.164 "+923001234567" (or null/empty). */
  value: string | null | undefined;
  /** Normalised E.164, or null while incomplete/invalid; `local` is what is typed. */
  onChange: (value: string | null, local: string) => void;
  invalid?: boolean;
  changed?: boolean;
  className?: string;
}

/** Fixed "+92" segment + number. Pasted "0300-1234567" or "+92 300 …" is normalised. */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, invalid, changed, className, readOnly, disabled, placeholder = "300 1234567", ...rest },
  ref,
) {
  const [local, setLocal] = useState(() => toLocalDisplay(value));

  // Follow outside changes (reset, undo) without fighting the typist.
  useEffect(() => {
    const cur = normalizePhone(stripToNational(local));
    const next = value ? normalizePhone(value) : null;
    if (next !== cur && !(next == null && !value && local === "")) setLocal(toLocalDisplay(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (raw: string) => {
    const nat = stripToNational(raw);
    const shown = formatNational(nat);
    setLocal(shown);
    onChange(nat ? normalizePhone(nat) : null, shown);
  };

  return (
    <div
      className={cx(
        "flex h-12 w-full items-center overflow-hidden lg:h-11",
        shellClasses({ invalid, changed, readOnly, disabled }),
        className,
      )}
    >
      <span className="num flex h-full flex-none items-center border-r border-line bg-fill px-3 text-[16px]/[24px] font-semibold text-ink-2 lg:text-[15px]/[22px]">
        +92
      </span>
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={local}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        onChange={(e) => update(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (text) {
            e.preventDefault();
            update(text);
          }
        }}
        className={cx(innerInput, "num px-3")}
        {...rest}
      />
      {readOnly ? <Lock size={16} strokeWidth={1.75} className="mr-3.5 flex-none text-muted" aria-hidden="true" /> : null}
    </div>
  );
});

// ── Price input (PKR … /day) ─────────────────────────────────────────────

export interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
  value: number | null | undefined;
  onChange: (value: number) => void;
  invalid?: boolean;
  changed?: boolean;
  suffix?: React.ReactNode;
  className?: string;
}

/** "PKR" segment + number with thousands separators + "/day". */
export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(function PriceInput(
  { value, onChange, invalid, changed, suffix = "/day", className, placeholder = "0", ...rest },
  ref,
) {
  const shown = value ? Math.round(value).toLocaleString("en-US") : "";
  return (
    <div className={cx("flex h-12 w-full items-center overflow-hidden lg:h-11", shellClasses({ invalid, changed }), className)}>
      <span className="flex h-full flex-none items-center border-r border-line bg-fill px-2.5 text-[13px]/[18px] font-semibold text-ink-2">
        PKR
      </span>
      <input
        ref={ref}
        inputMode="numeric"
        value={shown}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").slice(0, 7);
          onChange(d ? Number(d) : 0);
        }}
        className={cx(innerInput, "num px-2.5")}
        {...rest}
      />
      {suffix ? <span className="flex-none pr-2.5 text-[13px]/[18px] text-muted lg:pr-3">{suffix}</span> : null}
    </div>
  );
});
