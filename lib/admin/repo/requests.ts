import "server-only";
import { getDb } from "../db";
import type { Row } from "../db/driver";
import { isSiteCity } from "../constants";
import { fmtPhone, samePhone } from "../format";
import type { ListingEditable, ListingRequest, ListingRequestPayload } from "../types";
import { createListing, getListing, listAll } from "./listings";
import { createClaim } from "./claims";
import { notifyOwner } from "../notify";

/**
 * Listing requests from /list-your-business. A request never touches the
 * site until the owner presses Approve & publish; fixes made in the admin
 * stay on the request until then.
 */

export function effectivePayload(r: ListingRequest): ListingRequestPayload {
  return { ...r.payload, ...r.fixes };
}

/** A listing whose WhatsApp or phone matches this number. */
export async function findByNumber(num: string | null | undefined) {
  if (!num) return null;
  const all = await listAll();
  return all.find((l) => samePhone(l.whatsapp, num) || samePhone(l.phone, num)) ?? null;
}

export async function listRequests(): Promise<ListingRequest[]> {
  const d = await getDb();
  return d.select<ListingRequest>("listingRequests", undefined, { orderBy: "id", desc: true });
}

export async function getRequest(id: number): Promise<ListingRequest | null> {
  const d = await getDb();
  return d.get<ListingRequest>("listingRequests", id);
}

export async function createRequest(payload: ListingRequestPayload): Promise<number> {
  const d = await getDb();
  const now = new Date().toISOString();
  const dup = await findByNumber(payload.whatsapp);
  const id = await d.insert("listingRequests", {
    createdAt: now,
    updatedAt: now,
    status: "new",
    payload,
    fixes: {},
    duplicateOf: dup?.id ?? null,
    rejectReason: null,
    note: null,
    listingId: null,
    claimId: null,
    decidedAt: null,
  } as Row);
  const city = payload.city || payload.cityOther;
  notifyOwner(
    `New listing request: ${payload.name}`,
    [
      `${payload.name} · ${city}${payload.area ? ` · ${payload.area}` : ""}`,
      `From ${payload.ownerName} · WhatsApp ${fmtPhone(payload.whatsapp)}`,
      dup ? `Possible duplicate of ${dup.name} (${dup.city}).` : "",
      !isSiteCity(payload.city) ? `City not on the site yet: ${city}.` : "",
    ].filter(Boolean),
    `/admin/inbox/requests?id=${id}`,
  );
  return id;
}

export async function setFixes(id: number, fixes: Partial<ListingRequestPayload>) {
  const d = await getDb();
  const r = await getRequest(id);
  if (!r) throw new Error("Request not found");
  if (r.status !== "new") throw new Error("This request has already been handled");
  const merged = { ...r.fixes, ...fixes };
  // A fixed WhatsApp number is re-checked for duplicates.
  const dup = merged.whatsapp ? await findByNumber(merged.whatsapp) : null;
  await d.update(
    "listingRequests",
    { id },
    { fixes: merged, duplicateOf: merged.whatsapp ? dup?.id ?? null : r.duplicateOf, updatedAt: new Date().toISOString() },
  );
}

/** Create the listing (Free, Live, Not verified). Returns the new listing id. */
export async function approveRequest(id: number): Promise<number> {
  const r = await getRequest(id);
  if (!r) throw new Error("Request not found");
  if (r.status !== "new") throw new Error("This request has already been handled");
  const p = effectivePayload(r);
  if (!isSiteCity(p.city)) throw new Error("Choose a city first");
  if (!p.name.trim()) throw new Error("The listing needs a name");
  if (!p.whatsapp) throw new Error("The listing needs a WhatsApp number");
  const data: ListingEditable = {
    slug: "",
    name: p.name.trim(),
    city: p.city,
    area: p.area,
    whatsapp: p.whatsapp,
    phone: p.phone || p.whatsapp,
    phone2: null,
    website: p.website || null,
    mapsUrl: p.mapsUrl || null,
    about: p.about,
    services: p.services,
    cars: p.cars,
    logoUrl: p.logoUrl,
    googleRating: null,
    googleReviews: null,
    responseTime: null,
    plan: "free",
    planStart: null,
    planEnd: null,
    verified: false,
    status: "live",
  };
  const listingId = await createListing(data, {
    kind: "request",
    actor: "Created from listing request",
    note: `request from ${p.ownerName || "the business"}, approved by you`,
    refId: id,
  });
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("listingRequests", { id }, { status: "approved", listingId, decidedAt: now, updatedAt: now });
  return listingId;
}

export async function rejectRequest(id: number, reason: string, note: string | null) {
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("listingRequests", { id }, { status: "rejected", rejectReason: reason, note, decidedAt: now, updatedAt: now });
}

export async function reopenRequest(id: number) {
  const d = await getDb();
  const r = await getRequest(id);
  if (!r) throw new Error("Request not found");
  if (r.status === "approved" || r.status === "converted") throw new Error("This request was already turned into a listing or a claim");
  await d.update("listingRequests", { id }, { status: "new", rejectReason: null, note: null, decidedAt: null, updatedAt: new Date().toISOString() });
}

/** The business is already listed: turn the request into a claim on that listing. */
export async function convertToClaim(id: number): Promise<number> {
  const r = await getRequest(id);
  if (!r) throw new Error("Request not found");
  if (r.status !== "new") throw new Error("This request has already been handled");
  if (!r.duplicateOf) throw new Error("This request doesn't match a listing");
  const listing = await getListing(r.duplicateOf);
  if (!listing) throw new Error("That listing no longer exists");
  const p = effectivePayload(r);
  const proposed = {
    name: p.name || undefined,
    area: p.area || undefined,
    whatsapp: p.whatsapp || undefined,
    phone: p.phone || undefined,
    website: p.website || undefined,
    about: p.about || undefined,
    services: p.services.length ? p.services : undefined,
    cars: p.cars.length ? p.cars : undefined,
    logoUrl: p.logoUrl || undefined,
    ...(isSiteCity(p.city) ? { city: p.city } : {}),
  };
  const claimId = await createClaim({
    listingId: listing.id,
    claimantName: p.ownerName || "The business",
    role: "owner",
    claimantWhatsapp: p.whatsapp,
    message: "Sent as a new listing request; the number matched this listing.",
    proposed,
    closeRequested: false,
    requestId: id,
    notify: false,
  });
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("listingRequests", { id }, { status: "converted", claimId, decidedAt: now, updatedAt: now });
  return claimId;
}
