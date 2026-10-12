import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "./session";

/**
 * Server-side guards. Every admin page, admin route handler and admin server
 * action calls one of these — the middleware's cookie-presence check is only
 * a fast redirect, never the security boundary.
 */

export async function isAdmin(): Promise<boolean> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/** For pages and server actions: redirect to the login page when not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For route handlers: a 401 response when not signed in, else null. */
export async function adminGuard(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ error: "Not signed in" }, { status: 401 });
}
