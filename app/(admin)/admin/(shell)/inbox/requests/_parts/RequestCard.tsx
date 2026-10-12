import * as React from "react";
import { isSiteCity } from "@/lib/admin/constants";
import { fmtWhen } from "@/lib/admin/format";
import type { ListingRequest, ListingRequestPayload } from "@/lib/admin/types";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { InboxListCard, InboxListCardTitle } from "../../_shared/layout";
import { rejectedLabel, shortDay } from "./text";

export interface RequestCardProps {
  request: ListingRequest;
  payload: ListingRequestPayload;
  href: string;
  selected: boolean;
  /** The created listing is live (Done cards). */
  listingLive?: boolean;
}

/** One card in the requests list (New, Done or Rejected). */
export function RequestCard({ request: r, payload: p, href, selected, listingLive }: RequestCardProps) {
  const city = p.city || p.cityOther;
  const place = [city, p.area].filter(Boolean).join(" · ");

  if (r.status === "new") {
    const dup = r.duplicateOf != null;
    const noCity = !isSiteCity(p.city);
    const when = fmtWhen(r.createdAt, { short: true });
    const warnings = (
      <>
        {dup ? <StatusPill kind="duplicate" size="sm" /> : null}
        {noCity ? <StatusPill kind="cityNotOnSite" size="sm" /> : null}
      </>
    );
    return (
      <InboxListCard href={href} selected={selected}>
        <InboxListCardTitle title={p.name} meta={when} />
        <div className="num truncate text-[13px]/[18px] font-medium text-muted">
          {place}
          {p.ownerName ? (
            <>
              {place ? " · " : ""}
              <span className="hidden lg:inline">from </span>
              {p.ownerName}
            </>
          ) : null}
        </div>
        {/* Desktop: New + warnings */}
        <div className="hidden flex-wrap gap-1.5 lg:flex">
          <StatusPill kind="new" size="sm" />
          {warnings}
        </div>
        {/* Mobile: warnings left, time right (or the time alone) */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          {dup || noCity ? <span className="flex min-w-0 flex-wrap gap-1.5">{warnings}</span> : null}
          <span className="num text-[13px]/[18px] font-medium text-muted">{when}</span>
        </div>
      </InboxListCard>
    );
  }

  const day = shortDay(r.decidedAt ?? r.updatedAt);
  let pill: React.ReactNode;
  if (r.status === "approved") {
    pill = listingLive === false ? <StatusPill kind="approved" size="sm" label="Approved · hidden" /> : <StatusPill kind="approved" size="sm" label="Approved · live" />;
  } else if (r.status === "converted") {
    pill = <StatusPill kind="dismissed" size="sm" icon={null} label="Moved to Claims" />;
  } else {
    pill = <StatusPill kind="rejected" size="sm" label={rejectedLabel(r.rejectReason)} />;
  }
  return (
    <InboxListCard href={href} selected={selected}>
      <InboxListCardTitle title={p.name} meta={day} />
      <div className="num truncate text-[13px]/[18px] font-medium text-muted">
        {place}
        <span className="lg:hidden">{day ? ` · ${day}` : ""}</span>
      </div>
      <div className="flex">{pill}</div>
    </InboxListCard>
  );
}
