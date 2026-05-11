# PENDING — External Tasks (Audit Round v2.0)

Everything from the CTM SEO/AEO audit that **requires you to act outside the codebase**. I've done all the in-code work; this is what's left.

Use this as the checklist before launch and through the 90 days post-launch.

---

## A. Personal / business details to confirm (do this first — blocks several others)

| # | Task | Where it shows up |
|---|---|---|
| A1 | Replace the `hassan` placeholder in [`lib/authors.ts`](lib/authors.ts) with your real name, exact job title, bio, and LinkedIn URL. The `sameAs` array drives Person-schema verification by AI engines. | All guide bylines + Person JSON-LD |
| A2 | Decide your founder's full name + add to the Organization schema in [`app/page.tsx`](app/page.tsx) (currently uses `"@id"` reference only — fine, but a `founder` field with a real name strengthens the entity graph). | Homepage Organization JSON-LD |
| A3 | Set a real support WhatsApp number on the Organization schema (`telephone` field in `app/page.tsx`). Currently absent — schema validators will flag it as incomplete. | Homepage Organization JSON-LD |
| A4 | Decide on the company's founding date if you want it more specific than "2026". | Homepage Organization JSON-LD |

---

## B. Pre-launch — claim accounts (one afternoon's work, blocks AI entity recognition)

| # | Platform | What to claim | Why it matters |
|---|---|---|---|
| B1 | Facebook | `facebook.com/rentalsawari` | Already referenced in JSON-LD `sameAs` — make it exist before launch |
| B2 | Instagram | `instagram.com/rentalsawari` | Same as above |
| B3 | LinkedIn | `linkedin.com/company/rentalsawari` | **Critical for Microsoft Copilot AI visibility.** Copilot leans heavily on LinkedIn for B2B queries (List-Your-Business is B2B) |
| B4 | X / Twitter | `x.com/rentalsawari` | Referenced in twitter card metadata |
| B5 | YouTube | `youtube.com/@rentalsawari` | Reserve for upcoming video content (#G3 below) |
| B6 | TikTok | `tiktok.com/@rentalsawari` | Reserve only — not active yet |
| B7 | Reddit | `reddit.com/user/rentalsawari` | For posting in r/pakistan, r/lahore, etc. (#E1) |
| B8 | GitHub | `github.com/rentalsawari` | Reserve — useful if you ever open-source any tooling |
| B9 | Pakistani business directories | Yelp PK, Bing Places, Apple Maps Business Connect, Pakistan Business Directory | **Bing Places is critical — Bing powers ChatGPT's web search.** Apple Maps powers Apple Intelligence + Spotlight |
| B10 | Google Business Profile | Claim your registered business address | If you have a physical office, claim it. If not, skip — service-area listings aren't a great fit |

---

## C. Pre-launch — domain and DNS

| # | Task | Notes |
|---|---|---|
| C1 | Point `rentalsawari.com` DNS at Vercel | After deploying to Vercel, follow Vercel's "Add Domain" flow. CNAME / A records |
| C2 | Enable HSTS preload | `next.config.mjs` is already configured. After deploy, submit at <https://hstspreload.org/> |
| C3 | Verify SSL certificate | Vercel auto-provisions Let's Encrypt. Test at <https://www.ssllabs.com/ssltest/> — should hit A+ with our headers |
| C4 | Run SecurityHeaders.com scan | <https://securityheaders.com/?q=rentalsawari.com> — target A grade. The next.config headers should already get you there |
| C5 | Add an `MX` record for `@rentalsawari.com` emails | Required for the `hello@rentalsawari.com`, `legal@rentalsawari.com`, `privacy@rentalsawari.com` references throughout the site to actually work |

---

## D. Pre-launch — Search Console + Bing Webmaster

| # | Task | Notes |
|---|---|---|
| D1 | Add property to Google Search Console | Use `https://rentalsawari.com` (https, no www). Verify via DNS TXT record or the `<meta>` tag in `app/layout.tsx` |
| D2 | Submit `https://rentalsawari.com/sitemap.xml` to Search Console | One time. Recrawl is automatic after that |
| D3 | Add property to Bing Webmaster Tools | **Critical** — Bing powers ChatGPT's web search and Microsoft Copilot |
| D4 | Submit sitemap to Bing | Same URL |
| D5 | Add a Crawl Delay rule in Bing Webmaster if needed | Bing's defaults are usually fine |
| D6 | Add an Ahrefs Webmaster Tools verification | Free for site owners. Gives you free backlink monitoring |

---

## E. Launch week — analytics + tracking

| # | Task | Notes |
|---|---|---|
| E1 | Set up Google Analytics 4 | Create a property. Add the GA4 ID via `<Script>` in `app/layout.tsx` |
| E2 | Set up GA4 Consent Mode v2 | Pakistan isn't GDPR but anyone visiting from EU is — needed for legal compliance |
| E3 | Set up custom GA4 dimensions for AI-referred traffic | Create a dimension that segments by referrer. Track: `chat.openai.com`, `chatgpt.com`, `claude.ai`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` |
| E4 | Configure GA4 events | `whatsapp_click`, `phone_click`, `inquiry_submit`, `list_business_submit` |
| E5 | Set up a UTM tracker spreadsheet | For Reddit/LinkedIn campaigns — `?utm_source=reddit&utm_campaign=...` |
| E6 | Set up Looker Studio dashboard | Connect GA4 + Search Console — one unified weekly view |

---

## F. Launch week — content seeding (no code change needed)

| # | Task | Notes |
|---|---|---|
| F1 | Post on Reddit r/pakistan | Introduce RentalSawari as "I built a verified directory of 1,000+ Pakistani car rental companies — feedback welcome". Honest, non-spammy. Reply genuinely to every comment |
| F2 | Post on r/lahore, r/islamabad, r/karachi | Same intro, tailored to the city |
| F3 | Post on LinkedIn (personal + company page) | Lead with the data article ("We audited 1,085 verified Pakistani car rental vendors — here's what the market actually looks like"). Tag relevant Pakistani business journalists |
| F4 | Email Pakistani travel bloggers | Mooroo, Wandering Tinkerer, Pakistan Trail. Pitch: free use of the tourist guide content + offer to write a guest piece |
| F5 | Email 5-10 Lahore/Islamabad rental owners personally | Tell them they're already listed (we imported them). Invite them to upgrade to a featured plan. Real conversion happens via personal outreach |

---

## G. Month 1 — content depth

| # | Task | Notes |
|---|---|---|
| G1 | Record 5 short YouTube videos (60-120s each) | "What to expect when renting in Lahore", "How to identify a verified rental vendor", "Tourist guide: airport to Hunza". Embed in the relevant guide pages |
| G2 | Take 10-15 original photos in Lahore + Islamabad | Replace some of the Wikimedia photos with your own — your own photos are more authentic and don't share with competitors |
| G3 | Write a second-person guest post for one Pakistani travel blog | Linkable asset + drives early external citations |
| G4 | Add real reviews to RentalSawari | Once you have 10+ real reviews per featured vendor, add Review schema (NOT AggregateRating — actual Review entries from real users). This unlocks rich snippets |
| G5 | Set up a Notion/Airtable for vendor outreach | Track which featured-plan prospects you've contacted, response status, conversion |

---

## H. Month 1-3 — AI citation tracking

| # | Task | Cadence | Notes |
|---|---|---|---|
| H1 | Manual AI citation check spreadsheet | Weekly | Build a Google Sheet with columns: Query, ChatGPT, Claude, Perplexity, AI Overview, Gemini, Copilot, Date. Run the top 25 commercial queries each Monday. Takes ~30 min |
| H2 | Sign up for SE Ranking AI Overviews module or Profound | Once | Cheapest AI-visibility tracker. ~$30/month |
| H3 | Track AI-referred traffic in GA4 | Weekly | Filter sessions by referrer (set up in E3) |
| H4 | Track AI-referred conversion rate | Monthly | Compare AI-referred conversion to organic baseline. Expect 3-4x organic |
| H5 | Re-run this audit | Quarterly | Phase 3 (AEO baseline) drifts as engines update. Don't trust month-1 baselines past month 3 |

---

## I. Month 3+ — link building + entity authority

| # | Task | Target volume |
|---|---|---|
| I1 | Get listed on 10+ Pakistani business directories | 10 in month 2 |
| I2 | Pitch Dawn / Express Tribune / ProPakistani startup beat | 1-2 placements in month 3 |
| I3 | Create Wikipedia / Wikidata entry once you have one external press citation | 1 entry once eligible |
| I4 | Sponsor a Pakistani travel YouTuber | 1-2 placements |
| I5 | Partner with Northern Areas tour operators for link exchange | 5-10 partnerships |
| I6 | Submit to Pakistani business award programmes (PSEB Startup Awards, etc.) | 2-3 nominations |

---

## J. Ongoing — review acquisition

| # | Task | Notes |
|---|---|---|
| J1 | Ask first 10 satisfied renters to leave a Google review for RentalSawari Pakistan | Critical — establishes baseline review velocity, which AI engines watch |
| J2 | Build a post-inquiry email sequence | Day-3 follow-up: "Did you find a vendor? How was the experience? Mind leaving a review?" |
| J3 | Add review schema once you have 10+ real reviews | Then re-add AggregateRating to AutoRental schema, sourced from RentalSawari-collected reviews (not Google Maps imports) |

---

## K. Things I noted in the audit but couldn't fix in-code

| # | Issue | Where | Fix |
|---|---|---|---|
| K1 | **Core Web Vitals** can only be measured live with real visitors (CrUX requires Chrome usage data) | post-launch | After 28 days of real traffic, check Search Console > Experience. Most of our SSG-static pages should hit 100/100/100 |
| K2 | **Brand SERP** — only audit-able once the site is indexed | post-launch | Run "RentalSawari" search after Search Console reports the site is indexed (usually 2-4 weeks post-submit) |
| K3 | **Competitor AI citation analysis** — needs live AI engine queries | ongoing | Part of H1 above |
| K4 | **Featured-vendor real logo** images | when vendors upgrade | The `Company.logo` field is ready; CompanyAvatar already detects real URLs. When a vendor pays for featured, ask for a 256×256 PNG logo and add to their data entry |

---

## L. Future iterations (not blocking)

| # | Improvement | When |
|---|---|---|
| L1 | EN/UR language toggle is currently decorative — wire `next-intl` once you have ~50 Urdu strings translated | Month 4-6 |
| L2 | Real owner dashboard at `/owner-login` (replace the WhatsApp placeholder) | When you have 50+ paying featured vendors |
| L3 | Real review collection system (with verified-renter check) | When you have 100+ inquiries/month |
| L4 | Booking flow (currently directory-only) | If/when the directory model maxes out |
| L5 | Wedding-decoration photo gallery per vendor | When featured-plan adoption hits 20+ vendors |
| L6 | Comparison route for car types (e.g. `/compare/honda-civic-vs-toyota-corolla-rental`) | Month 2-3 — pattern is in place at `/compare/[pair]` |
| L7 | Per-area pages (e.g. `/rent-a-car-lahore/dha-phase-5`) | Once you have 20+ vendors per area |

---

## Quick reference — the in-code changes I shipped in this audit pass

1. `public/llms.txt` — structured AI crawler summary
2. `app/robots.ts` — explicit AI allowlist (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
3. `next.config.mjs` — HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy headers
4. `app/companies/[slug]/page.tsx` — removed `AggregateRating` (manual-action risk); `noindex` for thin pages (<5 reviews)
5. `components/shared/Breadcrumbs.tsx` — `BreadcrumbList` JSON-LD on every page
6. `app/page.tsx` — expanded `Organization` schema with founder, contactPoint, knowsAbout, sameAs
7. `app/layout.tsx` — trimmed titles, canonical, OG image, googleBot directives
8. `components/shared/UseCasePage.tsx` — `Service` schema + `Speakable` on FAQs
9. `lib/authors.ts` + `app/guides/[slug]/page.tsx` — `Person` schema + visible bylines on guides
10. `data/guideContent.tsx` — answer-first lead blocks + question H2s on all 4 existing guides
11. `data/faqs.ts` + `components/shared/FAQSection.tsx` — 8-question FAQs on homepage, /pricing, /list-your-business, /cars, /cities, /tourist-car-rental
12. `app/rent-a-car/[city]/page.tsx` — `ItemList` JSON-LD + per-city editorial context
13. `public/og-image.png` — generated 1200×630 OG image
14. `data/guideContent.tsx` — **two new data-backed guides** ("Pakistan's Car Rental Market in 2026" + "Top 10 Rent-a-Car Companies")
15. `data/cityContext.ts` — Pakistan-context paragraphs for all 8 cities
16. `data/carContext.ts` — Pakistan-context paragraphs for all 12 car models
17. `app/compare/[pair]/page.tsx` — vendor-vs-vendor comparison route (~80 pre-rendered top pairs)
18. `app/sitemap.ts` — comparison routes added to sitemap

**Build: 1,215 static pages, ~83 more than before.** All AEO and Phase 1-5 baseline gaps from the CTM v2 audit are closed.
