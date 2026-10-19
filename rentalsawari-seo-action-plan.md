# RentalSawari — SEO / AEO / GEO Action Plan
**Domain:** rentalsawari.com
**Audit date:** 2026-10-19
**Goal:** Rank #1 for Pakistani rent-a-car queries (cities, pricing, services) and become the cited source for AI answers on car rental in Pakistan.

---

## How to use this file
Work top to bottom. Each task has a checkbox, priority, and expected effort. Commit after every completed section. Suggested branch: `seo/phase-1`.

**Priority key:** 🔴 Critical (blocking) · 🟡 High · 🟢 Medium

---

## Phase 1 — Technical Foundation (Week 1–2)

### 1.1 Domain & Indexation
- [ ] 🔴 **Fix www redirect** — `www.rentalsawari.com` does not resolve/redirect. Add a 301 from `www` → apex in your DNS/host (Cloudflare: Page Rule or Redirect Rule). Verify with `curl -I https://www.rentalsawari.com` → expect `301` to apex.
- [ ] 🔴 **Google Search Console** — verify both `https://rentalsawari.com` and the `www` property; use the Domain property (DNS verification) to cover both. Confirm the www property shows the redirect.
- [ ] 🔴 **Submit all sitemaps** in GSC:
  - `sitemap.xml`
  - `sitemap-pages.xml`
  - `sitemap-cities.xml`
  - `sitemap-areas.xml`
  - `sitemap-cars.xml`
  - `sitemap-car-in-city.xml`
  - `sitemap-routes.xml`
  - `sitemap-companies.xml`
  - `sitemap-guides.xml`
  - `sitemap-compare.xml`
- [ ] 🟡 Validate every sitemap URL returns valid XML (200, correct content-type). Fix or remove any that error.
- [ ] 🟡 Check GSC **Page Indexing** report weekly; note which sections are "Discovered / not indexed" (usually company pages — see 1.4).
- [ ] 🟢 Set your canonical host consistently to `https://rentalsawari.com` everywhere in code and `og:url`.

### 1.2 Titles & Meta (fix duplicates)
Current problem: `/` and `/cities` share the same title. Create a unique template per page type:

| Page type | Title template |
|---|---|
| Homepage | `Rent a Car in Pakistan — 1,400+ Verified Vendors, Real PKR Prices \| RentalSawari` |
| Cities hub | `Browse {n} Cities — Verified Rent a Car Companies in Pakistan \| RentalSawari` |
| City page | `Rent a Car in {City} ({year}) — From {price}/day, {n}+ Vendors \| RentalSawari` |
| Area page | `Rent a Car in {Area}, {City} — Verified Local Vendors \| RentalSawari` |
| Car model | `{Car} Rental in Pakistan — Daily Rates, {n} Vendors \| RentalSawari` |
| Car in city | `Rent a {Car} in {City} — From {price}/day \| RentalSawari` |
| Company | `{Company} — Car Rental in {City} · ★{rating} ({reviews}) \| RentalSawari` |
| Guide | `{Title} ({year}) \| RentalSawari Guides` |
| Compare | `{A} vs {B} in Pakistan ({year}) — Which to Rent? \| RentalSawari` |
| Route | `{From} to {To} by Rental Car — Cost, Routes & Tips ({year}) \| RentalSawari` |

- [ ] 🟡 Implement unique templates for all types above
- [ ] 🟡 Write meta description templates (≤155 chars, include price or count + CTA)
- [ ] 🟢 Spot-check 20 random pages in GSC URL Inspection for rendered title/meta

### 1.3 Schema Markup (JSON-LD) — highest-leverage technical add
Add per page type (put in `<head>`, server-rendered, not client-injected):

- [ ] 🟡 **Homepage:** `Organization` + `WebSite` (+ `SearchAction` sitelinks searchbox)
- [ ] 🟡 **City / area pages:** `ItemList` of `LocalBusiness` entries (name, address, rating, reviewCount, telephone)
- [ ] 🟡 **Company pages:** `LocalBusiness` (subtype `AutoRental`) — full NAP, geo, opening hours, aggregateRating, sameAs
- [ ] 🟡 **Guides:** `Article` (+ `author`, `datePublished`, `dateModified`) and **`FAQPage`** matching visible Q&A blocks
- [ ] 🟡 **All pages:** `BreadcrumbList` mirroring visible breadcrumbs
- [ ] 🟢 Every page: `WebPage` with `speakable` pointing at the direct-answer paragraph
- [ ] 🟢 Validate with Google Rich Results Test + Schema.org validator on one URL per type

Starter snippet (guide FAQ — adapt per article):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How much does it cost to rent a car in Lahore?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "PKR 3,500–35,000 per day depending on category. Economy cars start at PKR 3,500/day..."
    }
  }]
}
</script>
```

### 1.4 Thin Content Risk — Company Pages (~1,400 pages)
- [ ] 🟡 **Data audit:** find broken/blank vendor names (e.g. a live page titled "& Travels — Car Rental in Okara"). Fix source data + add validation (name length ≥ 3, no leading symbols).
- [ ] 🟡 Set a content threshold: profiles with < N (e.g. 2) of {description, reviews, services, photos} → `noindex, follow` until enriched.
- [ ] 🟡 Enrich top 200 companies by traffic/reviews first: 150+ word unique description, services, neighborhood, price range.
- [ ] 🟢 Bulk-check in GSC which company pages are indexed; track ratio monthly.

### 1.5 Performance & Core Web Vitals
- [ ] 🟡 Compress city-card images (hero images are heavy); serve WebP/AVIF with lazy loading below the fold
- [ ] 🟡 Self-host fonts or use `font-display: swap`; preload the primary font
- [ ] 🟢 Add caching headers; if on a static host, confirm CDN is enabled
- [ ] 🟢 Measure with PageSpeed Insights on `/`, one city page, one guide → record scores, fix worst offenders

---

## Phase 2 — Content Moat (Week 3–8)

### 2.1 City Pages (21)
- [ ] 🟡 Add 300–500 words unique intro per city: price context, popular neighborhoods, who rents there, local quirks
- [ ] 🟡 Add a "Key facts" box (machine-extractable): vendor count, from-price, popular areas, top services
- [ ] 🟡 Add 4–6 question-format FAQs with `FAQPage` schema (mirror Lahore guide pattern)
- [ ] 🟢 Internal link each city page → its areas, its top guides, and related routes

### 2.2 Area Pages (DHA, Gulberg, Bahria Town, etc.)
- [ ] 🟡 Ensure top 30 area pages have unique copy (not just filtered listings): 150–250 words + FAQs
- [ ] 🟢 Verify area pages are in sitemap and interlinked from their city page

### 2.3 Guides — publish 25–30 new articles
Priority order (city × intent matrix). Format: direct numeric answer in first 100 words, question H2s, PKR numbers, FAQ schema.

**Batch 1 (pricing — highest intent):**
- [ ] 🟡 How Much Does It Cost to Rent a Car in Karachi in 2026?
- [ ] 🟡 How Much Does It Cost to Rent a Car in Islamabad/Rawalpindi in 2026?
- [ ] 🟡 Hiace Rental Prices in Pakistan (2026) — city-by-city
- [ ] 🟡 Wedding Car Rental Prices in Pakistan (2026) — Corolla to Land Cruiser

**Batch 2 (intent pages):**
- [ ] 🟡 Self-Drive Car Rental in Lahore — Requirements & Best Vendors
- [ ] 🟡 Rent a Car Without Driver in Karachi/Islamabad — deposits, CNIC rules
- [ ] 🟡 Monthly Car Rental for Companies in Pakistan — rates & contracts
- [ ] 🟡 Airport Pickup: Lahore/Karachi/Islamabad Airport Car Services
- [ ] 🟡 Northern Areas by Rental Car: Hunza, Skardu, Naran — vehicle choice, NOC rules

**Batch 3 (tourist/English-heavy — AI citation targets):**
- [ ] 🟡 Renting a Car in Pakistan: Complete Guide for Foreign Tourists (expand existing into pillar page)
- [ ] 🟡 Islamabad to Hunza road trip by rental car — 7-day itinerary + costs
- [ ] 🟡 Lahore to Hunza by rental car — itinerary + realistic costs
- [ ] 🟡 Toyota Corolla vs Honda Civic vs Suzuki Cultus rental comparison
- [ ] 🟡 Documents Required to Rent a Car in Pakistan (CNIC, license, deposit rules per city)

### 2.4 Data Asset (GEO link magnet)
- [ ] 🟡 Build `/pakistan-car-rental-price-index-2026`: aggregated stats from your 1,400 vendors — avg price per category per city, vendor density, rating distributions. Update quarterly, show "last updated" date.
- [ ] 🟡 Add downloadable CSV + methodology note (data = from N verified vendors, collected {month year})
- [ ] 🟢 Link it from every guide + footer; this is the page you pitch to press

### 2.5 Urdu Section
- [ ] 🟢 Launch `/ur/` with 10 translated pages: home, top 8 cities, main pricing guide
- [ ] 🟢 `hreflang` pairs: `en` ↔ `ur` on equivalent pages
- [ ] 🟢 Urdu titles keep brand term "RentalSawari" in Latin script

---

## Phase 3 — Authority & Off-page (Month 2–6)

### 3.1 Digital PR (the moat competitors don't have)
- [ ] 🟡 Pitch the Price Index + market research article to: ProPakistani, TechJuice, Dawn (young world/tech), The News tech desk, StartupList Pakistan
- [ ] 🟡 Offer yourself as expert source for travel/transport/eid-travel stories (respond to journalist queries)
- [ ] 🟡 Publish 2–3 more data studies: "Wedding season car price surge", "Eid travel rental demand", "Self-drive vs driver cost analysis"
- [ ] 🟢 Create a press kit page: logo, founder bio, stats, screenshots

### 3.2 Vendor-Driven Links (1,400 niche links)
- [ ] 🟡 Build an embeddable "Verified Vendor on RentalSawari" badge (SVG, branded, links to company profile page)
- [ ] 🟡 Email every listed vendor the badge + ask to add to their site/Facebook page
- [ ] 🟢 Track badge uptake in GSC Links report

### 3.3 Citations & Local SEO
- [ ] 🟡 Consistent NAP (from /contact) across Pakistani directories & maps: PakBusinessDirectory, local listing sites, Google Business Profile for RentalSawari itself
- [ ] 🟢 Create/claim Google Business Profile (as an online business — use office address)
- [ ] 🟢 Bing Places, Apple Business Connect

### 3.4 Reviews & Engagement Loop
- [ ] 🟡 Post-WhatsApp-referral message asking renters to review the vendor on Google + mention RentalSawari
- [ ] 🟡 Add subtle "Found via RentalSawari?" feedback link on listing pages
- [ ] 🟢 Monthly: check branded search volume trend in GSC

---

## GEO / AIO Maintenance (ongoing, monthly)
- [ ] 🟢 Keep `llms.txt` updated when adding major sections (it's already excellent)
- [ ] 🟢 Test AI visibility monthly — ask ChatGPT, Perplexity, Gemini: "best rent a car in Lahore", "car rental prices Pakistan", "rent a car with driver Karachi". Screenshot whether RentalSawari is cited; log in a sheet.
- [ ] 🟢 Ensure all key facts (prices, counts) are in static HTML — not behind JS clicks
- [ ] 🟢 Keep AI bots allowed in robots.txt (current setup is correct — do not regress)

---

## KPI Dashboard (review weekly)
| Metric | Baseline | 3-month target | 6-month target |
|---|---|---|---|
| GSC impressions | _record_ | 5× baseline | 10× baseline |
| Keywords in top 10 | _record_ | 50 | 150 |
| Top-3 city head terms ("rent a car lahore" etc.) | 0–1 | 3 | 8 |
| Referring domains | ~0 | 25 | 75 |
| Guides published | 10 | 25 | 40 |
| Company pages indexed ratio | _%_ | 60% | 80% |
| AI-engine citations (ChatGPT/Perplexity/Gemini) | manual check | cited on 2 queries | cited on 6+ queries |
| PageSpeed mobile (home/city/guide) | _record_ | ≥80 | ≥90 |

---

## Definition of Done — "Rank #1 everywhere" (realistic scope)
- #1–3 for `rent a car {city}` across all 8 major cities
- #1 for `car rental {city} prices` and service-intent queries (self-drive, wedding, Hiace, airport)
- Cited by AI assistants for Pakistan car-rental questions
- Price Index page cited/linked by ≥3 national publications
- Generic head term `car rental Pakistan` — top 5 (beating at least one aggregator)

---

*Generated from the full site audit of 2026-10-19. Questions on any task: reopen the chat and reference the section number.*
