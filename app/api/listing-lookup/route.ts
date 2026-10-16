import { normalizePhone, phoneLast4 } from "@/lib/admin/format";
import { clientIp, json, rateLimited } from "@/lib/admin/repo/guard";
import { listAll } from "@/lib/admin/repo/listings";
import { findByNumber } from "@/lib/admin/repo/requests";

/**
 * Public lookups for the business forms:
 *  GET /api/listing-lookup?whatsapp=03001234567  → is this number already listed?
 *  GET /api/listing-lookup?q=margalla             → find a listing to claim
 * Only what is already public on the listing pages is returned, and phone
 * numbers only as their last 4 digits.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (rateLimited(`lookup:${clientIp(req)}`, 60, 60 * 1000)) return json({ error: "Too many lookups" }, 429);
  const url = new URL(req.url);

  const wa = url.searchParams.get("whatsapp");
  if (wa !== null) {
    const n = normalizePhone(wa);
    if (!n) return json({ match: null });
    const l = await findByNumber(n);
    return json({ match: l && l.status === "live" && !l.demo ? { slug: l.slug, name: l.name, city: l.city, area: l.area } : null });
  }

  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return json({ results: [] });
  const digits = q.replace(/\D/g, "");
  const all = (await listAll()).filter((l) => l.status === "live" && !l.demo);
  const results = all
    .filter((l) =>
      digits.length >= 4
        ? l.whatsapp.replace(/\D/g, "").includes(digits.replace(/^0/, "")) || l.phone.replace(/\D/g, "").includes(digits.replace(/^0/, ""))
        : l.name.toLowerCase().includes(q),
    )
    .slice(0, 8)
    .map((l) => ({ slug: l.slug, name: l.name, city: l.city, area: l.area, last4: phoneLast4(l.whatsapp), logoUrl: l.logoUrl }));
  return json({ results });
}
