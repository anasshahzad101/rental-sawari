import type { ReactNode } from "react";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { fmtDayDow, fmtWhen, normalizePhone } from "@/lib/admin/format";
import { inboxCounts } from "@/lib/admin/repo/inbox";
import { pageLabel } from "@/lib/admin/repo/labels";
import { listAll } from "@/lib/admin/repo/listings";
import { listMessages } from "@/lib/admin/repo/messages";
import type { SiteMessage } from "@/lib/admin/types";
import { FIELD_LABELS, orderedEntries } from "@/lib/leads";
import { InboxTabs, PageTop } from "@/components/admin/shell";
import { InboxBody, InboxEmpty, InboxSplit } from "../_shared/layout";
import { inboxHref, parseInboxId, parseInboxView, type SearchParams } from "../_shared/params";
import { MessageCard } from "./_parts/MessageCard";
import { MessageDetail } from "./_parts/MessageDetail";

/**
 * Inbox › Messages (/admin/inbox/messages?view=new|done&id=N): the contact
 * form and the "Send inquiry" form on listing pages. Newest first.
 */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

type MessageView = "new" | "done";

function viewOf(m: SiteMessage): MessageView {
  return m.status === "new" ? "new" : "done";
}

/** Extra form fields as label/value rows; a pickup date reads "Sat 18 Oct 2026". */
function detailRows(details: Record<string, string>): Array<{ label: string; value: string }> {
  return orderedEntries(details ?? {}).map(([k, v]) => ({
    label: FIELD_LABELS[k] ?? k,
    value: k === "pickupDate" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDayDow(v) : v,
  }));
}

export default async function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  let view = parseInboxView(searchParams, ["new", "done"]) as MessageView;
  const idParam = parseInboxId(searchParams);

  const [all, counts, listings] = await Promise.all([listMessages(), inboxCounts(), listAll()]);
  const byView: Record<MessageView, SiteMessage[]> = { new: [], done: [] };
  for (const m of all) byView[viewOf(m)].push(m);
  byView.done.sort((a, b) => (b.doneAt ?? b.updatedAt).localeCompare(a.doneAt ?? a.updatedAt));

  // An id from the other view opens in its own view (no redirect; see reports/page.tsx).
  if (idParam) {
    const m = all.find((x) => x.id === idParam);
    if (m) view = viewOf(m);
  }

  const list = byView[view];
  const selected = (idParam ? list.find((m) => m.id === idParam) : null) ?? list[0] ?? null;
  const mobileDetail = !!idParam && !!selected;

  let detail: ReactNode = null;
  if (selected) {
    const l = selected.listingId ? listings.find((x) => x.id === selected.listingId) ?? null : null;
    const bySlug = new Map(listings.map((x) => [x.slug, x]));
    const wa = normalizePhone(selected.phone);
    detail = (
      <MessageDetail
        key={`${selected.id}-${selected.updatedAt}`}
        id={selected.id}
        kind={selected.kind}
        status={selected.status}
        name={selected.name}
        whatsapp={wa && /^\+923\d{9}$/.test(wa) ? wa : null}
        phoneText={selected.phone}
        email={selected.email}
        subject={selected.subject}
        body={selected.body}
        details={detailRows(selected.details)}
        listingName={selected.listingName || l?.name || ""}
        listing={
          l
            ? { id: l.id, name: l.name, city: l.city, area: l.area, whatsapp: l.whatsapp, logoUrl: l.logoUrl, status: l.status }
            : null
        }
        sentText={fmtWhen(selected.createdAt)}
        pageText={selected.page ? pageLabel(selected.page, bySlug) : null}
        doneText={selected.doneAt ? fmtWhen(selected.doneAt) : null}
        emailed={selected.emailed}
        view={view}
      />
    );
  }

  return (
    <>
      {mobileDetail ? (
        <PageTop title="Inbox" mobileTitle="Message" back={{ href: inboxHref("messages", { view }) }} />
      ) : (
        <PageTop title="Inbox" />
      )}
      <InboxBody mobileDetail={mobileDetail}>
        <InboxTabs
          className={mobileDetail ? "max-lg:hidden" : undefined}
          active="messages"
          hideRejected
          counts={{ requests: counts.requests, claims: counts.claims, reports: counts.reports, messages: counts.messages }}
          view={view}
          viewCounts={{ new: byView.new.length, done: byView.done.length, rejected: 0 }}
        />
        {selected ? (
          <InboxSplit
            mobile={mobileDetail ? "detail" : "list"}
            list={list.map((m) => (
              <MessageCard key={m.id} message={m} href={inboxHref("messages", { view, id: m.id })} selected={m.id === selected.id} />
            ))}
            detail={detail}
          />
        ) : view === "new" ? (
          <InboxEmpty
            icon={MessageSquare}
            title="No new messages"
            body="Contact-form messages and inquiries from listing pages show here."
            className="min-h-[280px]"
          />
        ) : (
          <InboxEmpty icon={MessageSquare} title="Nothing marked done yet" body="Messages you mark done show here." className="min-h-[280px]" />
        )}
      </InboxBody>
    </>
  );
}
