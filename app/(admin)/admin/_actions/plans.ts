"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { addDays, addMonths, pktDay } from "@/lib/admin/format";
import { getMonthStats, monthlyMessage } from "@/lib/admin/repo/analytics";
import { getListing, patchListing } from "@/lib/admin/repo/listings";
import type { ActionResult } from "./listings";

/** Featured plans: extend, switch to Free, and the monthly stats message. */

function fail(e: unknown): { ok: false; error: string } {
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Try again." };
}

/** The new start and end for an extension that continues from the old end. */
function extension(planEnd: string | null, opt: { months?: number; endDate?: string }): { start: string; end: string } {
  const start = planEnd ? addDays(planEnd, 1) : pktDay();
  if (opt.endDate && /^\d{4}-\d{2}-\d{2}$/.test(opt.endDate)) {
    if (opt.endDate < start) throw new Error("Pick an end date after the plan's current end");
    return { start, end: opt.endDate };
  }
  const months = Math.max(1, Math.min(24, Math.round(opt.months ?? 1)));
  return { start, end: addDays(addMonths(start, months), -1) };
}

export async function extendPlanAction(listingId: number, opt: { months?: number; endDate?: string }): Promise<ActionResult<{ versionId: number | null; start: string; end: string }>> {
  await requireAdmin();
  try {
    const l = await getListing(listingId);
    if (!l) return { ok: false, error: "Listing not found" };
    if (l.plan === "free") return { ok: false, error: "This listing isn't on a Featured plan" };
    const { start, end } = extension(l.planEnd, opt);
    const versionId = await patchListing(listingId, { planStart: start, planEnd: end }, { kind: "edit", actor: "Edited by you", note: "plan extended" });
    revalidatePath("/admin", "layout");
    return { ok: true, versionId, start, end };
  } catch (e) {
    return fail(e);
  }
}

export async function switchToFreeAction(listingId: number): Promise<ActionResult<{ versionId: number | null }>> {
  await requireAdmin();
  try {
    const versionId = await patchListing(listingId, { plan: "free", planStart: null, planEnd: null }, { kind: "edit", actor: "Edited by you" });
    revalidatePath("/admin", "layout");
    return { ok: true, versionId };
  } catch (e) {
    return fail(e);
  }
}

/** The monthly stats WhatsApp text for a listing (month = "YYYY-MM-01"; default last month). */
export async function monthlyMessageAction(listingId: number, month?: string): Promise<ActionResult<{ text: string; monthLabel: string; month: string }>> {
  await requireAdmin();
  try {
    const l = await getListing(listingId);
    if (!l) return { ok: false, error: "Listing not found" };
    const m = await getMonthStats(l, month);
    return { ok: true, text: monthlyMessage(l, m), monthLabel: m.monthLabel, month: m.month };
  } catch (e) {
    return fail(e);
  }
}
