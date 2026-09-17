# RentalSawari Pakistan

Car rental directory for Pakistan. Users search by city, area, and car type, view real prices, and contact verified rental companies directly via WhatsApp.

**First-draft status**: 52 pages live. See `NEXT_STEPS.md` for the route map and what's left.

---

## Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** with custom brand palette
- **shadcn/ui primitives** (Button, Badge, Dropdown — built into `components/ui`)
- **lucide-react** icons
- **next/font** for Inter (English) and Noto Nastaliq Urdu
- No database / no backend yet — mock data lives in `/data` as typed TS files

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Project structure

```
app/
  layout.tsx              # Root layout: fonts, metadata, viewport, OG tags
  page.tsx                # Homepage
  sitemap.ts              # Auto-generated /sitemap.xml from data
  robots.ts               # Auto-generated /robots.txt
  not-found.tsx           # Branded 404
  globals.css             # Tailwind base + design tokens + prose styles

  rent-a-car/[city]/      # 8 city listing pages (URL: /rent-a-car-{slug})
  cars/                   # /cars index
  cars/[slug]/            # 12 car type pages
  cities/                 # /cities index
  companies/[slug]/       # 12 company profile pages
  guides/                 # /guides index
  guides/[slug]/          # 4 article pages
  tourist-car-rental/     # Tourist landing
  wedding-car-rental/     # Use-case page
  airport-pickup/         # Use-case page
  northern-areas-tours/   # Use-case page
  corporate-monthly/      # Use-case page
  self-drive-rental/      # Use-case page
  tourist-packages/       # Use-case page
  list-your-business/     # Onboarding for new vendors
  pricing/                # Featured tier pricing
  owner-login/            # Placeholder until owner dashboard ships
  about/  contact/  privacy/  terms/

components/
  ui/                     # shadcn primitives — Button, Badge, DropdownMenu
  layout/                 # Header, Footer, Logo, MobileStickyCTA
  home/                   # Homepage sections
  shared/                 # PageShell, PageHeader, Breadcrumbs, BottomCTA, UseCasePage
  companies/              # CompanyCard, InquiryForm — reused across pages
  cities/                 # CityListings, CityFilterBar — listing UI
  forms/                  # ContactForm, ListBusinessForm

data/
  cities.ts               # 8 Pakistani cities
  carTypes.ts             # 12 car models popular in PK
  companies.ts            # 12 mock rental companies (6 featured)
  useCases.ts             # 6 use-case shortcuts (wedding, airport, etc.)
  guides.ts               # 4 article stubs
  guideContent.tsx        # Full article bodies (JSX, keyed by slug)

lib/
  types.ts                # All TS interfaces — the future DB schema
  utils.ts                # cn(), formatPKR(), buildWhatsAppLink()
  placeholder.ts          # Single point of swap for real imagery later

public/images/            # Empty — placeholders served from placehold.co
```

## URL rewrite

`next.config.mjs` rewrites `/rent-a-car-{city}` → `/rent-a-car/{city}` so the keyword-rich hyphen URL is the public form while the proper Next dynamic route folder lives at `app/rent-a-car/[city]/`. All `<Link>`s and the sitemap use the hyphen form.

## Design system

Defined in `tailwind.config.ts`:

| Token | Value | Use |
|---|---|---|
| `brand` | `#0F766E` | Primary buttons, links, accents |
| `brand-dark` | `#115E59` | Primary hover |
| `accent` | `#EA580C` | High-emphasis CTAs |
| `whatsapp` | `#25D366` | WhatsApp buttons only |
| `success` | `#16A34A` | Success states |
| `warning` | `#F59E0B` | Warnings |
| Neutrals | `stone-*` | Text, borders, backgrounds |

Fonts:

- `--font-inter` — Inter, 400-800
- `--font-noto-urdu` — Noto Nastaliq Urdu (use class `font-urdu`)

## Mock data → real DB

Every data file imports types from `lib/types.ts` and exports a typed array. When the backend lands, replace the array bodies with DB queries — components never see the shape change because they import the typed export.

Same goes for images: `lib/placeholder.ts` is the single switch. Flip `usePlaceholder` to `false` and every image source falls back to the `realPath` already declared in each data entry.

## Conventions

- **Server Components by default.** Only `Header`, `SearchBar`, `MobileStickyCTA`, and the dropdown primitive use `"use client"`.
- **No tracking code** wired up yet — analytics and Search Console get added once the homepage is reviewed.
- **All links use `next/link`.** All images use `next/image` with proper `sizes`.
- **WhatsApp links** go through `buildWhatsAppLink(phone, message)` in `lib/utils.ts`.

## Accessibility & SEO

- One `<h1>` (in `Hero`), then `<h2>` per section.
- All images have descriptive alt text.
- Focus rings visible (`*:focus-visible` in `globals.css`).
- JSON-LD for `WebSite` (with `SearchAction`) and `Organization` injected in `app/page.tsx`.
- Open Graph + Twitter Card metadata in `app/layout.tsx`.

## Forms → email

All three forms (`ContactForm`, `InquiryForm`, `ListBusinessForm`) POST to
`app/api/lead/route.ts`, which emails the submission to `hello@rentalsawari.com`
over SMTP. Set these on the host (Hostinger → deployment settings → Environment
Variables). Nothing is committed, because this repository is public:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `SMTP_USER` | yes | — | Full mailbox address, e.g. `hello@rentalsawari.com` |
| `SMTP_PASS` | yes | — | That mailbox's password |
| `SMTP_HOST` | no | `smtp.hostinger.com` | |
| `SMTP_PORT` | no | `465` | 465 = implicit TLS, 587 = STARTTLS |
| `LEAD_TO_EMAIL` | no | `hello@rentalsawari.com` | Where submissions land |
| `LEAD_FROM_NAME` | no | `RentalSawari Website` | Display name on the From header |

Until `SMTP_USER` / `SMTP_PASS` exist the route returns 503 and every form shows
a fallback pointing at WhatsApp and the mailbox. The forms never claim a message
was sent when it was not. Spam protection is a hidden honeypot field, a minimum
fill time, and a per-IP rate limit of 5 submissions per 10 minutes.

## Chat widget

`components/chat/HelpWidget.tsx` is a floating four-question assistant mounted
site-wide in `app/layout.tsx`. It asks need → city → car → timeline, then hands
off to WhatsApp with a pre-filled summary (carrying the usual `ref` tag) or to
the matching city listings page. No LLM, no backend, no third-party script — the
option lists are duplicated in that file to keep the client bundle small, so
keep their slugs in sync with `data/cities.ts` and `data/carTypes.ts`.

## Deploying

Deployed on **Hostinger** (hPanel → Git deployment, Node 22.x, `npm run build`,
output `.next`), building from `main`. The README previously said Vercel; that is
no longer accurate. Environment variables live in the deployment settings panel.
