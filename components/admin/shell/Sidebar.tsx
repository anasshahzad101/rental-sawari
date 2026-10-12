"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Globe, LogOut } from "lucide-react";
import { logoutAction } from "@/app/(admin)/admin/login/actions";
import { cx } from "../ui/cx";
import { activeNav, NAV } from "./nav";

/** Logo lockup: 34 px tile, "Rental" + "Sawari" wordmark, PAKISTAN, Admin pill. */
export function AdminLockup({ className }: { className?: string }) {
  return (
    <Link href="/admin" className={cx("flex items-center gap-2.5 rounded-control px-1.5 pt-0.5", className)} aria-label="RentalSawari Admin, Overview">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/admin/logo-tile.png" alt="" width={34} height={34} className="size-[34px] flex-none rounded-[9px]" />
      <span className="flex flex-col gap-[3px]">
        <span className="whitespace-nowrap text-[17px]/[20px] font-extrabold tracking-[-0.02em]">
          <span className="text-ink">Rental</span>
          <span className="text-brand-700">Sawari</span>
        </span>
        <span className="text-[9px]/[10px] font-semibold tracking-[0.36em] text-muted">PAKISTAN</span>
      </span>
      <span className="ml-auto inline-flex h-[22px] items-center rounded-full border border-brand-100 bg-brand-50 px-2 text-[12px]/[16px] font-semibold text-brand-700">
        Admin
      </span>
    </Link>
  );
}

export interface SidebarProps {
  /** Everything waiting in the Inbox (badge hidden at 0). */
  inboxCount: number;
  className?: string;
}

/** Desktop sidebar: lockup, nav (44 px items), View live site and Log out at the bottom. */
export function Sidebar({ inboxCount, className }: SidebarProps) {
  const active = activeNav(usePathname());
  const item = "flex h-11 items-center gap-3 rounded-control px-3 text-[15px]/[20px] outline-none transition-colors";
  return (
    <aside
      className={cx(
        "sticky top-0 hidden h-screen w-[248px] flex-none flex-col border-r border-line bg-white px-3.5 pb-4 pt-5 lg:flex",
        className,
      )}
    >
      <AdminLockup />
      <nav aria-label="Admin" className="mt-7 flex flex-col gap-1">
        {NAV.map((n) => {
          const on = n.key === active;
          const Icon = n.icon;
          return (
            <Link
              key={n.key}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={cx(item, on ? "bg-brand-50 font-semibold text-brand-700" : "font-medium text-ink-2 hover:bg-fill hover:text-ink")}
            >
              <Icon size={20} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
              {n.label}
              {n.key === "inbox" && inboxCount > 0 ? (
                <span
                  aria-label={`${inboxCount} waiting`}
                  className="num ml-auto inline-block h-[22px] min-w-[22px] rounded-full bg-brand-700 px-[7px] text-center text-[12px]/[22px] font-bold text-white"
                >
                  {inboxCount > 99 ? "99+" : inboxCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className={cx(item, "font-medium text-ink-2 hover:bg-fill hover:text-ink")}>
          <Globe size={20} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
          View live site
          <ArrowUpRight size={16} strokeWidth={1.75} className="ml-auto flex-none text-muted" aria-hidden="true" />
        </a>
        <form action={logoutAction}>
          <button type="submit" className={cx(item, "w-full font-medium text-ink-2 hover:bg-fill hover:text-ink")}>
            <LogOut size={20} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
