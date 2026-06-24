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
      "Islamabad has 265 verified rent-a-car companies — fewer than Lahore but with the highest review density in Pakistan. Islamabad vendors are better-known internationally, better at handling tourist paperwork, and more concentrated in the commercial sectors (F-10, F-7, Bahria Town). It's the natural launch point for Northern Areas trips. Almost every Islamabad rental is offered with a driver as standard, while self-drive is widely available in F-10 and F-11 for renters with a local licence. Airport pickup from Islamabad International (ISB) is a core service here, and the city has the deepest pool of vendors comfortable with English-speaking and foreign clients.",
    whereToRent:
      "F-10 Markaz is the densest commercial cluster — most major vendors operate from here or have a sub-office in F-10. F-6, F-7, and Blue Area host the executive and tourist-focused operators. Bahria Town has expanded rapidly as a rental hub since 2020, especially for Northern Areas tour packages. G-9 hosts the most-reviewed luxury operation in the country (New Pakistan Motors).",
    pricingNotes:
      "Islamabad prices average 10-15% higher than Lahore for equivalent vehicles. Starting price: PKR 4,000/day economy. Sedan with driver: PKR 7,500-9,000/day. Hiace: PKR 9,500-11,000/day. SUV: PKR 18,000-25,000/day. Northern Areas multi-day packages run USD 800-1,500 for 5 days (vehicle, driver, fuel, tolls).",
    bestFor:
      "Islamabad is the best city for: airport pickups from ISB, foreign tourist rentals, Northern Areas tour packages, and corporate monthly hires (largest concentration of MNC-experienced vendors).",
  },
  karachi: {
    intro:
      "Karachi has 192 verified rent-a-car companies despite being Pakistan's largest city by population — a deliberate market structure where ride-hailing (Careem, inDrive) dominates short trips and rental companies focus on multi-day, corporate, and tourist bookings. Karachi's average rating (4.19★) is lower than other cities; renters here are more critical reviewers. Both with-driver and self-drive rentals are easy to find in Karachi, and most established vendors offer airport pickup at Jinnah International (KHI) plus monthly corporate contracts. For city moves a driver is standard; for longer coastal trips an SUV with driver is the norm.",
    whereToRent:
      "Clifton (Blocks 4-6) and DHA Phase 6 host the most premium operations — these are the right pickups for executives, weddings, and high-deposit luxury rentals. PECHS and Gulshan have the broadest mid-market selection. North Nazimabad and Korangi serve commercial neighbourhoods at lower price points. Skip the city-centre Saddar area unless a specific vendor has been recommended to you — quality is highly variable.",
    pricingNotes:
      "Karachi prices: economy from PKR 3,800/day. Sedan with driver: PKR 6,500-8,500/day. Hiace: PKR 9,000-10,500/day. SUV: PKR 17,000-23,000/day. One-way rentals to Hyderabad and Bahawalpur are common (PKR 15,000-25,000 surcharge). Hingol National Park multi-day packages are PKR 35,000-60,000.",
    bestFor:
      "Karachi is the best city for: coastal route trips (Hingol, Gwadar), corporate monthly rentals at large MNCs, and self-drive city rentals from established vendors. Not ideal for first-time foreign visitors — Islamabad is more tourist-friendly.",
  },
  rawalpindi: {
    intro:
      "Rawalpindi has 81 verified rental companies — many of which operate jointly with Islamabad addresses across the twin-city boundary. Saddar, Cantt, and Bahria Town are the main hubs. Rawalpindi pricing is typically 5-10% lower than Islamabad for the same vehicle class, making it a smart pickup point for cost-conscious renters who plan to visit both cities. Most Rawalpindi rentals include a driver, with self-drive available in Bahria Town and Satellite Town. Because many Pindi vendors also cover Islamabad and the new Islamabad airport, a Rawalpindi pickup is often the cheapest way to arrange an airport transfer or a Murree / Northern-areas trip.",
    whereToRent:
      "Saddar Bazaar has the highest density of older, well-established vendors — best for first-time renters who want a proven track record. Cantonment area hosts the more premium operations. Bahria Town and Satellite Town have expanded as rental zones in the last 5 years, especially for tourist tours heading north on the GT Road.",
    pricingNotes:
      "Rawalpindi starting prices match Lahore's at PKR 3,500/day economy. With-driver adds PKR 1,500-2,000/day. Twin-city packages (Islamabad + Rawalpindi for the same trip) usually come at a single combined rate, not double-priced.",
    bestFor:
      "Rawalpindi is the best city for: cost-conscious twin-city visitors, GT Road trips, Murree day trips, and renters wanting a Cantt-area pickup with reasonable prices.",
  },
  faisalabad: {
    intro:
      "Faisalabad has 85 verified rent-a-car companies serving Pakistan's textile-industrial capital. The market is concentrated in Madina Town, People's Colony, and around D-Ground. Faisalabad rental rates are the lowest among the major-six cities, and the average rating (4.38★) is among the highest in Pakistan. Most Faisalabad rentals come with a driver, but self-drive options are growing around Madina Town and Susan Road. Because rates here run below Lahore and Islamabad, Faisalabad is a popular pickup point for weddings and for onward trips across south Punjab.",
    whereToRent:
      "Madina Town and Susan Road host the most-rented vendors. Peoples Colony is the second hub. D-Ground has a cluster of smaller, family-run operations. The Faisalabad Clock Tower area has older, lower-priced vendors — good for budget trips but mileage and vehicle age may be higher than premium operations.",
    pricingNotes:
      "Faisalabad starting prices: economy PKR 3,200/day, sedan with driver PKR 6,000-7,500/day. Multi-day discounts are unusually deep here — 20-30% off for 3+ day rentals is normal. Wedding cars (decorated Mercedes, Land Cruiser) are 15-25% cheaper than Lahore equivalents.",
    bestFor:
      "Faisalabad is the best city for: budget-conscious renters, weddings on a tighter budget, and trips into south Punjab (Multan, Bahawalpur, Sahiwal).",
  },
  multan: {
    intro:
      "Multan has 46 verified rent-a-car companies serving the south-Punjab gateway city. Despite its smaller market, Multan boasts the highest average rating in Pakistan (4.88★ across the 46 vendors) — an indicator of tight quality control and a market where reputation travels fast in a smaller community. With-driver hire is the default in Multan and self-drive supply is limited, so book early in wedding and Eid seasons. Multan's central position makes it the standard base for Bahawalpur, Cholistan, and shrine-circuit trips across south Punjab.",
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
  sialkot: {
    intro:
      "Sialkot has 56 verified rent-a-car companies — a surprisingly deep market for a mid-size city, driven by its export economy (sports goods, surgical instruments) and the business travel that comes with it. Sialkot International Airport, Pakistan's first privately built airport, makes airport transfers one of the most-requested services here. Most rentals come with a driver; self-drive is available but less common.",
    whereToRent:
      "Cantt and Civil Lines host the most established, business-grade vendors — best for corporate clients and airport runs. Pasrur Road and Daska Road have the broadest mid-market and budget selection. For airport pickups, choose a Cantt-based vendor familiar with the SKT terminal schedule.",
    pricingNotes:
      "Sialkot rates start around PKR 3,500/day for economy cars. Sedans with driver run PKR 6,000–7,500/day; Hiace and Grand Cabin vans PKR 9,000–11,000/day for the frequent Sialkot–Lahore and Sialkot–Islamabad runs. Airport transfers are usually quoted as a flat fee rather than a daily rate.",
    bestFor:
      "Sialkot is best for: airport transfers to and from Sialkot International, export-industry business travel, and intercity trips to Lahore, Gujranwala, and the border districts. Wedding-car demand peaks in winter — book decorated vehicles early.",
  },
  gujranwala: {
    intro:
      "Gujranwala has 39 verified rent-a-car companies serving one of Pakistan's busiest industrial cities on the GT Road, midway between Lahore and the Gujrat–Sialkot belt. Demand is split between business travel, weddings, and intercity runs to Lahore (about 80 km south). With-driver hire is the default; self-drive supply is thin.",
    whereToRent:
      "GT Road is the main vendor corridor — most companies sit on or just off it for easy intercity access. Civil Lines and Satellite Town host the more established, higher-rated operations, while Cantt-area vendors handle the premium and wedding fleets.",
    pricingNotes:
      "Gujranwala economy rentals start at PKR 3,500/day. Sedans with driver average PKR 6,000–7,500/day; SUVs PKR 15,000–20,000/day. Because Lahore is close, one-way and same-day Lahore trips are common and competitively priced.",
    bestFor:
      "Gujranwala is best for: Lahore commutes and airport runs, GT Road intercity travel, weddings, and family trips across central Punjab. A practical, lower-cost pickup point on the Lahore–Sialkot corridor.",
  },
  gujrat: {
    intro:
      "Gujrat has 38 verified rent-a-car companies, an unusually active market for the city's size — explained by Gujrat's status as one of Pakistan's biggest emigration hubs. Overseas-Pakistani families drive constant demand for airport transfers to Sialkot, Islamabad, and Lahore, alongside furniture-industry business travel. Most rentals are with-driver.",
    whereToRent:
      "GT Road is the primary rental strip and the fastest route to the motorway and airports. Civil Lines and Cantt host the longer-established vendors with newer fleets, best for airport transfers and weddings. Kharian, just north, is also served by several Gujrat operators.",
    pricingNotes:
      "Gujrat starting prices are around PKR 3,500/day economy, PKR 6,000–7,500/day for a sedan with driver. Long-distance airport transfers to Islamabad or Sialkot airports are typically quoted as fixed packages. Multi-day discounts of 15–25% are standard.",
    bestFor:
      "Gujrat is best for: airport transfers for overseas-Pakistani families, Kharian and GT-Road intercity travel, furniture-business logistics, and weddings. One of the strongest small-city markets for reliable, driver-included hire.",
  },
  sargodha: {
    intro:
      "Sargodha has 28 verified rent-a-car companies serving central Punjab's citrus belt and the home of a major Pakistan Air Force base. Demand mixes business travel, family trips, and runs to Lahore and Islamabad. With-driver rentals dominate; self-drive is available from a handful of Satellite Town vendors.",
    whereToRent:
      "Satellite Town and University Road have the densest, best-reviewed vendor clusters. Cantt-area operators handle the premium and official-visitor segment. Civil Lines hosts older, budget-friendly family businesses.",
    pricingNotes:
      "Sargodha economy rentals start at PKR 3,200/day. Sedans with driver run PKR 5,800–7,200/day; Hiace vans PKR 8,500–10,500/day for the popular Sargodha–Islamabad and Sargodha–Lahore routes. Kinnow season (winter) sees heavier demand for vans.",
    bestFor:
      "Sargodha is best for: intercity travel to Islamabad and Lahore, family and group trips by Hiace, and weddings. A reliable, budget-leaning market where reputation travels fast in a tight community.",
  },
  sheikhupura: {
    intro:
      "Sheikhupura has 28 verified rent-a-car companies, helped by its position on Lahore's doorstep (about 40 km) and on the route to Faisalabad. Many renters here are effectively booking Lahore-adjacent trips at lower prices. With-driver hire is standard; a few vendors offer self-drive.",
    whereToRent:
      "GT Road and Civil Lines form the main vendor corridor and the quickest link to Lahore and the M-2 motorway. Cantt and Saddar host the more established operators. For Lahore airport runs, pick a GT-Road vendor used to the M-2 interchange.",
    pricingNotes:
      "Sheikhupura is among the cheaper markets — economy from PKR 3,000/day, sedan with driver PKR 5,500–7,000/day. Lahore airport transfers and Hiran Minar day trips are common fixed-fee bookings. Multi-day discounts run 20–30%.",
    bestFor:
      "Sheikhupura is best for: low-cost Lahore commutes and airport runs, Hiran Minar and Faisalabad-route trips, and budget weddings. A smart pickup point for Lahore access without Lahore pricing.",
  },
  bahawalpur: {
    intro:
      "Bahawalpur has 23 verified rent-a-car companies serving the former princely state and the main gateway to the Cholistan Desert. Tourism to Noor Mahal, Derawar Fort, and Lal Sohanra National Park, plus Islamia University traffic, shapes demand. SUVs and 4x4s for desert trips are a Bahawalpur speciality; most hire is with-driver.",
    whereToRent:
      "Cantt and Model Town host the best-equipped tourist and premium operators — the right choice for Cholistan and Derawar trips. Satellite Town and Multan Road have the broader mid-market selection. For desert routes, confirm the vehicle is a genuine 4x4, not just a high-clearance SUV.",
    pricingNotes:
      "Bahawalpur economy rentals start at PKR 3,200/day; sedans with driver PKR 6,000–7,500/day. Cholistan and Derawar Fort 4x4 day trips run PKR 18,000–28,000 depending on vehicle and distance. Multi-day desert and jeep-rally packages are quoted as bundles.",
    bestFor:
      "Bahawalpur is best for: Cholistan Desert and Derawar Fort tours, Noor Mahal and Lal Sohanra sightseeing, Islamia University visits, and south-Punjab intercity travel. The leading base for desert-tourism vehicle hire.",
  },
  "rahim-yar-khan": {
    intro:
      "Rahim Yar Khan has 22 verified rent-a-car companies serving Punjab's southernmost district on the Sindh border. As a stop on the main N-5 highway and railway between Karachi and Lahore, and home to Sheikh Zayed International Airport, RYK sees steady demand for airport transfers and long-haul intercity trips. With-driver hire is the norm; self-drive is limited.",
    whereToRent:
      "Cantt and Civil Lines host the most established, airport-ready vendors — best for Sheikh Zayed Airport transfers and business travel. Model Town and Saddar have the broader mid-market and budget options. For the long Karachi or Multan runs, choose a vendor with a well-maintained sedan or Hiace.",
    pricingNotes:
      "Rahim Yar Khan economy rentals start at PKR 3,200/day; sedans with driver PKR 6,000–7,500/day; Hiace vans PKR 9,000–11,000/day. Long-distance one-way trips (RYK–Multan, RYK–Sukkur, RYK–Karachi) are quoted as fixed fares. Airport transfers are usually flat-rate.",
    bestFor:
      "Rahim Yar Khan is best for: Sheikh Zayed Airport transfers, long-haul travel along the N-5 (Multan, Sukkur, Karachi), Bhong Mosque and Sadiqabad day trips, and agricultural-business travel. The strongest rental market in far-south Punjab.",
  },
  chakwal: {
    intro:
      "Chakwal has 23 verified rent-a-car companies on the Pothohar plateau, well placed for trips to Kallar Kahar, the Katas Raj temples, and the Salt Range, with quick M-2 motorway access to Islamabad and Lahore. Tourism and Gulf-returnee family travel drive demand. Nearly all rentals come with a driver.",
    whereToRent:
      "Civil Lines and the Cantt area host the most reliable vendors and newer fleets. Talagang Road operators are convenient for Salt Range and Mianwali-direction trips. For motorway runs to Islamabad, pick a vendor near the Kallar Kahar interchange.",
    pricingNotes:
      "Chakwal economy rentals start at PKR 3,500/day; sedans with driver PKR 6,000–7,500/day; SUVs PKR 15,000–20,000/day for Salt Range and off-plateau trips. Kallar Kahar and Katas Raj day trips are commonly booked as fixed-fee packages.",
    bestFor:
      "Chakwal is best for: Kallar Kahar and Katas Raj day trips, Salt Range tourism, motorway transfers to Islamabad and Lahore, and weddings. A handy base for Pothohar-plateau travel.",
  },
  okara: {
    intro:
      "Okara has 21 verified rent-a-car companies serving an agricultural hub on the Lahore–Multan route, about 130 km from Lahore. Demand is led by intercity travel, family trips, and the dairy-farm and agri-business community. With-driver hire is standard, with a few self-drive options.",
    whereToRent:
      "GT Road and Multan Road form the main vendor corridor and the quickest intercity links. Cantt and Civil Lines host the more established operators with better-maintained fleets, best for Lahore airport runs and weddings.",
    pricingNotes:
      "Okara is one of the cheaper markets — economy from PKR 3,000/day, sedan with driver PKR 5,500–7,000/day. Lahore one-way trips and airport transfers are common fixed-fee bookings. Multi-day discounts of 20–30% are typical.",
    bestFor:
      "Okara is best for: Lahore and Sahiwal intercity travel, airport transfers to Lahore, agricultural-business trips, and budget weddings. A low-cost, driver-included market on the Lahore–Multan corridor.",
  },
  "dera-ghazi-khan": {
    intro:
      "Dera Ghazi Khan has 18 verified rent-a-car companies serving the western gateway between Punjab, Balochistan, and KPK. DG Khan is the main base for Fort Munro hill-station trips and the Indus-side routes south. Terrain favours SUVs, and nearly all rentals are with-driver.",
    whereToRent:
      "Civil Lines and the Cantt area host the most reliable, better-equipped vendors — the right choice for Fort Munro and longer Balochistan-direction trips. Block 19 and Block 20 have the broader mid-market selection.",
    pricingNotes:
      "DG Khan economy rentals start at PKR 3,500/day; sedans with driver PKR 6,000–7,500/day. Fort Munro and hill-route trips usually need an SUV at PKR 16,000–22,000/day given the climb. Long one-way trips to Multan and DI Khan are quoted as fixed fares.",
    bestFor:
      "Dera Ghazi Khan is best for: Fort Munro hill-station trips, cross-province travel toward Balochistan and DI Khan, Indus-route journeys, and rugged-terrain SUV hire. The key rental base in far-west Punjab.",
  },
  kasur: {
    intro:
      "Kasur has 16 verified rent-a-car companies just south of Lahore (about 55 km), best known for the shrine of Bulleh Shah and the Ganda Singh Wala border. Most demand is Lahore-adjacent — airport runs, commutes, and pilgrim visits. With-driver hire is the norm.",
    whereToRent:
      "Ferozepur Road and Civil Lines form the main vendor corridor and the fastest link to Lahore. Cantt and Old Town host the longer-established family operators. For Lahore airport transfers, choose a Ferozepur-Road vendor used to the city run.",
    pricingNotes:
      "Kasur is a budget market — economy from PKR 3,000/day, sedan with driver PKR 5,500–7,000/day. Lahore commutes and airport transfers are common fixed-fee trips. Multi-day discounts of 20–30% are standard.",
    bestFor:
      "Kasur is best for: low-cost Lahore commutes and airport runs, Bulleh Shah shrine and Ganda Singh Wala visits, and budget weddings. A cheaper alternative pickup point for Lahore-area travel.",
  },
  narowal: {
    intro:
      "Narowal has 12 verified rent-a-car companies, with demand shaped strongly by the Kartarpur Corridor and the Gurdwara Darbar Sahib pilgrimage that draws visitors from across Pakistan and abroad. Sialkot is the nearest major hub and airport. Rentals are almost entirely with-driver.",
    whereToRent:
      "Civil Lines and the Cantt area host the most reliable vendors and the operators most familiar with Kartarpur-corridor logistics. Pasrur Road links quickly to Sialkot for airport transfers. Saddar has the budget options.",
    pricingNotes:
      "Narowal economy rentals start at PKR 3,200/day; sedans with driver PKR 6,000–7,500/day. Kartarpur day trips and Sialkot-airport transfers are usually booked as fixed-fee packages. Group travel by Hiace is common for pilgrimage visits.",
    bestFor:
      "Narowal is best for: Kartarpur Corridor pilgrimage trips, Sialkot airport transfers, and intercity travel toward Sialkot and Lahore. The natural rental base for Gurdwara Darbar Sahib visitors.",
  },
  mianwali: {
    intro:
      "Mianwali has 9 verified rent-a-car companies serving the Indus-side district that links Punjab to KPK via Kalabagh. Demand comes from local travel, Namal Lake and Namal College visits, and the route toward Kundian and Daud Khel. With-driver hire is the standard.",
    whereToRent:
      "Civil Lines and the Cantt area host the most dependable vendors. Daud Khel Road operators are convenient for trips toward Kalabagh and KPK. Saddar has the budget-end options. With a smaller pool, book ahead in wedding and holiday seasons.",
    pricingNotes:
      "Mianwali economy rentals start at PKR 3,500/day; sedans with driver PKR 6,000–7,500/day; SUVs PKR 15,000–20,000/day for Kalabagh and hill routes. Long one-way trips to Islamabad and Sargodha are quoted as fixed fares.",
    bestFor:
      "Mianwali is best for: Namal Lake day trips, Kalabagh and Indus-route travel, KPK-direction journeys, and weddings. A small but practical market for driver-included hire on the Punjab–KPK edge.",
  },
};
