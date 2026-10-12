# RentalSawari Admin — Design Brief

You are designing the **RentalSawari Admin**, the private back office of RentalSawari.com, a car rental directory for Pakistan. You are also designing **three small public pages** that feed it. A developer will build exactly what you design, so everything you need is in this brief. Read all of it before you start.

---

## 0. How we will work: read this first

1. **Design one page at a time**, in the order of the page list in section 9. Never design ahead.
2. For every page, show **desktop (1440 px wide)** and **mobile (390 px wide)** side by side.
   - The mobile design must also work at **360 px**, a common Android width in Pakistan.
   - Also show the extra states listed for that page.
3. When a page is finished, **stop and ask me:** "Page X is ready. Approve it, or tell me what to change."
   - Don't start the next page until I reply **"next"**.
   - If I ask for changes, revise that same page and ask again.
4. **Page 1 is the design system and the admin shell.**
   - Every later page must reuse its components, colours, type sizes and spacing exactly.
   - If a later page needs a new component, add it to the design system and tell me you did.
5. Use the **sample data in section 8** on every page, so the same listing looks the same everywhere.
6. Use light mode only, and real copy, never lorem ipsum.
7. Don't add features this brief doesn't ask for (see section 10). If something blocks you, ask. Otherwise follow the decisions here.

---

## 1. What this is

RentalSawari lists **1,419 car rental companies** in **21 cities** across Pakistan. Visitors find a company, then contact it directly on WhatsApp, by phone or through an inquiry form. RentalSawari takes no booking fee. It earns from **Featured plans**:
- **Free:** PKR 0
- **Featured City:** PKR 5,000 a month
- **Featured Plus:** PKR 12,000 a month

The admin has **one user: the site owner.** There are no staff accounts and no roles.

**The admin has three jobs:**
1. **Show how every listing performs, in depth.** How often it is shown, opened and contacted, where its visitors come from, when they come, and how it compares with its city. These numbers are also the owner's sales proof when selling Featured plans.
2. **Handle requests from businesses:**
   - a business asking to be **added**;
   - an owner **claiming** a listing and asking for edits;
   - a visitor **reporting a problem** with a listing.
3. **Edit listings safely.** Every change is logged and can be undone.

**The feel:** a clear, calm analytics and inbox tool. Numbers are big and readable. Every number explains itself, and the next action is always obvious. It should not feel like a cluttered enterprise dashboard.

**Who uses it:** the owner, on a laptop **and** on a phone, equally often. Mobile is not a shrunken desktop; it must work well with one thumb. The interface is in English, in plain words.

---

## 2. Rules that shape every screen

1. **Nothing changes a listing by itself.** A listing only changes when the owner presses **Update listing**, **Approve & publish**, **Save changes**, **Hide**, or **Restore**. Requests and reports never change anything on their own.
2. **A claim cannot be applied until ownership is verified.** This is a hard rule (see Page 9). Until then, the **Update listing** button is visibly locked, with the reason written next to it.
3. **Every number explains itself.**
   - Every stat label has a small ⓘ that shows a one-line definition (section 5) on hover or tap.
   - Percentages show their base, for example *"14.6% · 187 of 1,284"*.
4. **Comparison arrows never rely on colour alone.**
   - Up: ▲ +18% in green. Down: ▼ −7% in red. Flat: "— no change" in grey.
   - The tooltip says what it is compared with: *"vs previous 30 days (14 Aug – 12 Sep)"*.
5. **Small numbers are labelled honestly.** When a listing has fewer than **30 opens** in the chosen period, rates and comparisons show **"Not enough data yet"** in grey instead of a misleading percentage.
6. **Tracking start date.** Stats only exist from the day tracking went live. Wherever a date range reaches back before that day, show a quiet note: *"Counting since 13 Oct 2026"*.
7. **Dates and times are in Pakistan time (PKT) and friendly:**
   - *Today, 3:45 PM*
   - *Yesterday, 5:10 PM*
   - *6 Oct 2026, 11:20 AM*
   - Ranges: *13 Sep – 12 Oct 2026*.
8. **Money is PKR with thousands separators:** *PKR 7,500/day*.
9. **Phone numbers are shown as *+92 300 1234567***.
10. **WhatsApp and Call buttons only open things.**
    - **WhatsApp** buttons open a chat with a pre-filled message, which the owner then sends. There is no inbox and no sending from inside the admin. Every pre-filled message also has a "Copy message" option.
    - **Call** buttons dial on phones.
11. **Undo instead of "Are you sure?"** for everyday actions. Show a toast like *"Listing updated · Undo"*.
    - Confirmation dialogs are only for **Hide listing**, **Reject**, **Delete** and **Restore an old version**.
12. **Big, forgiving controls.**
    - Buttons are at least 40 px tall on desktop and 48 px on mobile.
    - Body text is 15–16 px; nothing is under 12 px.
    - Tables have roomy 52–56 px rows.
13. **Plain words.** Use: *Shown, Opened, Contacted, Contact rate, Requests, Claims, Reports, Listing, Plan.* Technical terms (impressions, CTR, conversion) may appear only inside ⓘ tooltips.

---

## 3. Brand and design tokens (use these exact values)

The admin must feel like RentalSawari, but plainer and more practical than the public site. If I attach `logo-full.png` and `logo-mark.png`, use them.

### 3.1 Logo
- **Lockup:** a teal rounded-square tile with a white car mark, then the wordmark **"Rental"** in near-black and **"Sawari"** in teal, with a small spaced-out **"PAKISTAN"** underneath.
- **In the admin:** the lockup sits at the top of the sidebar with a small **"Admin"** pill beside it (teal text on #F0FDFA).
- **On mobile:** use the tile only, at 32 px.

### 3.2 Font
**Inter** (Google Fonts) for everything. Weights 400, 500, 600, 700 and 800. Use **tabular numbers** for every stat, count, price, phone number and time.

| Use | Desktop | Mobile |
|---|---|---|
| Page title (800, tracking −0.02em) | 28/34 | 22/28 |
| Card or section title (700) | 17/24 | 16/22 |
| Big stat number (800, tabular) | 34/38 | 28/32 |
| Body (400/500) | 15/24 | 16/24 |
| Labels and secondary text (500) | 13/18 | 13/18 |
| Table header (600, uppercase, 0.06em) | 12/16 | 12/16 |

### 3.3 Colours

**Brand and neutrals**
| Token | Hex | Use |
|---|---|---|
| brand-700 | **#0F766E** | Primary buttons, links, active nav, focus ring, main chart line |
| brand-800 | #115E59 | Primary hover and pressed |
| brand-400 | #14B8A6 | Chart secondary, icons on dark |
| brand-50 | #F0FDFA | Active nav background, light teal fills |
| brand-100 | #CCFBF1 | Teal borders |
| accent-600 | **#EA580C** | The public site's call-to-action orange. In the admin, use it **only** for the "Contacted" series in charts and the "Featured" badge |
| whatsapp | #25D366 | WhatsApp buttons and the WhatsApp series in charts (#1FAE54 on hover) |
| ink | **#1C1917** | Headings and main text (stone-900) |
| ink-2 | #44403C | Strong secondary text (stone-700) |
| muted | #78716C | Hints, timestamps (stone-500) |
| line | #E7E5E4 | Borders and dividers (stone-200) |
| fill | #F5F5F4 | Hover rows, subtle fills (stone-100) |
| page background | **#FAFAF9** | Admin canvas (stone-50) |
| surface | #FFFFFF | Cards, sidebar, dialogs |

**Meanings (fixed everywhere: badges, deltas, diff, statuses)**
| Meaning | Text | Fill | Border | Solid |
|---|---|---|---|---|
| **Green:** good, approved, up, verified, **added in a diff** | #15803D | #F0FDF4 | #BBF7D0 | #16A34A |
| **Red:** bad, rejected, down, urgent report, delete, **removed in a diff** | #B91C1C | #FEF2F2 | #FECACA | #DC2626 |
| **Amber:** waiting, needs attention, ending soon, **not verified yet** | #B45309 | #FFFBEB | #FDE68A | #F59E0B |
| **Teal:** new, our move, main action | #0F766E | #F0FDFA | #99F6E4 | #0F766E |
| **Grey:** closed, inactive, hidden, unchanged | #57534E | #F5F5F4 | #E7E5E4 | #A8A29E |

**Plan badges:** Free (grey), Featured City (orange text #C2410C on #FFF7ED), Featured Plus (white text on #EA580C).

**Chart palette (contact methods, fixed):** WhatsApp #25D366 · Call #0F766E · Inquiry form #EA580C · Website click #A8A29E. Views and Opened are teal #0F766E. Shown is light teal #99F6E4. The previous period is a dashed grey line #A8A29E.

### 3.4 Shape, depth and icons
- **Radius:**
  - cards 16 px;
  - buttons and inputs 12 px;
  - badges and chips fully round;
  - dialogs 20 px;
  - mobile bottom sheets 24 px on the top corners.
- **Card:** white, a 1 px #E7E5E4 border, and shadow `0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -12px rgba(28,25,23,0.12)`.
- **Spacing:** 4 px grid. Card padding is 24 px on desktop and 16 px on mobile. Gaps between cards are 24 px on desktop and 12 px on mobile.
- **Icons:** **Lucide**, 1.75 px stroke, 20 px.
- **Company avatar:** the logo if there is one; otherwise initials on #F0FDFA in #0F766E, rounded 12 px.
- **Buttons:**
  - **Primary:** #0F766E, white text.
  - **Success:** #16A34A, for Approve & publish and Update listing.
  - **Secondary:** white, #E7E5E4 border, ink text.
  - **Soft:** tinted fill from the meaning table.
  - **WhatsApp:** #25D366 with the WhatsApp glyph, white text.
  - **Destructive:** #DC2626, only inside confirmations.
  - **Locked:** grey fill, a lock icon and a reason line underneath.

---

## 4. Admin shell (the same on every page after login)

### Desktop
- **Left sidebar, 248 px:**
  - the logo with the "Admin" pill;
  - nav items: **Overview · Listings · Inbox · Featured plans**. Inbox carries a count badge of everything waiting (for example **9**).
  - At the bottom: **"View live site ↗"** and **Log out**.
- **Top bar:**
  - the page title;
  - a **global search** ("Search listings by name, phone or city…"). Results show the avatar, name, city · area, plan badge, and opens and contacts over the last 30 days.
  - on the right, the **date range picker** on pages that have stats (see 6.1).

### Mobile
- **Top bar:** the logo tile, the page title, and a search icon that opens full-screen search.
- **Bottom tab bar (4):** Overview · Listings · Inbox (with badge) · Plans.
- Log out and "View live site" live in a ⋯ menu in the top bar.

---

## 5. What the numbers mean (use these definitions in every ⓘ)

| Stat | Definition |
|---|---|
| **Shown** | How many times this listing's card appeared on a RentalSawari list page (city, area, car type, car-in-city, compare, homepage featured strip). |
| **Average position** | Where the card sat in those lists on average (1 = top). Shown per list page. |
| **Opened** | How many times someone opened this listing's own page. |
| **Unique visitors** | Different people who opened it (counted once per device per day). |
| **Open rate** | Opened ÷ Shown. How often people who saw the card clicked into it. |
| **Contacted** | WhatsApp clicks + Call clicks + Inquiry forms sent. These are the leads the listing got. |
| **Contact rate** | Contacted ÷ Opened. How often a visit turned into a lead. |
| **Website clicks** | Clicks on the company's own website link. Counted separately, not as contacts. |
| **Source** | Where the visitor came from before landing on RentalSawari: Google, Bing, AI assistants (ChatGPT, Perplexity, Copilot, Gemini), Facebook, Instagram, WhatsApp shares, Direct, or other websites. |
| **Entry page** | The RentalSawari page the visitor was on just before opening this listing (a city page, an area page, a car page, a compare page, a guide, the homepage, or "came straight to the listing"). |
| **Device** | Phone, desktop or tablet. |
| **Rank in city** | This listing's position among all listings in the same city, sorted by contacts in the period. |
| **Profile completeness** | How much of the listing is filled in: logo, about text, cars with prices, services, website, second phone. |

Bots and our own visits are excluded from every number. Say so once, in small print, at the bottom of the Overview page.

---

## 6. Shared components (designed on Page 1, reused everywhere)

### 6.1 Date range picker
- **Presets:** Today · Yesterday · Last 7 days · **Last 30 days** (the default) · This month · Last month · Last 90 days · Custom.
- A toggle: **"Compare with previous period"** (on by default).
- The trigger shows *"Last 30 days · 13 Sep – 12 Oct 2026"*.
- On mobile it opens as a bottom sheet.

### 6.2 Stat card
- A label with ⓘ, the big number, the delta (▲/▼ % with its tooltip), and an optional 30-point sparkline.
- States: normal, **"Not enough data yet"**, loading skeleton.

### 6.3 Charts
- **Line or area chart over time:** day or week grouping, a hover tooltip with every series' values for that day, series toggles shown as chips, and a dashed previous-period line when comparison is on.
- **Stacked bar:** contacts by method.
- **Horizontal bar list:** sources, entry pages, cities. Each row shows the label, the bar, the count and the %.
- **Funnel:** Shown → Opened → Contacted, with the rate between each step.
- **Heatmap:** 7 days × 24 hours in PKT, teal intensity, with a hover showing *"Fri 8–9 PM · 41 opens"*.
- **Donut:** devices. Use at most 3 slices, with labels on the slices, never a separate legend.

### 6.4 Other components
- **Diff row:** used on the claim screen and in history. Field label · old value · new value.
  - The old value is red text with a strikethrough on #FEF2F2.
  - The new value is green text on #F0FDF4.
  - A tick box at the start of the row means "apply this change".
  - Unchanged fields collapse into *"8 fields unchanged · Show"*.
- **Status pill:** New (teal), Waiting for verification (amber), Verified (green), Approved (green), Updated (green), Rejected (red), Resolved (grey).
- **Plan badge:** Free / Featured City / Featured Plus.
- **WhatsApp message preview:** a speech-bubble box with the pre-filled text, plus **Open in WhatsApp** and **Copy message**.
- **Toast with Undo**, **confirmation dialog**, **empty state**, **error banner**, and **skeleton** rows and cards.
- **Form controls:** text input, textarea, select, city picker (searchable, 21 cities), area input with suggestions, phone input (+92 prefix), chips multi-select for services, **cars and prices repeater** (car name with suggestions from the 12 car types, price per day, with driver or self-drive), logo upload with preview, and a toggle.

**Services (fixed list):** With Driver · Self-Drive · Wedding · Airport Pickup · Tourist Tours · Corporate Monthly · Luxury.

**Car types (suggestions in the repeater):** Toyota Corolla · Honda Civic · Toyota Hiace · Suzuki APV · Toyota Prado · Toyota Land Cruiser V8 · Suzuki Mehran · Suzuki Cultus · Toyota Fortuner · Mercedes-Benz · Suzuki Bolan · Toyota Coaster (any other name can also be typed).

**Cities (21):** Lahore · Islamabad · Karachi · Faisalabad · Rawalpindi · Sialkot · Multan · Gujranwala · Gujrat · Sheikhupura · Sargodha · Peshawar · Chakwal · Bahawalpur · Rahim Yar Khan · Quetta · Okara · Dera Ghazi Khan · Kasur · Narowal · Mianwali.

---

## 7. A listing's fields (what Edit, Add, Claim and History all work with)

Name · City · Area · WhatsApp number · Phone number · Website · Google Maps link (admin only) · About (long text) · Services (chips) · Cars and prices (repeater) · Logo · Google rating and review count (admin only, read-only on public forms) · Plan (Free / Featured City / Featured Plus) with start and end dates · Verified (yes/no) · Status (**Live** or **Hidden**) · Page address (`rentalsawari.com/companies/{slug}`, admin only).

---

## 8. Sample data (fictional; use it consistently)

**Listing A: Margalla Rent A Car** (the main sample)
- **Details:**
  - Islamabad · F-10 Markaz.
  - Featured City plan, 1 Oct – 31 Oct 2026. Verified. Live.
  - Google 4.8 (212 reviews).
  - WhatsApp and phone: +92 300 1234567.
  - Services: With Driver, Airport Pickup, Wedding, Tourist Tours.
  - Cars: Suzuki Cultus PKR 4,500 · Toyota Corolla PKR 6,000 · Honda Civic PKR 7,000 · Toyota Prado PKR 16,000 (all with driver).
  - No logo.
- **Last 30 days (13 Sep – 12 Oct 2026):**
  - Shown 18,420.
  - Opened 1,284 (▲ +18%). Open rate 7.0%.
  - Unique visitors 1,031.
  - Contacted 187 (▲ +24%): WhatsApp 121, Call 48, Inquiry form 18. Contact rate 14.6%, against an Islamabad average of 9.8%.
  - Website clicks 23.
  - Rank in city: **#4 of 265** in Islamabad.
- **Average position:**
  - "Rent a car Islamabad": 3.2
  - "F-10 area": 1.4
  - "Toyota Prado in Islamabad": 2.1
- **Sources:**
  - Google 61%
  - Direct 14%
  - Facebook and Instagram 9%
  - AI assistants 6%
  - WhatsApp shares 4%
  - Bing 3%
  - Other 3%
- **Entry pages:**
  - Rent a car Islamabad 512
  - Came straight to the listing 313
  - F-10 area page 211
  - Toyota Prado page 98
  - Compare: Margalla vs Capital Car Hire 64
  - Guide: Islamabad to Murree 47
  - Homepage 39
- **Devices:** phone 84%, desktop 14%, tablet 2%.
- **Busiest times:** Friday–Sunday, 6–10 PM.
- **Profile completeness:** 80%. Missing: logo, second phone.

**Listing B: Chenab Car Rental**
- Gujrat · GT Road. Free. Live.
- Last 30 days: Opened 9, Contacted 1. This is the "Not enough data yet" example.

**Listing C: Capital Car Hire**
- Islamabad · Blue Area. Featured Plus, ends **15 Oct 2026** (3 days left, so amber).

**Listing D: Lahore Luxury Wheels**
- Lahore · DHA Phase 5. Featured City, **ended 5 Oct 2026** but still marked Featured.
- This is the "plan ended, you decide" example.

**Site overview, last 30 days:**
- 1,419 listings live.
- Opened 48,920 (▲ +9%). Unique visitors 31,400.
- Contacted 6,815 (▲ +11%): WhatsApp 4,602, Call 1,690, Inquiry form 523. Contact rate 13.9%.
- Top cities by contacts: Lahore 2,140 · Islamabad 1,810 · Karachi 1,120 · Rawalpindi 410 · Faisalabad 260.
- **Featured against Free:** 25 Featured listings averaged 41 contacts each; Free listings averaged 3.8. That's *"Featured listings got 10.8× more contacts"*.
- 212 live listings had **zero opens** this period.

**Inbox right now:**
- 3 new listing requests
- 2 claims: one waiting for verification, one verified and ready to update
- 4 problem reports

**New listing request 1: Ravi Rent A Car**
- Lahore · Johar Town. Owner **Usman Tariq**, WhatsApp +92 321 7654321.
- Services: With Driver, Self-Drive, Wedding.
- Cars: Toyota Corolla PKR 5,500 (self-drive) · Honda Civic PKR 7,500 (with driver).
- About: two sentences. Fleet size 12.
- Sent Today, 11:42 AM.

**New listing request 2: Al-Noor Rent A Car**
- Rawalpindi · Saddar.
- Its WhatsApp **matches the existing listing "Al Noor Car Rental"**. This is the duplicate-warning example.

**New listing request 3: Karakoram Tours & Rent A Car**
- City typed as **"Gilgit"**, which isn't one of the site's 21 cities. This is the warning example.

**Claim on Margalla Rent A Car**
- **Claimant:** Bilal Ahmed, "I'm the owner", WhatsApp +92 333 5550101 (different from the listing's number). Sent Yesterday, 7:15 PM.
- **Requested changes:**
  - Phone +92 300 1234567 → +92 51 2345678
  - Honda Civic PKR 7,000 → PKR 7,500
  - **Add** Toyota Fortuner PKR 14,000
  - **Remove** Suzuki Cultus
  - **Add** service Self-Drive
  - **New** About text
  - **Add** website margallarentacar.pk
  - **Add** a logo
- Unchanged: name, city, area, WhatsApp.

**Problem reports:**
- "Wrong number: nobody answers" on Chenab Car Rental. Reporter left a WhatsApp.
- "Business has closed" on an Okara listing.
- "Prices are wrong" on Capital Car Hire.
- **"Fake or scam listing"** on a Karachi listing. This one is urgent, so it shows red.

---

## 9. Page list: design these one at a time, in this order

### Page 1: Design system and admin shell
- **Show:**
  - the colour tokens, the meaning table and the chart palette;
  - the type scale;
  - every button style and state (default, hover, pressed, disabled, loading, locked);
  - status pills, plan badges, delta arrows (up, down, flat, not enough data);
  - stat card variants;
  - every chart type from 6.3 with sample data;
  - the diff row (changed, added, removed, unchanged and collapsed);
  - the WhatsApp message preview, toast with Undo, confirmation dialog, empty state, error banner and skeletons;
  - all form controls, including the cars and prices repeater and the logo upload.
- **Admin shell:**
  - the desktop sidebar and top bar with Overview active;
  - the mobile top bar and bottom tab bar;
  - global search results open (a desktop dropdown and a mobile full screen);
  - the date range picker open (desktop popover and mobile sheet).

### Page 2: Log in
- A centred card with the logo, *"RentalSawari Admin"*, one **Password** field (with show/hide) and a **Log in** button.
- States: wrong password (*"That password is not right. Try again."*), too many tries (*"Too many tries. Wait 10 minutes."*), loading.
- There's no username, no sign-up and no "forgot password" (the password is set on the server).

### Page 3: Overview
Answers *"How is the site doing, and what needs me?"*
- **"Needs you" strip** at the top. Each tile is clickable:
  - **3 new listing requests**
  - **2 claims** (1 ready to update)
  - **4 problem reports** (1 urgent, in red)
  - **2 plans ending soon** or ended
  - **212 listings with zero opens**
- **Stat cards:** Opened · Unique visitors · Contacted · Contact rate. Each has a delta and a sparkline.
- **Main chart:** Opened and Contacted per day, with the previous-period dashed line.
- **Contacts by method:** a stacked bar or bar list (WhatsApp · Call · Inquiry form), plus Website clicks shown separately.
- **Top listings:** the top 10 by contacts, with avatar, name, city, plan badge, Opened, Contacted, contact rate and a mini sparkline. There's a "See all" link to Listings sorted by contacts.
- **Top cities:** a bar list by contacts, with Opened shown beside each.
- **Sources:** a bar list.
- **Devices:** a donut.
- **Busiest times:** a heatmap for the whole site.
- **Featured against Free:** a comparison card. Average contacts per listing as two bars, the line *"Featured listings got 10.8× more contacts"*, and a link to Featured plans.
- **Footer note:** *"Bots and your own visits are not counted. Counting since 13 Oct 2026."*
- **States to show:** the first day after launch ("Counting since today: numbers will fill in as visitors arrive"), loading.

### Page 4: Listings
- **Toolbar:**
  - search;
  - filters: City, Area, Plan, Verified, Status (Live/Hidden), Profile completeness (under 50%), "Zero opens";
  - **Export CSV**;
  - **+ Add listing**.
- **Table columns:** Listing (avatar, name, city · area) · Plan · Shown · Opened · Open rate · Contacted · Contact rate · Avg position · Rank in city · Trend (sparkline) · Last updated.
  - Every numeric column is sortable, and the sort direction is shown.
  - The default sort is Contacted, high to low.
- **Row click:** opens the listing (Page 5).
- **Hidden listings:** a grey row with a "Hidden" pill.
- **Mobile:** each row becomes a card with name, plan badge, Opened, Contacted and contact rate, and a sort menu at the top.
- **States to show:** filtered with no results, loading, and a row with "Not enough data yet" (Chenab Car Rental).

### Page 5: Listing, Stats tab (the deep stats; the most important page)
- **Listing header** (shared by Pages 5–7):
  - avatar, **Margalla Rent A Car**, *Islamabad · F-10 Markaz*;
  - plan badge, Verified, Live pill;
  - buttons: **View on site ↗** · **WhatsApp the owner** · ⋯ (Hide listing, Copy page link);
  - tabs: **Stats · Edit · History**.
- **Body**, in this order:
  1. **Stat cards:** Shown · Opened · Contacted · Contact rate · Website clicks · Unique visitors.
  2. **Funnel:** Shown 18,420 → Opened 1,284 (7.0%) → Contacted 187 (14.6%).
  3. **Over time:** Shown, Opened and Contacted per day, with series chips and the previous-period line.
  4. **How they contacted:** WhatsApp 121 · Call 48 · Inquiry form 18. Show it as a stacked bar per day and as totals.
  5. **Against the city:** contact rate 14.6% against the Islamabad average of 9.8%; **Rank in city #4 of 265**; Opened against the city median. Show it as small comparison bars.
  6. **Where it appears in lists:** a table with the list page, times shown, average position and opens from that page. For example:
     - Rent a car Islamabad · 11,200 shown · 3.2 · 512 opens
     - F-10 area page · 2,940 · 1.4 · 211
  7. **Where visitors came from:** a sources bar list.
  8. **Which page sent them:** an entry pages bar list.
  9. **Busiest times:** the heatmap.
  10. **Devices:** the donut.
  11. **Profile completeness:** an 80% ring. Missing items show as a checklist ("Add a logo", "Add a second phone"); each links to the Edit tab.
  12. **Monthly stats message:** a WhatsApp message preview of this listing's month (see Page 11), with **Open in WhatsApp** and **Copy message**.
- **Mobile:** the same order. The charts become full-width cards, and the tables become lists.
- **States to show:**
  - Listing B with "Not enough data yet" on rates and deltas, and the counts still shown;
  - a range that starts before tracking began, with the note;
  - loading.

### Page 6: Listing, Edit tab (and Add listing)
- **The form**, in groups:
  - **Basics:** name, city, area.
  - **Contact:** WhatsApp, phone, website.
  - **About.**
  - **Services.**
  - **Cars and prices.**
  - **Logo.**
  - **Admin only:** Google Maps link, rating and review count, Verified toggle, Plan with start and end dates, Status Live/Hidden, page address.
- Changed fields get a small teal dot while unsaved. A sticky footer bar shows *"3 unsaved changes"* with **Discard** and **Update listing**.
- **After saving:** the toast *"Margalla Rent A Car updated · Undo"*, and the change appears in History. Show a line saying *"Live on the site within a minute"*.
- **Changing the page address:** show a warning that the old address will redirect to the new one.
- **Add listing** reuses the same form, empty, with the button **Publish listing**.
- **States to show:** validation errors (a WhatsApp number missing or in the wrong format, no city), saving.

### Page 7: Listing, History tab
- A timeline of every change, newest first. Each entry shows:
  - when (PKT) and how: **"Edited by you"**, **"Claim by Bilal Ahmed applied"**, **"Created from listing request"**, **"Imported"**, **"Restored"**;
  - the changed fields as compact diff rows;
  - a **Restore this version** button, which asks for confirmation.
- **States to show:** a listing with a single "Imported" entry.

### Page 8: Inbox, New listing requests
- The **Inbox** has three tabs: **Listing requests (3) · Claims (2) · Problem reports (4)**. Each tab has sub-filters: **New · Done · Rejected**.
- **List:** request cards with business name, city · area, owner name, when sent, and warning chips ("Possible duplicate", "City not on site").
- **Request detail:** desktop shows the list on the left and the detail on the right; mobile opens a full screen.
  - Everything the business sent, laid out as a listing preview, so the owner sees roughly how it will look.
  - **Duplicate warning (Request 2):** an amber banner, *"This WhatsApp number is already on Al Noor Car Rental (Rawalpindi · Saddar)."* It offers **Open that listing** and **Treat as a claim instead** (which moves the request to Claims).
  - **City warning (Request 3):** *"Gilgit isn't a city on the site yet."* Offer a city dropdown to choose another city, or **Reject**.
  - The owner can **fix fields before publishing** (inline edit, using the same controls as Page 6).
  - **Actions:** **Approve & publish** (success button) · **Reject** (a dialog with a reason: duplicate / not a rental company / can't reach them / other + note).
  - **WhatsApp the applicant** with templates:
    - "Received, we'll check it";
    - "Your listing is live" (with the link);
    - "We couldn't approve it" (with the reason).
- **After approving:** the status becomes Approved, there's a link to the new listing, and **Send "Your listing is live" on WhatsApp**.
- **States to show:** an empty inbox ("No new requests. You're all caught up."), Done and Rejected lists.

### Page 9: Inbox, Claims and edit requests (the side-by-side screen)
- **List:** claim cards with listing name, claimant, number of changes, when sent, and status (**Waiting for verification** in amber, **Verified** in green).
- **Claim detail**, top to bottom:
  1. **Header:** "Claim on **Margalla Rent A Car**", a link to the listing and its Stats, and the claimant: *Bilal Ahmed · Owner · WhatsApp +92 333 5550101 · Yesterday, 7:15 PM*, with their message.
  2. **Verification panel:** required, and it comes before the changes.
     - **Not verified (amber):**
       - Copy: *"Before updating, confirm this is really the owner. Message the number already on the listing, not the claimant's number."*
       - The listing's current WhatsApp, **+92 300 1234567**, with a WhatsApp message preview: *"Assalam o Alaikum, this is RentalSawari. Bilal Ahmed has asked to update the Margalla Rent A Car listing (new phone number, Civic price, adds Fortuner). Was this you or your team? Please reply YES or NO."*
       - Buttons: **Open in WhatsApp** · **Call instead**.
       - Below that, the owner records the result: **"They confirmed YES"**, with a method (WhatsApp reply / phone call / other proof) and an optional note. A second option: **"They said NO"**, which rejects the claim and flags it.
     - **Verified (green):** *"Verified by WhatsApp reply · Today, 10:05 AM"*, with an **Undo** link.
     - **Special case:** when the claim changes the WhatsApp or phone number itself, show an extra amber line: *"This claim changes the contact number. Verify using the OLD number."*
     - **Special case:** when the listing's number can't be reached, "Other proof" requires a note (for example "Visited the office" or "Sent shop photo with the board").
  3. **Current against Requested:**
     - Two columns on desktop: **Current listing** on the left and **Requested** on the right.
     - Changed rows use the diff style, each with a tick box (all ticked by default).
     - Cars show per-car rows: changed price, added car (green), removed car (red, struck through).
     - The new logo shows as a thumbnail; the new About shows the old and new text with the changed words highlighted.
     - Unchanged fields are collapsed.
     - On mobile, each changed field is a card showing **Now** above **Requested**, with its tick box.
  4. **Action bar:** a sticky footer.
     - **Update listing** (success). It's **locked** until verified, with the reason line *"Verify ownership first"*.
     - When unlocked, the button reads *"Update listing · 7 of 8 changes"* if a change is unticked.
     - Also **Reject claim** (with a reason dialog).
- **After updating:**
  - the toast *"Margalla Rent A Car updated · Undo"*;
  - the claim becomes **Updated**;
  - the listing's History records *"Claim by Bilal Ahmed applied"*;
  - a **Send "Your changes are live" on WhatsApp** button (to the claimant's number).
- **States to show:** not verified (locked), verified (unlocked), contact-number-change warning, updated, rejected.

### Page 10: Inbox, Problem reports
- **List:** report cards with listing name, reason, reporter contact (if they left one), when sent, and an **Urgent** red pill for "Fake or scam listing".
- **Report detail:**
  - the reason and the reporter's note;
  - the listing's key details and its Stats in mini form (Opened and Contacted over 30 days);
  - **Actions:**
    - **Edit listing** (opens Page 6);
    - **Hide listing** (confirmation, with the copy *"It will disappear from the site but stay in the admin"*);
    - **WhatsApp the business** (a "someone reported…" template);
    - **WhatsApp the reporter**;
    - **Mark resolved** (with an optional note);
    - **Dismiss**.
- **States to show:** resolved, empty.

### Page 11: Featured plans
- **Summary cards:**
  - Featured listings (25)
  - Ending in 7 days (2)
  - Ended but still marked Featured (1)
  - Average contacts, Featured against Free
- **Table:** listing, plan, start, end, days left (amber at 7 days or fewer, red when ended), Opened and Contacted this plan period. Actions per row:
  - **Renewal reminder** (a WhatsApp template);
  - **Monthly stats message** (a preview);
  - **Extend plan** (date picker);
  - **Switch to Free**.
- **Ended example (Listing D):** an amber banner, *"Plan ended 5 Oct but the listing is still Featured. Nothing changes until you choose."* The buttons are **Switch to Free** and **Extend plan**.
- **Monthly stats message** for a Featured listing:
  > *"Assalam o Alaikum! Your RentalSawari listing, September 2026: 1,284 people opened your listing and 187 contacted you (121 on WhatsApp, 48 calls, 18 forms). You ranked #4 of 265 in Islamabad. Thank you for being a Featured partner. — RentalSawari"*
- **Sales message** for a Free listing (from the ⋯ menu in Listings): the listing's own numbers plus *"Featured listings in Islamabad got 10× more contacts last month. Featured City is PKR 5,000/month."*

### Page 12: Public, List your business (on rentalsawari.com)
This page sits **inside the existing public site**: the same header and footer, white background, stone-200 borders, rounded-2xl cards, extra-bold headings, orange #EA580C main buttons, teal #0F766E links.
- **A short step form** with a progress bar:
  1. **Your business:** company name, city (dropdown of 21, plus "My city isn't listed"), area, address (optional), website (optional), Google Maps link (optional).
  2. **Contact:** owner name, WhatsApp (required), phone (optional).
  3. **Your cars and services:** service chips, cars and prices repeater, fleet size.
  4. **About and logo:** about text (with a hint), logo upload (optional). Then a review screen of everything, and **Send request**.
- **Live duplicate check:** once the WhatsApp number is typed, if it matches an existing listing, show *"This number is already on Al Noor Car Rental (Rawalpindi). Is that yours?"* with **Claim that listing instead**. They can still continue if it isn't theirs.
- **Success:** *"Request received. We'll check your details and message you on WhatsApp within 24 hours. Free listings go live as soon as they're approved."*
- **Error:** the form couldn't send. Offer a WhatsApp fallback button.
- Keep the page's existing benefits and FAQ sections below the form (no need to redesign them).

### Page 13: Public, Claim this listing or suggest edits
- **Entry points** (show them in context):
  - On every company profile page, a card: **"Is this your business? Claim it to update your details."** with a **Claim this listing** button.
  - On the List your business page: **"Already on RentalSawari? Find and claim your listing"**, with a search box (name or phone).
- **The flow:**
  1. **Who are you?**
     - *I'm the owner* / *I work here*. These continue the claim.
     - *I'm a customer and something is wrong*. This goes to the Report form (Page 14).
     - Then: name and WhatsApp.
  2. **Update your details:** the same fields as Page 12, **filled in with the current listing**.
     - Each field the person changes gets a small "Changed" tag and a "Reset" link.
     - There's also a separate choice: **"This business has closed. Remove the listing."**
  3. **Review your changes:** a simple before-and-after list of only what changed, plus an optional message to RentalSawari.
- **Success:** *"Thanks! To protect your listing, we'll message the WhatsApp number already on it to confirm it's really you. Your changes go live once confirmed."*
- **Mobile:** every step is full screen, with a sticky bottom button.

### Page 14: Public, Report a problem
- **Entry:** a small **"Report a problem"** text link at the bottom of every company profile page.
- **Dialog** (a bottom sheet on mobile):
  - **reason:** Wrong number · Business has closed · Prices are wrong · Rude or bad service · Fake or scam listing · Other;
  - details (optional);
  - your WhatsApp (optional, *"only if you want a reply"*);
  - **Send report**.
- **Success:** *"Thank you. We'll look into it."*

---

## 10. Do not design

- Owner login or an owner dashboard for businesses (planned for later).
- Staff accounts, roles or permissions (there's one admin).
- Online payments or invoices (plans are paid off-site and recorded by hand).
- A reviews or ratings system, or a booking flow.
- Email templates, push notifications or a notification centre.
- Urdu screens or dark mode.
- Any WhatsApp sending from inside the admin (buttons only open chats).
- Redesigns of other public pages beyond the entry points named on Pages 13–14.

---

## 11. Handoff after the last page is approved

Export everything as **one handoff bundle**:
- every page at desktop and mobile, with every state listed;
- the design system page;
- a short README listing each page and anything you decided that this brief didn't specify.

I'll give the bundle to the developer, who will build it in Next.js with Tailwind and Lucide icons.
