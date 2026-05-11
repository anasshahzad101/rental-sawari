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
    return [
      {
        source: "/rent-a-car-:city",
        destination: "/rent-a-car/:city",
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
    ];
  },
};

export default nextConfig;
