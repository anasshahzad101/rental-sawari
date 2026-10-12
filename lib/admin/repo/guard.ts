import "server-only";

/**
 * Spam guards shared by the public form endpoints (listing requests, claims,
 * reports): a hidden honeypot, a minimum fill time and a per-IP limit.
 * Single Node process, so an in-memory map is enough.
 */

const hits = new Map<string, number[]>();

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

/** True when the submission looks automated (filled honeypot or too fast). */
export function looksLikeBot(body: { website?: unknown; hp?: unknown; elapsedMs?: unknown }, minMs = 2500): boolean {
  if (typeof body.hp === "string" && body.hp.trim()) return true;
  if (typeof body.elapsedMs === "number" && body.elapsedMs < minMs) return true;
  return false;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
