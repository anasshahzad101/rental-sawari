import { adminGuard } from "@/lib/admin/auth";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { fmtPhone, pktDay } from "@/lib/admin/format";
import { parseRange } from "@/lib/admin/ranges";
import { getListingRows } from "@/lib/admin/repo/analytics";

/**
 * GET /api/admin/export/listings?range=last30… — the Listings table as CSV
 * (Export CSV button). Same range parameters as the page.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const range = parseRange(new URL(req.url).searchParams);
  const { rows } = await getListingRows(range);
  const head = [
    "Listing",
    "City",
    "Area",
    "Plan",
    "Status",
    "Verified",
    "WhatsApp",
    "Shown",
    "Opened",
    "Open rate %",
    "Contacted",
    "WhatsApp clicks",
    "Calls",
    "Inquiry forms",
    "Contact rate %",
    "Website clicks",
    "Unique visitors",
    "Avg position",
    "Rank in city",
    "Profile completeness %",
    "Page",
  ];
  const lines = [head.join(",")];
  for (const r of rows.sort((a, b) => b.totals.contacted - a.totals.contacted)) {
    const t = r.totals;
    const l = r.listing;
    lines.push(
      [
        l.name,
        l.city,
        l.area,
        PLAN_LABEL[l.plan],
        l.status === "live" ? "Live" : "Hidden",
        l.verified ? "Yes" : "No",
        fmtPhone(l.whatsapp),
        t.shown,
        t.opened,
        t.shown ? ((t.opened / t.shown) * 100).toFixed(1) : "",
        t.contacted,
        t.wa,
        t.call,
        t.form,
        t.opened ? ((t.contacted / t.opened) * 100).toFixed(1) : "",
        t.web,
        t.visitors,
        r.avgPos != null ? r.avgPos.toFixed(1) : "",
        r.rank ? `${r.rank.rank} of ${r.rank.of}` : "",
        r.completeness,
        `https://rentalsawari.com/companies/${l.slug}`,
      ]
        .map(cell)
        .join(","),
    );
  }
  const name = `rentalsawari-listings-${range.start}-to-${range.end}-${pktDay()}.csv`;
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
