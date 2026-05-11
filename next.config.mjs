/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
  // Keep keyword-rich URL `/rent-a-car-lahore` (better SEO for
  // "rent a car {city}" queries) while using a proper Next dynamic route
  // folder `/rent-a-car/[city]` internally. Canonical tags on each city page
  // point search engines at the hyphenated form.
  async rewrites() {
    // Order matters — more specific patterns first.
    return [
      // City × car combos: /rent-a-toyota-corolla-in-lahore → /rent-a/toyota-corolla-in-lahore
      // The regex constraint `(.+-in-.+)` ensures the slug contains `-in-`.
      {
        source: "/rent-a-:slug(.+-in-.+)",
        destination: "/rent-a/:slug",
      },
      // City and area pages: /rent-a-car-lahore, /rent-a-car-dha-lahore, etc.
      {
        source: "/rent-a-car-:city",
        destination: "/rent-a-car/:city",
      },
    ];
  },
  // Canonicalise to apex (non-www), strip trailing slash, lowercase slugs.
  // The trailing-slash and case rules also live in Vercel's defaults, but
  // making them explicit prevents regressions if hosting changes.
  trailingSlash: false,
  async redirects() {
    return [
      // www → apex (308 permanent). Vercel typically handles this when both
      // domains are connected, but the rule ensures the behaviour is
      // codified regardless of host.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.rentalsawari.com" }],
        destination: "https://rentalsawari.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Enforce HTTPS for two years incl. subdomains; preload eligibility.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Block MIME-type sniffing.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Allow self-framing only (prevents click-jacking via foreign iframes).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Send origin only on cross-origin requests; full referrer same-origin.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable invasive browser APIs we never use.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      // Long-cache the auto-generated favicon and brand assets.
      {
        source: "/(logo-mark|logo-full|logo|icon).png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Tell Vercel's edge to send Last-Modified-derived ETags for HTML
      // pages so crawlers can prioritise re-fetch. We can't set a precise
      // Last-Modified per page from the config — Vercel ships one based on
      // build time. The sitemap's per-URL `lastmod` is the precise signal.
      {
        source: "/(.*)\\.(html|xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
