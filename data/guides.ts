import type { Guide } from "@/lib/types";
import { placeholder } from "@/lib/placeholder";

const img = (label: string, slug: string, realUrl?: string) =>
  placeholder({
    width: 600,
    height: 400,
    label,
    realUrl,
    realPath: `/images/guides/${slug}.jpg`,
  });

export const guides: Guide[] = [
  {
    slug: "rent-a-car-cost-lahore-2026",
    title: "How Much Does It Cost to Rent a Car in Lahore in 2026?",
    excerpt:
      "Real prices for every category — from a PKR 3,500/day Mehran to a PKR 35,000/day Land Cruiser, plus what affects the daily rate.",
    readTime: 7,
    publishedDate: "2026-04-12",
    image: img(
      "Lahore Prices",
      "lahore-prices",
      // Walled-City Badshahi shot — distinct from the Lahore city-hero photo
      "https://upload.wikimedia.org/wikipedia/commons/d/db/Badshahi_Mosqu_-_Mughal_Art_in_an_Ocean_of_Concrete.jpg",
    ),
    category: "Pricing",
  },
  {
    slug: "self-drive-vs-with-driver",
    title: "Self-Drive vs With-Driver: Which Is Better in Pakistan?",
    excerpt:
      "An honest breakdown of cost, hassle, license requirements, and which option makes sense for your trip type.",
    readTime: 9,
    publishedDate: "2026-03-28",
    image: img(
      "Self-Drive vs Driver",
      "self-drive-vs-driver",
      // Karakoram Highway — canonical Pakistani driving photo
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
    ),
    category: "Buying Guide",
  },
  {
    slug: "documents-to-rent-a-car-in-pakistan",
    title: "Documents You Need to Rent a Car in Pakistan",
    excerpt:
      "CNIC, license, security deposit, utility bill — exactly what every reputable rental company will ask for and why.",
    readTime: 5,
    publishedDate: "2026-03-15",
    image: img(
      "Documents Guide",
      "documents",
      // Quintessential Pakistani rental car — fits an article about local CNIC/licence requirements
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Mehran_Model_2001_Right_Side_View_At_Lowari_Pass%2CChitral%2CKPK.jpg",
    ),
    category: "Requirements",
  },
  {
    slug: "pakistan-car-rental-market-data-2026",
    title:
      "Pakistan's Car Rental Market in 2026 — Data from 1,085 Verified Vendors",
    excerpt:
      "We audited 1,085 verified rent-a-car companies across 8 Pakistani cities. Real numbers on city density, ratings, services offered, and which neighbourhoods dominate. The first proprietary dataset on Pakistan's car rental market.",
    readTime: 11,
    publishedDate: "2026-05-11",
    image: placeholder({
      width: 600,
      height: 400,
      label: "Market Data 2026",
      realUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dolmen_Towers_Karachi.jpg/1280px-Dolmen_Towers_Karachi.jpg",
      realPath: "/images/guides/market-data.jpg",
    }),
    category: "Market Research",
  },
  {
    slug: "top-rent-a-car-companies-pakistan-2026",
    title:
      "The 10 Highest-Rated Rent-a-Car Companies in Pakistan (Ranked by Reviews, 2026)",
    excerpt:
      "Ranked by Google review count across all verified RentalSawari listings. Real data on the most-trusted rental companies in Lahore, Islamabad, Karachi, and beyond — with what each one is best known for.",
    readTime: 9,
    publishedDate: "2026-05-11",
    image: placeholder({
      width: 600,
      height: 400,
      label: "Top 10 Rentals",
      realUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/2020_Toyota_HiAce_%28front%29.jpg/1280px-2020_Toyota_HiAce_%28front%29.jpg",
      realPath: "/images/guides/top-10.jpg",
    }),
    category: "Rankings",
  },
  {
    slug: "foreign-tourist-car-rental-pakistan",
    title: "Renting a Car in Pakistan as a Foreign Tourist — Complete Guide",
    excerpt:
      "International Driving Permit rules, deposit norms in USD, NOCs for Northern Areas, and the safest route from Islamabad to Hunza.",
    readTime: 14,
    publishedDate: "2026-02-22",
    image: img(
      "Tourist Guide",
      "tourist-guide",
      // Shalimar Gardens — iconic Pakistani tourist landmark
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Reflection_of_Farah_Baksh_Terrace_%28Upper_Terrace%29_main_building.jpg/1280px-Reflection_of_Farah_Baksh_Terrace_%28Upper_Terrace%29_main_building.jpg",
    ),
    category: "Tourists",
    faqs: [
      {
        q: "Can foreign tourists rent a car in Pakistan?",
        a: "Yes — with-driver hire is the norm and recommended. Self-drive is legal with a passport, valid visa, and International Driving Permit, but is not advised outside major cities. Deposits for tourists are usually quoted in USD (200–1,000).",
      },
      {
        q: "Do foreigners need an NOC for Hunza and Gilgit-Baltistan?",
        a: "Foreign nationals need a No-Objection Certificate for Gilgit-Baltistan. Verified tour operators arrange it in about 24 hours, usually free or for a small fee — you don't handle it yourself.",
      },
      {
        q: "Which airport should tourists fly into for the Northern Areas?",
        a: "Islamabad (ISB) — closest to the mountains, the most English-friendly rental market, and the standard launch point for Hunza, Skardu, and Naran packages.",
      },
      {
        q: "How much does a tourist car rental cost in Pakistan?",
        a: "City day hire with driver runs USD 25–40/day; a 5-day Hunza package costs USD 800–1,500 all-in; airport pickup is USD 15–30. Card payment is uncommon — carry USD cash.",
      },
    ],
  },
  {
    slug: "rent-a-car-islamabad-to-murree-routes-cost-2026",
    title: "Islamabad to Murree by Rental Car: Routes, Cost & Tips (2026)",
    excerpt:
      "The two routes (Expressway vs the old Lower Topa road), what a day trip vs overnight Murree car rental costs from Islamabad, the best vehicle, and when to avoid the traffic.",
    readTime: 8,
    publishedDate: "2026-06-18",
    image: img(
      "Islamabad to Murree",
      "islamabad-murree",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg/1280px-Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg",
    ),
    category: "Routes",
  },
  {
    slug: "lahore-to-hunza-7-day-itinerary-car-rental",
    title: "Lahore to Hunza by Rental Car: A 7-Day Itinerary (2026)",
    excerpt:
      "A day-by-day Lahore–Hunza road-trip plan with driving hours, overnight stops, the right vehicle, and a realistic 7-day rental cost with driver.",
    readTime: 12,
    publishedDate: "2026-06-15",
    image: img(
      "Lahore to Hunza",
      "lahore-hunza",
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
    ),
    category: "Routes",
  },
  {
    slug: "toyota-corolla-vs-honda-civic-rent-pakistan-2026",
    title: "Toyota Corolla vs Honda Civic vs Suzuki Cultus: Which to Rent in Pakistan? (2026)",
    excerpt:
      "Daily rates, comfort, fuel economy, and wedding suitability compared three ways — so you pick the right car for your trip and budget.",
    readTime: 7,
    publishedDate: "2026-06-12",
    image: img(
      "Corolla vs Civic",
      "corolla-vs-civic",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/1280px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
    ),
    category: "Buying Guide",
  },
  {
    slug: "cheapest-self-drive-cars-lahore-under-5000-pkr",
    title: "Cheapest Self-Drive Cars in Lahore Under PKR 5,000/day (2026)",
    excerpt:
      "Which cars actually rent self-drive under PKR 5,000/day in Lahore, the deposit and licence rules, where to find them, and the hidden costs to check first.",
    readTime: 6,
    publishedDate: "2026-06-10",
    image: img(
      "Cheap Self-Drive Lahore",
      "cheap-self-drive-lahore",
      "https://upload.wikimedia.org/wikipedia/commons/f/f8/2nd_generation_Suzuki_Cultus.jpg",
    ),
    category: "Pricing",
  },
  {
    slug: "wedding-car-rental-lahore-prices-decoration-booking",
    title: "Wedding Car Rental in Lahore: Prices, Decoration & Booking (2026)",
    excerpt:
      "What a decorated wedding car costs in Lahore by vehicle class, what flower decoration adds, how far ahead to book, and the questions to ask before you pay.",
    readTime: 8,
    publishedDate: "2026-06-08",
    image: img(
      "Wedding Car Lahore",
      "wedding-car-lahore",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Mercedes-Benz_W223_IMG_6663.jpg/1280px-Mercedes-Benz_W223_IMG_6663.jpg",
    ),
    category: "Wedding",
  },
  {
    slug: "rent-a-car-cost-karachi-2026",
    title: "How Much Does It Cost to Rent a Car in Karachi in 2026?",
    excerpt:
      "Real Karachi rental rates by category — economy from PKR 3,800/day, sedans, Hiace, SUVs — plus deposits, one-way fees, and how Karachi compares to Lahore.",
    readTime: 7,
    publishedDate: "2026-10-19",
    image: img(
      "Karachi Prices",
      "karachi-prices",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/1280px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
    ),
    category: "Pricing",
    faqs: [
      {
        q: "What is the cheapest car to rent in Karachi?",
        a: "Economy hatchbacks (Suzuki Mehran, Cultus, Wagon R) start at PKR 3,800/day in Karachi with a driver. Self-drive economy rentals start around PKR 3,000/day plus a refundable deposit of PKR 25,000–50,000.",
      },
      {
        q: "How much is a Corolla with driver in Karachi per day?",
        a: "A Toyota Corolla or Honda Civic with driver costs PKR 6,500–8,500/day in Karachi in 2026, excluding fuel and tolls on intercity trips. Multi-day bookings typically get 10–15% off.",
      },
      {
        q: "Do Karachi rentals include fuel?",
        a: "No. Daily rates cover the car and driver; fuel, tolls, and the driver's meal allowance on outstation trips are billed separately or settled at the end of the trip.",
      },
      {
        q: "How much is airport pickup at Jinnah International (KHI)?",
        a: "Airport pickup in Karachi typically adds PKR 500–1,500 over the standard daily rate, depending on vehicle class and terminal wait time. Most Clifton and DHA vendors offer meet-and-greet at arrivals.",
      },
    ],
  },
  {
    slug: "rent-a-car-cost-islamabad-2026",
    title: "How Much Does It Cost to Rent a Car in Islamabad & Rawalpindi in 2026?",
    excerpt:
      "Twin-city rental rates by category — economy from PKR 4,000/day in Islamabad, PKR 3,500 in Rawalpindi — plus Northern Areas package pricing and airport pickup costs.",
    readTime: 7,
    publishedDate: "2026-10-19",
    image: img(
      "Islamabad Prices",
      "islamabad-prices",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2024_Toyota_Land_Cruiser_250_VX_in_Platinum_White_Pearl_Mica%2C_front_left.jpg/1280px-2024_Toyota_Land_Cruiser_250_VX_in_Platinum_White_Pearl_Mica%2C_front_left.jpg",
    ),
    category: "Pricing",
    faqs: [
      {
        q: "Is renting a car cheaper in Rawalpindi than Islamabad?",
        a: "Yes — Rawalpindi rates run 5–10% below Islamabad for the same vehicle class. Many Rawalpindi vendors also cover Islamabad and the airport, so a Pindi pickup is often the cheapest twin-city option.",
      },
      {
        q: "How much is a 5-day Northern Areas package from Islamabad?",
        a: "A 5-day Hunza or Naran package from Islamabad costs roughly USD 800–1,500 (PKR 225,000–420,000) including vehicle, driver, fuel, and tolls, depending on vehicle class and season.",
      },
      {
        q: "How much does airport pickup from Islamabad International (ISB) cost?",
        a: "Airport pickup at ISB typically adds PKR 800–2,000 over the daily rate. Most F-10, F-7, and Bahria Town vendors include meet-and-greet at arrivals.",
      },
      {
        q: "Can I self-drive in Islamabad as a foreign tourist?",
        a: "Yes — F-10 and F-11 vendors regularly rent self-drive to foreign visitors with a passport, valid visa, and International Driving Permit. Expect a refundable deposit of PKR 50,000–100,000.",
      },
    ],
  },
  {
    slug: "hiace-rental-prices-pakistan-2026",
    title: "Hiace Rental Prices in Pakistan (2026) — City-by-City Rates",
    excerpt:
      "Toyota Hiace and van rental rates across Lahore, Islamabad, Karachi and more — daily rates, per-km outstation pricing, and what group size actually fits.",
    readTime: 6,
    publishedDate: "2026-10-19",
    image: img(
      "Hiace Prices",
      "hiace-prices",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/2020_Toyota_HiAce_%28front%29.jpg/1280px-2020_Toyota_HiAce_%28front%29.jpg",
    ),
    category: "Pricing",
    faqs: [
      {
        q: "How many passengers fit in a rental Hiace?",
        a: "A standard Toyota Hiace seats 12–14 passengers plus the driver. For comfortable long trips with luggage, plan on 10–12 passengers. Larger groups should book a Toyota Coaster (25–29 seats).",
      },
      {
        q: "How much is a Hiace per day in Lahore?",
        a: "A Toyota Hiace with driver costs PKR 9,000–10,000/day in Lahore in 2026, excluding fuel. Islamabad runs PKR 9,500–11,000/day; Karachi PKR 9,000–10,500/day.",
      },
      {
        q: "Can I rent a Hiace for a Northern Areas trip?",
        a: "Yes — Hiace is the standard group vehicle for Hunza, Naran, and Swat trips. Expect PKR 12,000–15,000/day equivalent on multi-day mountain packages, as rates include the driver's overnight allowance.",
      },
      {
        q: "Is fuel included in the Hiace daily rate?",
        a: "No — fuel and tolls are extra on top of the daily van-and-driver rate. For outstation trips, most vendors quote either fuel-inclusive fixed fares or per-km rates of PKR 55–75/km.",
      },
    ],
  },
  {
    slug: "wedding-car-rental-prices-pakistan-2026",
    title: "Wedding Car Rental Prices in Pakistan (2026) — Corolla to Land Cruiser",
    excerpt:
      "What decorated wedding cars cost across Pakistan by vehicle class — from a PKR 8,000 Corolla to a PKR 35,000+ Land Cruiser V8 — plus decoration and booking lead times.",
    readTime: 8,
    publishedDate: "2026-10-19",
    image: img(
      "Wedding Car Prices",
      "wedding-car-prices",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Mercedes-Benz_W223_IMG_6663.jpg/1280px-Mercedes-Benz_W223_IMG_6663.jpg",
    ),
    category: "Wedding",
    faqs: [
      {
        q: "How much does a wedding car cost in Pakistan?",
        a: "A decorated sedan (Corolla, Civic) costs PKR 8,000–15,000 per event; a Mercedes E-Class or BMW 5-Series runs PKR 25,000–40,000; a Land Cruiser V8 or Mercedes S-Class runs PKR 28,000–50,000+, depending on city and season.",
      },
      {
        q: "Is flower decoration included in the wedding car price?",
        a: "Usually not. Fresh-flower decoration adds PKR 3,000–12,000 depending on coverage. Most vendors coordinate with their regular decorator, or you can bring your own.",
      },
      {
        q: "How far ahead should I book a wedding car?",
        a: "Book 4–8 weeks ahead for December–January and Eid-season dates in Lahore and Islamabad — premium fleets sell out. Off-season, 1–2 weeks is usually enough.",
      },
      {
        q: "Which city is cheapest for wedding cars?",
        a: "Faisalabad and Multan wedding cars run 15–25% below Lahore prices for equivalent vehicles. Lahore has the deepest premium fleet; Islamabad the widest executive selection.",
      },
    ],
  },
  {
    slug: "self-drive-car-rental-lahore",
    title: "Self-Drive Car Rental in Lahore — Requirements & Best Areas (2026)",
    excerpt:
      "Where to find self-drive rentals in Lahore, what documents and deposits you need, realistic rates, and the contract clauses worth reading twice.",
    readTime: 6,
    publishedDate: "2026-10-19",
    image: img(
      "Self-Drive Lahore",
      "self-drive-lahore",
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Mehran_Model_2001_Right_Side_View_At_Lowari_Pass%2CChitral%2CKPK.jpg",
    ),
    category: "Buying Guide",
    faqs: [
      {
        q: "What documents do I need for self-drive in Lahore?",
        a: "An original CNIC, a valid Pakistani driving licence, and a refundable security deposit of PKR 25,000–100,000 depending on the car. Some vendors also ask for a utility bill as address proof. Foreign visitors need a passport, valid visa, and International Driving Permit.",
      },
      {
        q: "How much does self-drive cost in Lahore?",
        a: "Self-drive rates in Lahore run PKR 3,000–5,000/day for economy cars, PKR 5,000–7,000/day for sedans, and PKR 12,000–18,000/day for SUVs — roughly PKR 1,500–3,000/day cheaper than with-driver hire.",
      },
      {
        q: "Which areas of Lahore have the most self-drive options?",
        a: "Johar Town dominates Lahore's self-drive segment, with Gulberg and Wapda Town as secondary hubs. DHA vendors rarely offer self-drive because their fleets skew luxury.",
      },
      {
        q: "Is there a mileage limit on self-drive rentals?",
        a: "Usually yes — most Lahore vendors cap self-drive at 200–300 km/day within the city, with PKR 20–40/km beyond that. Intercity self-drive needs prior approval and sometimes a higher deposit.",
      },
    ],
  },
  {
    slug: "rent-a-car-without-driver-karachi-islamabad",
    title: "Rent a Car Without a Driver in Karachi & Islamabad (2026) — Deposits & CNIC Rules",
    excerpt:
      "How no-driver rentals work in Karachi and Islamabad — deposit ranges, CNIC and licence rules, insurance realities, and which vendors actually hand over the keys.",
    readTime: 6,
    publishedDate: "2026-10-19",
    image: img(
      "Rent Without Driver",
      "without-driver",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/1280px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
    ),
    category: "Buying Guide",
    faqs: [
      {
        q: "How much is the deposit for a no-driver rental?",
        a: "Expect a refundable deposit of PKR 25,000–50,000 for economy cars, PKR 50,000–100,000 for sedans and SUVs in Karachi and Islamabad. Deposits are returned at handover after a damage and fuel-level check.",
      },
      {
        q: "Can I rent without a driver using someone else's CNIC?",
        a: "No — reputable vendors require the renter's own original CNIC and driving licence. Renting on a borrowed CNIC voids any insurance arrangement and most vendors will refuse at pickup.",
      },
      {
        q: "Is insurance included in self-drive rentals?",
        a: "Basic third-party cover is standard; comprehensive cover is rare on self-drive contracts. Most agreements make the renter liable for damage up to the deposit amount — read the accident clause before signing.",
      },
      {
        q: "Which city is easier for first-time self-drive renters?",
        a: "Islamabad — wider roads, calmer traffic, and vendors in F-10/F-11 accustomed to foreign and first-time renters. Karachi self-drive is concentrated in PECHS, Gulshan, and DHA and suits experienced city drivers.",
      },
    ],
  },
  {
    slug: "monthly-car-rental-companies-pakistan",
    title: "Monthly Car Rental for Companies in Pakistan (2026) — Rates & Contracts",
    excerpt:
      "What corporate monthly rentals cost in Pakistan by vehicle class, what a proper contract includes, and how to structure driver, fuel, and maintenance terms.",
    readTime: 7,
    publishedDate: "2026-10-19",
    image: img(
      "Corporate Monthly",
      "corporate-monthly",
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png",
    ),
    category: "Business",
    faqs: [
      {
        q: "How much is a monthly car rental for a company in Pakistan?",
        a: "Monthly corporate rates in 2026: economy cars PKR 90,000–130,000/month, sedans PKR 150,000–220,000/month, SUVs PKR 350,000–550,000/month — typically 15–30% below equivalent daily rates, driver included.",
      },
      {
        q: "What should a corporate rental contract include?",
        a: "Vehicle replacement guarantee within 24 hours of breakdown, driver backup clause, insurance responsibilities, fuel policy, mileage caps, and invoice/PAN details for tax withholding. Get the replacement SLA in writing.",
      },
      {
        q: "Is fuel included in monthly corporate rates?",
        a: "Usually not. Most contracts bill fuel at actuals or set a monthly fuel cap. Clarify whether the driver's salary, meals, and accommodation on travel days are included — on good contracts they are.",
      },
      {
        q: "Which cities have the strongest corporate rental supply?",
        a: "Islamabad (MNC and NGO concentration), Karachi (corporate headquarters), and Lahore. All three have vendors experienced with monthly invoicing, GST invoices, and multi-vehicle fleet contracts.",
      },
    ],
  },
  {
    slug: "airport-pickup-car-service-pakistan",
    title: "Airport Pickup Car Services in Pakistan (2026) — Lahore, Karachi, Islamabad",
    excerpt:
      "What airport pickup costs at LHE, KHI, and ISB, how meet-and-greet works, and how to book a reliable pickup for late-night and early-morning flights.",
    readTime: 5,
    publishedDate: "2026-10-19",
    image: img(
      "Airport Pickup",
      "airport-pickup",
      "https://upload.wikimedia.org/wikipedia/commons/9/90/Toyota_Coaster_GX_XZB70.jpg",
    ),
    category: "Services",
    faqs: [
      {
        q: "How much does airport pickup cost in Pakistan?",
        a: "Airport pickup typically adds PKR 500–2,000 over the standard daily rate: roughly PKR 4,500–8,000 total for a sedan pickup at Lahore (LHE), Karachi (KHI), or Islamabad (ISB) including the first day's hire.",
      },
      {
        q: "How does meet-and-greet work at Pakistani airports?",
        a: "Share your flight number on WhatsApp when booking. The driver tracks the flight, waits at arrivals with a name card, and messages you on landing. Most vendors include 60 minutes of free waiting after landing.",
      },
      {
        q: "Can I book a pickup for a 3 AM flight?",
        a: "Yes — established vendors in all three cities run 24/7 airport services. Book at least 12–24 hours ahead for late-night pickups and confirm the driver's name and number the evening before.",
      },
      {
        q: "What if my flight is delayed?",
        a: "Drivers track flight status via the flight number you provide, so delays are absorbed automatically. Beyond 60–90 minutes of post-landing waiting, a small waiting charge (PKR 200–500/hour) may apply.",
      },
    ],
  },
  {
    slug: "northern-areas-rental-car-guide",
    title: "Northern Areas by Rental Car (2026) — Hunza, Skardu, Naran: Vehicles & Rules",
    excerpt:
      "Which vehicle for which valley, what multi-day packages cost, NOC and permit realities, and the season windows that matter for Hunza, Skardu, and Naran.",
    readTime: 9,
    publishedDate: "2026-10-19",
    image: img(
      "Northern Areas",
      "northern-areas",
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
    ),
    category: "Travel",
    faqs: [
      {
        q: "Which car is best for a Hunza trip?",
        a: "A sedan handles the Karakoram Highway to Hunza comfortably in season (May–October). For Skardu side valleys, Deosai, or winter travel, book an SUV (Prado, Fortuner) — ground clearance and 4x4 matter off the KKH.",
      },
      {
        q: "How much does a 5-day Hunza package cost?",
        a: "A 5-day Islamabad–Hunza package costs roughly USD 800–1,500 (PKR 225,000–420,000) including vehicle, driver, fuel, and tolls — sedan at the low end, Land Cruiser at the top.",
      },
      {
        q: "Do I need an NOC to visit the Northern Areas?",
        a: "Pakistani nationals need no NOC for Hunza, Skardu, or Naran. Foreign tourists should carry passport and visa copies; some border-adjacent zones (e.g. toward Khunjerab) may require registration at checkposts — your driver handles this.",
      },
      {
        q: "When is the best season for a Northern Areas road trip?",
        a: "June–September for full access (Babusar Top, Deosai open). April–May and October are quieter with lower rates. November–March: Naran and Babusar close; Hunza remains accessible via the KKH with a 4x4 recommended.",
      },
    ],
  },
  {
    slug: "islamabad-to-hunza-rental-car-itinerary",
    title: "Islamabad to Hunza by Rental Car — 7-Day Itinerary & Costs (2026)",
    excerpt:
      "A realistic day-by-day Islamabad–Hunza itinerary with drive times, stopovers, and what the full trip costs with a rental car and driver.",
    readTime: 9,
    publishedDate: "2026-10-19",
    image: img(
      "Islamabad to Hunza",
      "isb-hunza-itinerary",
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
    ),
    category: "Travel",
    faqs: [
      {
        q: "How long is the drive from Islamabad to Hunza?",
        a: "Islamabad to Karimabad is roughly 600 km — 13–15 hours of driving via the Karakoram Highway, or 9–10 hours via the Babusar route (June–September only). Plan two days up with a Naran or Chilas stopover.",
      },
      {
        q: "How much does a 7-day Islamabad–Hunza rental cost?",
        a: "A 7-day package with driver costs roughly PKR 300,000–550,000 (USD 1,050–1,950) all-in — sedan at the low end, Land Cruiser at the top — covering vehicle, driver, fuel, and tolls. Hotels are extra.",
      },
      {
        q: "Is the Babusar Top route worth it?",
        a: "Yes, in season (June–September): it cuts 3–4 hours and passes Naran and Lulusar Lake. It closes November–May and after heavy rain — always confirm status with your driver the day before.",
      },
      {
        q: "Can I do Hunza in fewer than 7 days?",
        a: "Five days is the practical minimum: two up, two back, one full day in Hunza. Seven days adds Attabad Lake, Passu, and Khunjerab without rushed driving days.",
      },
    ],
  },
];
