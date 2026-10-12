import "server-only";
import type { Company } from "@/lib/types";
import type { Listing } from "../types";
import { listAll, resolveRedirect } from "./listings";

/**
 * The public site's view of the listings: live ones only, in the shape the
 * site's components already use (Company). This is the one place the site
 * reads listings from — the admin edits the database, the site reads it.
 *
 * If the database can't be reached (for example a build machine without
 * database access), the site falls back to the snapshot in
 * data/companies.ts rather than failing; pages refresh from the database on
 * their next revalidation.
 */

export function listingToCompany(l: Listing): Company {
  return {
    slug: l.slug,
    name: l.name,
    city: l.city,
    area: l.area,
    rating: l.googleRating ?? 0,
    reviewCount: l.googleReviews ?? 0,
    verified: l.verified,
    featured: l.plan !== "free",
    ...(l.responseTime ? { responseTime: l.responseTime } : {}),
    topCars: l.cars.map((c) => ({ name: c.name, pricePerDay: c.pricePerDay, withDriver: c.mode === "driver" })),
    whatsapp: l.whatsapp,
    phone: l.phone || l.whatsapp,
    ...(l.mapsUrl ? { googleMapsUrl: l.mapsUrl } : {}),
    ...(l.about ? { about: l.about } : {}),
    ...(l.website ? { website: l.website } : {}),
    ...(l.logoUrl ? { logo: l.logoUrl } : {}),
    servicesOffered: l.services,
  };
}

let warned = false;

async function snapshot(): Promise<Company[]> {
  const { companies } = await import("@/data/companies");
  return companies;
}

let lastGood: { at: number; list: Company[] } | null = null;
/** After a failure, don't wait on the database again for a minute (a build renders ~1,500 pages). */
let downUntil = 0;

/** Every live listing as a Company, in directory order. */
export async function getCompanies(): Promise<Company[]> {
  if (Date.now() < downUntil) return lastGood?.list ?? snapshot();
  try {
    const all = await listAll();
    const list = all.filter((l) => l.status === "live").map(listingToCompany);
    lastGood = { at: Date.now(), list };
    return list;
  } catch (e) {
    downUntil = Date.now() + 60_000;
    if (!warned) {
      warned = true;
      console.error("[listings] Database unavailable, serving the built-in snapshot:", e instanceof Error ? e.message : e);
    }
    return lastGood?.list ?? snapshot();
  }
}

export async function getFeaturedCompanies(): Promise<Company[]> {
  return (await getCompanies()).filter((c) => c.featured);
}

export async function getCompanyBySlug(slug: string): Promise<Company | undefined> {
  return (await getCompanies()).find((c) => c.slug === slug);
}

/** For a renamed listing: the slug its old address should redirect to. */
export async function getRenamedSlug(oldSlug: string): Promise<string | null> {
  if (Date.now() < downUntil) return null;
  try {
    return await resolveRedirect(oldSlug);
  } catch {
    return null;
  }
}
