import * as React from "react";
import { fmtWhen, plural } from "@/lib/admin/format";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { InboxListCard, InboxListCardTitle } from "../../_shared/layout";
import { ROLE_LABEL } from "./rows";
import type { ClaimListItem } from "./types";

/** The status pill(s) of a claim, 24 px (list) or 26 px. */
export function ClaimPills({ item, size = "sm" }: { item: Pick<ClaimListItem, "status" | "flagged" | "flaggedBefore">; size?: "sm" | "md" }) {
  const main =
    item.status === "waiting" ? (
      <StatusPill kind="waiting" size={size} />
    ) : item.status === "verified" ? (
      <StatusPill kind="verified" size={size} label="Verified · ready to update" />
    ) : item.status === "updated" ? (
      <StatusPill kind="updated" size={size} />
    ) : (
      <StatusPill kind="rejected" size={size} />
    );
  return (
    <>
      {main}
      {item.status === "rejected" && item.flagged ? <StatusPill kind="urgent" size={size} label="Flagged" /> : null}
      {item.status !== "rejected" && item.flaggedBefore ? <StatusPill kind="flagged" size={size} label="Flagged before" /> : null}
    </>
  );
}

/** One claim in the list: listing name + when, claimant line, status pill. */
export function ClaimCard({ item, href, selected }: { item: ClaimListItem; href: string; selected: boolean }) {
  const open = item.status === "waiting" || item.status === "verified";
  const when = fmtWhen(open ? item.createdAt : item.decidedAt ?? item.createdAt, { short: true });
  return (
    <InboxListCard href={href} selected={selected} aria-label={`Claim on ${item.listingName} by ${item.claimantName}`}>
      <InboxListCardTitle title={item.listingName} meta={when} />
      <div className="num truncate text-[13px]/[18px] font-medium text-muted">
        {item.claimantName} · {ROLE_LABEL[item.role]} · {plural(item.changes, "change")}
      </div>
      {/* Desktop: the pills */}
      <div className="hidden flex-wrap gap-1.5 lg:flex">
        <ClaimPills item={item} />
      </div>
      {/* Mobile: pills left, time right */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <span className="flex min-w-0 flex-wrap gap-1.5">
          <ClaimPills item={item} />
        </span>
        <span className="num flex-none text-[13px]/[18px] font-medium text-muted">{when}</span>
      </div>
    </InboxListCard>
  );
}
