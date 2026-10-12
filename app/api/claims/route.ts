import { isSiteCity } from "@/lib/admin/constants";
import { createClaim } from "@/lib/admin/repo/claims";
import { clientIp, json, looksLikeBot, rateLimited } from "@/lib/admin/repo/guard";
import { getListingBySlug } from "@/lib/admin/repo/listings";
import { MediaError, storeDataUrl } from "@/lib/admin/repo/media";
import * as clean from "@/lib/admin/repo/sanitize";
import type { ClaimChanges } from "@/lib/admin/types";

/**
 * POST /api/claims — "Claim this listing" (/companies/{slug}/claim).
 * Stores the requested changes as a claim. The listing does not change until
 * the owner of RentalSawari has confirmed ownership with the number already
 * on the listing and pressed Update listing in the admin.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  if (looksLikeBot(body)) return json({ ok: true, id: 0 });
  if (rateLimited(`claim:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, 429);
  }

  const listing = await getListingBySlug(clean.str(body.slug, 160));
  if (!listing || listing.status !== "live") return json({ ok: false, error: "That listing isn't on the site." }, 404);

  const claimantName = clean.str(body.name, 200);
  const claimantWhatsapp = clean.phone(body.whatsapp);
  const errors: Record<string, string> = {};
  if (!claimantName) errors.name = "Enter your name";
  if (!claimantWhatsapp) errors.whatsapp = "Enter a WhatsApp number like 0300 1234567";
  if (Object.keys(errors).length) return json({ ok: false, error: "Some details need fixing.", fieldErrors: errors }, 400);

  const c = (body.changes ?? {}) as Record<string, unknown>;
  const proposed: ClaimChanges = {};
  if (c.name !== undefined) proposed.name = clean.str(c.name, 255) || listing.name;
  if (c.city !== undefined && isSiteCity(clean.str(c.city, 60))) proposed.city = clean.str(c.city, 60);
  if (c.area !== undefined) proposed.area = clean.str(c.area, 160);
  if (c.whatsapp !== undefined) proposed.whatsapp = clean.phone(c.whatsapp) ?? listing.whatsapp;
  if (c.phone !== undefined) proposed.phone = c.phone ? clean.phone(c.phone) ?? listing.phone : listing.whatsapp;
  if (c.website !== undefined) proposed.website = c.website ? clean.url(c.website) : null;
  if (c.about !== undefined) proposed.about = clean.text(c.about, 3000);
  if (c.services !== undefined) proposed.services = clean.services(c.services);
  if (c.cars !== undefined) proposed.cars = clean.cars(c.cars);
  if (c.logo === null && listing.logoUrl) proposed.logoUrl = null; // "remove our logo"
  if (typeof c.logo === "string" && c.logo.startsWith("data:")) {
    try {
      proposed.logoUrl = await storeDataUrl(c.logo, `claim:${listing.id}`);
    } catch (e) {
      if (e instanceof MediaError) return json({ ok: false, error: e.message, fieldErrors: { logo: e.message } }, 400);
      throw e;
    }
  }

  try {
    const id = await createClaim({
      listingId: listing.id,
      claimantName,
      role: body.role === "staff" ? "staff" : "owner",
      claimantWhatsapp: claimantWhatsapp!,
      message: clean.text(body.message, 2000) || null,
      proposed,
      closeRequested: body.closeRequested === true,
    });
    return json({ ok: true, id });
  } catch (e) {
    console.error("[claims] could not save:", e);
    return json({ ok: false, error: "Your changes couldn't be sent." }, 500);
  }
}
