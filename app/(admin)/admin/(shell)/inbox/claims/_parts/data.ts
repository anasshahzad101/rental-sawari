import "server-only";
import type { InboxView } from "@/components/admin/shell";
import { fmtPhone, samePhone } from "@/lib/admin/format";
import { claimRows, flaggedBefore, listClaims, verifyLabel } from "@/lib/admin/repo/claims";
import { inboxCounts, type InboxCounts } from "@/lib/admin/repo/inbox";
import { getListing, listVersions } from "@/lib/admin/repo/listings";
import type { Claim, Listing } from "@/lib/admin/types";
import { changeSummary, sortRows, type ClaimRow } from "./rows";
import type { ClaimDetailData, ClaimListItem } from "./types";

/** Server reads for the Claims screen. */

export function viewOf(c: Claim): InboxView {
  if (c.status === "updated") return "done";
  if (c.status === "rejected") return "rejected";
  return "new";
}

/**
 * The change rows of a claim. Open and rejected claims compare with the
 * listing as it is now; an applied claim is rebuilt from the listing as it
 * was just before it was applied (the claim's History entry).
 */
async function rowsFor(claim: Claim, listing: Listing): Promise<{ rows: ClaimRow[]; unchanged: string[]; base: Listing }> {
  if (claim.status === "updated") {
    const versions = await listVersions(listing.id);
    const v = versions.find((x) => x.kind === "claim" && x.refId === claim.id && x.before);
    if (v?.before) {
      const base: Listing = { ...listing, ...v.before };
      const r = claimRows(claim, base);
      return { rows: sortRows(r.rows), unchanged: r.unchanged, base };
    }
  }
  const r = claimRows(claim, listing);
  return { rows: sortRows(r.rows), unchanged: r.unchanged, base: listing };
}

const site = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function unchangedValue(label: string, l: Listing): string {
  switch (label) {
    case "Name":
      return l.name;
    case "City":
      return l.city || "—";
    case "Area":
      return l.area || "—";
    case "WhatsApp":
      return fmtPhone(l.whatsapp);
    case "Phone":
      return fmtPhone(l.phone);
    case "Website":
      return l.website ? site(l.website) : "None";
    case "About": {
      const a = l.about.trim();
      if (!a) return "None";
      return a.length > 160 ? `${a.slice(0, 160).trimEnd()}…` : a;
    }
    case "Logo":
      return l.logoUrl ? "Has a logo" : "No logo";
    default:
      return "";
  }
}

function wasFlaggedBefore(c: Claim, all: Claim[]): boolean {
  return all.some((x) => x.id !== c.id && x.flagged && samePhone(x.claimantWhatsapp, c.claimantWhatsapp));
}

async function buildDetail(claim: Claim, view: InboxView): Promise<ClaimDetailData> {
  const listing = await getListing(claim.listingId);
  const flagged = await flaggedBefore(claim);
  const verifiedBy = verifyLabel(claim.verification.method);
  if (!listing) {
    return {
      claim,
      listing: null,
      listingNumber: "",
      rows: [],
      appliedRows: [],
      unchanged: [],
      unchangedRows: [],
      flaggedBefore: flagged,
      verifiedBy,
      summary: "",
      view,
    };
  }
  const { rows, unchanged, base } = await rowsFor(claim, listing);
  const applied = new Set(claim.appliedKeys);
  return {
    claim,
    listing: { id: listing.id, slug: listing.slug, name: listing.name, logoUrl: listing.logoUrl },
    // Verify on the number as it was before the claim (an applied claim may have replaced it).
    listingNumber: base.whatsapp || base.phone || "",
    rows,
    appliedRows: claim.status === "updated" ? rows.filter((r) => applied.has(r.key)) : [],
    unchanged,
    unchangedRows: unchanged.map((label) => ({ key: label, field: label, value: unchangedValue(label, base) })),
    flaggedBefore: flagged,
    verifiedBy,
    summary: changeSummary(rows),
    view,
  };
}

export interface ClaimsPageData {
  counts: InboxCounts;
  viewCounts: Record<InboxView, number>;
  items: ClaimListItem[];
  detail: ClaimDetailData | null;
  /** The detail is the claim named by `?id` (not the default first one). */
  fromUrl: boolean;
}

export async function loadClaims(view: InboxView, id: number | null): Promise<ClaimsPageData> {
  const [claims, counts] = await Promise.all([listClaims(), inboxCounts()]);
  const groups: Record<InboxView, Claim[]> = { new: [], done: [], rejected: [] };
  for (const c of claims) groups[viewOf(c)].push(c);
  const list = groups[view];

  const items = await Promise.all(
    list.map(async (c): Promise<ClaimListItem> => {
      const l = await getListing(c.listingId);
      const n = l ? (await rowsFor(c, l)).rows.length : 0;
      return {
        id: c.id,
        listingName: l?.name ?? "Listing removed",
        claimantName: c.claimantName,
        role: c.role,
        status: c.status,
        flagged: c.flagged,
        flaggedBefore: wasFlaggedBefore(c, claims),
        changes: c.status === "updated" ? Math.max(n, c.appliedKeys.length) : n,
        createdAt: c.createdAt,
        decidedAt: c.decidedAt,
      };
    }),
  );

  const fromId = id != null ? claims.find((c) => c.id === id) ?? null : null;
  const selected = fromId ?? list[0] ?? null;
  const detail = selected ? await buildDetail(selected, view) : null;

  return {
    counts,
    viewCounts: { new: groups.new.length, done: groups.done.length, rejected: groups.rejected.length },
    items,
    detail,
    fromUrl: !!fromId,
  };
}
