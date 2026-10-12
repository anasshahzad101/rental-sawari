import "server-only";
import { addDays, dayList, pktDay, slugify } from "../format";
import type { CarRow, ClaimChanges, ClaimVerification, Listing, ListingEditable, ListingRequestPayload, ReportReason } from "../types";
import type { Db, Row } from "./driver";

/**
 * Demo data, so the admin can be learned before real visitors arrive.
 *
 * Added once, the first time the database is set up (./index.ts):
 *  - 8 sample listings named "… (Demo)". They never show on the public site.
 *  - 90 days of made-up stats on those and on about 150 real listings.
 *  - Sample listing requests, claims and problem reports.
 *
 * Every row it writes carries demo = 1, so the kill switch on the Overview
 * (lib/admin/repo/demo.ts) can delete exactly these rows and nothing else.
 * After that app_meta.demo is "removed" and it is never added again.
 */

export const DEMO_KEY = "demo"; // app_meta: "on" while demo data exists, "removed" after the kill switch
export const REAL_START_KEY = "tracking_start_real";

const DAYS = 90;

// Small seeded random, so every fresh database gets the same story.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pairs<T> = [T, number][];

function picker<T>(rnd: () => number, pairs: Pairs<T>): () => T {
  const total = pairs.reduce((s, p) => s + p[1], 0);
  return () => {
    let r = rnd() * total;
    for (const [k, w] of pairs) if ((r -= w) <= 0) return k;
    return pairs[0][0];
  };
}

const car = (name: string, pricePerDay: number, mode: CarRow["mode"] = "driver"): CarRow => ({ name, pricePerDay, mode });

interface DemoListing {
  key: string;
  data: Omit<ListingEditable, "slug" | "planStart" | "planEnd"> & { planStart?: number; planEnd?: number };
  ageDays: number;
  weight: number;
  hiddenDaysAgo?: number;
}

/** planStart / planEnd are days from today. */
function demoListings(): DemoListing[] {
  const base = { phone2: null, mapsUrl: null, logoUrl: null, verified: false, status: "live" as const, plan: "free" as const, responseTime: null };
  return [
    {
      key: "margalla",
      ageDays: 140,
      weight: 9,
      data: {
        ...base,
        name: "Margalla Executive Rent A Car (Demo)",
        city: "Islamabad",
        area: "F-7 Markaz",
        whatsapp: "+923005550101",
        phone: "+923005550101",
        phone2: "+92512345601",
        website: "https://margalla-executive.example",
        about:
          "Family-run since 2009. Clean, recent-model cars with trained drivers for airport runs, weddings, corporate monthly hire and trips to Murree and the northern areas. Fuel and driver food are discussed upfront, no hidden charges.",
        services: ["With Driver", "Airport Pickup", "Wedding", "Corporate Monthly", "Tourist Tours"],
        cars: [car("Toyota Corolla", 7500), car("Honda Civic", 9500), car("Toyota Fortuner", 18000), car("Toyota Prado", 22000)],
        googleRating: 4.8,
        googleReviews: 212,
        responseTime: "15 min",
        plan: "plus",
        planStart: -10,
        planEnd: 20,
        verified: true,
      },
    },
    {
      key: "lahore-wedding",
      ageDays: 120,
      weight: 7,
      data: {
        ...base,
        name: "Lahore Wedding Cars & Rentals (Demo)",
        city: "Lahore",
        area: "DHA Phase 5",
        whatsapp: "+923215550202",
        phone: "+923215550202",
        website: null,
        about:
          "Decorated wedding cars, Mercedes and Land Cruisers with chauffeurs for baraat, walima and VIP guests. Flower decoration on request.",
        services: ["Wedding", "Luxury", "With Driver"],
        cars: [car("Mercedes-Benz", 35000), car("Toyota Land Cruiser V8", 30000), car("Honda Civic", 9000), car("Toyota Corolla", 7000)],
        googleRating: 4.6,
        googleReviews: 138,
        plan: "city",
        planStart: -26,
        planEnd: 4,
        verified: true,
      },
    },
    {
      key: "clifton",
      ageDays: 100,
      weight: 6,
      data: {
        ...base,
        name: "Clifton Self Drive (Demo)",
        city: "Karachi",
        area: "Clifton",
        whatsapp: "+923335550303",
        phone: "+923335550303",
        website: "https://clifton-selfdrive.example",
        about: "Self-drive cars by the day or week. CNIC, licence and a refundable deposit needed. Airport drop-off available.",
        services: ["Self-Drive", "Airport Pickup"],
        cars: [car("Suzuki Cultus", 5000, "self"), car("Toyota Corolla", 6500, "self"), car("Honda Civic", 8500, "self")],
        googleRating: 4.3,
        googleReviews: 76,
        plan: "plus",
        planStart: -33,
        planEnd: -3,
      },
    },
    {
      key: "pindi-tour",
      ageDays: 80,
      weight: 5,
      data: {
        ...base,
        name: "Pindi Tour & Travel (Demo)",
        city: "Rawalpindi",
        area: "Saddar",
        whatsapp: "+923455550404",
        phone: "+923455550404",
        website: null,
        about: "Hiace and Coaster for family trips, tours to Naran, Hunza and Skardu, and staff transport on monthly contracts.",
        services: ["Tourist Tours", "With Driver", "Corporate Monthly"],
        cars: [car("Toyota Hiace", 14000), car("Toyota Coaster", 25000), car("Suzuki APV", 9000), car("Toyota Corolla", 7000)],
        googleRating: 4.4,
        googleReviews: 61,
        plan: "city",
        planStart: -5,
        planEnd: 25,
      },
    },
    {
      key: "faisal-town",
      ageDays: 12,
      weight: 2.2,
      data: {
        ...base,
        name: "Faisal Town Car Rental (Demo)",
        city: "Faisalabad",
        area: "Madina Town",
        whatsapp: "+923065550505",
        phone: "+923065550505",
        website: null,
        about: "",
        services: ["With Driver"],
        cars: [car("Toyota Corolla", 6000), car("Suzuki Cultus", 4500)],
        googleRating: null,
        googleReviews: null,
      },
    },
    {
      key: "multan-airport",
      ageDays: 70,
      weight: 2.6,
      data: {
        ...base,
        name: "Multan Airport Cars (Demo)",
        city: "Multan",
        area: "Cantt",
        whatsapp: "+923015550606",
        phone: "+923015550606",
        website: null,
        about: "Airport pickup and drop at fixed prices, 24 hours. Sedans and Hiace for families.",
        services: ["Airport Pickup", "With Driver"],
        cars: [car("Toyota Corolla", 6500), car("Toyota Hiace", 12000)],
        googleRating: 4.5,
        googleReviews: 88,
      },
    },
    {
      key: "peshawar-hills",
      ageDays: 60,
      weight: 1.2,
      data: {
        ...base,
        name: "Peshawar Hills Rent A Car (Demo)",
        city: "Peshawar",
        area: "University Town",
        whatsapp: "+923135550707",
        phone: "+923135550707",
        website: null,
        about: "",
        services: [],
        cars: [],
        googleRating: 3.9,
        googleReviews: 19,
      },
    },
    {
      key: "sialkot-cabs",
      ageDays: 90,
      weight: 1.5,
      hiddenDaysAgo: 6,
      data: {
        ...base,
        name: "Sialkot City Cabs (Demo)",
        city: "Sialkot",
        area: "Cantt",
        whatsapp: "+923025550808",
        phone: "+923025550808",
        website: null,
        about: "Cars with drivers in Sialkot and to Lahore airport.",
        services: ["With Driver", "Airport Pickup"],
        cars: [car("Toyota Corolla", 6000), car("Honda Civic", 8000)],
        googleRating: 4.1,
        googleReviews: 27,
        status: "hidden",
      },
    },
  ];
}

async function setMetaRaw(d: Db, k: string, v: string) {
  const n = await d.update("meta", { k }, { v });
  if (!n) await d.insertMany("meta", [{ k, v }], { ignore: true });
}

const iso = (msAgo: number, now: number) => new Date(now - msAgo).toISOString();
const H = 3600_000;
const D = 24 * H;

/**
 * Write the demo data. Takes the raw driver (it runs inside the first-run
 * seeding, before getDb() resolves), so it must not call any repo function.
 */
export async function seedDemo(d: Db): Promise<void> {
  await setMetaRaw(d, DEMO_KEY, "on");
  const now = Date.now();
  const today = pktDay(now);
  const first = addDays(today, -DAYS);
  const days = dayList(first, addDays(today, -1)); // through yesterday: real counting from today never collides

  // Stats need the chart to treat these days as counted; the real start is kept for the kill switch.
  const meta = await d.select<{ k: string; v: string }>("meta");
  const realStart = meta.find((m) => m.k === "tracking_start")?.v ?? today;
  if (!meta.some((m) => m.k === REAL_START_KEY)) await setMetaRaw(d, REAL_START_KEY, realStart);
  if (first < realStart) await setMetaRaw(d, "tracking_start", first);

  // ── Listings ─────────────────────────────────────────────────────────
  const defs = demoListings();
  const ids = new Map<string, number>();
  const made: { def: DemoListing; listing: Listing }[] = [];
  for (const def of defs) {
    const { planStart, planEnd, ...rest } = def.data;
    const createdAt = iso(def.ageDays * D, now);
    const row: Omit<Listing, "id"> = {
      ...rest,
      slug: `demo-${slugify(rest.name.replace(/\(Demo\)/, ""))}`,
      planStart: planStart == null ? null : addDays(today, planStart),
      planEnd: planEnd == null ? null : addDays(today, planEnd),
      hiddenAt: def.hiddenDaysAgo ? iso(def.hiddenDaysAgo * D, now) : null,
      createdAt,
      updatedAt: def.hiddenDaysAgo ? iso(def.hiddenDaysAgo * D, now) : createdAt,
      demo: true,
    };
    try {
      const id = await d.insert("listings", row as unknown as Row);
      ids.set(def.key, id);
      made.push({ def, listing: { ...row, id } });
    } catch (e) {
      console.error(`[admin] Demo listing ${row.slug} skipped:`, e instanceof Error ? e.message : e);
    }
  }
  const lid = (k: string) => ids.get(k) ?? null;
  const byKey = (k: string) => made.find((m) => m.def.key === k)?.listing ?? null;

  // ── Inbox: listing requests ──────────────────────────────────────────
  const payload = (p: Partial<ListingRequestPayload>): ListingRequestPayload => ({
    name: "",
    city: "",
    cityOther: "",
    area: "",
    address: "",
    website: "",
    mapsUrl: "",
    ownerName: "",
    whatsapp: "",
    phone: "",
    services: [],
    cars: [],
    fleetSize: null,
    about: "",
    logoUrl: null,
    ...p,
  });
  const request = (agoMs: number, p: ListingRequestPayload, extra: Row = {}): Row => ({
    createdAt: iso(agoMs, now),
    updatedAt: iso(agoMs, now),
    status: "new",
    payload: p,
    fixes: {},
    duplicateOf: null,
    rejectReason: null,
    note: null,
    listingId: null,
    claimId: null,
    decidedAt: null,
    demo: true,
    ...extra,
  });
  const margalla = byKey("margalla");
  const requests: Row[] = [
    request(
      2 * H,
      payload({
        name: "Hunza Adventure Cars",
        cityOther: "Skardu",
        area: "Main Bazaar",
        ownerName: "Karim Baig",
        whatsapp: "+923555550909",
        services: ["Tourist Tours", "With Driver"],
        cars: [car("Toyota Prado", 24000), car("Toyota Land Cruiser V8", 32000)],
        fleetSize: 6,
        about: "Jeeps and Prados with local drivers for Deosai, Shigar and Khaplu. We know the mountain roads.",
      }),
    ),
    request(
      26 * H,
      payload({
        name: "Royal Ride Rent A Car",
        city: "Lahore",
        area: "Johar Town",
        address: "Shop 4, Block G1 Market",
        website: "https://royalride.example",
        ownerName: "Usman Tariq",
        whatsapp: "+923215551010",
        phone: "+924235551010",
        services: ["With Driver", "Self-Drive", "Wedding"],
        cars: [car("Toyota Corolla", 6500), car("Honda Civic", 8500), car("Suzuki Cultus", 4500, "self")],
        fleetSize: 12,
        about: "Twelve well-kept cars in Johar Town. Daily, weekly and wedding bookings, with or without driver.",
      }),
    ),
  ];
  if (margalla) {
    requests.push(
      request(
        3 * D,
        payload({
          name: "Margalla Executive Cars",
          city: "Islamabad",
          area: "F-7 Markaz",
          ownerName: "Asad Mehmood",
          whatsapp: margalla.whatsapp,
          services: ["With Driver", "Airport Pickup", "Wedding", "Corporate Monthly", "Tourist Tours"],
          cars: [car("Toyota Corolla", 8000), car("Honda Civic", 9500), car("Toyota Hiace", 15000), car("Toyota Prado", 22000)],
          about: margalla.about,
        }),
        { duplicateOf: margalla.id },
      ),
    );
  }
  requests.push(
    request(
      9 * D,
      payload({ name: "Ali Mobile Shop & Car Wash", city: "Lahore", area: "Ichhra", ownerName: "Ali Raza", whatsapp: "+923005551212" }),
      { status: "rejected", rejectReason: "Not a rental company", decidedAt: iso(8 * D, now), updatedAt: iso(8 * D, now) },
    ),
  );
  const faisal = byKey("faisal-town");
  if (faisal) {
    requests.push(
      request(
        13 * D,
        payload({ name: "Faisal Town Car Rental", city: "Faisalabad", area: "Madina Town", ownerName: "Naveed Akhtar", whatsapp: faisal.whatsapp, services: faisal.services, cars: faisal.cars }),
        { status: "approved", listingId: faisal.id, decidedAt: iso(12 * D, now), updatedAt: iso(12 * D, now) },
      ),
    );
  }
  const requestIds: number[] = [];
  for (const r of requests) requestIds.push(await d.insert("listingRequests", r));
  const approvedRequestId = faisal ? requestIds[requestIds.length - 1] : null;

  // ── Inbox: claims ────────────────────────────────────────────────────
  const none: ClaimVerification = { status: "none", method: null, note: null, at: null };
  const claim = (agoMs: number, listingId: number | null, c: { name: string; role: "owner" | "staff"; wa: string; message: string | null; changes: ClaimChanges }, extra: Row = {}): Row | null =>
    listingId == null
      ? null
      : {
          createdAt: iso(agoMs, now),
          updatedAt: iso(agoMs, now),
          listingId,
          claimantName: c.name,
          role: c.role,
          claimantWhatsapp: c.wa,
          message: c.message,
          changes: c.changes,
          closeRequested: false,
          verification: none,
          appliedKeys: [],
          status: "waiting",
          flagged: false,
          rejectReason: null,
          note: null,
          decidedAt: null,
          requestId: null,
          demo: true,
          ...extra,
        };
  const claims = [
    claim(40 * 60_000, lid("lahore-wedding"), {
      name: "Bilal Ahmed",
      role: "owner",
      wa: "+923005551313",
      message: "Wedding season prices, and we bought an Audi. The Corolla is sold.",
      changes: {
        phone2: "+923005554455",
        cars: [car("Mercedes-Benz", 38000), car("Toyota Land Cruiser V8", 30000), car("Honda Civic", 9000), car("Audi A6", 28000)],
        about:
          "Decorated wedding cars, Mercedes, Audi and Land Cruisers with chauffeurs for baraat, walima and VIP guests. Fresh flower decoration included in wedding packages.",
      },
    }),
    claim(
      5 * H,
      lid("pindi-tour"),
      {
        name: "Sana Khan",
        role: "owner",
        wa: "+923455551414",
        message: "We moved to Bahria Town and now do airport runs too.",
        changes: {
          name: "Pindi Tours & Travel (Demo)",
          area: "Bahria Town Phase 7",
          services: ["Tourist Tours", "With Driver", "Corporate Monthly", "Airport Pickup"],
          website: "https://pinditours.example",
        },
      },
      {
        status: "verified",
        verification: { status: "yes", method: "whatsapp", note: "Replied from the number on the listing", at: iso(4 * H, now) },
        updatedAt: iso(4 * H, now),
      },
    ),
    claim(
      2 * D,
      lid("peshawar-hills"),
      { name: "Zahid Afridi", role: "staff", wa: "+923135551515", message: "The owner has closed the business. Please remove it.", changes: {} },
      { closeRequested: true },
    ),
    claim(
      6 * D,
      lid("multan-airport"),
      { name: "Rashid Ali", role: "owner", wa: "+923015551616", message: null, changes: { whatsapp: "+923015559999", phone: "+923015559999" } },
      {
        status: "rejected",
        flagged: true,
        rejectReason: "Couldn't confirm ownership",
        verification: { status: "no", method: "call", note: "The number on the listing said they never asked for this", at: iso(5 * D, now) },
        decidedAt: iso(5 * D, now),
        updatedAt: iso(5 * D, now),
      },
    ),
  ].filter((c): c is Row => !!c);
  for (const c of claims) await d.insert("claims", c);

  // ── Inbox: problem reports ───────────────────────────────────────────
  const report = (agoMs: number, listingId: number | null, reason: ReportReason, details: string | null, reporter: string | null, extra: Row = {}): Row | null =>
    listingId == null
      ? null
      : {
          createdAt: iso(agoMs, now),
          updatedAt: iso(agoMs, now),
          listingId,
          reason,
          details,
          reporterWhatsapp: reporter,
          status: "new",
          resolvedNote: null,
          resolvedAt: null,
          demo: true,
          ...extra,
        };
  const reports = [
    report(70 * 60_000, lid("peshawar-hills"), "scam", "Asked for the full amount in advance on JazzCash, then stopped answering.", "+923335551717"),
    report(22 * H, lid("multan-airport"), "wrong_number", "The WhatsApp number belongs to a private person, not a rental company.", null),
    report(2 * D, lid("clifton"), "prices", "Corolla self-drive is 9,000 a day now, not 6,500.", "+923005551818"),
    report(8 * D, lid("margalla"), "service", "Driver came 40 minutes late for an airport pickup.", "+923125551919", {
      status: "resolved",
      resolvedNote: "Called the owner; that driver has been replaced.",
      resolvedAt: iso(7 * D, now),
      updatedAt: iso(7 * D, now),
    }),
    report(10 * D, lid("lahore-wedding"), "other", "test", null, { status: "dismissed", resolvedAt: iso(10 * D, now), updatedAt: iso(10 * D, now) }),
  ].filter((r): r is Row => !!r);
  for (const r of reports) await d.insert("reports", r);

  // ── History for the demo listings ────────────────────────────────────
  const versions: Row[] = [];
  for (const { def, listing } of made) {
    const snap: ListingEditable = {
      slug: listing.slug,
      name: listing.name,
      city: listing.city,
      area: listing.area,
      whatsapp: listing.whatsapp,
      phone: listing.phone,
      phone2: listing.phone2,
      website: listing.website,
      mapsUrl: listing.mapsUrl,
      about: listing.about,
      services: listing.services,
      cars: listing.cars,
      logoUrl: listing.logoUrl,
      googleRating: listing.googleRating,
      googleReviews: listing.googleReviews,
      responseTime: listing.responseTime,
      plan: listing.plan,
      planStart: listing.planStart,
      planEnd: listing.planEnd,
      verified: listing.verified,
      status: listing.status,
    };
    const fromRequest = def.key === "faisal-town" && approvedRequestId;
    const oldCars = snap.cars.map((c) => (def.key === "margalla" && c.name === "Toyota Corolla" ? { ...c, pricePerDay: 7000 } : c));
    versions.push({
      listingId: listing.id,
      createdAt: listing.createdAt,
      kind: fromRequest ? "request" : "create",
      actor: fromRequest ? "Created from listing request" : "Added by you",
      note: fromRequest ? "request from Naveed Akhtar, approved by you" : "demo listing",
      changes: [],
      snapshot: { ...snap, cars: oldCars, status: "live", plan: "free", planStart: null, planEnd: null },
      prior: null,
      refId: fromRequest ? approvedRequestId : null,
    });
    if (def.key === "margalla") {
      const start = { ...snap, cars: oldCars, plan: "free" as const, planStart: null, planEnd: null };
      const planned = { ...start, plan: snap.plan, planStart: snap.planStart, planEnd: snap.planEnd };
      versions.push({
        listingId: listing.id,
        createdAt: iso(10 * D, now),
        kind: "plan",
        actor: "Plan changed by you",
        note: "Featured Plus started",
        changes: [
          { field: "plan", old: "free", new: snap.plan },
          { field: "planStart", old: null, new: snap.planStart },
          { field: "planEnd", old: null, new: snap.planEnd },
        ],
        snapshot: planned,
        prior: start,
        refId: null,
      });
      versions.push({
        listingId: listing.id,
        createdAt: iso(4 * D, now),
        kind: "edit",
        actor: "Edited by you",
        note: "",
        changes: [{ field: "cars", old: oldCars, new: snap.cars }],
        snapshot: snap,
        prior: planned,
        refId: null,
      });
    }
    if (def.hiddenDaysAgo) {
      versions.push({
        listingId: listing.id,
        createdAt: listing.hiddenAt,
        kind: "edit",
        actor: "Edited by you",
        note: "hidden from the site",
        changes: [{ field: "status", old: "live", new: "hidden" }],
        snapshot: snap,
        prior: { ...snap, status: "live" },
        refId: null,
      });
    }
  }
  await d.insertMany("listingVersions", versions);

  await seedStats(d, made, days);
  console.log(`[admin] Added demo data (${made.length} listings, ${requests.length + claims.length + reports.length} inbox items, ${days.length} days of stats)`);
}

// ── Stats ────────────────────────────────────────────────────────────────

async function seedStats(d: Db, made: { def: DemoListing; listing: Listing }[], days: string[]) {
  const rnd = rng(20261012);
  const [{ cities }, { areas }, { carTypes }, { guides }, { useCases }] = await Promise.all([
    import("@/data/cities"),
    import("@/data/areas"),
    import("@/data/carTypes"),
    import("@/data/guides"),
    import("@/data/useCases"),
  ]);
  const citySlug = new Map(cities.map((c) => [c.name, c.slug]));
  const areaPages = new Map<string, string[]>();
  for (const a of areas) areaPages.set(a.cityName, [...(areaPages.get(a.cityName) ?? []), `/rent-a-car-${a.slug}`]);
  const areasOf = (city: string) => areaPages.get(city) ?? [];

  // Real listings that get demo traffic: the paid ones and the best reviewed, plus a random spread.
  const real = await d.select<Listing>("listings", { status: "live" }, { columns: ["id", "slug", "city", "plan", "website", "googleReviews", "demo"] });
  const pool = real.filter((l) => !l.demo);
  const ranked = [...pool].sort((a, b) => Number(b.plan !== "free") - Number(a.plan !== "free") || (b.googleReviews ?? 0) - (a.googleReviews ?? 0));
  const chosen = new Map<number, Listing>();
  for (const l of ranked.slice(0, 60)) chosen.set(l.id, l);
  while (chosen.size < Math.min(150, pool.length)) {
    const l = pool[Math.floor(rnd() * pool.length)];
    chosen.set(l.id, l);
  }

  interface T {
    l: Pick<Listing, "id" | "slug" | "city" | "plan" | "website">;
    w: number;
    contact: number;
    hiddenFrom: string | null;
    createdDay: string;
  }
  const targets: T[] = [];
  for (const l of Array.from(chosen.values())) {
    targets.push({
      l,
      w: Math.pow((l.googleReviews ?? 1) + 5, 0.45) * (l.plan !== "free" ? 2.4 : 1),
      contact: 0.1 + rnd() * 0.06,
      hiddenFrom: null,
      createdDay: days[0],
    });
  }
  const realTotal = targets.reduce((s, t) => s + t.w, 0);
  const demoTotal = made.reduce((s, m) => s + m.def.weight, 0);
  for (const { def, listing } of made) {
    targets.push({
      l: listing,
      // About 40% of all opens go to the demo listings, so their stats pages are rich.
      w: (def.weight / demoTotal) * realTotal * 0.67,
      contact: def.key === "peshawar-hills" || def.key === "faisal-town" ? 0.05 : 0.15,
      hiddenFrom: listing.hiddenAt ? pktDay(listing.hiddenAt) : null,
      createdDay: pktDay(listing.createdAt),
    });
  }

  const cityPage = (city: string) => `/rent-a-car-${citySlug.get(city) ?? slugify(city)}`;
  const hours = [0.25, 0.12, 0.06, 0.04, 0.04, 0.06, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95, 1, 0.95, 0.9, 0.9, 1, 1.15, 1.5, 1.85, 2.1, 1.9, 1.3, 0.6];
  const pickHour = picker(rnd, hours.map((v, h) => [h, v] as [number, number]));
  const pickSource = picker<string>(rnd, [["google", 58], ["direct", 15], ["social", 10], ["ai", 7], ["whatsapp", 5], ["bing", 3], ["other", 2]]);
  const pickDevice = picker<string>(rnd, [["phone", 82], ["desktop", 15], ["tablet", 3]]);
  const pickMethod = picker<string>(rnd, [["wa", 67], ["call", 25], ["form", 8]]);
  const carPages = carTypes.slice(0, 6).map((c) => `/cars/${c.slug}`);
  const guidePages = guides.slice(0, 3).map((g) => `/guides/${g.slug}`);
  const usePages = useCases.slice(0, 4).map((u) => `/${u.slug}`);
  const hex = () => Math.floor(rnd() * 0xffffffff).toString(16).padStart(8, "0") + Math.floor(rnd() * 0xffffffff).toString(16).padStart(8, "0");
  const week = [1.35, 0.85, 0.82, 0.86, 0.92, 1.4, 1.5]; // Sun..Sat

  const events: Row[] = [];
  const shown: Row[] = [];
  days.forEach((day, i) => {
    const live = targets.filter((t) => t.createdDay <= day && (!t.hiddenFrom || day < t.hiddenFrom));
    const W = live.reduce((s, t) => s + t.w, 0);
    const cum: number[] = [];
    live.reduce((s, t, j) => (cum[j] = s + t.w), 0);
    const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
    const opens = Math.round(200 * week[dow] * (0.75 + (0.5 * i) / days.length) * (0.88 + 0.24 * rnd()));
    const visitors = Array.from({ length: Math.max(1, Math.round(opens * 0.8)) }, hex);

    for (let k = 0; k < opens; k++) {
      const r = rnd() * W;
      let lo = 0;
      let hi = cum.length - 1;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (cum[m] < r) lo = m + 1;
        else hi = m;
      }
      const t = live[lo];
      const hour = pickHour();
      const ts = new Date(Date.parse(`${day}T00:00:00Z`) + (hour - 5) * H + Math.floor(rnd() * H)).toISOString();
      const visitor = visitors[Math.floor(rnd() * visitors.length)];
      const source = pickSource();
      const device = pickDevice();
      const cp = cityPage(t.l.city);
      const ap = areasOf(t.l.city);
      const x = rnd();
      const entry =
        x < 0.48 ? cp
        : x < 0.7 ? ""
        : x < 0.78 && ap.length ? ap[Math.floor(rnd() * ap.length)]
        : x < 0.83 ? "/"
        : x < 0.89 ? carPages[Math.floor(rnd() * carPages.length)]
        : x < 0.92 ? guidePages[Math.floor(rnd() * guidePages.length)]
        : x < 0.96 ? usePages[Math.floor(rnd() * usePages.length)]
        : cp;
      const base = { ts, day, hour, listingId: t.l.id, visitor, source, device, demo: true };
      events.push({ ...base, kind: "open", entry });
      if (rnd() < t.contact) events.push({ ...base, kind: pickMethod(), entry: `/companies/${t.l.slug}` });
      if (t.l.website && rnd() < 0.03) events.push({ ...base, kind: "web", entry: `/companies/${t.l.slug}` });
    }

    // Card views on list pages: one counter row per day × listing × page.
    for (const t of live) {
      const e = (opens * t.w) / W;
      const paid = t.l.plan !== "free";
      const pages: [string, number, number][] = [[cityPage(t.l.city), 12 + rnd() * 8, paid ? 1 + Math.floor(rnd() * 3) : 4 + Math.floor(rnd() * 22)]];
      if (paid) pages.push(["/", 4 + rnd() * 3, 1 + Math.floor(rnd() * 6)]);
      if (t.l.id % 3 === 0) pages.push([carPages[t.l.id % carPages.length], 2 + rnd() * 2, 2 + Math.floor(rnd() * 12)]);
      for (const [page, per, pos] of pages) {
        const n = Math.round(e * per + rnd() * 2);
        if (n > 0) shown.push({ day, listingId: t.l.id, page, shown: n, posSum: n * pos, demo: true });
      }
    }
  });

  await d.insertMany("statEvents", events);
  await d.insertMany("statShown", shown, { ignore: true });
}
