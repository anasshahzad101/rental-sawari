"use client";

import * as React from "react";
import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ellipsis, Globe, LogOut, Search } from "lucide-react";
import { logoutAction } from "@/app/(admin)/admin/login/actions";
import { IconButton } from "../ui/Button";
import { cx } from "../ui/cx";
import { Menu } from "../ui/Popover";
import { DateRangePicker, DateRangeTriggerFallback } from "./DateRangePicker";
import { GlobalSearch, MobileSearch, type SearchFn } from "./GlobalSearch";

export interface PageTopProps {
  /** Desktop title (and mobile, unless mobileTitle is set). */
  title: string;
  mobileTitle?: string;
  /** Pages with stats: show the date range trigger. */
  dateRange?: boolean;
  /** Detail pages: a 44 px back arrow replaces the logo tile on mobile. */
  back?: { href: string };
  /** Replace the search request (kit page / tests). */
  search?: SearchFn;
}

/**
 * The top of every admin page. Desktop: 76 px bar with the title, global
 * search and the date range. Mobile: 56 px bar (tile or back, title, search,
 * ⋯ menu) and, on stats pages, a full-width date trigger under it.
 */
export function PageTop({ title, mobileTitle, dateRange, back, search }: PageTopProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      {/* Desktop */}
      <header className="hidden h-[76px] flex-none items-center gap-5 border-b border-line px-8 lg:flex">
        <h1 className="min-w-0 truncate text-page-title text-ink">{title}</h1>
        <GlobalSearch className="ml-auto min-w-[220px]" search={search} />
        {dateRange ? (
          <Suspense fallback={<DateRangeTriggerFallback variant="desktop" />}>
            <DateRangePicker variant="desktop" />
          </Suspense>
        ) : null}
      </header>

      {/* Mobile */}
      <header className="sticky top-0 z-20 flex h-14 flex-none items-center gap-2.5 border-b border-line bg-white pl-4 pr-1.5 lg:hidden">
        {back ? (
          <Link
            href={back.href}
            aria-label="Back"
            className="-ml-2.5 -mr-1.5 grid size-11 flex-none place-items-center rounded-control text-ink active:bg-fill"
          >
            <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/admin/logo-tile.png" alt="RentalSawari" width={32} height={32} className="size-8 flex-none rounded-lg" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-page-title-m text-ink">{mobileTitle ?? title}</h1>
        <IconButton icon={Search} label="Search listings" onClick={() => setSearchOpen(true)} />
        <Menu
          mobile="popover"
          align="end"
          width={236}
          className="shadow-[0_16px_40px_-12px_rgba(28,25,23,0.3),0_2px_6px_rgba(28,25,23,0.06)]"
          trigger={<IconButton icon={Ellipsis} label="More" className="aria-expanded:bg-fill" />}
          items={[
            { key: "site", label: "View live site", icon: Globe, href: "/", external: true },
            { key: "d", divider: true },
            { key: "out", label: "Log out", icon: LogOut, formAction: logoutAction },
          ]}
        />
      </header>
      {dateRange ? (
        <div className={cx("px-4 pt-3 lg:hidden")}>
          <Suspense fallback={<DateRangeTriggerFallback variant="mobile" />}>
            <DateRangePicker variant="mobile" />
          </Suspense>
        </div>
      ) : null}
      <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} search={search} />
    </>
  );
}
