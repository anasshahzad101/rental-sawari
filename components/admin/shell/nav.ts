import { Inbox, LayoutDashboard, Star, Store } from "lucide-react";
import type { IconComponent } from "../ui/icons";

export type NavKey = "overview" | "listings" | "inbox" | "plans";

export interface NavItem {
  key: NavKey;
  href: string;
  label: string;
  /** Short label for the mobile tab bar. */
  short: string;
  icon: IconComponent;
}

export const NAV: NavItem[] = [
  { key: "overview", href: "/admin", label: "Overview", short: "Overview", icon: LayoutDashboard },
  { key: "listings", href: "/admin/listings", label: "Listings", short: "Listings", icon: Store },
  { key: "inbox", href: "/admin/inbox/requests", label: "Inbox", short: "Inbox", icon: Inbox },
  { key: "plans", href: "/admin/plans", label: "Featured plans", short: "Plans", icon: Star },
];

/** Which nav item a path belongs to (`/admin` exact = Overview). */
export function activeNav(pathname: string | null): NavKey | null {
  if (!pathname) return null;
  if (pathname === "/admin" || pathname === "/admin/") return "overview";
  if (pathname.startsWith("/admin/listings")) return "listings";
  if (pathname.startsWith("/admin/inbox")) return "inbox";
  if (pathname.startsWith("/admin/plans")) return "plans";
  return null;
}
