import { cookies } from "next/headers";
import { FLAG_COOKIE, SESSION_COOKIE } from "@/lib/admin/session";
import { recordBatch, type InEvent } from "@/lib/admin/repo/stats";

/**
 * Receives listing stats from the public site's tracker
 * (components/analytics/SiteTracker.tsx): cards shown, listings opened,
 * WhatsApp / call / form contacts and website clicks.
 *
 * Bots, the owner's own browser (admin cookies) and floods are dropped
 * silently — the response is always 204 so a client learns nothing.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp\/|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|python|curl|wget|httpclient|axios|node-fetch|go-http|java\/|preview|scrapy|phantom|selenium|puppeteer|playwright/i;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_EVENTS = 600;
const seen = new Map<string, { n: number; at: number }>();

function limited(ip: string, n: number): boolean {
  const now = Date.now();
  const r = seen.get(ip);
  if (!r || now - r.at > WINDOW_MS) {
    if (seen.size > 10000) seen.clear();
    seen.set(ip, { n, at: now });
    return false;
  }
  r.n += n;
  return r.n > MAX_EVENTS;
}

const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  const jar = cookies();
  if (jar.get(SESSION_COOKIE) || jar.get(FLAG_COOKIE)) return done();
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return done();

  let body: { v?: unknown; e?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > 32_000) return done();
    body = JSON.parse(raw);
  } catch {
    return done();
  }
  if (typeof body.v !== "string" || body.v.length < 8 || !Array.isArray(body.e) || !body.e.length) return done();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (limited(ip, body.e.length)) return done();

  try {
    await recordBatch(body.v, body.e as InEvent[]);
  } catch (e) {
    console.error("[track] could not record:", e instanceof Error ? e.message : e);
  }
  return done();
}
