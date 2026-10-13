import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { fmtWhen, slugify } from "@/lib/admin/format";
import { inboxCounts } from "@/lib/admin/repo/inbox";
import { areasByCity, listAll } from "@/lib/admin/repo/listings";
import { effectivePayload, listRequests } from "@/lib/admin/repo/requests";
import type { ListingRequest } from "@/lib/admin/types";
import { InboxTabs, PageTop, type InboxView } from "@/components/admin/shell";
import { Button } from "@/components/admin/ui/Button";
import { InboxBody, InboxEmpty, InboxSplit } from "../_shared/layout";
import { inboxHref, parseInboxId, parseInboxView, type SearchParams } from "../_shared/params";
import { RequestCard } from "./_parts/RequestCard";
import { RequestDetail } from "./_parts/RequestDetail";

/**
 * Inbox › Listing requests (/admin/inbox/requests?view=new|done|rejected&id=N).
 * List on the left, the selected request on the right (desktop); on mobile
 * the list, or the request full screen when `?id` is set.
 */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Listing requests" };

function viewOf(r: ListingRequest): InboxView {
  return r.status === "new" ? "new" : r.status === "rejected" ? "rejected" : "done";
}

const EMPTY: Record<InboxView, { title: string; body: string }> = {
  new: { title: "No new requests", body: "You're all caught up." },
  done: { title: "No done requests yet", body: "Approved requests, and ones moved to Claims, show here." },
  rejected: { title: "No rejected requests", body: "Requests you reject show here." },
};

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  let view = parseInboxView(searchParams);
  const idParam = parseInboxId(searchParams);

  const [all, counts, listings] = await Promise.all([listRequests(), inboxCounts(), listAll()]);
  const byView: Record<InboxView, ListingRequest[]> = { new: [], done: [], rejected: [] };
  for (const r of all) byView[viewOf(r)].push(r);
  // Done and Rejected: most recently decided first.
  const decided = (a: ListingRequest, b: ListingRequest) => (b.decidedAt ?? b.updatedAt).localeCompare(a.decidedAt ?? a.updatedAt);
  byView.done.sort(decided);
  byView.rejected.sort(decided);

  // An id from another view (a notification link, or a request that was just
  // handled) opens in its own view. No redirect: the refresh a server action
  // triggers must render, not bounce — the client already updates the URL.
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
    const p = effectivePayload(selected);
    const dup = selected.duplicateOf != null ? listingById.get(selected.duplicateOf) ?? null : null;
    const created = selected.listingId != null ? listingById.get(selected.listingId) ?? null : null;
    detail = (
      <RequestDetail
        key={`${selected.id}-${selected.updatedAt}`}
        id={selected.id}
        status={selected.status}
        payload={p}
        sentText={fmtWhen(selected.createdAt)}
        decidedText={selected.decidedAt ? fmtWhen(selected.decidedAt) : null}
        rejectReason={selected.rejectReason}
        note={selected.note}
        duplicate={dup ? { id: dup.id, name: dup.name, city: dup.city, area: dup.area } : null}
        created={created ? { id: created.id, slug: created.slug, status: created.status } : null}
        claimId={selected.claimId}
        slugGuess={slugify(p.name) || "listing"}
        areasByCity={selected.status === "new" ? await areasByCity() : {}}
      />
    );
  }

  return (
    <>
      {mobileDetail ? (
        <PageTop title="Inbox" mobileTitle="Listing request" back={{ href: inboxHref("requests", { view }) }} />
      ) : (
        <PageTop title="Inbox" />
      )}
      <InboxBody mobileDetail={mobileDetail}>
        <InboxTabs
          className={mobileDetail ? "max-lg:hidden" : undefined}
          active="requests"
          counts={{ requests: counts.requests, claims: counts.claims, reports: counts.reports, messages: counts.messages }}
          view={view}
          viewCounts={{ new: byView.new.length, done: byView.done.length, rejected: byView.rejected.length }}
        />
        {selected ? (
          <InboxSplit
            mobile={mobileDetail ? "detail" : "list"}
            list={list.map((r) => {
              const created = r.listingId != null ? listingById.get(r.listingId) : undefined;
              return (
                <RequestCard
                  key={r.id}
                  request={r}
                  payload={effectivePayload(r)}
                  href={inboxHref("requests", { view, id: r.id })}
                  selected={r.id === selected.id}
                  listingLive={created ? created.status === "live" : undefined}
                />
              );
            })}
            detail={detail}
          />
        ) : (
          <InboxEmpty
            title={EMPTY[view].title}
            body={EMPTY[view].body}
            action={
              view === "new" ? (
                <Button variant="secondary" href={inboxHref("requests", { view: "done" })}>
                  See done requests
                </Button>
              ) : null
            }
          />
        )}
      </InboxBody>
    </>
  );
}
