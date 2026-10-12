/**
 * The admin session: one password, one signed cookie.
 *
 * The cookie is "{expiry}.{signature}", where the signature is an HMAC of the
 * expiry under ADMIN_SECRET (or ADMIN_PASSWORD when no secret is set, so a
 * new password also logs every device out). Web Crypto only, so the same
 * code runs in Node and in middleware.
 *
 * Middleware only checks that a session cookie is present (cheap, and it
 * can't rely on runtime env vars on every host). The real check — this
 * signature — runs in every admin page, route and server action through
 * requireAdmin() in ./auth.ts.
 */

export const SESSION_COOKIE = "rs_admin_session";
/** Not HttpOnly: tells the public tracker on this browser to stay quiet. */
export const FLAG_COOKIE = "rs_admin";
export const SESSION_DAYS = 30;

function secret(): string | null {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function passwordConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string | null> {
  const s = secret();
  if (!s) return null;
  const key = await crypto.subtle.importKey("raw", enc.encode(`rs-admin:${s}`), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Constant-time string compare. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function signSession(now = Date.now()): Promise<{ token: string; maxAge: number } | null> {
  const exp = now + SESSION_DAYS * 86400000;
  const sig = await hmac(`admin|${exp}`);
  if (!sig) return null;
  return { token: `${exp}.${sig}`, maxAge: SESSION_DAYS * 86400 };
}

export async function verifySession(token: string | null | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = Number(token.slice(0, dot));
  if (!Number.isFinite(exp) || exp < now) return false;
  const want = await hmac(`admin|${exp}`);
  return !!want && safeEqual(want, token.slice(dot + 1));
}

/** Compare a typed password with ADMIN_PASSWORD without leaking timing. */
export async function passwordMatches(typed: string): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(typed)),
    crypto.subtle.digest("SHA-256", enc.encode(real)),
  ]);
  return safeEqual(b64url(a), b64url(b));
}
