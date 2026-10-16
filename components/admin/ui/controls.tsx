"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cx } from "./cx";
import type { IconComponent } from "./icons";

// ── Segmented ────────────────────────────────────────────────────────────

export interface SegmentedOption<V extends string = string> {
  value: V;
  label: React.ReactNode;
  icon?: IconComponent;
  /** 500 13 muted count after the label ("New 3"). */
  count?: React.ReactNode;
  /** 6 px dot before the label (e.g. Live in green). */
  dot?: string;
  /** Text colour when selected (e.g. #15803D for Live). */
  activeClassName?: string;
  href?: string;
  disabled?: boolean;
}

export interface SegmentedProps<V extends string = string> {
  options: SegmentedOption<V>[];
  value: V;
  onChange?: (value: V) => void;
  /**
   * sm: chart switch (thumb 34 px, 32 mobile) · md: filters (track 40, 44
   * mobile) · lg: form field (track 44, 48 mobile).
   */
  size?: "sm" | "md" | "lg";
  /** Stretch to the container; options share the width. */
  fullWidth?: boolean;
  /** Full width only on mobile. */
  mobileFull?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** Track #F5F5F4 (padding 3, radius 12) with a white thumb (radius 9, thumb shadow). */
export function Segmented<V extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  fullWidth,
  mobileFull,
  className,
  ...rest
}: SegmentedProps<V>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest["aria-label"]}
      className={cx(
        "inline-flex flex-none gap-0.5 rounded-control bg-fill p-[3px]",
        size === "md" && "h-11 lg:h-10",
        size === "lg" && "h-12 lg:h-11",
        (fullWidth || mobileFull) && "flex w-full",
        mobileFull && !fullWidth && "lg:inline-flex lg:w-auto",
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        const cls = cx(
          "inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-thumb outline-none transition-colors",
          size === "sm" ? "h-8 px-3 text-[13px]/[18px] lg:h-[34px] lg:px-3.5 lg:text-[14px]/[20px]" : "px-3.5",
          size === "md" && "text-[14px]/[20px]",
          size === "lg" && "text-[15px]/[20px] lg:text-[14px]/[20px]",
          (fullWidth || mobileFull) && "flex-1",
          mobileFull && !fullWidth && "lg:flex-none",
          on ? cx("bg-white font-semibold text-ink shadow-thumb", o.activeClassName) : "font-medium text-quiet-text hover:text-ink",
          o.disabled && "cursor-not-allowed opacity-50",
        );
        const Icon = o.icon;
        const inner = (
          <>
            {o.dot ? <span aria-hidden="true" className="size-1.5 flex-none rounded-full" style={{ background: o.dot }} /> : null}
            {Icon ? <Icon size={16} strokeWidth={1.75} className="flex-none" aria-hidden="true" /> : null}
            {o.label}
            {o.count != null ? <span className="num text-[13px]/[18px] font-medium text-muted">{o.count}</span> : null}
          </>
        );
        if (o.href && !o.disabled) {
          return (
            <Link key={o.value} href={o.href} role="radio" aria-checked={on} className={cls} scroll={false}>
              {inner}
            </Link>
          );
        }
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            className={cls}
            onClick={() => onChange?.(o.value)}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────

export interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name when there is no visible label next to it. */
  label?: string;
  id?: string;
  className?: string;
}

/** 44 × 26 (48 × 28 mobile), on #0F766E, off #A8A29E, 20 px knob (22 mobile), 150 ms. */
export function Toggle({ checked, onChange, disabled, label, id, className }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cx(
        "relative inline-block h-7 w-12 flex-none rounded-full outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[26px] lg:w-11",
        checked ? "bg-brand-700" : "bg-[#A8A29E]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "absolute left-[3px] top-[3px] size-[22px] rounded-full bg-white shadow-[0_1px_2px_rgba(28,25,23,0.25)] transition-transform duration-150 lg:size-5",
          checked ? "translate-x-5 lg:translate-x-[18px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

export interface ToggleRowProps extends ToggleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned 13 px muted text ("Yes" / "No"). */
  trailing?: React.ReactNode;
  /** Mobile: a 56 px bordered row with the toggle on the right. */
  boxed?: boolean;
}

/** Toggle + 600 15 label (+ hint). Tapping the row toggles it. */
export function ToggleRow({ title, description, trailing, boxed, checked, onChange, disabled, className, id }: ToggleRowProps) {
  const labelId = React.useId();
  return (
    <div
      className={cx(
        "flex cursor-pointer select-none items-center gap-3",
        boxed && "min-h-14 rounded-control border border-line bg-white px-3.5 lg:min-h-0 lg:border-0 lg:bg-transparent lg:px-0",
        disabled && "cursor-not-allowed",
        className,
      )}
      onClick={(e) => {
        if (disabled) return;
        if ((e.target as HTMLElement).closest("button[role=switch]")) return;
        onChange?.(!checked);
      }}
    >
      <Toggle checked={checked} onChange={onChange} disabled={disabled} id={id} className={boxed ? "max-lg:order-3" : undefined} />
      <span id={labelId} className="flex min-w-0 flex-1 flex-col">
        <span className="text-[16px]/[24px] font-semibold text-ink lg:text-[15px]/[22px]">{title}</span>
        {description ? <span className="num text-[13px]/[18px] font-medium text-muted">{description}</span> : null}
      </span>
      {trailing ? <span className="text-[13px]/[18px] font-medium text-muted">{trailing}</span> : null}
    </div>
  );
}

// ── Checkbox ─────────────────────────────────────────────────────────────

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  /** md: 20 px (radius 6) · lg: 24 px (radius 7, mobile diff cards). */
  size?: "md" | "lg";
  id?: string;
  name?: string;
  "aria-label"?: string;
  className?: string;
}

/** 20 px, radius 6. Ticked = #0F766E with a white check; unticked = 1.5 px #A8A29E. */
export function Checkbox({ checked, onChange, disabled, label, size = "md", id, name, className, ...rest }: CheckboxProps) {
  const lg = size === "lg";
  const box = (
    <span
      aria-hidden="true"
      className={cx(
        "grid flex-none place-items-center transition-colors",
        lg ? "size-6 rounded-[7px]" : "size-5 rounded-md",
        disabled
          ? "border-[1.5px] border-line bg-fill"
          : checked
            ? "bg-brand-700 text-white"
            : "border-[1.5px] border-[#A8A29E] bg-white peer-hover:border-ink-2",
        "peer-focus-visible:shadow-focus",
      )}
    >
      {checked && !disabled ? <Check size={lg ? 16 : 14} strokeWidth={3} /> : null}
    </span>
  );
  return (
    <label
      className={cx(
        "relative inline-flex items-center gap-2.5 text-[16px]/[24px] font-medium lg:text-[15px]/[22px]",
        disabled ? "cursor-not-allowed text-[#A8A29E]" : "cursor-pointer text-ink",
        className,
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        className="peer absolute size-px opacity-0"
        checked={checked}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {box}
      {label != null ? <span>{label}</span> : null}
    </label>
  );
}

// ── Radio ────────────────────────────────────────────────────────────────

export interface RadioProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label?: React.ReactNode;
  name?: string;
  value?: string;
  /** md: 20 px · lg: 22 px (mobile sheets). */
  size?: "md" | "lg";
  className?: string;
}

/** The radio mark alone (20 px, 2 px ring, 10 px dot). */
export function RadioMark({ checked, size = "md", disabled }: { checked: boolean; size?: "md" | "lg"; disabled?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "grid flex-none place-items-center rounded-full border-2 transition-colors",
        size === "lg" ? "size-[22px]" : "size-5",
        disabled ? "border-line bg-fill" : checked ? "border-brand-700" : "border-[#A8A29E]",
      )}
    >
      {checked ? <span className={cx("size-2.5 rounded-full", disabled ? "bg-[#A8A29E]" : "bg-brand-700")} /> : null}
    </span>
  );
}

/** A 44 px radio row ("Why reject?"). */
export function Radio({ checked, onChange, disabled, label, name, value, size = "md", className }: RadioProps) {
  return (
    <label
      className={cx(
        "relative flex min-h-11 items-center gap-3 text-[16px]/[24px] font-medium lg:text-[15px]/[22px]",
        disabled ? "cursor-not-allowed text-[#A8A29E]" : "cursor-pointer text-ink",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.()}
        className="peer absolute size-px opacity-0"
      />
      <span className="rounded-full peer-focus-visible:shadow-focus">
        <RadioMark checked={checked} size={size} disabled={disabled} />
      </span>
      {label != null ? <span className="min-w-0">{label}</span> : null}
    </label>
  );
}

export interface RadioCardProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label: React.ReactNode;
  /** 13 px under or beside the label. */
  description?: React.ReactNode;
  /** Right side: a hint ("6 Oct – 5 Nov 2026") or icon. */
  trailing?: React.ReactNode;
  name?: string;
  value?: string;
  /** md: 56 px rows (claim flow) · sm: 48 px rows (extend popover). */
  size?: "md" | "sm";
  className?: string;
}

/** Option card: selected = 1.5 px #0F766E border on #F0FDFA, 600 label. */
export function RadioCard({ checked, onChange, disabled, label, description, trailing, name, value, size = "md", className }: RadioCardProps) {
  return (
    <label
      className={cx(
        "relative flex items-center rounded-control transition-colors",
        size === "md" ? "min-h-14 gap-3 px-4" : "min-h-12 gap-2.5 px-3",
        checked ? "border-[1.5px] border-brand-700 bg-brand-50" : "border border-line bg-white hover:bg-page",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.()}
        className="peer absolute size-px opacity-0"
      />
      <span className="rounded-full peer-focus-visible:shadow-focus">
        <RadioMark checked={checked} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col py-2">
        <span
          className={cx(
            "text-ink",
            size === "md" ? "text-[16px]/[24px]" : "text-[15px]/[22px]",
            checked ? "font-semibold" : "font-medium",
          )}
        >
          {label}
        </span>
        {description ? <span className="text-[13px]/[18px] font-medium text-muted">{description}</span> : null}
      </span>
      {trailing != null ? (
        <span className={cx("num flex-none text-[13px]/[18px] font-medium", checked ? "text-brand-700" : "text-muted")}>{trailing}</span>
      ) : null}
    </label>
  );
}
