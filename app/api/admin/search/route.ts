import { adminGuard } from "@/lib/admin/auth";
import { last30ById } from "@/lib/admin/repo/analytics";
import { listAll } from "@/lib/admin/repo/listings";

/**
 * GET /api/admin/search?q=… — the admin's global search. Matches name,
 * city, area and phone numbers (ignoring a leading 0, +92 and spaces);
 * ordered by contacts in the last 30 days.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return Response.json({ results: [] });
  const digits = q.replace(/\D/g, "").replace(/^(0092|92|0)/, "");
  const [all, stats] = await Promise.all([listAll(), last30ById()]);
  const hits = all.filter((l) => {
    if (digits.length >= 3 && /^[\d\s+()-]+$/.test(q)) {
      return [l.whatsapp, l.phone, l.phone2].some((p) => (p ?? "").replace(/\D/g, "").includes(digits));
    }
    return l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.area.toLowerCase().includes(q) || l.slug.includes(q);
  });
  const results = hits
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      name: l.name,
      city: l.city,
      area: l.area,
      plan: l.plan,
      status: l.status,
      logoUrl: l.logoUrl,
      whatsapp: l.whatsapp,
      opened: stats.get(l.id)?.opened ?? 0,
      contacted: stats.get(l.id)?.contacted ?? 0,
    }))
    .sort((a, b) => b.contacted - a.contacted || b.opened - a.opened || a.name.localeCompare(b.name))
    .slice(0, 8);
  return Response.json({ results, total: hits.length });
}
