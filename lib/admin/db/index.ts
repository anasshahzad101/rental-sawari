import "server-only";
import type { Company } from "@/lib/types";
import type { CarRow, Listing } from "../types";
import { normalizePhone, pktDay } from "../format";
import type { Db, Row } from "./driver";
import { createFileDb } from "./file";
import { createMysqlDb } from "./mysql";

/**
 * Picks the driver and makes sure the data is there.
 *
 * MySQL whenever DB_HOST, DB_USER and DB_NAME are set (production on
 * Hostinger), the local JSON file otherwise (development). The first time
 * either one is used with an empty listings table, the 1,419 listings from
 * data/companies.ts — the directory as it was before the admin existed — are
 * copied in. After that the database is the only source of truth for
 * listings; data/companies.ts is just the starting snapshot and the build
 * fallback (see lib/admin/repo/public.ts).
 */

if (typeof window !== "undefined") {
  throw new Error("lib/admin/db is server-only");
}

type G = typeof globalThis & { __rsDb?: Db; __rsSeeded?: Promise<void> | null };
const g = globalThis as G;

export function mysqlConfigured(): boolean {
  if (process.env.ADMIN_STORE === "file") return false;
  return !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}

function pick(): Db {
  if (g.__rsDb) return g.__rsDb;
  if (mysqlConfigured()) {
    g.__rsDb = createMysqlDb();
  } else {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      console.error(
        "[admin] No database configured (DB_HOST, DB_USER, DB_NAME). Using a local JSON file that the next deploy will erase.",
      );
    }
    g.__rsDb = createFileDb();
  }
  return g.__rsDb;
}

/** The database, seeded. Every repo function goes through this. */
export async function getDb(): Promise<Db> {
  const d = pick();
  if (!g.__rsSeeded) {
    g.__rsSeeded = seed(d).catch((e) => {
      g.__rsSeeded = null;
      throw e;
    });
  }
  await g.__rsSeeded;
  return d;
}

/** Which driver is live — shown in the admin so a misconfiguration is visible. */
export function dbInfo(): { kind: "mysql" | "file"; describe: string; productionFile: boolean } {
  const d = pick();
  return { kind: d.kind, describe: d.describe, productionFile: d.kind === "file" && process.env.NODE_ENV === "production" };
}

// ── Seeding ──────────────────────────────────────────────────────────────

export function companyToListing(c: Company, now: string): Omit<Listing, "id"> {
  const cars: CarRow[] = (c.topCars ?? []).map((t) => ({
    name: t.name,
    pricePerDay: t.pricePerDay,
    mode: t.withDriver ? "driver" : "self",
  }));
  return {
    slug: c.slug,
    name: c.name,
    city: c.city,
    area: c.area ?? "",
    whatsapp: normalizePhone(c.whatsapp) ?? c.whatsapp ?? "",
    phone: normalizePhone(c.phone) ?? c.phone ?? "",
    phone2: null,
    website: c.website || null,
    mapsUrl: c.googleMapsUrl || null,
    about: c.about ?? "",
    services: [...(c.servicesOffered ?? [])],
    cars,
    logoUrl: c.logo && !c.logo.includes("placehold.co") ? c.logo : null,
    googleRating: Number.isFinite(c.rating) ? c.rating : null,
    googleReviews: Number.isFinite(c.reviewCount) ? c.reviewCount : null,
    responseTime: c.responseTime ?? null,
    plan: c.featured ? "city" : "free",
    planStart: null,
    planEnd: null,
    verified: !!c.verified,
    status: "live",
    hiddenAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

async function seed(d: Db): Promise<void> {
  const meta = await d.select<{ k: string; v: string }>("meta");
  const has = (k: string) => meta.some((m) => m.k === k);
  const now = new Date().toISOString();

  if (!has("tracking_start")) {
    // Stats can only exist from the day this code first ran.
    await d.insertMany("meta", [{ k: "tracking_start", v: process.env.TRACKING_START || pktDay() }], { ignore: true });
  }

  if ((await d.count("listings")) > 0) return;

  const { companies } = await import("@/data/companies");
  const rows = companies.map((c) => companyToListing(c, now) as unknown as Row);
  await d.insertMany("listings", rows, { ignore: true });
  await d.insertMany("meta", [{ k: "imported_at", v: now }], { ignore: true });
  console.log(`[admin] Imported ${rows.length} listings into ${d.describe}`);
}

export async function getMeta(k: string): Promise<string | null> {
  const d = await getDb();
  const rows = await d.select<{ k: string; v: string }>("meta", { k });
  return rows[0]?.v ?? null;
}

export async function setMeta(k: string, v: string): Promise<void> {
  const d = await getDb();
  const n = await d.update("meta", { k }, { v });
  if (!n) await d.insertMany("meta", [{ k, v }], { ignore: true });
}
