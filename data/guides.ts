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
    title: "Toyota Corolla vs Honda Civic: Which to Rent in Pakistan? (2026)",
    excerpt:
      "Daily rates, comfort, fuel economy, and wedding suitability compared head-to-head — so you pick the right sedan for your trip and budget.",
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
];
