import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { InboxTabs, PageTop } from "@/components/admin/shell";
import { InboxBody, InboxEmpty, InboxSplit } from "../_shared/layout";
import { inboxHref, parseInboxId, parseInboxView, type SearchParams } from "../_shared/params";
import { ClaimCard } from "./_parts/ClaimCard";
import { ClaimDetail } from "./_parts/ClaimDetail";
import { loadClaims } from "./_parts/data";

/**
 * /admin/inbox/claims — an owner (or staff) asked to change their listing.
 * `?view=new|done|rejected` (New = waiting + verified, Done = updated) and
 * `?id=N` (the open claim; desktop defaults to the first one in the view).
 * Desktop: list 340 px | detail. Mobile: the list, or the detail full screen.
 */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Claims" };

const EMPTY = {
  new: { title: "No new claims", body: "You're all caught up." },
  done: { title: "No updated claims yet", body: "Claims you apply to a listing show up here." },
  rejected: { title: "No rejected claims", body: "Claims you reject show up here." },
} as const;

export default async function ClaimsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const view = parseInboxView(searchParams);
  const id = parseInboxId(searchParams);
  const { counts, viewCounts, items, detail, fromUrl } = await loadClaims(view, id);
  const mobileDetail = fromUrl && !!detail;
  const selectedId = detail?.claim.id ?? null;

  const list = items.length ? (
    items.map((it) => <ClaimCard key={it.id} item={it} href={inboxHref("claims", { view, id: it.id })} selected={it.id === selectedId} />)
  ) : (
    <InboxEmpty title={EMPTY[view].title} body={EMPTY[view].body} />
  );

  return (
    <>
      <PageTop
        title="Inbox"
        mobileTitle={mobileDetail ? "Claim" : undefined}
        back={mobileDetail ? { href: inboxHref("claims", { view }) } : undefined}
      />
      <InboxBody mobileDetail={mobileDetail}>
        <InboxTabs
          className={mobileDetail ? "max-lg:hidden" : undefined}
          active="claims"
          counts={{ requests: counts.requests, claims: counts.claims, reports: counts.reports, messages: counts.messages }}
          view={view}
          viewCounts={viewCounts}
        />
        {detail ? (
          <InboxSplit
            listWidth={340}
            mobile={mobileDetail ? "detail" : "list"}
            list={list}
            detail={<ClaimDetail key={detail.claim.id} d={detail} />}
          />
        ) : (
          list
        )}
      </InboxBody>
    </>
  );
}
