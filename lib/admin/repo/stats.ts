import "server-only";
import { createHash } from "node:crypto";
import { getDb, getMeta } from "../db";
import type { Row } from "../db/driver";
import { pktDay, pktHour } from "../format";
import type { ContactMethod, DeviceKey, EventKind, SourceKey } from "../types";
import { getListingBySlug, resolveRedirect } from "./listings";

/**
 * Stats storage: what the public tracker sends (app/api/t/route.ts) and the
 * raw reads the analytics layer aggregates.
 *
 * - Opens, contacts and website clicks are one row each in stat_events.
 * - "Shown" is far more frequent (every card on every list page), so it is
 *   counted, not logged: stat_shown keeps one row per day × listing × page
 *   with a running count and the sum of positions (for the average).
 *
 * Visitors are stored as a 16-character hash of (day, browser id), so a
 * person can be counted once per device per day but never followed across
 * days, and no IP address is ever stored.
 */

export interface InEvent {
  t: "s" | "o" | "c" | "w";
  l: string; // listing slug
  p?: string; // list page (shown)
  n?: number; // position (shown)
  m?: ContactMethod; // contact method
  src?: SourceKey;
  en?: string; // entry page
  d?: DeviceKey;
}

const SOURCES: SourceKey[] = ["google", "direct", "social", "ai", "whatsapp", "bing", "other"];
const DEVICES: DeviceKey[] = ["phone", "desktop", "tablet"];
const METHODS: ContactMethod[] = ["wa", "call", "form"];

export function cleanPath(p: unknown): string {
  if (typeof p !== "string" || !p.startsWith("/")) return "";
  return p.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "").slice(0, 191) || "/";
}

function visitorHash(raw: string, day: string): string {
  const salt = process.env.TRACK_SALT || process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "rentalsawari";
  return createHash("sha256").update(`${salt}|${day}|${raw}`).digest("hex").slice(0, 16);
}

const slugIds = new Map<string, { id: number | null; at: number }>();

async function idForSlug(slug: string): Promise<number | null> {
  const hit = slugIds.get(slug);
  if (hit && Date.now() - hit.at < 300_000) return hit.id;
  let l = await getListingBySlug(slug);
  if (!l) {
    const moved = await resolveRedirect(slug);
    if (moved) l = await getListingBySlug(moved);
  }
  const id = l ? l.id : null;
  if (slugIds.size > 5000) slugIds.clear();
  slugIds.set(slug, { id, at: Date.now() });
  return id;
}

/** Store one batch from a browser. Unknown listings and junk are dropped. */
export async function recordBatch(visitorRaw: string, events: InEvent[], now = new Date()): Promise<number> {
  const day = pktDay(now);
  const hour = pktHour(now);
  const ts = now.toISOString();
  const visitor = visitorHash(visitorRaw.slice(0, 64), day);
  const shown = new Map<string, Row>();
  const rows: Row[] = [];

  for (const e of events.slice(0, 200)) {
    if (!e || typeof e.l !== "string") continue;
    const listingId = await idForSlug(e.l.slice(0, 160));
    if (!listingId) continue;
    if (e.t === "s") {
      const page = cleanPath(e.p);
      if (!page) continue;
      const pos = Math.max(1, Math.min(500, Math.round(Number(e.n) || 1)));
      const key = `${listingId}|${page}`;
      const r = shown.get(key);
      if (r) {
        r.shown = (r.shown as number) + 1;
        r.posSum = (r.posSum as number) + pos;
      } else shown.set(key, { day, listingId, page, shown: 1, posSum: pos });
      continue;
    }
    let kind: EventKind | null = null;
    if (e.t === "o") kind = "open";
    else if (e.t === "w") kind = "web";
    else if (e.t === "c" && e.m && METHODS.includes(e.m)) kind = e.m;
    if (!kind) continue;
    rows.push({
      ts,
      day,
      hour,
      listingId,
      kind,
      visitor,
      source: e.src && SOURCES.includes(e.src) ? e.src : "other",
      entry: cleanPath(e.en),
      device: e.d && DEVICES.includes(e.d) ? e.d : "phone",
    });
  }

  const d = await getDb();
  if (shown.size) await d.bump("statShown", Array.from(shown.values()), ["shown", "posSum"]);
  if (rows.length) await d.insertMany("statEvents", rows);
  return shown.size + rows.length;
}

// ── Reads ────────────────────────────────────────────────────────────────

export interface EventRow {
  day: string;
  hour: number;
  listingId: number;
  kind: EventKind;
  visitor: string;
  source: SourceKey;
  entry: string;
  device: DeviceKey;
}

export interface ShownRow {
  day: string;
  listingId: number;
  page: string;
  shown: number;
  posSum: number;
}

export async function loadEvents(start: string, end: string, listingId?: number): Promise<EventRow[]> {
  const d = await getDb();
  return d.select<EventRow>(
    "statEvents",
    { day: { between: [start, end] }, ...(listingId ? { listingId } : {}) },
    { columns: ["day", "hour", "listingId", "kind", "visitor", "source", "entry", "device"] },
  );
}

export async function loadShown(start: string, end: string, listingId?: number): Promise<ShownRow[]> {
  const d = await getDb();
  return d.select<ShownRow>("statShown", { day: { between: [start, end] }, ...(listingId ? { listingId } : {}) });
}

/** The first day stats exist for ("Counting since …"). */
export async function trackingStart(): Promise<string> {
  return (await getMeta("tracking_start")) ?? pktDay();
}
