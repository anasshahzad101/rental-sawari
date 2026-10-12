import * as React from "react";
import Link from "next/link";
import { cx } from "./cx";
import type { IconComponent } from "./icons";

export interface TabItem {
  key: string;
  label: React.ReactNode;
  /** Shorter label under 1024 px ("Requests"). */
  mobileLabel?: React.ReactNode;
  href?: string;
  icon?: IconComponent;
  /** Count pill (solid teal when active, grey otherwise). */
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange?: (key: string) => void;
  /** Equal-width tabs on mobile. */
  mobileFill?: boolean;
  /** Tab height on mobile: 44 (default) or 48. */
  mobileHeight?: 44 | 48;
  className?: string;
  "aria-label"?: string;
}

/** Underline tabs: 44 px, 2 px teal underline on the active tab, optional icon and count pill. */
export function Tabs({ items, active, onChange, mobileFill, mobileHeight = 44, className, ...rest }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className={cx("flex border-b border-line", mobileFill ? "gap-0 lg:gap-7" : "gap-7 overflow-x-auto scrollbar-hide", className)}
    >
      {items.map((it) => {
        const on = it.key === active;
        const cls = cx(
          "-mb-px inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-1 text-[15px]/[20px] outline-none transition-colors",
          on ? "border-brand-700 font-semibold text-brand-700" : "border-transparent font-medium text-quiet-text hover:text-ink",
          mobileFill && "max-lg:min-w-0 max-lg:flex-1 max-lg:px-0.5",
          mobileHeight === 48 && "max-lg:h-12",
        );
        const Icon = it.icon;
        const inner = (
          <>
            {Icon ? <Icon size={18} strokeWidth={1.75} className="flex-none" aria-hidden="true" /> : null}
            {it.mobileLabel != null ? (
              <>
                <span className="lg:hidden">{it.mobileLabel}</span>
                <span className="max-lg:hidden">{it.label}</span>
              </>
            ) : (
              it.label
            )}
            {it.count != null ? (
              <span
                className={cx(
                  "num inline-block h-[22px] min-w-[22px] flex-none rounded-full px-[7px] text-center text-[12px]/[22px] font-bold",
                  on ? "bg-brand-700 text-white" : "bg-fill text-quiet-text",
                )}
              >
                {it.count}
              </span>
            ) : null}
          </>
        );
        if (it.href) {
          return (
            <Link key={it.key} href={it.href} role="tab" aria-selected={on} aria-current={on ? "page" : undefined} className={cls} scroll={false}>
              {inner}
            </Link>
          );
        }
        return (
          <button key={it.key} type="button" role="tab" aria-selected={on} className={cls} onClick={() => onChange?.(it.key)}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
