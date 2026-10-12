import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ChartColumn, Ellipsis, History, MapPin, Pencil } from "lucide-react";
import type { ListingStatus, Plan } from "@/lib/admin/types";
import { waLink } from "@/lib/admin/format";
import { Avatar } from "../ui/Avatar";
import { Button, IconButton } from "../ui/Button";
import { Popover } from "../ui/Popover";
import { PlanBadge, StatusPill, VerifiedBadge } from "../ui/StatusPill";
import { Tabs } from "../ui/Tabs";

export interface ListingHeaderListing {
  id: number;
  slug: string;
  name: string;
  city: string;
  area: string;
  plan: Plan;
  verified: boolean;
  status: ListingStatus;
  logoUrl: string | null;
  whatsapp: string;
}

export interface ListingHeaderProps {
  listing: ListingHeaderListing;
  tab: "stats" | "edit" | "history";
  /** Content of the ⋯ popover (usually <MenuList items={…} />). */
  menu?: React.ReactNode;
  /** Range query kept on the Stats tab link ("range=last30&compare=1"). */
  query?: string;
}

/**
 * Listing pages header: back link, avatar, name, place + plan + verified +
 * live/hidden, View on site / WhatsApp the owner / ⋯, then Stats · Edit ·
 * History tabs. Stacked on mobile with equal-width tabs.
 */
export function ListingHeader({ listing: l, tab, menu, query }: ListingHeaderProps) {
  const base = `/admin/listings/${l.id}`;
  const statsHref = query ? `${base}?${query}` : base;
  return (
    <div className="flex flex-col gap-3 text-ink lg:gap-3.5">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1.5 self-start text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        All listings
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar name={l.name} logoUrl={l.logoUrl} size={56} className="max-lg:size-12 max-lg:rounded-control max-lg:text-[17px]" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-[22px]/[28px] font-extrabold tracking-[-0.02em] [text-wrap:pretty] lg:text-[28px]/[34px]">{l.name}</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px]/[18px] font-medium text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
                {l.city} · {l.area}
              </span>
              <PlanBadge plan={l.plan} className="px-[9px]" />
              <VerifiedBadge verified={l.verified} size="sm" />
              <StatusPill kind={l.status === "live" ? "live" : "hidden"} size="sm" />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-none gap-2 lg:w-auto">
          <Button variant="secondary" icon={ArrowUpRight} href={`/companies/${l.slug}`} target="_blank" className="px-3.5">
            <span className="lg:hidden">Site</span>
            <span className="max-lg:hidden">View on site</span>
          </Button>
          <Button variant="whatsapp" href={waLink(l.whatsapp)} target="_blank" className="min-w-0 flex-1 lg:flex-none">
            {/* "WhatsApp the owner" doesn't fit beside Site and ⋯ under 380 px. */}
            <span className="min-[380px]:hidden">WhatsApp</span>
            <span className="max-[379px]:hidden">WhatsApp the owner</span>
          </Button>
          {menu ? (
            <Popover align="end" trigger={<IconButton icon={Ellipsis} label="More actions" variant="secondary" className="size-12 lg:size-10 aria-expanded:bg-fill" />}>
              <div className="w-[236px] max-w-[calc(100vw-32px)]">{menu}</div>
            </Popover>
          ) : null}
        </div>
      </div>
      <Tabs
        className="mt-1"
        mobileFill
        active={tab}
        aria-label="Listing sections"
        items={[
          { key: "stats", label: "Stats", icon: ChartColumn, href: statsHref },
          { key: "edit", label: "Edit", icon: Pencil, href: `${base}?tab=edit` },
          { key: "history", label: "History", icon: History, href: `${base}?tab=history` },
        ]}
      />
    </div>
  );
}
