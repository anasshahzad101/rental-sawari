import "server-only";
import { getDb } from "../db";
import type { Row } from "../db/driver";
import { fmtPKRDay, fmtPhone, samePhone } from "../format";
import type { CarRow, Claim, ClaimChanges, ClaimVerification, Listing, ListingEditable, VerifyMethod } from "../types";
import { editable, getListing, sameValue, updateListing } from "./listings";
import { notifyOwner } from "../notify";

/**
 * Claims: an owner (or staff) asks to change their listing. Nothing on the
 * listing changes until the owner of the site has verified ownership — by
 * messaging or calling the number ALREADY on the listing — and pressed
 * Update listing. applyClaim enforces that here, not only in the UI.
 */

const VERIFY_LABEL: Record<VerifyMethod, string> = {
  whatsapp: "WhatsApp reply",
  call: "phone call",
  other: "other proof",
};

export function verifyLabel(m: VerifyMethod | null): string {
  return m ? VERIFY_LABEL[m] : "";
}

/** One line of "Current against requested". */
export interface ClaimRow {
  key: string;
  field: string; // label shown in the Field column
  kind: "changed" | "added" | "removed" | "text" | "logo";
  oldText: string | null;
  newText: string | null;
}

const SCALARS: { key: keyof ClaimChanges; label: string; kind?: ClaimRow["kind"]; fmt?: (v: string | null) => string | null }[] = [
  { key: "name", label: "Listing name" },
  { key: "city", label: "City" },
  { key: "area", label: "Area" },
  { key: "whatsapp", label: "WhatsApp", fmt: (v) => (v ? fmtPhone(v) : null) },
  { key: "phone", label: "Phone", fmt: (v) => (v ? fmtPhone(v) : null) },
  { key: "phone2", label: "Second phone", fmt: (v) => (v ? fmtPhone(v) : null) },
  { key: "website", label: "Website", fmt: (v) => (v ? v.replace(/^https?:\/\//, "").replace(/\/$/, "") : null) },
  { key: "about", label: "About", kind: "text" },
  { key: "logoUrl", label: "Logo", kind: "logo" },
];

const UNCHANGED_LABEL: Record<string, string> = {
  name: "Name",
  city: "City",
  area: "Area",
  whatsapp: "WhatsApp",
  phone: "Phone",
  website: "Website",
  about: "About",
  logoUrl: "Logo",
};

function carText(c: CarRow, withMode = false): string {
  return `${fmtPKRDay(c.pricePerDay)}${withMode ? ` · ${c.mode === "self" ? "Self-drive" : "With driver"}` : ""}`;
}

/** The change rows for a claim, compared with the listing as it is now. */
export function claimRows(claim: Claim, listing: Listing): { rows: ClaimRow[]; unchanged: string[] } {
  const rows: ClaimRow[] = [];
  const ch = claim.changes;
  const unchanged: string[] = [];

  for (const s of SCALARS) {
    if (!(s.key in ch)) {
      if (UNCHANGED_LABEL[s.key]) unchanged.push(UNCHANGED_LABEL[s.key]);
      continue;
    }
    const oldV = (listing[s.key as keyof Listing] as string | null) || null;
    const newV = ((ch as Record<string, unknown>)[s.key] as string | null) || null;
    if (sameValue(oldV, newV)) {
      if (UNCHANGED_LABEL[s.key]) unchanged.push(UNCHANGED_LABEL[s.key]);
      continue;
    }
    const f = s.fmt ?? ((v: string | null) => v);
    let kind: ClaimRow["kind"] = s.kind ?? "changed";
    if (kind === "changed" && !oldV) kind = "added";
    if (kind === "changed" && !newV) kind = "removed";
    rows.push({ key: s.key, field: s.label, kind, oldText: f(oldV), newText: f(newV) });
  }

  if (ch.services) {
    for (const sv of ch.services.filter((s) => !listing.services.includes(s))) {
      rows.push({ key: `services:+${sv}`, field: sv, kind: "added", oldText: null, newText: "Service added" });
    }
    for (const sv of listing.services.filter((s) => !ch.services!.includes(s))) {
      rows.push({ key: `services:-${sv}`, field: sv, kind: "removed", oldText: "Service", newText: null });
    }
  }

  if (ch.cars) {
    const cur = new Map(listing.cars.map((c) => [c.name.toLowerCase(), c]));
    const req = new Map(ch.cars.map((c) => [c.name.toLowerCase(), c]));
    for (const [k, c] of Array.from(req)) {
      const was = cur.get(k);
      if (!was) rows.push({ key: `cars:+${c.name}`, field: c.name, kind: "added", oldText: null, newText: carText(c, true) });
      else if (was.pricePerDay !== c.pricePerDay || was.mode !== c.mode) {
        rows.push({
          key: `cars:~${c.name}`,
          field: c.name,
          kind: "changed",
          oldText: carText(was),
          newText: `${carText(c)} (${c.mode === "self" ? "Self-drive" : "With driver"})`,
        });
      }
    }
    for (const [k, c] of Array.from(cur)) {
      if (!req.has(k)) rows.push({ key: `cars:-${c.name}`, field: c.name, kind: "removed", oldText: carText(c), newText: null });
    }
  }

  if (claim.closeRequested && listing.status === "live") {
    rows.push({ key: "status", field: "Status", kind: "changed", oldText: "Live", newText: "Hidden · business has closed" });
  }

  return { rows, unchanged };
}

/** The listing with the ticked claim rows applied. */
export function applyRows(claim: Claim, listing: Listing, keys: string[]): ListingEditable {
  const next = editable(listing);
  const ch = claim.changes;
  const want = new Set(keys);
  for (const s of SCALARS) {
    if (!want.has(s.key) || !(s.key in ch)) continue;
    (next as unknown as Record<string, unknown>)[s.key] = (ch as Record<string, unknown>)[s.key] ?? (s.key === "about" ? "" : null);
  }
  if (ch.services) {
    let svc = [...next.services];
    for (const k of keys) {
      if (k.startsWith("services:+")) svc.push(k.slice(10));
      if (k.startsWith("services:-")) svc = svc.filter((s) => s !== k.slice(10));
    }
    next.services = Array.from(new Set(svc));
  }
  if (ch.cars) {
    const req = new Map(ch.cars.map((c) => [c.name.toLowerCase(), c]));
    let cars = [...next.cars];
    for (const k of keys) {
      const name = k.slice(6).toLowerCase();
      if (k.startsWith("cars:~")) cars = cars.map((c) => (c.name.toLowerCase() === name && req.get(name) ? { ...req.get(name)! } : c));
      if (k.startsWith("cars:+") && req.get(name)) cars.push({ ...req.get(name)! });
      if (k.startsWith("cars:-")) cars = cars.filter((c) => c.name.toLowerCase() !== name);
    }
    next.cars = cars;
  }
  if (want.has("status") && claim.closeRequested) next.status = "hidden";
  return next;
}

// ── Reads ────────────────────────────────────────────────────────────────

export async function listClaims(): Promise<Claim[]> {
  const d = await getDb();
  return d.select<Claim>("claims", undefined, { orderBy: "id", desc: true });
}

export async function getClaim(id: number): Promise<Claim | null> {
  const d = await getDb();
  return d.get<Claim>("claims", id);
}

/** Has this WhatsApp number had a claim the owner said NO to? */
export async function flaggedBefore(claim: Claim): Promise<boolean> {
  const all = await listClaims();
  return all.some((c) => c.id !== claim.id && c.flagged && samePhone(c.claimantWhatsapp, claim.claimantWhatsapp));
}

// ── Writes ───────────────────────────────────────────────────────────────

/** Only keep the fields that really differ from the listing. */
export function changedFields(listing: Listing, proposed: ClaimChanges): ClaimChanges {
  const out: ClaimChanges = {};
  for (const [k, v] of Object.entries(proposed) as [keyof ClaimChanges, unknown][]) {
    if (v === undefined) continue;
    if (k === "cars") {
      const a = JSON.stringify([...listing.cars].sort((x, y) => x.name.localeCompare(y.name)));
      const b = JSON.stringify([...(v as CarRow[])].sort((x, y) => x.name.localeCompare(y.name)));
      if (a !== b) out.cars = v as CarRow[];
    } else if (k === "services") {
      const a = [...listing.services].sort().join("|");
      const b = [...(v as string[])].sort().join("|");
      if (a !== b) out.services = v as string[];
    } else if (!sameValue(listing[k], v)) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

export async function createClaim(input: {
  listingId: number;
  claimantName: string;
  role: "owner" | "staff";
  claimantWhatsapp: string;
  message: string | null;
  proposed: ClaimChanges;
  closeRequested: boolean;
  requestId?: number | null;
  notify?: boolean;
}): Promise<number> {
  const listing = await getListing(input.listingId);
  if (!listing) throw new Error("Listing not found");
  const d = await getDb();
  const now = new Date().toISOString();
  const verification: ClaimVerification = { status: "none", method: null, note: null, at: null };
  const changes = changedFields(listing, input.proposed);
  const id = await d.insert("claims", {
    createdAt: now,
    updatedAt: now,
    listingId: input.listingId,
    claimantName: input.claimantName,
    role: input.role,
    claimantWhatsapp: input.claimantWhatsapp,
    message: input.message,
    changes,
    closeRequested: input.closeRequested,
    verification,
    appliedKeys: [],
    status: "waiting",
    flagged: false,
    rejectReason: null,
    note: null,
    decidedAt: null,
    requestId: input.requestId ?? null,
  } as Row);
  if (input.notify !== false) {
    const n = claimRows({ id, changes, closeRequested: input.closeRequested } as Claim, listing).rows.length;
    notifyOwner(
      `New claim: ${listing.name}`,
      [
        `${input.claimantName} (${input.role === "owner" ? "Owner" : "Works here"}) asked to update ${listing.name}, ${listing.city}.`,
        `${n} change${n === 1 ? "" : "s"}${input.closeRequested ? ", including closing the listing" : ""}.`,
        `WhatsApp: ${fmtPhone(input.claimantWhatsapp)}`,
        "Verify ownership with the number already on the listing before updating it.",
      ],
      `/admin/inbox/claims?id=${id}`,
    );
  }
  return id;
}

export async function setVerification(id: number, v: { choice: "yes" | "no" | "none"; method?: VerifyMethod | null; note?: string | null }) {
  const d = await getDb();
  const claim = await getClaim(id);
  if (!claim) throw new Error("Claim not found");
  if (claim.status === "updated") throw new Error("This claim has already been applied");
  const now = new Date().toISOString();
  if (v.choice === "none") {
    await d.update(
      "claims",
      { id },
      { verification: { status: "none", method: null, note: null, at: null }, status: "waiting", flagged: false, rejectReason: null, decidedAt: null, updatedAt: now },
    );
    return;
  }
  if (v.choice === "yes") {
    if (!v.method) throw new Error("Choose how they confirmed");
    if (v.method === "other" && !v.note?.trim()) throw new Error("Add a note about the proof before saving");
    await d.update(
      "claims",
      { id },
      { verification: { status: "yes", method: v.method, note: v.note?.trim() || null, at: now }, status: "verified", updatedAt: now },
    );
    return;
  }
  await d.update(
    "claims",
    { id },
    {
      verification: { status: "no", method: v.method ?? "whatsapp", note: v.note?.trim() || null, at: now },
      status: "rejected",
      flagged: true,
      rejectReason: "The owner said NO",
      decidedAt: now,
      updatedAt: now,
    },
  );
}

/** Apply the ticked changes. Refuses unless ownership was verified. Returns the version id. */
export async function applyClaim(id: number, keys: string[]): Promise<{ versionId: number | null; applied: number; total: number }> {
  const claim = await getClaim(id);
  if (!claim) throw new Error("Claim not found");
  if (claim.verification.status !== "yes" || claim.status !== "verified") {
    throw new Error("Verify ownership first");
  }
  const listing = await getListing(claim.listingId);
  if (!listing) throw new Error("Listing not found");
  const { rows } = claimRows(claim, listing);
  const valid = new Set(rows.map((r) => r.key));
  const chosen = keys.filter((k) => valid.has(k));
  if (!chosen.length) throw new Error("Tick at least one change to apply");
  const next = applyRows(claim, listing, chosen);
  const versionId = await updateListing(claim.listingId, next, {
    kind: "claim",
    actor: `Claim by ${claim.claimantName} applied`,
    note: `${chosen.length} of ${rows.length} changes · verified by ${verifyLabel(claim.verification.method)}`,
    refId: claim.id,
  });
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("claims", { id }, { status: "updated", appliedKeys: chosen, decidedAt: now, updatedAt: now });
  return { versionId, applied: chosen.length, total: rows.length };
}

/** After an Undo of the applied version: the claim is verified again, not applied. */
export async function unapplyClaim(id: number) {
  const d = await getDb();
  await d.update("claims", { id }, { status: "verified", appliedKeys: [], decidedAt: null, updatedAt: new Date().toISOString() });
}

export async function rejectClaim(id: number, reason: string, note: string | null) {
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("claims", { id }, { status: "rejected", rejectReason: reason, note, decidedAt: now, updatedAt: now });
}

export async function reopenClaim(id: number) {
  const d = await getDb();
  const claim = await getClaim(id);
  if (!claim) throw new Error("Claim not found");
  const verified = claim.verification.status === "yes";
  await d.update(
    "claims",
    { id },
    {
      status: verified ? "verified" : "waiting",
      verification: verified ? claim.verification : { status: "none", method: null, note: null, at: null },
      rejectReason: null,
      note: null,
      decidedAt: null,
      flagged: false,
      updatedAt: new Date().toISOString(),
    },
  );
}
