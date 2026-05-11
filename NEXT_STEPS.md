# NEXT_STEPS

First-draft site is built. Every route the navigation references now renders. The next two phases are **content** and **companies**.

---

## What's live (52 static pages)

### Marketing surfaces
- `/` — Homepage
- `/cities` — Cities index
- `/cars` — Car types index
- `/about`, `/contact`, `/privacy`, `/terms`

### Directory pages (SSG, one per item)
- `/rent-a-car-{city}` × 8 — city listings with filter bar
- `/cars/{slug}` × 12 — car type pages
- `/companies/{slug}` × 12 — company profile with WhatsApp/Call/Inquiry
- `/guides/{slug}` × 4 — full articles

### Use-case landings
- `/tourist-car-rental` — dedicated foreign-tourist landing
- `/wedding-car-rental`, `/airport-pickup`, `/northern-areas-tours`
- `/corporate-monthly`, `/self-drive-rental`, `/tourist-packages`

### Business surfaces
- `/list-your-business` — onboarding form
- `/pricing` — Free / Featured / Featured Plus tiers
- `/owner-login` — placeholder until dashboard exists

### Meta
- `/sitemap.xml` — auto-generated from data
- `/robots.txt` — auto-generated
- `app/not-found.tsx` — branded 404

---

## Content phase (you're here next)

The site has prose throughout that should be reviewed and rewritten in your voice:

| File | What to review |
|---|---|
| `app/page.tsx` (homepage sections) | Hero, why-us bullets, footer copy — high-traffic |
| `app/about/page.tsx` | "Why we built this" narrative |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | First-draft legal — needs Pakistani lawyer review before launch |
| `app/list-your-business/page.tsx` | Benefits, steps, pitch tone |
| `app/pricing/page.tsx` | Tier names, prices, FAQ |
| `app/tourist-car-rental/page.tsx` | Essential info, destinations |
| `app/{use-case}/page.tsx` × 6 | Body copy, FAQs |
| `data/guideContent.tsx` | Full article bodies for the 4 guides |
| `data/guides.ts` | Titles and excerpts |
| `data/useCases.ts` | Use-case titles and descriptions |

**The schema is solid — don't change interfaces in `lib/types.ts`. Just edit the values.**

---

## Companies phase (after content)

`data/companies.ts` has 12 mock entries spread across 8 cities. Lahore has 3, Karachi has 2, smaller cities have 1 each. To make city pages feel real you'll want roughly:

| City | Target companies | Current |
|---|---|---|
| Lahore | 25–40 | 3 |
| Karachi | 25–40 | 2 |
| Islamabad | 20–30 | 2 |
| Rawalpindi | 10–15 | 1 |
| Faisalabad, Multan, Peshawar, Quetta | 5–10 each | 1 each |

When adding:
1. Append to `data/companies.ts` — schema stays the same.
2. Update `data/cities.ts` listing counts to match (or compute on-the-fly).
3. Featured listings (`featured: true`) should be capped at ~3 per city.
4. The `topCars[].name` field needs to match a car name in `data/carTypes.ts` (case-insensitive) for the car type page cross-linking to work. The current matcher slugifies the name and compares to `carType.slug`.

---

## Real images

Drop city/car/company/guide images into `/public/images/...` matching the paths declared in each data file (`realPath` arg to `placeholder()`), then flip:

```ts
// lib/placeholder.ts
const usePlaceholder = false;
```

That's the only change needed.

---

## Technical debt (deferred, none urgent)

- **Duplicate URL exposure.** The hyphen URL `/rent-a-car-lahore` is canonical, but the internal route `/rent-a-car/lahore` also responds (Next can't be told to hide it without middleware). Search engines will prefer the canonical via the `<link rel="canonical">` tags we already emit. If we ever see Google indexing the duplicate, add `middleware.ts` to redirect `/rent-a-car/:city → /rent-a-car-:city`.
- **No real backend.** Forms (`InquiryForm`, `ContactForm`, `ListBusinessForm`) just `console.log`. Wire to a server action + email/WhatsApp webhook in v2.
- **Search bar doesn't search.** Currently routes to `/rent-a-car-{city}` when a city is selected. Once we have more listings, hook up a real search endpoint.
- **EN/UR toggle is decorative.** Add `next-intl` (or a cookie + per-component conditional) when ready to ship Urdu translations.
- **No analytics.** Add Google Analytics 4 + Search Console after content review.
- **No Open Graph image.** Need a 1200×630 PNG at `/public/og-image.png` referenced from `app/layout.tsx`.
- **No real logo asset.** Currently a `Car` icon in a brand-coloured tile. Need a proper SVG before launch.
- **`data/companies.ts` matching is loose.** Cross-linking from car type pages to companies uses slugified `topCars[].name`. If a company lists "Civic" instead of "Honda Civic", the car page won't match. Tighten the data, not the code.

---

## Revenue infrastructure (further out)

- **Featured payment flow.** Stripe (PKR support is recent — verify availability) or off-platform invoicing for v1.
- **AdSense slots.** Identified positions but not implemented: homepage Hero bottom, between major sections, footer top.
- **Travel affiliate links** on tourist pages — defer until traffic exists.

---

## Open product questions

These came up during the build — flag for product-side decisions:

- Should the homepage `Featured Rentals` strip pull dynamically based on the user's location, or always show a curated set? (Currently: curated.)
- Do we want a Booking flow at any point, or stay strictly directory-only? Pricing tier definitions assume directory-only.
- The Owner Login currently routes users to WhatsApp support. When do we build a real owner dashboard?
- Should we add per-listing reviews? `Company.reviewCount` is a number today — no review content modelled.
