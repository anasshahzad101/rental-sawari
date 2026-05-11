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
];
