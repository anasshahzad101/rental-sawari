"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { FLAG_COOKIE, SESSION_COOKIE, passwordConfigured, passwordMatches, signSession } from "@/lib/admin/session";

/**
 * Log in and log out. One password (ADMIN_PASSWORD), no usernames.
 *
 * Five wrong tries from one address lock that address for 10 minutes. The
 * counter lives in memory: the site runs as a single Node process, and a
 * restart clearing it is harmless.
 */

const MAX_TRIES = 5;
const LOCK_MS = 10 * 60 * 1000;
const tries = new Map<string, { fails: number; lockedUntil: number }>();

export type LoginState =
  | { status: "idle" }
  | { status: "wrong" }
  | { status: "locked"; until: number }
  | { status: "unset" };

function clientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

function safeNext(raw: FormDataEntryValue | null): string {
  const s = typeof raw === "string" ? raw : "";
  return s.startsWith("/admin") && !s.startsWith("//") ? s : "/admin";
}

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!passwordConfigured()) return { status: "unset" };

  const ip = clientIp();
  const now = Date.now();
  const rec = tries.get(ip);
  if (rec && rec.lockedUntil > now) return { status: "locked", until: rec.lockedUntil };

  const typed = String(form.get("password") ?? "");
  if (!(await passwordMatches(typed))) {
    const fails = (rec && rec.lockedUntil <= now && rec.fails >= MAX_TRIES ? 0 : rec?.fails ?? 0) + 1;
    if (fails >= MAX_TRIES) {
      const until = now + LOCK_MS;
      tries.set(ip, { fails, lockedUntil: until });
      return { status: "locked", until };
    }
    tries.set(ip, { fails, lockedUntil: 0 });
    if (tries.size > 2000) tries.clear();
    return { status: "wrong" };
  }

  tries.delete(ip);
  const session = await signSession();
  if (!session) return { status: "unset" };
  const secure = process.env.NODE_ENV === "production";
  const jar = cookies();
  jar.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  // Lets the public site's tracker know this browser belongs to the owner.
  jar.set(FLAG_COOKIE, "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: 365 * 86400 });
  redirect(safeNext(form.get("next")));
}

export async function logoutAction(): Promise<void> {
  const jar = cookies();
  jar.delete(SESSION_COOKIE);
  // The tracker flag stays: the owner's own browsing should stay uncounted
  // after logging out too.
  redirect("/admin/login");
}
