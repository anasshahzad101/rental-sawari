import "server-only";

/**
 * Spam guards shared by the public form endpoints (listing requests, claims,
 * reports): a hidden honeypot and a per-IP limit. Single Node process, so an
 * in-memory map is enough.
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

/**
 * True when the hidden honeypot field was filled: only bots do that (people
 * never see it, and Chrome's autofill treats it as an unknown field). The
 * caller then answers "ok" without saving, so the bot learns nothing.
 *
 * Fill time is deliberately not a reason to drop anything: a quick person
 * (open "Report a problem", tap a reason, Send) beat the old minimum, saw
 * "sent", and the submission was silently thrown away. `elapsedMs` is only
 * logged now.
 */
export function looksLikeBot(body: { hp?: unknown; elapsedMs?: unknown }, form: string): boolean {
  if (typeof body.hp === "string" && body.hp.trim()) {
    console.warn(`[${form}] dropped a submission: honeypot filled (${typeof body.elapsedMs === "number" ? `${body.elapsedMs} ms` : "no timer"})`);
    return true;
  }
  return false;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
