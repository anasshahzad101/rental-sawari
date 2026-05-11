import { buildUrlset, xmlHeaders, SITE } from "@/lib/sitemap";

export const dynamic = "force-static";

const STATIC = [
  { path: "", priority: 1.0, freq: "weekly" as const },
  { path: "/cities", priority: 0.8, freq: "weekly" as const },
  { path: "/cars", priority: 0.8, freq: "weekly" as const },
  { path: "/tourist-car-rental", priority: 0.8, freq: "weekly" as const },
  { path: "/wedding-car-rental", priority: 0.8, freq: "weekly" as const },
  { path: "/airport-pickup", priority: 0.7, freq: "weekly" as const },
  { path: "/northern-areas-tours", priority: 0.7, freq: "weekly" as const },
  { path: "/corporate-monthly", priority: 0.7, freq: "weekly" as const },
  { path: "/self-drive-rental", priority: 0.7, freq: "weekly" as const },
  { path: "/tourist-packages", priority: 0.7, freq: "weekly" as const },
  { path: "/guides", priority: 0.7, freq: "weekly" as const },
  { path: "/list-your-business", priority: 0.7, freq: "monthly" as const },
  { path: "/pricing", priority: 0.6, freq: "monthly" as const },
  { path: "/about", priority: 0.5, freq: "monthly" as const },
  { path: "/contact", priority: 0.5, freq: "monthly" as const },
];

export function GET() {
  const now = new Date().toISOString();
  const body = buildUrlset(
    STATIC.map((s) => ({
      loc: `${SITE}${s.path}`,
      lastmod: now,
      changefreq: s.freq,
      priority: s.priority,
    })),
  );
  return new Response(body, { headers: xmlHeaders });
}
