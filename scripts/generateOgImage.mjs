// Generate the 1200x630 Open Graph image for social sharing.
//
// Composition (modern, minimal, on-brand):
//  - Cream / off-white background
//  - The 256px logo-mark in the upper-left
//  - "RentalSawari" wordmark next to it (RentalSawari with "Sawari" in teal)
//  - Tagline below: "Pakistan's verified rent-a-car directory"
//  - Subline: "1,000+ vendors · 8 cities · Direct WhatsApp"
//
// Built as SVG → rendered to PNG via Sharp so we can hand-pick fonts and
// keep the file deterministic (no headless-Chrome needed).

import sharp from "sharp";

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title  { font-family: 'Inter', system-ui, sans-serif; font-weight: 800; font-size: 84px; fill: #1c1917; letter-spacing: -0.02em; }
      .accent { font-family: 'Inter', system-ui, sans-serif; font-weight: 800; font-size: 84px; fill: #0F766E; letter-spacing: -0.02em; }
      .tag    { font-family: 'Inter', system-ui, sans-serif; font-weight: 700; font-size: 36px; fill: #44403c; letter-spacing: -0.01em; }
      .sub    { font-family: 'Inter', system-ui, sans-serif; font-weight: 600; font-size: 26px; fill: #78716c; letter-spacing: 0.02em; }
      .domain { font-family: 'Inter', system-ui, sans-serif; font-weight: 700; font-size: 22px; fill: #0F766E; letter-spacing: 0.06em; text-transform: uppercase; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#FAF7F0"/>

  <!-- Decorative bottom-right blob (subtle brand colour wash) -->
  <circle cx="1150" cy="650" r="320" fill="#0F766E" fill-opacity="0.08"/>
  <circle cx="1000" cy="100" r="140" fill="#EA580C" fill-opacity="0.08"/>

  <!-- Logo tile (teal rounded square + white R + small orange accent dash) -->
  <g transform="translate(80, 100)">
    <rect width="160" height="160" rx="36" fill="#0F766E"/>
    <!-- Stylised winding "R" shape — single thick white stroke -->
    <path
      d="M 56 36
         L 56 124
         M 56 36
         C 84 36, 104 44, 104 64
         C 104 80, 84 88, 56 88
         C 76 92, 96 100, 104 124"
      stroke="white"
      stroke-width="14"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Orange accent dash above the R -->
    <path
      d="M 60 30 L 100 22"
      stroke="#EA580C"
      stroke-width="9"
      stroke-linecap="round"
    />
  </g>

  <!-- Wordmark -->
  <text x="280" y="190" class="title">Rental<tspan class="accent">Sawari</tspan></text>

  <!-- Domain badge -->
  <text x="280" y="225" class="domain">rentalsawari.com</text>

  <!-- Tagline -->
  <text x="80" y="380" class="tag">Pakistan's verified rent-a-car directory.</text>

  <!-- Subline -->
  <text x="80" y="430" class="sub">1,000+ vendors  ·  8 cities  ·  Direct WhatsApp  ·  No booking fees</text>

  <!-- Bottom signature strip -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="#0F766E"/>
  <text x="80" y="${H - 28}" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="28" fill="white">Lahore · Islamabad · Karachi · Rawalpindi · Faisalabad · Multan · Peshawar · Quetta</text>
</svg>
`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile("public/og-image.png");

const meta = await sharp("public/og-image.png").metadata();
console.log(`Wrote public/og-image.png — ${meta.width}x${meta.height}`);
