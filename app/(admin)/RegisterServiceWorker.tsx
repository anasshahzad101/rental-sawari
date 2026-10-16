"use client";

import { useEffect } from "react";

/**
 * Registers the admin app's service worker (app/(admin)/admin/sw.js), which
 * shows an offline page in the installed app. Production only, so it never
 * gets in the way of development.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin" }).catch(() => {});
  }, []);
  return null;
}
