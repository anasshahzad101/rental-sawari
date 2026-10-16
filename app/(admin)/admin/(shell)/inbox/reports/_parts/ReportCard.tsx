import * as React from "react";
import { REPORT_REASON_HEADLINE } from "@/lib/admin/constants";
import { fmtWhen } from "@/lib/admin/format";
import type { Report } from "@/lib/admin/types";
import { cx } from "@/components/admin/ui/cx";
import { WhatsAppIcon } from "@/components/admin/ui/icons";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { InboxListCard, InboxListCardTitle } from "../../_shared/layout";

export interface ReportCardProps {
  report: Report;
  listingName: string;
  href: string;
  selected: boolean;
}

/** One card in the reports list. Urgent (scam) cards are red. */
export function ReportCard({ report: r, listingName, href, selected }: ReportCardProps) {
  const urgent = r.reason === "scam";
  const open = r.status === "new";
  const when = fmtWhen(open ? r.createdAt : r.resolvedAt ?? r.updatedAt, { short: true });
  const headline = REPORT_REASON_HEADLINE[r.reason];
  return (
    <InboxListCard href={href} selected={selected} urgent={urgent && open}>
      <InboxListCardTitle title={listingName} meta={when} />
      {urgent ? (
        <div className="flex min-w-0 items-center gap-2">
          <StatusPill kind="urgent" size="sm" className="gap-1" />
          <span className="min-w-0 truncate text-[14px]/[20px] font-semibold text-bad-text">{headline}</span>
        </div>
      ) : (
        <div className="truncate text-[14px]/[20px] font-semibold text-ink-2">{headline}</div>
      )}
      {open ? (
        <>
          {/* Desktop: contact line */}
          {r.reporterWhatsapp ? (
            <div className="hidden items-center gap-1.5 text-[13px]/[18px] font-medium text-muted lg:flex">
              <WhatsAppIcon size={13} />
              Reporter left a WhatsApp
            </div>
          ) : (
            <div className="hidden text-[13px]/[18px] font-medium text-[#A8A29E] lg:block">No contact left</div>
          )}
          {/* Mobile: time · contact */}
          <div className="num text-[13px]/[18px] font-medium text-muted lg:hidden">
            {when}
            {r.reporterWhatsapp ? " · reporter left a WhatsApp" : ""}
          </div>
        </>
      ) : (
        <div className={cx("flex items-center justify-between gap-2")}>
          <StatusPill kind={r.status === "resolved" ? "resolved" : "dismissed"} size="sm" />
          <span className="num text-[13px]/[18px] font-medium text-muted lg:hidden">{when}</span>
        </div>
      )}
    </InboxListCard>
  );
}
