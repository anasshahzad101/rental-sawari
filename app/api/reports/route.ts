import { REPORT_REASONS } from "@/lib/admin/constants";
import { clientIp, json, looksLikeBot, rateLimited } from "@/lib/admin/repo/guard";
import { getListingBySlug } from "@/lib/admin/repo/listings";
import { createReport } from "@/lib/admin/repo/reports";
import * as clean from "@/lib/admin/repo/sanitize";
import type { ReportReason } from "@/lib/admin/types";

/** POST /api/reports — "Report a problem" on a listing page. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  if (looksLikeBot(body, "reports")) return json({ ok: true });
  if (rateLimited(`report:${clientIp(req)}`, 6, 10 * 60 * 1000)) {
    return json({ ok: false, error: "Too many reports. Please try again in a few minutes." }, 429);
  }
  const listing = await getListingBySlug(clean.str(body.slug, 160));
  if (!listing) return json({ ok: false, error: "That listing isn't on the site." }, 404);
  const reason = body.reason as ReportReason;
  if (!REPORT_REASONS.includes(reason)) return json({ ok: false, error: "Choose a reason to send" }, 400);
  try {
    await createReport({
      listingId: listing.id,
      reason,
      details: clean.text(body.details, 2000) || null,
      reporterWhatsapp: clean.phone(body.whatsapp),
    });
    return json({ ok: true });
  } catch (e) {
    console.error("[reports] could not save:", e);
    return json({ ok: false, error: "Your report couldn't be sent." }, 500);
  }
}
