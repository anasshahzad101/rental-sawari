import "server-only";
import { revalidatePath } from "next/cache";
import { getDb } from "../db";
import type { Row } from "../db/driver";
import { fmtDay, pktDay, slugify } from "../format";
import type { FieldChange, Listing, ListingEditable, ListingField, ListingVersion, VersionKind } from "../types";

/**
 * Listings: reads (cached), writes (always versioned), history, undo and
 * restore. Nothing else may write to the listings table — this is how
 * "every change is logged and can be undone" holds.
 */

type G = typeof globalThis & { __rsListings?: { at: number; list: Listing[]; byId: Map<number, Listing>; bySlug: Map<string, Listing> } | null };
const g = globalThis as G;
const TTL = 60_000;

async function loadAll() {
  const d = await getDb();
  const list = await d.select<Listing>("listings", undefined, { orderBy: "id" });
  const entry = {
    at: Date.now(),
    list,
    byId: new Map(list.map((l) => [l.id, l])),
    bySlug: new Map(list.map((l) => [l.slug, l])),
  };
  g.__rsListings = entry;
  return entry;
}

async function cache() {
  const c = g.__rsListings;
  if (c && Date.now() - c.at < TTL) return c;
  return loadAll();
}

/** Every listing, live and hidden, in id order. Treat as read-only. */
export async function listAll(): Promise<Listing[]> {
  return (await cache()).list;
}

export async function getListing(id: number): Promise<Listing | null> {
  return (await cache()).byId.get(id) ?? null;
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  return (await cache()).bySlug.get(slug) ?? null;
}

/** Area names already used in each city, most common first (AreaInput suggestions). */
export async function areasByCity(limit = 40): Promise<Record<string, string[]>> {
  const counts = new Map<string, Map<string, number>>();
  for (const l of await listAll()) {
    const a = l.area.trim();
    if (!a) continue;
    const m = counts.get(l.city) ?? new Map<string, number>();
    m.set(a, (m.get(a) ?? 0) + 1);
    counts.set(l.city, m);
  }
  const out: Record<string, string[]> = {};
  for (const [city, m] of Array.from(counts)) {
    out[city] = Array.from(m)
      .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
      .slice(0, limit)
      .map(([a]) => a);
  }
  return out;
}

/** Where an old page address now points, if it was renamed. */
export async function resolveRedirect(oldSlug: string): Promise<string | null> {
  const d = await getDb();
  const rows = await d.select<{ oldSlug: string; listingId: number }>("listingRedirects", { oldSlug });
  if (!rows[0]) return null;
  const l = await getListing(rows[0].listingId);
  return l && l.status === "live" && !l.demo ? l.slug : null;
}

/** Drop the cache and tell Next to rebuild every page on its next request. */
export function invalidateListings() {
  g.__rsListings = null;
  try {
    revalidatePath("/", "layout");
  } catch {
    // Outside a request (scripts, build) there is nothing to revalidate.
  }
}

// ── Diffs ────────────────────────────────────────────────────────────────

export const EDITABLE_FIELDS: ListingField[] = [
  "name",
  "slug",
  "city",
  "area",
  "whatsapp",
  "phone",
  "phone2",
  "website",
  "mapsUrl",
  "about",
  "services",
  "cars",
  "logoUrl",
  "googleRating",
  "googleReviews",
  "verified",
  "plan",
  "planStart",
  "planEnd",
  "status",
];

export const FIELD_LABEL: Record<ListingField, string> = {
  name: "Listing name",
  slug: "Page address",
  city: "City",
  area: "Area",
  whatsapp: "WhatsApp",
  phone: "Phone",
  phone2: "Second phone",
  website: "Website",
  mapsUrl: "Google Maps link",
  about: "About",
  services: "Services",
  cars: "Cars and prices",
  logoUrl: "Logo",
  googleRating: "Google rating",
  googleReviews: "Review count",
  verified: "Verified",
  plan: "Plan",
  planStart: "Plan starts",
  planEnd: "Plan ends",
  status: "Status",
};

function norm(v: unknown): unknown {
  if (v === undefined || v === "") return null;
  return v;
}

export function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

export function editable(l: Listing | ListingEditable): ListingEditable {
  const { slug, name, city, area, whatsapp, phone, phone2, website, mapsUrl, about, services, cars, logoUrl, googleRating, googleReviews, responseTime, plan, planStart, planEnd, verified, status } =
    l as Listing;
  return {
    slug,
    name,
    city,
    area,
    whatsapp,
    phone,
    phone2,
    website,
    mapsUrl,
    about,
    services: [...services],
    cars: cars.map((c) => ({ ...c })),
    logoUrl,
    googleRating,
    googleReviews,
    responseTime,
    plan,
    planStart,
    planEnd,
    verified,
    status,
  };
}

export function diffListing(a: ListingEditable, b: ListingEditable): FieldChange[] {
  const out: FieldChange[] = [];
  for (const f of EDITABLE_FIELDS) {
    const x = (a as unknown as Record<string, unknown>)[f];
    const y = (b as unknown as Record<string, unknown>)[f];
    if (!sameValue(x, y)) out.push({ field: f, old: norm(x), new: norm(y) });
  }
  return out;
}

// ── Profile completeness ─────────────────────────────────────────────────

const WEIGHTS: { key: string; label: string; field: ListingField; weight: number; has: (l: Listing) => boolean }[] = [
  { key: "about", label: "Add an about text", field: "about", weight: 25, has: (l) => l.about.trim().length >= 40 },
  { key: "cars", label: "Add cars with prices", field: "cars", weight: 30, has: (l) => l.cars.some((c) => c.pricePerDay > 0) },
  { key: "services", label: "Choose the services", field: "services", weight: 15, has: (l) => l.services.length > 0 },
  { key: "logo", label: "Add a logo", field: "logoUrl", weight: 10, has: (l) => !!l.logoUrl },
  { key: "website", label: "Add a website", field: "website", weight: 10, has: (l) => !!l.website },
  { key: "phone2", label: "Add a second phone", field: "phone2", weight: 10, has: (l) => !!l.phone2 },
];

export function completeness(l: Listing): { pct: number; missing: { key: string; label: string; field: ListingField }[] } {
  let pct = 0;
  const missing: { key: string; label: string; field: ListingField }[] = [];
  for (const w of WEIGHTS) {
    if (w.has(l)) pct += w.weight;
    else missing.push({ key: w.key, label: w.label, field: w.field });
  }
  return { pct, missing };
}

// ── Versions ─────────────────────────────────────────────────────────────

type VersionRow = Omit<ListingVersion, "before"> & { prior: ListingEditable | null };

function fromRow(r: VersionRow): ListingVersion {
  const { prior, ...rest } = r;
  return { ...rest, before: prior };
}

export async function listVersions(listingId: number): Promise<ListingVersion[]> {
  const d = await getDb();
  const rows = await d.select<VersionRow>("listingVersions", { listingId }, { orderBy: "id", desc: true });
  const versions = rows.map(fromRow);
  if (!versions.length) {
    // Listings from the original directory get a stored "Imported" entry on
    // their first change (see updateListing). Until then, show one built from
    // the listing as it stands, so History is never empty.
    const l = await getListing(listingId);
    if (l) {
      versions.push({
        id: 0,
        listingId,
        createdAt: l.createdAt,
        kind: "import",
        actor: "Imported",
        note: "from the original directory",
        changes: [],
        snapshot: editable(l),
        before: null,
        refId: null,
      });
    }
  }
  return versions;
}

export interface WriteMeta {
  kind: VersionKind;
  actor: string;
  note?: string;
  refId?: number | null;
}

async function writeVersion(listingId: number, before: ListingEditable | null, after: ListingEditable, changes: FieldChange[], meta: WriteMeta) {
  const d = await getDb();
  return d.insert("listingVersions", {
    listingId,
    createdAt: new Date().toISOString(),
    kind: meta.kind,
    actor: meta.actor,
    note: meta.note ?? "",
    changes,
    snapshot: after,
    prior: before,
    refId: meta.refId ?? null,
  } as Row);
}

export async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  const all = await listAll();
  const d = await getDb();
  const redirects = await d.select<{ oldSlug: string; listingId: number }>("listingRedirects");
  const taken = new Set([
    ...all.filter((l) => l.id !== exceptId).map((l) => l.slug),
    ...redirects.filter((r) => r.listingId !== exceptId).map((r) => r.oldSlug),
  ]);
  const root = slugify(base) || "listing";
  let s = root;
  for (let i = 2; taken.has(s); i++) s = `${root}-${i}`;
  return s;
}

/** Create a listing. Returns the new id. */
export async function createListing(data: ListingEditable, meta: WriteMeta, opts: { demo?: boolean } = {}): Promise<number> {
  const d = await getDb();
  const now = new Date().toISOString();
  const slug = await uniqueSlug(data.slug || data.name);
  const row: Omit<Listing, "id"> = {
    ...editable({ ...data, slug }),
    hiddenAt: data.status === "hidden" ? now : null,
    createdAt: now,
    updatedAt: now,
    demo: !!opts.demo,
  };
  const id = await d.insert("listings", row as unknown as Row);
  await writeVersion(id, null, editable(row as Listing), [], meta);
  invalidateListings();
  return id;
}

/**
 * Apply a change to a listing and log it. Returns the new version id, or
 * null when nothing actually changed.
 */
export async function updateListing(id: number, next: ListingEditable, meta: WriteMeta): Promise<number | null> {
  const d = await getDb();
  const cur = await d.get<Listing>("listings", id);
  if (!cur) throw new Error("Listing not found");
  const before = editable(cur);
  if (next.slug !== cur.slug) next = { ...next, slug: await uniqueSlug(next.slug, id) };
  const changes = diffListing(before, next);
  if (!changes.length) return null;

  // First change to an imported listing: keep its original state in History.
  const existing = await d.count("listingVersions", { listingId: id });
  if (!existing) {
    await d.insert("listingVersions", {
      listingId: id,
      createdAt: cur.createdAt,
      kind: "import",
      actor: "Imported",
      note: "from the original directory",
      changes: [],
      snapshot: before,
      prior: null,
      refId: null,
    } as Row);
  }

  const now = new Date().toISOString();
  const patch: Row = { ...next, updatedAt: now };
  if (next.status !== cur.status) patch.hiddenAt = next.status === "hidden" ? now : null;
  await d.update("listings", { id }, patch);

  if (next.slug !== cur.slug) {
    // The old address keeps working: /companies/{old} redirects to the new one.
    await d.remove("listingRedirects", { oldSlug: next.slug });
    const known = await d.select("listingRedirects", { oldSlug: cur.slug });
    if (known.length) await d.update("listingRedirects", { oldSlug: cur.slug }, { listingId: id });
    else await d.insert("listingRedirects", { oldSlug: cur.slug, listingId: id, createdAt: now });
  }

  const vid = await writeVersion(id, before, editable({ ...cur, ...next } as Listing), changes, meta);
  invalidateListings();
  return vid;
}

/** Restore an old version (its snapshot) as a new "Restored by you" version. */
export async function restoreVersion(listingId: number, versionId: number): Promise<number | null> {
  const versions = await listVersions(listingId);
  const v = versions.find((x) => x.id === versionId) ?? (versionId === 0 ? versions[versions.length - 1] : undefined);
  if (!v) throw new Error("Version not found");
  if (v === versions[0]) throw new Error("That is already the current version");
  return updateListing(listingId, { ...v.snapshot }, {
    kind: "restore",
    actor: "Restored by you",
    note: `back to the version from ${fmtDay(pktDay(v.createdAt))}`,
  });
}

/**
 * Undo a version right after it was made (the toast's Undo): put the
 * listing back as it was and drop the version, so History reads as if it
 * never happened. Only the newest version of a listing can be undone.
 */
export async function undoVersion(versionId: number): Promise<{ listingId: number; kind: VersionKind; refId: number | null }> {
  const d = await getDb();
  const v = await d.get<VersionRow>("listingVersions", versionId);
  if (!v) throw new Error("Nothing to undo");
  const newest = await d.select<VersionRow>("listingVersions", { listingId: v.listingId }, { orderBy: "id", desc: true, limit: 1 });
  if (newest[0]?.id !== v.id) throw new Error("A later change was made, so this one can't be undone. Use History instead.");
  if (!v.prior) throw new Error("This change can't be undone");
  const cur = await d.get<Listing>("listings", v.listingId);
  if (!cur) throw new Error("Listing not found");
  const now = new Date().toISOString();
  const patch: Row = { ...v.prior, updatedAt: now };
  if (v.prior.status !== cur.status) patch.hiddenAt = v.prior.status === "hidden" ? now : null;
  await d.update("listings", { id: v.listingId }, patch);
  if (v.prior.slug !== cur.slug) {
    await d.remove("listingRedirects", { oldSlug: v.prior.slug });
    await d.remove("listingRedirects", { oldSlug: cur.slug, listingId: v.listingId });
  }
  await d.remove("listingVersions", { id: v.id });
  invalidateListings();
  return { listingId: v.listingId, kind: v.kind, refId: v.refId };
}

/** Change a few fields (plan, status…) through the same versioned path. */
export async function patchListing(id: number, patch: Partial<ListingEditable>, meta: WriteMeta): Promise<number | null> {
  const cur = await getListing(id);
  if (!cur) throw new Error("Listing not found");
  return updateListing(id, { ...editable(cur), ...patch }, meta);
}
