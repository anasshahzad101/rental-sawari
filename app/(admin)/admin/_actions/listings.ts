"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { CITIES } from "@/lib/admin/constants";
import { normalizePhone } from "@/lib/admin/format";
import { getListing, editable, createListing, updateListing, restoreVersion, undoVersion, patchListing } from "@/lib/admin/repo/listings";
import { unapplyClaim } from "@/lib/admin/repo/claims";
import { MediaError, resolveLogo } from "@/lib/admin/repo/media";
import * as clean from "@/lib/admin/repo/sanitize";
import type { CarRow, ListingEditable, Plan } from "@/lib/admin/types";

/**
 * Server actions for listings (Edit, Add, History, Hide, Undo). Every one
 * re-checks the admin session — never trust that the page did.
 */

export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string; fieldErrors?: Record<string, string> };

export interface ListingFormInput {
  name: string;
  slug: string;
  city: string;
  area: string;
  whatsapp: string;
  phone: string;
  phone2: string;
  website: string;
  mapsUrl: string;
  about: string;
  services: string[];
  cars: CarRow[];
  /** Existing URL, a new data: URL from the upload control, or null. */
  logo: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  verified: boolean;
  plan: Plan;
  planStart: string | null;
  planEnd: string | null;
  status: "live" | "hidden";
}

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Try again." };
}

const isDay = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Validate and clean the Edit / Add form. Field keys match the form. */
async function toEditable(input: ListingFormInput, ref: string): Promise<{ data?: ListingEditable; fieldErrors?: Record<string, string> }> {
  const fieldErrors: Record<string, string> = {};
  const name = clean.str(input.name, 255);
  if (!name) fieldErrors.name = "Enter the listing name";
  const city = clean.str(input.city, 60);
  if (!(CITIES as readonly string[]).includes(city)) fieldErrors.city = "Choose a city";
  const whatsapp = normalizePhone(input.whatsapp);
  if (!whatsapp) fieldErrors.whatsapp = "Enter a WhatsApp number like +92 300 1234567";
  const phone = input.phone?.trim() ? normalizePhone(input.phone) : null;
  if (input.phone?.trim() && !phone) fieldErrors.phone = "Enter a phone number like +92 300 1234567";
  const phone2 = input.phone2?.trim() ? normalizePhone(input.phone2) : null;
  if (input.phone2?.trim() && !phone2) fieldErrors.phone2 = "Enter a phone number like +92 51 2345678";
  const website = input.website?.trim() ? clean.url(input.website) : null;
  if (input.website?.trim() && !website) fieldErrors.website = "Enter a website like margallarentacar.pk";
  const mapsUrl = input.mapsUrl?.trim() ? clean.url(input.mapsUrl) : null;
  const rating = input.googleRating == null || (input.googleRating as unknown) === "" ? null : Number(input.googleRating);
  if (rating != null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) fieldErrors.googleRating = "A rating is between 0 and 5";
  const reviews = input.googleReviews == null || (input.googleReviews as unknown) === "" ? null : clean.int(input.googleReviews, 10_000_000);
  const plan: Plan = input.plan === "city" || input.plan === "plus" ? input.plan : "free";
  const planStart = plan !== "free" && isDay(input.planStart) ? input.planStart : null;
  const planEnd = plan !== "free" && isDay(input.planEnd) ? input.planEnd : null;
  if (plan !== "free" && planStart && planEnd && planEnd < planStart) fieldErrors.planEnd = "The plan must end after it starts";
  const slug = clean.str(input.slug, 160).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  let logoUrl: string | null = null;
  try {
    logoUrl = await resolveLogo(input.logo, ref);
  } catch (e) {
    if (e instanceof MediaError) return { fieldErrors: { logo: e.message } };
    throw e;
  }

  return {
    data: {
      slug,
      name,
      city,
      area: clean.str(input.area, 160),
      whatsapp: whatsapp!,
      phone: phone ?? whatsapp!,
      phone2,
      website,
      mapsUrl,
      about: clean.text(input.about, 5000),
      services: clean.services(input.services),
      cars: clean.cars(input.cars),
      logoUrl,
      googleRating: rating == null ? null : Math.round(rating * 10) / 10,
      googleReviews: reviews,
      responseTime: null,
      plan,
      planStart,
      planEnd,
      verified: !!input.verified,
      status: input.status === "hidden" ? "hidden" : "live",
    },
  };
}

function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

export async function saveListingAction(id: number, input: ListingFormInput): Promise<ActionResult<{ versionId: number | null; slug: string }>> {
  await requireAdmin();
  try {
    const cur = await getListing(id);
    if (!cur) return { ok: false, error: "This listing no longer exists." };
    const { data, fieldErrors } = await toEditable(input, `listing:${id}`);
    if (!data) return { ok: false, error: "Some fields need fixing.", fieldErrors };
    data.responseTime = cur.responseTime;
    if (!data.slug) data.slug = cur.slug;
    const versionId = await updateListing(id, data, { kind: "edit", actor: "Edited by you" });
    refreshAdmin();
    const after = await getListing(id);
    return { ok: true, versionId, slug: after?.slug ?? data.slug };
  } catch (e) {
    return fail(e);
  }
}

export async function createListingAction(input: ListingFormInput): Promise<ActionResult<{ id: number }>> {
  await requireAdmin();
  try {
    const { data, fieldErrors } = await toEditable({ ...input, plan: input.plan ?? "free", status: input.status ?? "live" }, "listing:new");
    if (!data) return { ok: false, error: "Some fields need fixing.", fieldErrors };
    const id = await createListing(data, { kind: "create", actor: "Added by you", note: "added in the admin" });
    refreshAdmin();
    return { ok: true, id };
  } catch (e) {
    return fail(e);
  }
}

export async function setListingStatusAction(id: number, status: "live" | "hidden"): Promise<ActionResult<{ versionId: number | null }>> {
  await requireAdmin();
  try {
    const versionId = await patchListing(id, { status }, { kind: "edit", actor: "Edited by you" });
    refreshAdmin();
    return { ok: true, versionId };
  } catch (e) {
    return fail(e);
  }
}

export async function restoreVersionAction(listingId: number, versionId: number): Promise<ActionResult<{ versionId: number | null }>> {
  await requireAdmin();
  try {
    const vid = await restoreVersion(listingId, versionId);
    refreshAdmin();
    return { ok: true, versionId: vid };
  } catch (e) {
    return fail(e);
  }
}

/**
 * The toast's Undo for any listing change: puts the listing back and drops
 * the version. Undoing an applied claim makes that claim "verified" again.
 */
export async function undoVersionAction(versionId: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    const r = await undoVersion(versionId);
    if (r.kind === "claim" && r.refId) await unapplyClaim(r.refId);
    refreshAdmin();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** The current state of a listing as the form's starting values. */
export async function listingFormValues(id: number): Promise<ListingFormInput | null> {
  await requireAdmin();
  const l = await getListing(id);
  if (!l) return null;
  const e = editable(l);
  return {
    name: e.name,
    slug: e.slug,
    city: e.city,
    area: e.area,
    whatsapp: e.whatsapp,
    phone: e.phone,
    phone2: e.phone2 ?? "",
    website: e.website ?? "",
    mapsUrl: e.mapsUrl ?? "",
    about: e.about,
    services: e.services,
    cars: e.cars,
    logo: e.logoUrl,
    googleRating: e.googleRating,
    googleReviews: e.googleReviews,
    verified: e.verified,
    plan: e.plan,
    planStart: e.planStart,
    planEnd: e.planEnd,
    status: e.status,
  };
}
