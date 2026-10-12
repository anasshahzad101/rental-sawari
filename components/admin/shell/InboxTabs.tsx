import * as React from "react";
import { Segmented } from "../ui/controls";
import { Tabs } from "../ui/Tabs";

export type InboxKind = "requests" | "claims" | "reports";
export type InboxView = "new" | "done" | "rejected";

export interface InboxTabsProps {
  active: InboxKind;
  counts: { requests: number; claims: number; reports: number };
  view: InboxView;
  viewCounts: { new: number; done: number; rejected: number };
  /** Reports have no Rejected view. */
  hideRejected?: boolean;
  className?: string;
}

/**
 * Inbox header: underline tabs "Listing requests (3) · Claims (2) · Problem
 * reports (4)" (mobile: Requests / Claims / Reports) and a New · Done ·
 * Rejected segmented filter. All links; the `id` param is dropped.
 */
export function InboxTabs({ active, counts, view, viewCounts, hideRejected, className }: InboxTabsProps) {
  const base = `/admin/inbox/${active}`;
  const views: Array<{ value: InboxView; label: string }> = [
    { value: "new", label: "New" },
    { value: "done", label: "Done" },
    ...(hideRejected ? [] : [{ value: "rejected" as const, label: "Rejected" }]),
  ];
  return (
    <div className={["flex flex-col gap-3.5", className].filter(Boolean).join(" ")}>
      <Tabs
        mobileFill
        mobileHeight={48}
        active={active}
        aria-label="Inbox"
        items={[
          { key: "requests", label: "Listing requests", mobileLabel: "Requests", count: counts.requests, href: "/admin/inbox/requests" },
          { key: "claims", label: "Claims", count: counts.claims, href: "/admin/inbox/claims" },
          { key: "reports", label: "Problem reports", mobileLabel: "Reports", count: counts.reports, href: "/admin/inbox/reports" },
        ]}
      />
      <div className="flex items-center gap-3">
        <Segmented
          size="md"
          mobileFull
          value={view}
          aria-label="Show"
          options={views.map((v) => ({
            value: v.value,
            label: v.label,
            count: viewCounts[v.value],
            href: `${base}?view=${v.value}`,
          }))}
        />
      </div>
    </div>
  );
}
