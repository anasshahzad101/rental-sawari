import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { REPORT_REASON_HEADLINE } from "@/lib/admin/constants";
import { fmtDay, fmtWhen, pktDay } from "@/lib/admin/format";
import { inboxCounts } from "@/lib/admin/repo/inbox";
import { listAll } from "@/lib/admin/repo/listings";
import { listReports, reportsForListing } from "@/lib/admin/repo/reports";
import type { Report } from "@/lib/admin/types";
import { InboxTabs, PageTop, type InboxView } from "@/components/admin/shell";
import { InboxBody, InboxEmpty, InboxSplit } from "../_shared/layout";
import { inboxHref, parseInboxId, parseInboxView, type SearchParams } from "../_shared/params";
import { ReportCard } from "./_parts/ReportCard";
import { ReportDetail } from "./_parts/ReportDetail";
import { miniStats } from "./_parts/stats";

/**
 * Inbox › Problem reports (/admin/inbox/reports?view=new|done&id=N).
 * Urgent ("Fake or scam listing") reports sort first. Done = resolved + dismissed.
 */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Problem reports" };

type ReportView = "new" | "done";

function viewOf(r: Report): ReportView {
  return r.status === "new" ? "new" : "done";
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  let view = parseInboxView(searchParams, ["new", "done"]) as ReportView;
  const idParam = parseInboxId(searchParams);

  const [all, counts, listings] = await Promise.all([listReports(), inboxCounts(), listAll()]);
  const byView: Record<ReportView, Report[]> = { new: [], done: [] };
  for (const r of all) byView[viewOf(r)].push(r); // listReports: urgent first, then newest
  byView.done.sort((a, b) => (b.resolvedAt ?? b.updatedAt).localeCompare(a.resolvedAt ?? a.updatedAt));

  // An id from another view opens in its own view. No redirect: the refresh a
  // server action triggers must render, not bounce — the client updates the URL.
  if (idParam) {
    const r = all.find((x) => x.id === idParam);
    if (r) view = viewOf(r);
  }

  const list = byView[view];
  const selected = (idParam ? list.find((r) => r.id === idParam) : null) ?? list[0] ?? null;
  const listingById = new Map(listings.map((l) => [l.id, l]));
  const mobileDetail = !!idParam && !!selected;

  let detail: ReactNode = null;
  if (selected) {
    const l = listingById.get(selected.listingId) ?? null;
    const [stats, others] = await Promise.all([l ? miniStats(l) : Promise.resolve(null), reportsForListing(selected.listingId)]);
    const earlier = others.filter((o) => o.id !== selected.id && o.createdAt < selected.createdAt).length;
    detail = (
      <ReportDetail
        key={`${selected.id}-${selected.updatedAt}`}
        id={selected.id}
        status={selected.status}
        reason={selected.reason}
        headline={REPORT_REASON_HEADLINE[selected.reason]}
        details={selected.details}
        reporterWhatsapp={selected.reporterWhatsapp}
        sentText={fmtWhen(selected.createdAt)}
        closedText={selected.resolvedAt ? fmtWhen(selected.resolvedAt) : null}
        resolvedNote={selected.resolvedNote}
        listing={
          l
            ? {
                id: l.id,
                name: l.name,
                city: l.city,
                area: l.area,
                plan: l.plan,
                verified: l.verified,
                status: l.status,
                whatsapp: l.whatsapp,
                logoUrl: l.logoUrl,
                listedSince: fmtDay(pktDay(l.createdAt)),
              }
            : null
        }
        stats={stats}
        earlier={earlier}
      />
    );
  }

  return (
    <>
      {mobileDetail ? (
        <PageTop title="Inbox" mobileTitle="Problem report" back={{ href: inboxHref("reports", { view }) }} />
      ) : (
        <PageTop title="Inbox" />
      )}
      <InboxBody mobileDetail={mobileDetail}>
        <InboxTabs
          className={mobileDetail ? "max-lg:hidden" : undefined}
          active="reports"
          hideRejected
          counts={{ requests: counts.requests, claims: counts.claims, reports: counts.reports, messages: counts.messages }}
          view={view}
          viewCounts={{ new: byView.new.length, done: byView.done.length, rejected: 0 }}
        />
        {selected ? (
          <InboxSplit
            mobile={mobileDetail ? "detail" : "list"}
            list={list.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                listingName={listingById.get(r.listingId)?.name ?? "Deleted listing"}
                href={inboxHref("reports", { view, id: r.id })}
                selected={r.id === selected.id}
              />
            ))}
            detail={detail}
          />
        ) : view === "new" ? (
          <InboxEmpty icon={ShieldCheck} title="No new problem reports" body="You're all caught up." className="min-h-[280px]" />
        ) : (
          <InboxEmpty icon={ShieldCheck} title="No closed reports yet" body="Reports you resolve or dismiss show here." className="min-h-[280px]" />
        )}
      </InboxBody>
    </>
  );
}
