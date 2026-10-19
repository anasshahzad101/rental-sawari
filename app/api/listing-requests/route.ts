import { isSiteCity } from "@/lib/admin/constants";
import { clientIp, json, looksLikeBot, rateLimited } from "@/lib/admin/repo/guard";
import { MediaError, storeDataUrl } from "@/lib/admin/repo/media";
import { createRequest } from "@/lib/admin/repo/requests";
import * as clean from "@/lib/admin/repo/sanitize";
import type { ListingRequestPayload } from "@/lib/admin/types";

/**
 * POST /api/listing-requests — the "List your business" form.
 * Saves a request into the admin Inbox (and emails the owner). Nothing goes
 * on the site until the owner approves it.
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
  if (looksLikeBot(body, "listing-requests")) return json({ ok: true, id: 0 });
  if (rateLimited(`req:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, 429);
  }

  const name = clean.str(body.name, 255);
  const city = clean.str(body.city, 60);
  const cityOther = clean.str(body.cityOther, 60);
  const ownerName = clean.str(body.ownerName, 200);
  const whatsapp = clean.phone(body.whatsapp);
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Enter your company name";
  else if (!clean.isValidCompanyName(name))
    errors.name = "Name must be at least 3 characters and start with a letter or digit";
  if (!isSiteCity(city) && !cityOther) errors.city = "Choose your city";
  if (!ownerName) errors.ownerName = "Enter your name";
  if (!whatsapp) errors.whatsapp = "Enter a WhatsApp number like 0300 1234567";
  if (Object.keys(errors).length) return json({ ok: false, error: "Some details need fixing.", fieldErrors: errors }, 400);

  let logoUrl: string | null = null;
  if (typeof body.logo === "string" && body.logo.startsWith("data:")) {
    try {
      logoUrl = await storeDataUrl(body.logo, "request");
    } catch (e) {
      if (e instanceof MediaError) return json({ ok: false, error: e.message, fieldErrors: { logo: e.message } }, 400);
      throw e;
    }
  }

  const payload: ListingRequestPayload = {
    name,
    city: isSiteCity(city) ? city : "",
    cityOther: isSiteCity(city) ? "" : cityOther,
    area: clean.str(body.area, 160),
    address: clean.str(body.address, 300),
    website: clean.url(body.website) ?? "",
    mapsUrl: clean.url(body.mapsUrl) ?? "",
    ownerName,
    whatsapp: whatsapp!,
    phone: clean.phone(body.phone) ?? "",
    services: clean.services(body.services),
    cars: clean.cars(body.cars),
    fleetSize: clean.int(body.fleetSize, 10000),
    about: clean.text(body.about, 3000),
    logoUrl,
  };

  try {
    const id = await createRequest(payload);
    return json({ ok: true, id });
  } catch (e) {
    console.error("[listing-requests] could not save:", e);
    return json({ ok: false, error: "Your request couldn't be sent." }, 500);
  }
}
