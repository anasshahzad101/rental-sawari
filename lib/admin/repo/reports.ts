import "server-only";
import { getDb } from "../db";
import type { Row } from "../db/driver";
import { REPORT_REASON_LABEL } from "../constants";
import { fmtPhone } from "../format";
import type { Report, ReportReason } from "../types";
import { getListing } from "./listings";
import { notifyOwner } from "../notify";

/**
 * Problem reports from the "Report a problem" link on every listing.
 * A "Fake or scam listing" report is urgent and sorts first.
 */

export function isUrgent(r: Pick<Report, "reason">): boolean {
  return r.reason === "scam";
}

export async function listReports(): Promise<Report[]> {
  const d = await getDb();
  const all = await d.select<Report>("reports", undefined, { orderBy: "id", desc: true });
  return all.sort((a, b) => Number(isUrgent(b)) - Number(isUrgent(a)) || b.id - a.id);
}

export async function getReport(id: number): Promise<Report | null> {
  const d = await getDb();
  return d.get<Report>("reports", id);
}

export async function reportsForListing(listingId: number): Promise<Report[]> {
  const d = await getDb();
  return d.select<Report>("reports", { listingId }, { orderBy: "id", desc: true });
}

export async function createReport(input: { listingId: number; reason: ReportReason; details: string | null; reporterWhatsapp: string | null }): Promise<number> {
  const listing = await getListing(input.listingId);
  if (!listing) throw new Error("Listing not found");
  const d = await getDb();
  const now = new Date().toISOString();
  const id = await d.insert("reports", {
    createdAt: now,
    updatedAt: now,
    listingId: input.listingId,
    reason: input.reason,
    details: input.details,
    reporterWhatsapp: input.reporterWhatsapp,
    status: "new",
    resolvedNote: null,
    resolvedAt: null,
  } as Row);
  notifyOwner(
    `${isUrgent(input) ? "URGENT · " : ""}Problem report: ${listing.name}`,
    [
      `${REPORT_REASON_LABEL[input.reason]} · ${listing.name}, ${listing.city}`,
      input.details ? `"${input.details}"` : "",
      input.reporterWhatsapp ? `Reporter: ${fmtPhone(input.reporterWhatsapp)}` : "The reporter left no contact.",
    ].filter(Boolean),
    `/admin/inbox/reports?id=${id}`,
  );
  return id;
}

export async function resolveReport(id: number, note: string | null) {
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("reports", { id }, { status: "resolved", resolvedNote: note, resolvedAt: now, updatedAt: now });
}

export async function dismissReport(id: number) {
  const d = await getDb();
  const now = new Date().toISOString();
  await d.update("reports", { id }, { status: "dismissed", resolvedAt: now, updatedAt: now });
}

export async function reopenReport(id: number) {
  const d = await getDb();
  await d.update("reports", { id }, { status: "new", resolvedNote: null, resolvedAt: null, updatedAt: new Date().toISOString() });
}
