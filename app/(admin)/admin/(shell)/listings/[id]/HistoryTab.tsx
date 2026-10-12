import type { Listing } from "@/lib/admin/types";
import { diffListing, editable, FIELD_LABEL, listVersions } from "@/lib/admin/repo/listings";
import { HistoryList, type HistoryItem } from "./_history/HistoryList";
import { createdSummary } from "./_history/rows";

/** Listing › History: every version, newest first, each one restorable. */
export default async function HistoryTab({ listing }: { listing: Listing }) {
  const versions = await listVersions(listing.id);
  const now = editable(listing);
  const items: HistoryItem[] = versions.map((v, i) => ({
    id: v.id,
    createdAt: v.createdAt,
    kind: v.kind,
    actor: v.actor,
    note: v.note,
    refId: v.refId,
    changes: v.changes,
    created: v.kind === "import" || v.kind === "create" || v.kind === "request" ? createdSummary(v.snapshot) : null,
    // What "Restore this version" would change: the listing now → that snapshot.
    restore: i === 0 ? [] : diffListing(now, v.snapshot),
  }));
  return <HistoryList key={listing.id} listingId={listing.id} listingName={listing.name} items={items} labels={FIELD_LABEL} />;
}
