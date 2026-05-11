/**
 * Area-level pages. URL pattern: /rent-a-car-{area-slug}-{city-slug}.
 *
 * Each area entry pairs a neighbourhood with the parent city slug + a short
 * description used as the unique copy seed for the page. The page also
 * filters the company list to vendors whose `area` field matches one of
 * the area's `matchers`.
 *
 * Pages with fewer than 3 matching vendors are auto-noindexed via
 * generateMetadata so we don't ship thin pages.
 */

export interface Area {
  slug: string;
  /** Visible name on the page, e.g. "DHA". */
  name: string;
  /** Parent city slug (must match a city in data/cities.ts). */
  citySlug: string;
  /** Parent city display name. */
  cityName: string;
  /**
   * One-liner shown in `<title>` and meta description. ≤90 chars.
   */
  tagline: string;
  /**
   * 200-350 word unique paragraph used as the area description. Mention
   * specific landmarks, vendor density, typical use cases.
   */
  description: string;
  /**
   * Substring matchers — companies whose `area` field contains any of
   * these will be listed. Case-insensitive.
   */
  matchers: string[];
}

export const areas: Area[] = [
  // ── LAHORE (15) ────────────────────────────────────────────────────
  {
    slug: "dha-lahore",
    name: "DHA",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Premium DHA car rentals with the largest wedding & luxury fleet in Lahore.",
    description:
      "DHA Lahore (Defence Housing Authority) — spread across Phase 1 to Phase 8 — is the densest premium-rental cluster in Pakistan. Phase 2, Phase 5, and Phase 8 host the highest concentration of luxury fleets: decorated Mercedes-Benz S-Class, Toyota Land Cruiser V8, Audi A6, and the full range of executive sedans. Wedding-car decorators tend to be DHA-based because their Mercedes inventory is closest to the wedding venues at Falettis Hotel, Royal Palm, and the dozens of marquees along Cantt and Phase 5 Commercial Broadway. Response times in DHA are the fastest in Lahore — many vendors quote within 10-15 minutes on WhatsApp during business hours, against a city-wide average closer to 30. Expect a 10-20% price premium versus Gulberg or Johar Town vendors for equivalent vehicles. Self-drive is available but limited to the most established Phase 2 and Phase 5 operators — most DHA vendors prefer with-driver because their inventory skews luxury and the security deposit risk is otherwise too high.",
    matchers: ["DHA"],
  },
  {
    slug: "gulberg-lahore",
    name: "Gulberg",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Gulberg car rentals — the mid-market hub for Lahore's commercial corridor.",
    description:
      "Gulberg III is Lahore's second rental hotspot, anchored by the Liberty Market and Hussain Chowk commercial belt. Most Gulberg vendors operate from the M.M. Alam Road / Main Boulevard corridor and serve a mix of family weekend trips, business pickups for the Mall Road / Davis Road financial district, and budget wedding fleets that can&apos;t justify a DHA pickup fee. Fleet composition skews toward sedans (Civic, Corolla) and vans (Hiace, APV). Self-drive availability is broader than DHA — Gulberg vendors are more willing to release a Cultus or older Civic on self-drive contracts. Prices typically run 10-15% below the DHA equivalents. The trade-off: response times average 30-45 minutes (vs DHA&apos;s 10-15) and fleet age is generally 2-4 years older.",
    matchers: ["Gulberg"],
  },
  {
    slug: "bahria-town-lahore",
    name: "Bahria Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Bahria Town Lahore rentals — the suburban gateway for Motorway-bound trips.",
    description:
      "Bahria Town Lahore sits at the southern edge of the city, off the Lahore-Islamabad Motorway (M2) at the Thokar Niaz Baig interchange. The rental cluster here is purpose-built for trips originating from Bahria&apos;s gated communities — weddings at Bahria&apos;s Grand Mosque, family weekend trips toward Murree via the M2, and inter-city moves to Islamabad. Vendors here are typically newer (2020+) operations with younger fleets. Most offer one-way drops to Islamabad with the standard PKR 5,000-7,000 surcharge. Prices match Gulberg levels. For renters living anywhere south of Mall Road, picking up from Bahria Town saves 30-45 minutes of cross-Lahore traffic versus a DHA pickup.",
    matchers: ["Bahria"],
  },
  {
    slug: "johar-town-lahore",
    name: "Johar Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Johar Town — Lahore's self-drive capital with the deepest budget-tier supply.",
    description:
      "Johar Town is the centre of Lahore's self-drive rental market. The neighbourhood&apos;s mix of university students (UMT, UCP nearby), young professionals, and price-sensitive families has historically driven demand for self-drive Cultus, Mehran, and older Civic rentals — and vendors here have responded with the deepest self-drive supply in Pakistan. Daily rates start at PKR 3,500 for a Mehran and PKR 4,500-5,500 for a Cultus. Security deposits are typically PKR 25,000-50,000 in cash. Several Johar Town operators also handle short-term rentals (4-12 hours) for in-city errands — a feature rare outside this neighbourhood. Self-drive contracts almost always cap mileage at 250km/day with PKR 15-25/km extra.",
    matchers: ["Johar Town"],
  },
  {
    slug: "model-town-lahore",
    name: "Model Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Model Town — Lahore's longest-established rental scene with sedan specialists.",
    description:
      "Model Town vendors are typically the oldest established operators in Lahore — most have been operating since the 1990s or early 2000s. Fleets tend to be mid-aged sedans (Corolla and Civic dominate) maintained meticulously by long-term mechanics in the same area. Less luxury inventory than DHA, less self-drive than Johar Town, but the consistency and reputation runs deep. Many Model Town vendors are family businesses with two or three generations involved. Pricing sits between Gulberg and DHA. Best fit for renters who value reliability over premium feel — a Corolla here that&apos;s been on the road since 2018 will arrive cleaner and more reliable than a 2020 Corolla from a newer Bahria Town operation.",
    matchers: ["Model Town"],
  },
  {
    slug: "cantt-lahore",
    name: "Cantt",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Lahore Cantt rentals — military-area vendors with executive transport focus.",
    description:
      "Lahore Cantonment hosts a quieter but established rental segment focused on executive transport, embassy ground service, and corporate accounts. Several Cantt operators are veteran-owned and run with a more military-grade operational discipline — fixed pickup times, formal contracts, and a heavier focus on corporate billing. Fleet skews toward newer sedans (Civic, Corolla) and SUVs (Fortuner). Less consumer-facing than DHA or Gulberg — most volume comes from B2B contracts with corporates in the Mall Road / Saddar belt. Walk-in retail rates are higher than market average; corporate monthly rates are competitive.",
    matchers: ["Cantt", "Cantonment"],
  },
  {
    slug: "faisal-town-lahore",
    name: "Faisal Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Faisal Town — mid-market rentals serving Lahore's southern residential belt.",
    description:
      "Faisal Town sits between Johar Town and Garden Town, serving a residential catchment with weekend and weekday rental demand. Vendor density is lower than the major hubs but quality is solid — most operators here have run for 8+ years. Fleet composition is largely sedans and vans. Pricing is competitive (10-15% below DHA). Many Faisal Town vendors also serve Wapda Town and Township for pickup-and-drop without extra cost, making this a good pickup neighbourhood for renters living in the southern half of Lahore.",
    matchers: ["Faisal Town"],
  },
  {
    slug: "garden-town-lahore",
    name: "Garden Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Garden Town — quieter, family-rental focused Lahore neighbourhood.",
    description:
      "Garden Town has a small but loyal rental scene focused on family use — weekend trips to Murree, wedding fleets for the area&apos;s many community marquees, and corporate transport for businesses on Ferozepur Road. The neighbourhood&apos;s vendors are typically smaller operations (2-8 vehicles each) with strong local reputations. Self-drive availability is moderate. Pricing matches Faisal Town and Iqbal Town. Best fit if you live anywhere in Lahore&apos;s south-central belt and want a vendor you can drive to in under 15 minutes for a hassle-free pickup.",
    matchers: ["Garden Town"],
  },
  {
    slug: "iqbal-town-lahore",
    name: "Iqbal Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Iqbal Town rentals — budget-friendly Lahore neighbourhood with self-drive supply.",
    description:
      "Iqbal Town is a budget-tier rental neighbourhood with strong self-drive supply. Several operators here specialise in week-long self-drive contracts for visiting families, students moving to Lahore, and small business owners who need a vehicle for a specific project. Fleet skews older (5-10 years) but well-maintained. Daily rates start around PKR 3,500 for economy cars; self-drive deposits run PKR 20,000-40,000. Excellent value-for-money for non-luxury rentals, especially for multi-day contracts where the 20-30% discount on weekly rates makes a meaningful difference.",
    matchers: ["Iqbal Town"],
  },
  {
    slug: "wapda-town-lahore",
    name: "Wapda Town",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Wapda Town — Lahore's south-side residential rental hub.",
    description:
      "Wapda Town serves Lahore's south-side residential population — families heading to Murree, business travellers heading to Islamabad on the M2, and weekend trippers heading to Patriata or Kalar Kahar. The rental scene is dominated by mid-range sedans and Hiace vans for family group travel. Pricing matches the broader south-Lahore mid-market (10-15% below DHA). Most vendors offer pickup-and-drop to nearby Township, Faisal Town, and Garden Town at no extra cost.",
    matchers: ["Wapda Town"],
  },
  {
    slug: "thokar-niaz-baig-lahore",
    name: "Thokar Niaz Baig",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Thokar Niaz Baig — Lahore's M2 motorway gateway with intercity-focused fleets.",
    description:
      "Thokar Niaz Baig is the entry point to the M2 motorway from Lahore. The handful of rental operations here specialise in intercity trips — Lahore-Islamabad, Lahore-Faisalabad, Lahore-Multan — and tend to have newer fleets (under 4 years) suited for high-mileage motorway runs. Pickup here saves you 30-60 minutes versus a DHA or Gulberg pickup if you&apos;re heading anywhere via the M2. Fleet skews toward Honda Civic and Toyota Corolla in the mid-range, Fortuner and Prado at the premium end. Few wedding-specialised vendors operate from this side of the city.",
    matchers: ["Thokar Niaz Baig"],
  },
  {
    slug: "walton-lahore",
    name: "Walton",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Walton Cantt rentals — quiet, established military-adjacent operators.",
    description:
      "Walton Cantt has a small but well-respected rental scene, with most operators run by ex-military families. Fleet quality is consistently high — vehicles are maintained on a stricter rotation than the city average. Corporate accounts and embassy ground transport dominate the customer mix. Walk-in retail is limited but available; expect a slightly slower response time during business hours (45-60 min WhatsApp typical). Best fit if you value vehicle reliability over rental flexibility.",
    matchers: ["Walton"],
  },
  {
    slug: "township-lahore",
    name: "Township",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Township Lahore — south-side budget rentals with diverse fleet age.",
    description:
      "Township is a mixed residential / commercial neighbourhood with a fragmented rental scene — many small operators, none dominant. Fleet age varies widely (some 2022 Civics, some 2010 Mehrans). The trade-off works in renters' favour: pricing is among the lowest in Lahore (PKR 3,200/day for economy is achievable). Quality varies significantly between operators, so check ratings carefully before paying any deposit. Best fit for cost-sensitive multi-day rentals where you can inspect the actual vehicle before committing.",
    matchers: ["Township"],
  },
  {
    slug: "allama-iqbal-airport-lahore",
    name: "Allama Iqbal Airport",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Lahore airport pickup — vendors operating from Allama Iqbal International (LHE).",
    description:
      "Allama Iqbal International Airport pickups in Lahore are handled by a mix of dedicated airport-service vendors and city operators who do airport runs as a service. Pricing for a sedan pickup from LHE to DHA / Gulberg / Cantt typically runs PKR 2,500-4,000 one-way. For renters arriving on a flight, the most efficient route is to book the pickup before landing (24 hours minimum), share your flight number on WhatsApp, and the driver will track the flight and wait at international arrivals with a name sign. Fixed-fare quotes are standard; surge pricing isn&apos;t a thing here. Booking through RentalSawari guarantees a verified vendor — the airport area also has unregulated drivers offering rides outside arrivals that should be avoided.",
    matchers: ["Airport", "Cantonment"],
  },
  {
    slug: "liberty-market-lahore",
    name: "Liberty Market",
    citySlug: "lahore",
    cityName: "Lahore",
    tagline: "Liberty Market Gulberg — commercial-core Lahore rental cluster.",
    description:
      "Liberty Market and Hussain Chowk sit at the heart of Lahore's commercial Gulberg corridor. Rental operators here serve a high-volume mix of business pickups, weekend family trips, and out-of-town day trips. Fleet is similar to broader Gulberg (sedans + vans). Pickup convenience is the main draw — most operations are within a 5-minute walk of the metro bus stop. Good fit for renters who work in the M.M. Alam Road / Liberty business district.",
    matchers: ["Gulberg", "Liberty"],
  },

  // ── ISLAMABAD (10) ─────────────────────────────────────────────────
  {
    slug: "blue-area-islamabad",
    name: "Blue Area",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "Blue Area car rentals — Islamabad's commercial spine.",
    description:
      "Blue Area is Islamabad's primary commercial district — banks, embassies, ministries, and headquarters of most large Pakistani businesses run from here. Rental operators serving Blue Area focus heavily on executive transport: Mercedes E-Class and S-Class, Land Cruisers, Audi A6, plus the standard Civic / Corolla fleet for mid-level employee pickups. Hourly rates are common (PKR 1,500-3,000 per hour with driver). Fleet age is the youngest in Pakistan — many Blue Area operators rotate vehicles every 18-24 months. Premium pricing applies but the consistency is matched nowhere else in the country.",
    matchers: ["Blue Area"],
  },
  {
    slug: "f6-islamabad",
    name: "F-6",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "F-6 Islamabad rentals — established residential sector with diplomat-grade fleets.",
    description:
      "F-6 is one of Islamabad's oldest and most prestigious residential sectors, home to many embassies and senior diplomats. Rental operators serving F-6 maintain fleets to embassy standards — typically newer Civics, Corollas, Land Cruiser Prados, and the occasional Mercedes E-Class. Pricing is at the higher end of Islamabad market rates. Many vendors offer 24/7 driver standby for embassy and diplomatic clients. Walk-in retail is welcome but expect to be vetted more carefully than at suburban operators.",
    matchers: ["F-6"],
  },
  {
    slug: "f7-islamabad",
    name: "F-7",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "F-7 Islamabad — upscale residential rentals with tourist-focused operators.",
    description:
      "F-7 sits between the diplomatic enclave and the F-6 commercial fringe. Rental operators here are a strong mix of executive transport (similar to F-6) and tourist-focused Northern Areas specialists — F-7 is the natural pickup point for foreign visitors heading to Hunza or Skardu. Several F-7 vendors handle USD-denominated security deposits, English-speaking drivers, and NOC paperwork for Gilgit-Baltistan. Pricing matches F-6 levels. Best fit for visitors arriving at Islamabad International heading north.",
    matchers: ["F-7"],
  },
  {
    slug: "f10-islamabad",
    name: "F-10",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "F-10 Markaz — the densest car rental cluster in Islamabad.",
    description:
      "F-10 Markaz is the heart of Islamabad's rental market — more vendors operate here than any other Islamabad sector. The Markaz hosts dedicated rental offices, parking-lot inventory, and a mix of established operations alongside newer entrants. Fleet diversity is the broadest in the city: budget Cultus to luxury Land Cruiser V8, plus the full Hiace / APV van range. Pricing is mid-tier (cheaper than F-6/F-7, more expensive than Bahria Town). Best fit for renters who want maximum vendor choice and the ability to physically inspect 5-10 vehicles in one afternoon before deciding.",
    matchers: ["F-10"],
  },
  {
    slug: "g11-islamabad",
    name: "G-11",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "G-11 Islamabad — Western residential sector with mid-market rentals.",
    description:
      "G-11 is a mid-market residential cluster with a small but steady rental scene. Vendors here serve a mix of long-term residents and project-based contracts for visitors working at the nearby SECP / state regulator offices. Fleet skews mid-range — Civic, Corolla, Fortuner. Pricing slightly below F-10. Smaller selection than F-10 but tighter quality control because the vendors are family-run and reputation-dependent.",
    matchers: ["G-11"],
  },
  {
    slug: "i8-islamabad",
    name: "I-8",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "I-8 Islamabad — Faizabad-adjacent rentals with intercity focus.",
    description:
      "I-8 sits near the Faizabad interchange, the main connector between Islamabad and Rawalpindi via the Islamabad Expressway. Rental operators here serve both Islamabad residents and Rawalpindi pickups via the inter-city axis. Faizabad Car Cab — Pakistan's most-reviewed rental company with 6,284 Google reviews — operates from this neighbourhood. Fleet is broad: budget Cultus to mid-luxury Fortuner. Pricing is competitive due to the volume of operators competing for the twin-city traffic.",
    matchers: ["I-8"],
  },
  {
    slug: "bahria-town-islamabad",
    name: "Bahria Town",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "Bahria Town Islamabad — suburban rentals serving the M2 motorway.",
    description:
      "Bahria Town Islamabad — Phases 1 through 7 — has grown into a major rental cluster, especially for trips originating in the southern Islamabad suburbs and heading to Lahore on the M2 or to Murree via the Murree Expressway. Vendors here are typically newer (2018+) with younger fleets and more aggressive pricing. Wedding-car decoration is increasingly common; several operators specialise in Bahria-area wedding venues. Pricing is 10-15% below F-7 / F-10 equivalents.",
    matchers: ["Bahria"],
  },
  {
    slug: "dha-islamabad",
    name: "DHA",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "DHA Islamabad — premium suburban rentals near Murree Expressway.",
    description:
      "DHA Islamabad (Phases 1-5) is a newer high-end residential cluster between Islamabad proper and Bahria Town. Rental operators here lean premium — newer SUVs, executive sedans, and a growing wedding-fleet segment. Pickup convenience is the main draw for residents — DHA-based renters save 30-45 minutes of cross-city traffic versus an F-10 pickup. Pricing is similar to F-10. Best fit for residents of the southern Islamabad belt or anyone heading south on the GT Road or M2.",
    matchers: ["DHA"],
  },
  {
    slug: "airport-islamabad",
    name: "Islamabad International Airport",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "Islamabad airport pickup — vendors handling Northern Areas departures.",
    description:
      "Islamabad International Airport (ISB) is Pakistan's primary tourist entry point, especially for visitors heading to Hunza, Skardu, Naran, and Murree. Airport-pickup vendors here are accustomed to handling international flights — they track flight arrivals, have English-speaking drivers, and stage vehicles at international arrivals with name signs. Fixed-fare rates apply: PKR 2,500-4,500 for a sedan one-way to most Islamabad sectors. For tourists heading directly north (Hunza, Skardu, Naran), book a multi-day package that starts with the airport pickup — most ISB vendors quote inclusive packages of PKR 30,000-80,000 for 3-7 day Northern Areas tours.",
    matchers: ["Airport"],
  },
  {
    slug: "pwd-islamabad",
    name: "PWD",
    citySlug: "islamabad",
    cityName: "Islamabad",
    tagline: "PWD Colony — Islamabad's south-east rental gateway.",
    description:
      "PWD Colony (Pakistan Public Works Department Housing Scheme) lies on the south-east edge of Islamabad. The handful of rental operations here serve commuters, weekend trippers heading to Bani Gala / Murree, and intercity travellers heading toward Lahore via the GT Road. Fleet is mid-range and value-priced. Limited luxury selection. Best fit for residents of the PWD / Soan Garden / Pakistan Town corridor.",
    matchers: ["PWD"],
  },

  // ── KARACHI (10) ───────────────────────────────────────────────────
  {
    slug: "clifton-karachi",
    name: "Clifton",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Clifton car rentals — Karachi's premium coastal rental cluster.",
    description:
      "Clifton — particularly Blocks 4, 5, and 6 — is Karachi's premier rental hub. Operators here run the broadest fleets in the city: luxury Mercedes and Audi for wedding rukhsati and executive transport, mid-range Civics and Corollas for daily use, plus a growing self-drive segment for the area's young professional residents. Wedding-decorated vehicles are common (Beach Luxury, Sheraton, Movenpick all sit minutes away). Pricing is the highest in Karachi but quality control is also tightest — most Clifton vendors run vehicles under 4 years old and rotate aggressively.",
    matchers: ["Clifton"],
  },
  {
    slug: "defence-karachi",
    name: "DHA / Defence",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Karachi DHA — Phase 1 to 8 with the most premium-fleet operators.",
    description:
      "Karachi's Defence Housing Authority spreads across Phases 1 through 8 and houses many of the city's senior business families. Phase 5, 6, and 8 host the densest rental clusters — premium Mercedes, Land Cruiser V8, BMW, and Range Rover inventory aimed at weddings, embassy contracts, and corporate executive transport. Fleet age is among the lowest in Pakistan. Pricing is at the top of the Karachi market. Walk-in retail is welcome but most operators here prefer scheduled bookings — book 48-72 hours ahead during wedding season.",
    matchers: ["DHA", "Defence"],
  },
  {
    slug: "gulshan-karachi",
    name: "Gulshan-e-Iqbal",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Gulshan rentals — Karachi's largest middle-class rental cluster.",
    description:
      "Gulshan-e-Iqbal is Karachi's most populous residential district and has a correspondingly large rental supply. Vendors here serve family weddings, university student rentals (NED, IBA, UoK all nearby), and middle-income business pickups. Fleet skews mid-range — Civic, Corolla, City, plus van inventory for larger weddings. Self-drive availability is the broadest in Karachi after Johar Town in Lahore. Pricing is 15-25% below Clifton / DHA. Quality varies — pick vendors with 50+ Google reviews.",
    matchers: ["Gulshan"],
  },
  {
    slug: "pechs-karachi",
    name: "PECHS",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "PECHS Karachi — established residential rental hub on Sharah-e-Faisal corridor.",
    description:
      "PECHS sits along the Sharah-e-Faisal corridor, Karachi's main commercial spine. The neighbourhood's rental operators are well-established (many running since the 1990s) and focus on a mix of family weddings, business pickups, and intercity trips toward Hyderabad and Bahawalpur. Fleet is mid-range and reliable. Pricing matches Gulshan. Pickup convenience is excellent if you're flying into Karachi airport — PECHS is on the route from Jinnah International to downtown.",
    matchers: ["PECHS"],
  },
  {
    slug: "tariq-road-karachi",
    name: "Tariq Road",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Tariq Road — Karachi's mid-city commercial rental cluster.",
    description:
      "Tariq Road is one of Karachi's busiest commercial streets and has a tight rental scene focused on day-trade traffic — visitors shopping the area, mid-budget weddings, and business pickups for the Sharah-e-Faisal corporate corridor. Fleet is sedan-heavy. Pricing is competitive. Limited luxury selection — for Mercedes and Land Cruiser, head to Clifton or DHA.",
    matchers: ["Tariq Road"],
  },
  {
    slug: "saddar-karachi",
    name: "Saddar",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Karachi Saddar — old-city rental traders with the deepest budget supply.",
    description:
      "Saddar is Karachi's old commercial centre and has a fragmented but deep rental supply. Many vendors here have operated for 20+ years and run older fleets at the lowest prices in Karachi. Walk-in trade is the norm; some operators don't even maintain WhatsApp lines. Quality varies wildly — check the specific vehicle before paying any deposit. Best fit for very cost-conscious renters or short emergency rentals when other vendors are booked out.",
    matchers: ["Saddar"],
  },
  {
    slug: "north-nazimabad-karachi",
    name: "North Nazimabad",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "North Nazimabad rentals — established middle-class Karachi sector.",
    description:
      "North Nazimabad is a long-established residential district north of the city centre. Rental operators here are family-run with strong local reputations. Fleet is mid-range. Pricing is competitive. Self-drive is available with reasonable deposits. Best fit if you live in the northern half of Karachi and want a pickup that doesn't require a 45-minute drive through traffic.",
    matchers: ["North Nazimabad", "Nazimabad"],
  },
  {
    slug: "malir-karachi",
    name: "Malir",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Malir Karachi — south-east rentals near the airport corridor.",
    description:
      "Malir lies between Karachi proper and the airport. Rental operators here pick up airport business and serve Korangi / Landhi industrial belt traffic. Fleet is mid-range and value-priced. Limited luxury selection. Good fit for budget-conscious renters or anyone with a Malir / Korangi / Landhi pickup requirement.",
    matchers: ["Malir"],
  },
  {
    slug: "airport-karachi",
    name: "Jinnah International Airport",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Karachi airport pickup — Jinnah International (KHI) vendor operations.",
    description:
      "Jinnah International Airport (KHI) is one of Pakistan's busiest. Airport-pickup vendors here are accustomed to handling international flights at any hour, with English-speaking drivers and fixed pickup-cost quotes. PKR 1,800-3,500 for sedan pickup to most Karachi neighbourhoods (excluding remote DHA Phase 8 which carries a premium). Book at least 4 hours ahead during off-peak; 24 hours ahead for late-night arrivals. The verified vendors on RentalSawari track your flight number — no need to call after landing.",
    matchers: ["Airport"],
  },
  {
    slug: "port-qasim-karachi",
    name: "Port Qasim",
    citySlug: "karachi",
    cityName: "Karachi",
    tagline: "Port Qasim — heavy-industry corridor rentals for visiting engineers.",
    description:
      "Port Qasim's rental scene is small and specialised — most operators serve visiting industrial engineers, oil-and-gas contractors, and port logistics personnel. Fleet skews toward mid-range SUVs (Fortuner) for site visits and Hiace vans for crew transport. Daily rates are typical. Multi-day and monthly contracts dominate the customer mix. Limited consumer-facing trade. Best fit for B2B rental requirements rather than retail.",
    matchers: ["Port Qasim"],
  },
];

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}
