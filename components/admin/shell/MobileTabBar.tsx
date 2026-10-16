"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "../ui/cx";
import { activeNav, NAV } from "./nav";

export interface MobileTabBarProps {
  inboxCount: number;
  className?: string;
}

/** Fixed bottom tab bar under 1024 px: 4 tabs, 56 px, active pill #F0FDFA. */
export function MobileTabBar({ inboxCount, className }: MobileTabBarProps) {
  const active = activeNav(usePathname());
  return (
    <nav
      aria-label="Admin"
      className={cx(
        "fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white px-1.5 pb-[max(26px,env(safe-area-inset-bottom))] pt-1.5 lg:hidden",
        className,
      )}
    >
      {NAV.map((n) => {
        const on = n.key === active;
        const Icon = n.icon;
        return (
          <Link
            key={n.key}
            href={n.href}
            aria-current={on ? "page" : undefined}
            className="flex h-14 min-w-0 flex-col items-center justify-center gap-1 outline-none"
          >
            <span className={cx("relative grid h-[30px] w-14 place-items-center rounded-full", on ? "bg-brand-50 text-brand-700" : "text-quiet-text")}>
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              {n.key === "inbox" && inboxCount > 0 ? (
                <span
                  aria-label={`${inboxCount} waiting`}
                  className="num absolute -top-[5px] left-[31px] h-5 min-w-5 rounded-full border-2 border-white bg-brand-700 px-[5px] text-center text-[12px]/[16px] font-bold text-white"
                >
                  {inboxCount > 99 ? "99+" : inboxCount}
                </span>
              ) : null}
            </span>
            <span className={cx("truncate text-[12px]/[16px]", on ? "font-semibold text-brand-700" : "font-medium text-quiet-text")}>{n.short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
