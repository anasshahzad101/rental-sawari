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
      // Block: scrapers that ignore crawl budgets and have no AI-search use case.
      {
        userAgent: ["Bytespider", "ImagesiftBot", "AhrefsBot"],
        disallow: "/",
      },
    ],
    sitemap: "https://rentalsawari.com/sitemap.xml",
    host: "https://rentalsawari.com",
  };
}
