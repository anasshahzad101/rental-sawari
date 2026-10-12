import type { Company } from "@/lib/types";

/**
 * Area suggestions for the public forms: for each city, the area names
 * already used by its listings, most common first (up to `max`).
 * Pure function — call it on the server and pass the result to the form.
 */
export function areasByCity(companies: Company[], max = 40): Record<string, string[]> {
  const byCity = new Map<string, Map<string, { name: string; n: number }>>();
  for (const c of companies) {
    const city = (c.city ?? "").trim();
    const area = (c.area ?? "").replace(/\s+/g, " ").trim();
    // Skip empty values, the city itself, and long street addresses.
    if (!city || !area || area.length > 40 || area.toLowerCase() === city.toLowerCase()) continue;
    let m = byCity.get(city);
    if (!m) byCity.set(city, (m = new Map()));
    const key = area.toLowerCase();
    const hit = m.get(key);
    if (hit) hit.n += 1;
    else m.set(key, { name: area, n: 1 });
  }
  const out: Record<string, string[]> = {};
  byCity.forEach((m, city) => {
    out[city] = Array.from(m.values())
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
      .slice(0, max)
      .map((a) => a.name);
  });
  return out;
}
