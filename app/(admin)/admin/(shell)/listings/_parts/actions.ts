"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { PLAN_PRICE } from "@/lib/admin/constants";
import { fmtNum, fmtPKR } from "@/lib/admin/format";
import { cityFeaturedMultiple, last30ById } from "@/lib/admin/repo/analytics";
import { getListing } from "@/lib/admin/repo/listings";

/**
 * The Listings ⋯ menu's "Sales message" (Free listings only): the listing's
 * last-30-day numbers and how much better Featured did in its city last
 * month, as a pre-filled WhatsApp message. Nothing is sent from here.
 */
export async function salesMessageAction(
  id: number,
): Promise<{ ok: true; text: string; name: string; whatsapp: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const listing = await getListing(Number(id));
    if (!listing) return { ok: false, error: "That listing no longer exists." };
    const [last30, multiple] = await Promise.all([last30ById(), cityFeaturedMultiple(listing.city)]);
    const t = last30.get(listing.id);
    const opened = t?.opened ?? 0;
    const contacted = t?.contacted ?? 0;
    const parts = [
      `Assalam o Alaikum! Your free RentalSawari listing, last 30 days: ${fmtNum(opened)} ${opened === 1 ? "person" : "people"} opened ${listing.name} and ${fmtNum(contacted)} contacted you.`,
    ];
    if (multiple != null && multiple > 1) {
      const m = multiple.toFixed(1).replace(/\.0$/, "");
      parts.push(`Featured listings in ${listing.city} got ${m}× more contacts last month.`);
    }
    parts.push(`Featured City is ${fmtPKR(PLAN_PRICE.city)}/month. Reply YES and we'll set it up. — RentalSawari`);
    return { ok: true, text: parts.join(" "), name: listing.name, whatsapp: listing.whatsapp || listing.phone };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn't build the message. Try again." };
  }
}
