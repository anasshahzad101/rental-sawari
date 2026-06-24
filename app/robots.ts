import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default — everyone allowed except the (placeholder) owner dashboard.
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/owner-login"],
      },
      // Explicit AI crawler allowlist. Defaults to allow anyway, but signals
      // intent and survives any future site-wide tightening.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User"],
        allow: "/",
      },
      {
        userAgent: ["ClaudeBot", "anthropic-ai", "Claude-Web"],
        allow: "/",
      },
      {
        userAgent: ["PerplexityBot", "Perplexity-User"],
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
      // Block: low-value scrapers that ignore crawl budgets. AhrefsBot is
      // intentionally NOT blocked — we want backlink visibility in Ahrefs
      // Webmaster Tools (free) once the site is indexed.
      {
        userAgent: ["Bytespider", "ImagesiftBot"],
        disallow: "/",
      },
    ],
    sitemap: [
      "https://rentalsawari.com/sitemap.xml",
      "https://rentalsawari.com/sitemap-pages.xml",
      "https://rentalsawari.com/sitemap-cities.xml",
      "https://rentalsawari.com/sitemap-areas.xml",
      "https://rentalsawari.com/sitemap-cars.xml",
      "https://rentalsawari.com/sitemap-car-in-city.xml",
      "https://rentalsawari.com/sitemap-routes.xml",
      "https://rentalsawari.com/sitemap-companies.xml",
      "https://rentalsawari.com/sitemap-guides.xml",
      "https://rentalsawari.com/sitemap-compare.xml",
    ],
    host: "https://rentalsawari.com",
  };
}
