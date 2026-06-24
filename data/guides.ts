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
];
