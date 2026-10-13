import * as React from "react";
import { fmtWhen } from "@/lib/admin/format";
import type { SiteMessage } from "@/lib/admin/types";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { InboxListCard, InboxListCardTitle } from "../../_shared/layout";

export interface MessageCardProps {
  message: SiteMessage;
  href: string;
  selected: boolean;
}

/** One card in the Messages list: who, what it is, and the start of the message. */
export function MessageCard({ message: m, href, selected }: MessageCardProps) {
  const open = m.status === "new";
  const when = fmtWhen(open ? m.createdAt : m.doneAt ?? m.updatedAt, { short: true });
  const what = m.kind === "inquiry" ? `Inquiry · ${m.listingName || "a listing"}` : m.subject ? `Contact · ${m.subject}` : "Contact form";
  return (
    <InboxListCard href={href} selected={selected}>
      <InboxListCardTitle title={m.name || "No name given"} meta={when} />
      <div className="truncate text-[14px]/[20px] font-semibold text-ink-2">{what}</div>
      {open ? (
        <>
          <div className="hidden truncate text-[13px]/[18px] font-medium text-muted lg:block">{m.body || "No message"}</div>
          <div className="num truncate text-[13px]/[18px] font-medium text-muted lg:hidden">
            {when} · {m.body || "No message"}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <StatusPill kind="resolved" label="Done" size="sm" />
          <span className="num text-[13px]/[18px] font-medium text-muted lg:hidden">{when}</span>
        </div>
      )}
    </InboxListCard>
  );
}
