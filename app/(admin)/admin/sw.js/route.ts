/**
 * The admin app's service worker, served at /admin/sw.js.
 *
 * It caches nothing: admin pages are private and must always be live. It
 * only shows a friendly page instead of the browser's error when the phone
 * is offline. Served from a route (not public/) so it can carry the
 * Service-Worker-Allowed header that lets it cover /admin itself.
 */

export const dynamic = "force-static";

const OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline · RentalSawari Admin</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FAFAF9;color:#1C1917;font:16px/24px system-ui,sans-serif;padding:24px;box-sizing:border-box;text-align:center}
img{width:64px;height:64px;border-radius:16px}
h1{font-size:22px;line-height:28px;margin:20px 0 6px}
p{margin:0 0 20px;color:#44403C}
button{height:48px;padding:0 24px;border:0;border-radius:12px;background:#0F766E;color:#fff;font:600 16px system-ui,sans-serif}
</style></head>
<body><div><img src="/admin/app-icon-192.png" alt=""><h1>You're offline</h1><p>Check your internet connection, then try again.</p>
<button onclick="location.reload()">Try again</button></div></body></html>`;

const SW = `// RentalSawari Admin service worker. Network only; an offline page when there is no connection.
const OFFLINE_HTML = ${JSON.stringify(OFFLINE_HTML)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("rs-admin-offline").then((c) => c.add("/admin/app-icon-192.png")).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method === "GET" && new URL(req.url).pathname === "/admin/app-icon-192.png") {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  if (req.mode !== "navigate") return;
  event.respondWith(
    (async () => {
      try {
        const pre = await event.preloadResponse;
        if (pre) return pre;
        return await fetch(req);
      } catch {
        return new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })(),
  );
});
`;

export function GET() {
  return new Response(SW, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/admin",
    },
  });
}
