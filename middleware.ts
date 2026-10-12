import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/session";

/**
 * A fast front door for /admin: no session cookie → the login page.
 * This only checks the cookie is there. The signature is verified on the
 * server by every admin page, route and action (lib/admin/auth.ts), so a
 * forged cookie gets past this redirect and no further.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) return NextResponse.next();
  // Static files under /admin (public/admin/logo-tile.png) are never pages.
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
  // The component gallery only exists in development (it 404s in production).
  if (process.env.NODE_ENV !== "production" && pathname.startsWith("/admin/kit")) return NextResponse.next();
  if (req.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" && !search ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
