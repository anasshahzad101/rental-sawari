/**
 * Per-city editorial context. Rendered on each city's listing page above
 * the filter bar. Designed for AI extractability: each section opens with
 * a direct answer to a likely user question.
 *
 * Kept in a separate file (not inline in cities.ts) so the data file stays
 * a clean schema target for the eventual database migration.
 */

export interface CityContext {
  intro: string;
  whereToRent: string;
  pricingNotes: string;
  bestFor: string;
}

export const cityContext: Record<string, CityContext> = {
  lahore: {
    intro:
      "Renting a car in Lahore is straightforward: 371 verified rental companies operate across the city, with the heaviest concentration in DHA, Gulberg, and Johar Town. Lahore's rental market is the deepest in Pakistan — supply is plentiful even in wedding season — but quality varies significantly by neighbourhood, so where you rent from matters.",
    whereToRent:
      "DHA Phase 2, 5, and 8 host the most premium-fleet rentals: Mercedes, Audi, Land Cruiser, decorated wedding cars, and the highest-rated chauffeurs in the city. Gulberg III is the second hotspot — slightly cheaper, similar quality. Johar Town dominates the self-drive segment. Cantt and Model Town have smaller but very established vendors who've been operating since the 1990s. Avoid trying to rent from outside these zones unless you have a specific recommendation.",
    pricingNotes:
      "Lahore prices in 2026: economy cars (Mehran, Cultus) start at PKR 3,500/day. Sedans (Corolla, Civic) average PKR 6,500-8,500/day with driver. Hiace vans run PKR 9,000-10,000/day. SUVs (Fortuner, Prado) sit at PKR 17,000-24,000/day. Wedding-grade Mercedes and Land Cruiser V8s run PKR 28,000-35,000+/day. Multi-day rentals get 10-15% off; monthly contracts 15-30%.",
    bestFor:
      "Lahore is the best city for: wedding car rentals (largest decorated-fleet supply), self-drive (most options), and last-minute bookings (deepest supply). It's not the best city for foreign-tourist rentals — Islamabad has more English-speaking, NOC-handling vendors.",
  },
  islamabad: {
    intro:
      "Islamabad has 265 verified rent-a-car companies — fewer than Lahore but with the highest review density in Pakistan. Islamabad vendors are better-known internationally, better at handling tourist paperwork, and more concentrated in the commercial sectors (F-10, F-7, Bahria Town). It's the natural launch point for Northern Areas trips.",
    whereToRent:
      "F-10 Markaz is the densest commercial cluster — most major vendors operate from here or have a sub-office in F-10. F-6, F-7, and Blue Area host the executive and tourist-focused operators. Bahria Town has expanded rapidly as a rental hub since 2020, especially for Northern Areas tour packages. G-9 hosts the most-reviewed luxury operation in the country (New Pakistan Motors).",
    pricingNotes:
      "Islamabad prices average 10-15% higher than Lahore for equivalent vehicles. Starting price: PKR 4,000/day economy. Sedan with driver: PKR 7,500-9,000/day. Hiace: PKR 9,500-11,000/day. SUV: PKR 18,000-25,000/day. Northern Areas multi-day packages run USD 800-1,500 for 5 days (vehicle, driver, fuel, tolls).",
    bestFor:
      "Islamabad is the best city for: airport pickups from ISB, foreign tourist rentals, Northern Areas tour packages, and corporate monthly hires (largest concentration of MNC-experienced vendors).",
  },
  karachi: {
    intro:
      "Karachi has 192 verified rent-a-car companies despite being Pakistan's largest city by population — a deliberate market structure where ride-hailing (Careem, inDrive) dominates short trips and rental companies focus on multi-day, corporate, and tourist bookings. Karachi's average rating (4.19★) is lower than other cities; renters here are more critical reviewers.",
    whereToRent:
      "Clifton (Blocks 4-6) and DHA Phase 6 host the most premium operations — these are the right pickups for executives, weddings, and high-deposit luxury rentals. PECHS and Gulshan have the broadest mid-market selection. North Nazimabad and Korangi serve commercial neighbourhoods at lower price points. Skip the city-centre Saddar area unless a specific vendor has been recommended to you — quality is highly variable.",
    pricingNotes:
      "Karachi prices: economy from PKR 3,800/day. Sedan with driver: PKR 6,500-8,500/day. Hiace: PKR 9,000-10,500/day. SUV: PKR 17,000-23,000/day. One-way rentals to Hyderabad and Bahawalpur are common (PKR 15,000-25,000 surcharge). Hingol National Park multi-day packages are PKR 35,000-60,000.",
    bestFor:
      "Karachi is the best city for: coastal route trips (Hingol, Gwadar), corporate monthly rentals at large MNCs, and self-drive city rentals from established vendors. Not ideal for first-time foreign visitors — Islamabad is more tourist-friendly.",
  },
  rawalpindi: {
    intro:
      "Rawalpindi has 81 verified rental companies — many of which operate jointly with Islamabad addresses across the twin-city boundary. Saddar, Cantt, and Bahria Town are the main hubs. Rawalpindi pricing is typically 5-10% lower than Islamabad for the same vehicle class, making it a smart pickup point for cost-conscious renters who plan to visit both cities.",
    whereToRent:
      "Saddar Bazaar has the highest density of older, well-established vendors — best for first-time renters who want a proven track record. Cantonment area hosts the more premium operations. Bahria Town and Satellite Town have expanded as rental zones in the last 5 years, especially for tourist tours heading north on the GT Road.",
    pricingNotes:
      "Rawalpindi starting prices match Lahore's at PKR 3,500/day economy. With-driver adds PKR 1,500-2,000/day. Twin-city packages (Islamabad + Rawalpindi for the same trip) usually come at a single combined rate, not double-priced.",
    bestFor:
      "Rawalpindi is the best city for: cost-conscious twin-city visitors, GT Road trips, Murree day trips, and renters wanting a Cantt-area pickup with reasonable prices.",
  },
  faisalabad: {
    intro:
      "Faisalabad has 85 verified rent-a-car companies serving Pakistan's textile-industrial capital. The market is concentrated in Madina Town, People's Colony, and around D-Ground. Faisalabad rental rates are the lowest among the major-six cities, and the average rating (4.38★) is among the highest in Pakistan.",
    whereToRent:
      "Madina Town and Susan Road host the most-rented vendors. Peoples Colony is the second hub. D-Ground has a cluster of smaller, family-run operations. The Faisalabad Clock Tower area has older, lower-priced vendors — good for budget trips but mileage and vehicle age may be higher than premium operations.",
    pricingNotes:
      "Faisalabad starting prices: economy PKR 3,200/day, sedan with driver PKR 6,000-7,500/day. Multi-day discounts are unusually deep here — 20-30% off for 3+ day rentals is normal. Wedding cars (decorated Mercedes, Land Cruiser) are 15-25% cheaper than Lahore equivalents.",
    bestFor:
      "Faisalabad is the best city for: budget-conscious renters, weddings on a tighter budget, and trips into south Punjab (Multan, Bahawalpur, Sahiwal).",
  },
  multan: {
    intro:
      "Multan has 46 verified rent-a-car companies serving the south-Punjab gateway city. Despite its smaller market, Multan boasts the highest average rating in Pakistan (4.88★ across the 46 vendors) — an indicator of tight quality control and a market where reputation travels fast in a smaller community.",
    whereToRent:
      "Cantt, Gulgasht, and Bosan Road are the main vendor hubs. Most established operations are family businesses operating for 10-20 years. Chaudhry Colony and Shah Rukn-e-Alam areas host smaller but reliable vendors. Limited self-drive availability — most Multan rentals come with driver as the norm.",
    pricingNotes:
      "Multan is the cheapest major city for rentals. Economy from PKR 3,000/day. Sedan with driver: PKR 5,500-7,000/day. SUV: PKR 15,000-19,000/day. Multi-day discounts of 25-30% common. Wedding-season pricing is much less inflated than in Lahore/Islamabad.",
    bestFor:
      "Multan is the best city for: south-Punjab tourism (Bahawalpur, Cholistan, Derawar Fort), pilgrim trips to local shrines (Shah Rukn-e-Alam, Bahauddin Zakariya), and weddings on a strict budget.",
  },
  peshawar: {
    intro:
      "Peshawar has 24 verified rent-a-car companies, the smallest major-city market in the directory. Supply is concentrated in University Town, Hayatabad, and the Cantonment area. Peshawar rentals serve a mix of business travellers, families heading to Swat / Kalam, and the occasional foreign visitor (though we recommend Islamabad-based vendors for foreign-tourist trips through KPK).",
    whereToRent:
      "University Town and Hayatabad host the more modern, English-friendly operations. Cantonment area has the longer-established traditional vendors. Saddar Bazaar serves walk-in trade but quality is less consistent.",
    pricingNotes:
      "Peshawar rates: economy from PKR 3,200/day. With-driver dominates the market. SUV rentals for Swat or Kalam trips run PKR 18,000-22,000/day. Most multi-day Northern KPK packages (Kalam, Naran via Mansehra) start around PKR 80,000 for 4 days inclusive.",
    bestFor:
      "Peshawar is the best city for: Swat Valley trips, Kalam tours, and Kaghan / Naran via the Mansehra route. Not recommended for foreign visitors without prior Pakistan experience — use Islamabad-based operators for KPK trips instead.",
  },
  quetta: {
    intro:
      "Quetta has 21 verified rent-a-car companies, the smallest market in the directory. Supply is concentrated around Jinnah Town, Cantt, and Satellite Town. Quetta rentals serve business travellers, infrastructure-project visitors, and a small Balochistan-tourism segment (Hanna Lake, Ziarat, Hingol northern routes). 4x4 capability is the norm rather than the exception.",
    whereToRent:
      "Jinnah Town and Satellite Town have the most modern operations. Cantonment area hosts the longer-established traditional vendors with the most reliable fleets. Samungli Road serves the airport pickup market.",
    pricingNotes:
      "Quetta is the most expensive city for rentals — starting at PKR 4,500/day. SUV / 4x4 rentals for Ziarat or Hingol-north trips run PKR 22,000-30,000/day. The premium reflects smaller supply pool and tougher terrain that requires better-maintained vehicles.",
    bestFor:
      "Quetta is the best city for: Ziarat trips, Hanna Lake / Pir Ghaib day trips, and Hingol National Park northern-approach routes. Not recommended for unaccompanied foreign visitors due to ongoing security advisories — coordinate with local sponsors or licenced tour operators first.",
  },
};
