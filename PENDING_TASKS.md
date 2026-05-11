# PENDING_TASKS

External work + content tasks remaining after the CTM SEO+AEO Domination + On-Site SEO Implementation prompts.

In-code work shipped in those passes is listed at the bottom. **Everything here requires you (or a content/data hand) — none of it is unblocked by code I can write alone.**

---

## 🔴 Pre-launch blockers

These must be done before you submit to Search Console / publish broadly.

| # | Task | Notes |
|---|---|---|
| L1 | Replace `REPLACE_WITH_GSC_TOKEN` in `app/layout.tsx` `metadata.verification.google` | Get from Google Search Console after you add the property |
| L2 | Replace `REPLACE_WITH_BING_TOKEN` in `app/layout.tsx` `metadata.verification.other['msvalidate.01']` | Get from Bing Webmaster Tools |
| L3 | Replace placeholder author in `lib/authors.ts` | Real name + LinkedIn URL. Person schema is currently anchored to a placeholder LinkedIn |
| L4 | Set `NEXT_PUBLIC_GA_ID` env var (e.g. `G-XXXXXXXXXX`) on Vercel | Activates GA4 in `components/analytics/Analytics.tsx` |
| L5 | Set `NEXT_PUBLIC_CLARITY_ID` env var on Vercel | Activates Microsoft Clarity |
| L6 | Add an MX record + email mailbox for `hello@`, `legal@`, `privacy@rentalsawari.com` | All site copy and JSON-LD references these |
| L7 | Point `rentalsawari.com` DNS to Vercel + connect both `rentalsawari.com` and `www.rentalsawari.com` (the redirect in `next.config.mjs` handles canonicalisation) | |
| L8 | Submit `https://hstspreload.org/` for HSTS preload eligibility | Already configured via `next.config.mjs` headers |
| L9 | Submit `/sitemap.xml` to Google Search Console + Bing Webmaster Tools | The sitemap-index references 9 sub-sitemaps |

---

## 🟡 Content debt (write these to lift AEO citation rate)

| # | Task | Source data |
|---|---|---|
| C1 | Hand-write `description` strings in `data/areas.ts` further — currently 300-350 words per area, target 800+ per CTM spec for Lahore/Islamabad/Karachi areas | First-hand knowledge of each neighbourhood |
| C2 | Add **`topCars` arrays** to imported companies in `data/companies.ts` | Currently empty (CSV import didn't capture fleet). Without this, city × car pages can't generate. Sourceable from each vendor's Google Maps description text or by asking vendors directly when they sign featured plans |
| C3 | Add 5 more guides from the P5 list: | |
| | • `/guides/rent-a-car-islamabad-to-murree-routes-cost-2026` | |
| | • `/guides/lahore-to-hunza-7-day-itinerary-car-rental` | |
| | • `/guides/toyota-corolla-vs-honda-civic-rent-pakistan-2026` | |
| | • `/guides/cheapest-self-drive-cars-lahore-under-5000-pkr` | |
| | • `/guides/wedding-car-rental-lahore-prices-decoration-booking` | |
| C4 | Author byline on each guide currently uses placeholder name from `lib/authors.ts` — replace once L3 is done | |
| C5 | Replace the placeholder Wikimedia logo for company schema `image` field with a real cover image per company (currently uses the RentalSawari logo for every vendor — fine but unhelpful for vendor differentiation in image search) | |

---

## 🟢 External work (not blocked by code)

### Social handles + business directories
Claim, then add real URLs back into `app/page.tsx` Organization `sameAs`:
- [ ] facebook.com/rentalsawari
- [ ] instagram.com/rentalsawari
- [ ] linkedin.com/company/rentalsawari (**critical for Microsoft Copilot B2B**)
- [ ] x.com/rentalsawari
- [ ] youtube.com/@rentalsawari
- [ ] tiktok.com/@rentalsawari
- [ ] reddit.com/user/rentalsawari

Pakistani directories:
- [ ] Yelp PK
- [ ] Bing Places (**Bing powers ChatGPT search**)
- [ ] Apple Maps Business Connect (**Apple Intelligence**)
- [ ] Pakistan Business Directory
- [ ] Crunchbase
- [ ] PSEB Startup Directory

### Reviews + UGC system
Per CTM spec §3.3, the UGC review system is the single biggest moat. Not in scope for code-only work — requires:
- [ ] Backend / DB (reviews collection, OTP verification)
- [ ] Moderation queue
- [ ] Re-enable `AggregateRating` on company pages **only** when the rating is sourced from our own DB (currently noindexed because Google review counts can't legally be republished as our own rating — see code comment in `app/companies/[slug]/page.tsx`)

### Indexing + outreach
- [ ] Post on r/pakistan, r/lahore, r/islamabad, r/karachi (genuine, not promotional)
- [ ] Pitch Dawn / Express Tribune / ProPakistani startup beat
- [ ] Reach out to Pakistani travel bloggers (Mooroo, Wandering Tinkerer, Pakistan Trail)
- [ ] Partner with Northern Areas tour operators (link exchanges, not paid)
- [ ] Submit Wikidata entry once you have one press citation

### Measurement
- [ ] Set up Looker Studio dashboard wired to GA4 + Search Console
- [ ] Weekly AI citation check spreadsheet (top 25 queries × 6 engines)
- [ ] Sign up for SE Ranking AI Overviews module or Profound for AI visibility tracking
- [ ] Set up access to LiteSpeed/Hostinger logs (or Vercel's analytics) for crawler monitoring

### CRO experiments
- [ ] A/B test inquiry-form copy on company profile
- [ ] First-month: ask 10 satisfied renters for real Google reviews on RentalSawari Business Profile (once claimed)

---

## 🟢 Code TODOs I deferred (not urgent)

| # | Task | Reason deferred |
|---|---|---|
| D1 | Sticky `MobileStickyCTA` on city + listing pages (currently only on `/companies/[slug]`) | The component is built and proven, but it pulls a single WhatsApp number — listing pages have many. Needs a design pass to show a "Find a vendor" CTA instead. |
| D2 | Replace Hero dropdowns with one-tap city button row | Spec §3.2. Current SearchBar has dropdowns which are crawler-readable (links are SSR'd inside `<select>`). A button-row would be cleaner UX, especially on mobile, but content is fully crawlable today. Low priority. |
| D3 | Header global search with autocomplete (cities + cars + companies) | Spec §3.5. Would need a client component with debounced search index. Worth doing once traffic data shows what people search for. |
| D4 | Owner dashboard at `/owner-login` | Currently a placeholder. Needs auth + DB. Build when 50+ paying featured vendors exist. |
| D5 | `next-intl` Urdu translations | Spec §1.9 option B. Currently `availableLanguage` only declares English. Wire Urdu when ~50 strings are translated. |
| D6 | `noindex` thin company pages drops them from listings too quickly — instead build a "data completeness" score and `noindex` only when score < 0.5 | Currently `noindex` if `reviewCount < 5`. Could be smarter |
| D7 | Per-page `Last-Modified` HTTP header (currently uses build time + per-URL sitemap `lastmod`) | Vercel limitation — would need ISR per page with revalidation timestamps. Not worth the complexity for static-site signal |
| D8 | Custom 404 fuzzy-match "did you mean" | Spec §6.3. Currently shows curated popular links. Fuzzy match needs server runtime — fine since 404 is dynamic, but extra dependency. Optional polish |
| D9 | `/search` route with crawlable result URLs | Spec §6.5. Current SearchBar routes to existing pages, so no `/search` to noindex. Build this when global header search ships (D3) |

---

## In-code work shipped to date

### CTM SEO+AEO Domination v2.0 pass
1. `public/llms.txt` — structured AI crawler summary
2. `app/robots.ts` — AI allowlist (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) + 9 sitemap references
3. `next.config.mjs` — HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
4. `BreadcrumbList` JSON-LD on every page (via `components/shared/Breadcrumbs.tsx`)
5. `Organization` schema with founder/contactPoint/knowsAbout/sameAs
6. `Service` schema + `Speakable` on use-case pages
7. `Person` schema + visible byline on guides
8. Answer-first lead blocks (TL;DR pills) on all guides
9. FAQs on homepage, /pricing, /list-your-business, /cars, /cities, /tourist
10. `ItemList` JSON-LD on city pages
11. 1200×630 OG image
12. Data-backed market guide (1,085 vendors stats)
13. Top-10 rental companies guide
14. Pakistan-context paragraphs for all 8 cities + 12 car models
15. `/compare/{vendorA}-vs-{vendorB}` route (~80 pre-rendered pairs)

### On-Site SEO Implementation v2.0 pass (this round)
1. GSC + Bing verification meta tags (placeholders)
2. AhrefsBot unblocked
3. preconnect / dns-prefetch hints
4. Expanded `AutoRental` schema: `priceRange`, `openingHoursSpecification`, `address.streetAddress` + `addressRegion` (province mapping), `makesOffer`, `sameAs` with website + Google Maps URL
5. `Product` + `AggregateOffer` schema on `/cars/{slug}` pages
6. Urdu removed from `availableLanguage` (until translations ship)
7. **Sitemap split** into 9 sub-sitemaps: pages, cities, areas, cars, car-in-city, routes, companies, guides, compare
8. www → apex redirect via Next.js config
9. Trailing-slash stripped
10. Legal pages (`/privacy`, `/terms`) set to `noindex,follow`
11. Custom 404 with browse-by-city / car / guide blocks
12. GA4 + Microsoft Clarity scaffolding (env-var gated)
13. UTM-style source ref appended to WhatsApp pre-filled messages
14. `RelatedLinks` component on city pages
15. /cities + /cars intro content (answer-block TL;DR + four-H2 explainers)
16. **35 area pages**: 15 Lahore + 10 Islamabad + 10 Karachi, each with 250-350 word unique copy, vendor filtering, ItemList schema, BreadcrumbList
17. **Up to 96 city × car pages** (only generates where ≥3 vendors offer that car in that city — currently 0 due to C2 above; will activate as topCars data populates)
18. **10 intercity route pages** with distance / time / price / recommended-car / unique 250-400 word descriptions: Lahore→Islamabad/Murree/Hunza/Multan, Islamabad→Murree/Naran/Skardu/Hunza, Karachi→Hyderabad/Thatta

**Build state**: 1,269 static pages.
