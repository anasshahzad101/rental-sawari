"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { normalizePhone } from "@/lib/admin/format";
import { applyClaim, rejectClaim, reopenClaim, setVerification } from "@/lib/admin/repo/claims";
import { getListing, patchListing } from "@/lib/admin/repo/listings";
import { MediaError, resolveLogo } from "@/lib/admin/repo/media";
import { dismissReport, getReport, reopenReport, resolveReport } from "@/lib/admin/repo/reports";
import { approveRequest, convertToClaim, getRequest, rejectRequest, reopenRequest, setFixes } from "@/lib/admin/repo/requests";
import * as clean from "@/lib/admin/repo/sanitize";
import type { ListingRequestPayload, VerifyMethod } from "@/lib/admin/types";
import type { ActionResult } from "./listings";

/** Server actions for the Inbox: listing requests, claims and problem reports. */

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Try again." };
}

function refresh() {
  revalidatePath("/admin", "layout");
}

// ── Listing requests ─────────────────────────────────────────────────────

export async function fixRequestAction(id: number, fixes: Partial<ListingRequestPayload>): Promise<ActionResult> {
  await requireAdmin();
  try {
    const out: Partial<ListingRequestPayload> = {};
    if (fixes.name !== undefined) out.name = clean.str(fixes.name, 255);
    if (fixes.city !== undefined) out.city = clean.str(fixes.city, 60);
    if (fixes.area !== undefined) out.area = clean.str(fixes.area, 160);
    if (fixes.address !== undefined) out.address = clean.str(fixes.address, 300);
    if (fixes.website !== undefined) out.website = fixes.website ? clean.url(fixes.website) ?? "" : "";
    if (fixes.mapsUrl !== undefined) out.mapsUrl = fixes.mapsUrl ? clean.url(fixes.mapsUrl) ?? "" : "";
    if (fixes.ownerName !== undefined) out.ownerName = clean.str(fixes.ownerName, 200);
    if (fixes.whatsapp !== undefined) {
      const w = normalizePhone(fixes.whatsapp);
      if (!w) return { ok: false, error: "Enter a WhatsApp number like +92 300 1234567", fieldErrors: { whatsapp: "Enter a WhatsApp number like +92 300 1234567" } };
      out.whatsapp = w;
    }
    if (fixes.phone !== undefined) out.phone = fixes.phone ? normalizePhone(fixes.phone) ?? "" : "";
    if (fixes.services !== undefined) out.services = clean.services(fixes.services);
    if (fixes.cars !== undefined) out.cars = clean.cars(fixes.cars);
    if (fixes.fleetSize !== undefined) out.fleetSize = clean.int(fixes.fleetSize, 10000);
    if (fixes.about !== undefined) out.about = clean.text(fixes.about, 5000);
    if (fixes.logoUrl !== undefined) {
      try {
        out.logoUrl = await resolveLogo(fixes.logoUrl, `request:${id}`);
      } catch (e) {
        if (e instanceof MediaError) return { ok: false, error: e.message };
        throw e;
      }
    }
    await setFixes(id, out);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function approveRequestAction(id: number): Promise<ActionResult<{ listingId: number; slug: string }>> {
  await requireAdmin();
  try {
    const listingId = await approveRequest(id);
    const l = await getListing(listingId);
    refresh();
    return { ok: true, listingId, slug: l?.slug ?? "" };
  } catch (e) {
    return fail(e);
  }
}

export async function rejectRequestAction(id: number, reason: string, note: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    if (!(await getRequest(id))) return { ok: false, error: "Request not found" };
    await rejectRequest(id, clean.str(reason, 200) || "Other", clean.text(note, 2000) || null);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function reopenRequestAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await reopenRequest(id);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function convertRequestAction(id: number): Promise<ActionResult<{ claimId: number }>> {
  await requireAdmin();
  try {
    const claimId = await convertToClaim(id);
    refresh();
    return { ok: true, claimId };
  } catch (e) {
    return fail(e);
  }
}

// ── Claims ───────────────────────────────────────────────────────────────

export async function verifyClaimAction(
  id: number,
  input: { choice: "yes" | "no"; method: VerifyMethod | null; note: string | null },
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await setVerification(id, { choice: input.choice, method: input.method, note: input.note ? clean.text(input.note, 1000) : null });
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** The Undo on a recorded verification (YES or NO). */
export async function clearVerificationAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await setVerification(id, { choice: "none" });
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function applyClaimAction(id: number, keys: string[]): Promise<ActionResult<{ versionId: number | null; applied: number; total: number }>> {
  await requireAdmin();
  try {
    const r = await applyClaim(id, Array.isArray(keys) ? keys.filter((k) => typeof k === "string") : []);
    refresh();
    return { ok: true, ...r };
  } catch (e) {
    return fail(e);
  }
}

export async function rejectClaimAction(id: number, reason: string, note: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await rejectClaim(id, clean.str(reason, 200) || "Other", clean.text(note, 2000) || null);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function reopenClaimAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await reopenClaim(id);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Problem reports ──────────────────────────────────────────────────────

export async function resolveReportAction(id: number, note: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await resolveReport(id, clean.text(note, 2000) || null);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function dismissReportAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await dismissReport(id);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function reopenReportAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await reopenReport(id);
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Hide the reported listing, optionally marking the report resolved too. */
export async function hideFromReportAction(reportId: number, alsoResolve: boolean): Promise<ActionResult<{ versionId: number | null }>> {
  await requireAdmin();
  try {
    const r = await getReport(reportId);
    if (!r) return { ok: false, error: "Report not found" };
    const versionId = await patchListing(r.listingId, { status: "hidden" }, { kind: "edit", actor: "Edited by you", note: "hidden after a problem report" });
    if (alsoResolve) await resolveReport(reportId, "Hid the listing.");
    refresh();
    return { ok: true, versionId };
  } catch (e) {
    return fail(e);
  }
}
