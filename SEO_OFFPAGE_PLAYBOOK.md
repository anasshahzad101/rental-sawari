# RentalSawari — Off-Page SEO Playbook

On-page and technical SEO are now strong. For a domain this young (~6 weeks),
the ranking ceiling is **authority and trust**, which is built off-site. This
is the highest-ROI work remaining — and almost none of it is code.

Work it top to bottom. Tick items as you go.

---

## 1. Brand entity & citations (do first — fastest trust signal)

Consistent **Name / Address / Phone (NAP)** everywhere. Use the exact same
business name ("RentalSawari"), one phone, and one email on every profile.

### Business directories
- [ ] **Bing Places** — powers ChatGPT Search & Copilot. High priority.
- [ ] **Apple Maps (Business Connect)** — feeds Apple Intelligence.
- [ ] **Google Business Profile** — for RentalSawari the brand (not vendors).
- [ ] Yelp Pakistan
- [ ] Crunchbase (company profile)
- [ ] Pakistan Business Directory / PakBiz / Pakistan Yellow Pages
- [ ] PSEB (Pakistan Software Export Board) startup directory
- [ ] Clutch / GoodFirms (if positioning as a tech platform)

### Social profiles (claim, fill out, then wire back)
Claim each, add a logo + bio + link to rentalsawari.com, then **add the real
URLs to the `Organization` `sameAs` array** in `app/page.tsx`:
- [ ] facebook.com/rentalsawari
- [ ] instagram.com/rentalsawari
- [ ] linkedin.com/company/rentalsawari  ← **critical for Microsoft Copilot / B2B**
- [ ] x.com/rentalsawari
- [ ] youtube.com/@rentalsawari
- [ ] tiktok.com/@rentalsawari

> Once the handles exist, tell me and I'll wire them into the `sameAs` schema.

---

## 2. Backlinks (the real ranking lever)

Quality over quantity. Even 10–20 relevant links move the needle for a new site.

- [ ] **Travel bloggers / vloggers** — pitch the data-backed market guide and the
      route guides (Islamabad→Murree, Lahore→Hunza). Mooroo, Wandering
      Tinkerer, Pakistan Trail, etc. Offer the stats as a citable source.
- [ ] **Press / startup beat** — ProPakistani, Dawn, Express Tribune. Angle:
      "first proprietary dataset on Pakistan's 1,400+ car-rental vendors"
      (the `/guides/pakistan-car-rental-market-data-2026` piece is the hook).
- [ ] **Northern-areas tour operators** — link exchanges (not paid), tied to the
      new route/itinerary guides.
- [ ] **Reddit (genuine, not promotional):** r/pakistan, r/lahore, r/islamabad,
      r/karachi — answer real "rent a car in X?" threads and link only when it
      actually helps. Self-promo gets removed.
- [ ] **Wikidata entry** — create once you have one press citation.

---

## 3. Reviews & UGC (biggest long-term moat — needs a build)

`AggregateRating` star snippets in the SERP would lift CTR on the high-impression
city pages dramatically, but we can't republish Google's review counts as our own
(policy + manual-action risk). The fix is collecting **our own** reviews:
- [ ] Build a review-collection flow (OTP-verified) + moderation queue (backend).
- [ ] Re-enable `aggregateRating` on company pages sourced only from our DB.
- [ ] First month: ask ~10 happy renters for a Google review on the RentalSawari
      Business Profile (once claimed in §1).

---

## 4. Measurement (so we can see what's working)

- [ ] Set `NEXT_PUBLIC_GA_ID` (GA4) on Vercel — activates `components/analytics/Analytics.tsx`.
- [ ] Set `NEXT_PUBLIC_CLARITY_ID` (Microsoft Clarity) on Vercel.
- [ ] After each merge, **resubmit `/sitemap.xml` in Google Search Console + Bing
      Webmaster Tools** to speed recrawl of changed titles/FAQs/new pages.
- [ ] Track the top-5 city pages + Rahim Yar Khan weekly (position + CTR).
- [ ] Monthly: spot-check AI engines (ChatGPT, Perplexity, AI Overviews) for
      "rent a car {city}" to see if our pages get cited.

---

## 5. Still-open launch placeholders (code — I can do once you supply values)

- [ ] Real author identity in `lib/authors.ts` (name + LinkedIn) → proper E-E-A-T.
- [ ] GSC + Bing verification tokens in `app/layout.tsx` (GSC appears connected
      already since we have Search Console data).
- [ ] Real AdSense publisher ID + ad-unit slot IDs (currently placeholder).
- [ ] MX records / mailboxes for hello@, legal@, privacy@rentalsawari.com.

---

### Priority order if you only do three things
1. **Bing Places + Google Business Profile + LinkedIn company page** (§1)
2. **The press/blogger pitch using the market-data guide** (§2)
3. **GA4 + resubmit sitemap** so we can measure the lift (§4)
