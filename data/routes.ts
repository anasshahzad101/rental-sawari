/**
 * Intercity / scenic route pages. URL pattern:
 *   /rent-a-car-{from-slug}-to-{to-slug}
 *
 * `fromSlug` and `toSlug` are city slugs (or destination slugs not in
 * `data/cities.ts` — Murree, Hunza, Naran, etc.). The page renders unique
 * route copy + filtered vendors based on the FROM city.
 */

export interface RouteData {
  slug: string;
  fromSlug: string;
  fromName: string;
  toSlug: string;
  toName: string;
  /** Driving distance in km. */
  distanceKm: number;
  /** One-way drive time in hours, low end. */
  hoursLow: number;
  /** One-way drive time in hours, high end. */
  hoursHigh: number;
  /** Sample price range for the round trip with driver. */
  priceFromPKR: number;
  priceToPKR: number;
  /** Recommended vehicle class slug from carTypes.ts. */
  recommendedCar: string;
  /** 250-400 word unique route description. */
  description: string;
  /** Best months to attempt the route. */
  bestMonths: string;
  /** Notable stops along the way. */
  stops: string[];
}

export const routes: RouteData[] = [
  {
    slug: "lahore-to-islamabad",
    fromSlug: "lahore",
    fromName: "Lahore",
    toSlug: "islamabad",
    toName: "Islamabad",
    distanceKm: 380,
    hoursLow: 4,
    hoursHigh: 5,
    priceFromPKR: 18000,
    priceToPKR: 28000,
    recommendedCar: "toyota-corolla",
    description:
      "Lahore to Islamabad on the M2 motorway is the most-driven intercity route in Pakistan. The drive is straightforward — 4 to 5 hours one-way on a six-lane controlled-access motorway with three major rest stops (Bhera, Kallar Kahar, and the Salt Range viewpoint near Khewra). Most rental vendors quote a one-way sedan trip at PKR 18,000-22,000 (vehicle, driver, fuel, tolls inclusive) or a round-trip same-day at PKR 25,000-32,000. The motorway toll is approximately PKR 1,200 each way for a sedan. Speed limit is 120 km/h. The route is generally safe year-round but heavy fog between November and February occasionally drops visibility below 50 m — confirm weather before booking for these months.",
    bestMonths: "October to April (avoid heavy fog in December-January)",
    stops: ["Bhera Service Area", "Kallar Kahar (Mahmood Kotha)", "Salt Range viewpoint", "Khewra Salt Mine (~30 min detour)"],
  },
  {
    slug: "lahore-to-murree",
    fromSlug: "lahore",
    fromName: "Lahore",
    toSlug: "murree",
    toName: "Murree",
    distanceKm: 380,
    hoursLow: 5,
    hoursHigh: 7,
    priceFromPKR: 22000,
    priceToPKR: 35000,
    recommendedCar: "toyota-fortuner",
    description:
      "Lahore to Murree is a 380 km, 5-7 hour drive that combines M2 motorway with the steep, winding Murree Expressway approach. A standard sedan handles the route in dry weather but an SUV (Fortuner, Prado) is strongly recommended December-February when the upper sections can carry snow and ice. Most weekend trips combine Murree with a half-day extension to Patriata (the chair-lift village 13 km further). Booking includes the vehicle, driver, fuel, motorway tolls, and the Murree Expressway toll. Hotel and meals are separate. Wedding-season warnings: avoid arriving in Murree on Eid weekends or major public holidays — traffic queues on the expressway have historically taken 4+ extra hours.",
    bestMonths: "March-November (winter requires SUV + snow chains)",
    stops: ["Bhera Service Area", "Kallar Kahar", "Bhurban (en route)", "Patriata (extension)"],
  },
  {
    slug: "lahore-to-hunza",
    fromSlug: "lahore",
    fromName: "Lahore",
    toSlug: "hunza",
    toName: "Hunza",
    distanceKm: 1600,
    hoursLow: 22,
    hoursHigh: 28,
    priceFromPKR: 120000,
    priceToPKR: 220000,
    recommendedCar: "toyota-land-cruiser-v8",
    description:
      "Lahore to Hunza is a 1,600 km journey that almost always splits across 2-3 days. The standard package is Lahore → Islamabad (M2, 4-5 hrs) → Besham or Chilas overnight (KKH, 10-12 hrs) → Hunza (KKH, 6-8 hrs). A Land Cruiser V8 or Prado with mountain-experienced driver is the right vehicle — sedans and standard SUVs are not recommended past Besham. Package prices vary widely: PKR 120,000-160,000 for a 5-day round trip with vehicle, driver, fuel, and tolls; PKR 180,000-220,000+ for premium fleets or extended itineraries. Hotels, meals, NOCs (if foreign visitor), and Attabad Lake boat fees are typically separate. The KKH is fully open May-October; partial closures and weather diversions are common November-April.",
    bestMonths: "May to October",
    stops: ["Islamabad", "Besham or Chilas (overnight)", "Gilgit", "Attabad Lake", "Karimabad (Hunza)", "Passu / Sost (extension)"],
  },
  {
    slug: "islamabad-to-murree",
    fromSlug: "islamabad",
    fromName: "Islamabad",
    toSlug: "murree",
    toName: "Murree",
    distanceKm: 64,
    hoursLow: 1.5,
    hoursHigh: 2.5,
    priceFromPKR: 8000,
    priceToPKR: 15000,
    recommendedCar: "toyota-fortuner",
    description:
      "The shortest tourist trip from Islamabad — 64 km via the Murree Expressway, typically 1.5-2 hours each way without traffic. Most renters book this as a one-day round trip or a two-night Murree-plus-Patriata package. A sedan is fine 9 months of the year; switch to an SUV with 4WD or chains for December-February. Same-day round-trip pricing: PKR 8,000-12,000 for a Corolla with driver, PKR 12,000-15,000 for a Fortuner. The expressway carries a PKR 600 toll. Wedding-season warning: same as Lahore — avoid Eid weekends. The Islamabad-Murree corridor backs up severely when the city empties out at festival time.",
    bestMonths: "Year-round (winter requires 4WD)",
    stops: ["Bhurban", "Murree Mall", "Patriata (chair lift)", "Ayubia National Park (extension)"],
  },
  {
    slug: "islamabad-to-naran",
    fromSlug: "islamabad",
    fromName: "Islamabad",
    toSlug: "naran",
    toName: "Naran",
    distanceKm: 270,
    hoursLow: 6,
    hoursHigh: 8,
    priceFromPKR: 35000,
    priceToPKR: 60000,
    recommendedCar: "toyota-prado",
    description:
      "Islamabad to Naran via Mansehra and the Kaghan Valley — 270 km, 6-8 hours one-way depending on traffic at the Lower Topa and Kaghan choke points. The route is paved throughout but the final 90 km from Balakot to Naran is narrow, winding mountain road. Prado or Fortuner is the right vehicle; a Land Cruiser V8 is overkill for a Naran-only trip. Standard 3-day package: PKR 45,000-65,000 inclusive. Saif-ul-Muluk Lake (12 km further on a rough 4x4 jeep track) requires hiring a local jeep at Naran (PKR 3,000-5,000 round trip) — your rental SUV typically stays parked at the Naran base. Open May-October; closed November-April.",
    bestMonths: "May to October",
    stops: ["Mansehra", "Balakot", "Kaghan town", "Naran", "Saif-ul-Muluk Lake (jeep extension)", "Babusar Top (further extension)"],
  },
  {
    slug: "islamabad-to-skardu",
    fromSlug: "islamabad",
    fromName: "Islamabad",
    toSlug: "skardu",
    toName: "Skardu",
    distanceKm: 720,
    hoursLow: 16,
    hoursHigh: 22,
    priceFromPKR: 85000,
    priceToPKR: 160000,
    recommendedCar: "toyota-land-cruiser-v8",
    description:
      "Islamabad to Skardu by road is 720 km via the KKH and the Skardu Road — 16-22 hours depending on weather, almost always split as a 2-day journey. Most foreign tourists fly instead (PIA operates daily 1-hour flights from Islamabad to Skardu, PKR 22,000-30,000 one-way) and rent a 4x4 locally in Skardu for the in-region travel. For renters insisting on the drive, a Land Cruiser V8 with experienced driver is the only acceptable vehicle. Package prices: PKR 85,000-110,000 for a 5-day round trip including the drive, PKR 130,000-160,000 for the premium itinerary covering Deosai Plateau, Sheosar Lake, and the K2 base camp viewpoint at Concordia (requires separate trekking arrangements).",
    bestMonths: "May to September (snow closes road outside these months)",
    stops: ["Besham or Chilas (overnight)", "Jaglot", "Skardu Town", "Shangrila Resort", "Deosai Plateau (extension)", "Satpara Lake"],
  },
  {
    slug: "islamabad-to-hunza",
    fromSlug: "islamabad",
    fromName: "Islamabad",
    toSlug: "hunza",
    toName: "Hunza",
    distanceKm: 600,
    hoursLow: 14,
    hoursHigh: 18,
    priceFromPKR: 75000,
    priceToPKR: 140000,
    recommendedCar: "toyota-land-cruiser-v8",
    description:
      "Islamabad to Hunza on the Karakoram Highway — 600 km, 14-18 hours typically split as a 2-day drive with an overnight at Besham (km 250) or Chilas (km 400). Most tourists fly to Gilgit (50 min from Islamabad, PKR 18,000-25,000 one-way) and rent locally, but the KKH drive remains iconic for travellers prioritising the journey itself. Required vehicle: Land Cruiser V8 or Prado with proven mountain-experienced driver. Package range: PKR 75,000-100,000 for a basic 4-day Hunza loop, PKR 130,000-160,000 for premium fleets or extended itineraries that include Khunjerab Pass (Chinese border), Attabad Lake boat rides, and a Passu Cones overnight.",
    bestMonths: "May to October",
    stops: ["Besham (overnight option)", "Chilas (overnight option)", "Gilgit", "Karimabad (Hunza)", "Attabad Lake", "Passu Cones", "Khunjerab Pass (extension)"],
  },
  {
    slug: "karachi-to-hyderabad",
    fromSlug: "karachi",
    fromName: "Karachi",
    toSlug: "hyderabad",
    toName: "Hyderabad",
    distanceKm: 165,
    hoursLow: 2.5,
    hoursHigh: 3.5,
    priceFromPKR: 12000,
    priceToPKR: 20000,
    recommendedCar: "toyota-corolla",
    description:
      "Karachi to Hyderabad on the M9 Superhighway is 165 km, 2.5-3.5 hours one-way. The route is fast and well-maintained — a standard sedan handles it easily. Most rentals quote PKR 12,000-15,000 for a one-way sedan, PKR 16,000-20,000 for a same-day round trip. The motorway carries a PKR 700 toll. Useful as a corporate day-trip route, family visits, or as a Karachi base for Bahawalpur / Cholistan extensions. Out-of-city surcharges may apply for vendors based deep in DHA or Clifton — confirm in your WhatsApp inquiry.",
    bestMonths: "October to March (avoid peak summer heat)",
    stops: ["M9 Service Areas", "Thatta + Makli (60 km detour)", "Kotri Barrage"],
  },
  {
    slug: "karachi-to-thatta",
    fromSlug: "karachi",
    fromName: "Karachi",
    toSlug: "thatta",
    toName: "Thatta",
    distanceKm: 100,
    hoursLow: 2,
    hoursHigh: 3,
    priceFromPKR: 8000,
    priceToPKR: 14000,
    recommendedCar: "toyota-corolla",
    description:
      "Karachi to Thatta is a 100 km, 2-3 hour drive along the N-5 National Highway. The standard Thatta day-trip itinerary combines Makli Necropolis (UNESCO World Heritage), Shah Jahan Mosque, and Keenjhar Lake. Most vendors quote a same-day round trip at PKR 8,000-12,000 for a sedan with driver, PKR 12,000-14,000 for a Fortuner. Hingol National Park (a 5-hour drive beyond Thatta) is sometimes combined as a 2-day package starting at PKR 35,000. Best done October-March; summer temperatures regularly exceed 42°C and make outdoor sightseeing brutal.",
    bestMonths: "October to March",
    stops: ["Makli Necropolis", "Shah Jahan Mosque (Jamia Masjid Thatta)", "Keenjhar Lake (extension)", "Bambore archaeological site"],
  },
  {
    slug: "lahore-to-multan",
    fromSlug: "lahore",
    fromName: "Lahore",
    toSlug: "multan",
    toName: "Multan",
    distanceKm: 350,
    hoursLow: 4,
    hoursHigh: 5,
    priceFromPKR: 18000,
    priceToPKR: 28000,
    recommendedCar: "toyota-corolla",
    description:
      "Lahore to Multan on the M3 / M4 motorway is 350 km, 4-5 hours one-way. The route is the standard corporate intercity trip for Punjab. Sedan with driver one-way: PKR 18,000-22,000 inclusive. Round-trip same-day: PKR 24,000-28,000. Most renters who do this route also extend to Bahawalpur (110 km further) or Derawar Fort in Cholistan (a further 3-hour 4x4 drive for which you'd need to switch vehicles in Bahawalpur). The M3 / M4 motorway tolls add about PKR 1,400 each way for a sedan.",
    bestMonths: "October to March (avoid summer heat above 42°C)",
    stops: ["Sahiwal", "Khanewal", "Multan city + Shah Rukn-e-Alam shrine", "Bahawalpur (extension)", "Derawar Fort (4x4 extension)"],
  },
];

export function getRoute(slug: string): RouteData | undefined {
  return routes.find((r) => r.slug === slug);
}
