import "server-only";
import { areas } from "@/data/areas";
import { carTypes } from "@/data/carTypes";
import { cities } from "@/data/cities";
import { guides } from "@/data/guides";
import { routes } from "@/data/routes";
import { useCases } from "@/data/useCases";
import type { Listing } from "../types";

/**
 * Turns stored page paths into the names the stats screens show:
 * "/rent-a-car-islamabad" → "Rent a car Islamabad",
 * "/rent-a-car-f-10-islamabad" → "F-10 area page", "" → "Came straight to the listing".
 */

const cityBySlug = new Map(cities.map((c) => [c.slug, c.name]));
const areaBySlug = new Map(areas.map((a) => [a.slug, a.name]));
const routeBySlug = new Map(routes.map((r) => [r.slug, `${r.fromName} to ${r.toName}`]));
const carBySlug = new Map(carTypes.map((c) => [c.slug, c.name]));
const guideBySlug = new Map(guides.map((g) => [g.slug, g.title]));
const useCaseBySlug = new Map(useCases.map((u) => [u.slug, u.title]));

const FIXED: Record<string, string> = {
  "/": "Homepage",
  "/cities": "Cities page",
  "/cars": "Car types page",
  "/guides": "Guides page",
  "/tourist-car-rental": "Tourist car rental",
  "/tourist-packages": "Tourist packages",
  "/pricing": "Pricing",
  "/list-your-business": "List your business",
};

function shortGuide(title: string): string {
  const t = title.replace(/\?$/, "");
  return t.length > 48 ? `${t.slice(0, 46).trimEnd()}…` : t;
}

export function pageLabel(path: string, listings: Map<string, Listing>, opts: { listPage?: boolean } = {}): string {
  if (!path) return "Came straight to the listing";
  if (path === "/") return opts.listPage ? "Homepage featured strip" : "Homepage";
  if (FIXED[path]) return FIXED[path];

  let m = /^\/rent-a-car-(.+)$/.exec(path);
  if (m) {
    const s = m[1];
    if (cityBySlug.has(s)) return `Rent a car ${cityBySlug.get(s)}`;
    if (areaBySlug.has(s)) return `${areaBySlug.get(s)} area page`;
    if (routeBySlug.has(s)) return `${routeBySlug.get(s)} route`;
  }
  m = /^\/rent-a\/(.+)-in-(.+)$/.exec(path) ?? /^\/rent-a-(.+)-in-(.+)$/.exec(path);
  if (m && carBySlug.has(m[1]) && cityBySlug.has(m[2])) return `${carBySlug.get(m[1])} in ${cityBySlug.get(m[2])}`;
  m = /^\/cars\/(.+)$/.exec(path);
  if (m && carBySlug.has(m[1])) return `${carBySlug.get(m[1])} page`;
  m = /^\/guides\/(.+)$/.exec(path);
  if (m && guideBySlug.has(m[1])) return `Guide: ${shortGuide(guideBySlug.get(m[1])!)}`;
  m = /^\/compare\/(.+)-vs-(.+)$/.exec(path);
  if (m) {
    const a = listings.get(m[1])?.name;
    const b = listings.get(m[2])?.name;
    if (a && b) return `Compare: ${a} vs ${b}`;
    return "Compare page";
  }
  m = /^\/companies\/([^/]+)(\/claim)?$/.exec(path);
  if (m) {
    const l = listings.get(m[1]);
    const name = l?.name ?? "Another listing";
    return m[2] ? `${name} claim page` : `${name} page`;
  }
  m = /^\/([a-z-]+)$/.exec(path);
  if (m && useCaseBySlug.has(m[1])) return `${useCaseBySlug.get(m[1])} page`;
  return path;
}
