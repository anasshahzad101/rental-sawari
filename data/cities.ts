import type { City } from "@/lib/types";
import { placeholder } from "@/lib/placeholder";
import { companies } from "./companies";

/**
 * `listingCount` is derived from the actual companies array — never edit it
 * here. To update counts, re-run `node scripts/importCompanies.mjs`.
 */
function countFor(cityName: string) {
  return companies.filter((c) => c.city === cityName).length;
}

export const cities: City[] = [
  {
    slug: "lahore",
    name: "Lahore",
    nameUrdu: "لاہور",
    listingCount: countFor("Lahore"),
    startingPrice: 3500,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Lahore",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Badshahi_Mosque_front_picture.jpg",
      realPath: "/images/cities/lahore.jpg",
    }),
    popularAreas: ["DHA", "Gulberg", "Johar Town", "Cantt", "Model Town"],
  },
  {
    slug: "islamabad",
    name: "Islamabad",
    nameUrdu: "اسلام آباد",
    listingCount: countFor("Islamabad"),
    startingPrice: 4000,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Islamabad",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg/1280px-Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg",
      realPath: "/images/cities/islamabad.jpg",
    }),
    popularAreas: ["F-6", "F-7", "F-10", "G-9", "Blue Area", "Bahria Town"],
  },
  {
    slug: "karachi",
    name: "Karachi",
    nameUrdu: "کراچی",
    listingCount: countFor("Karachi"),
    startingPrice: 3800,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Karachi",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Dolmen_Towers_Karachi.jpg/1280px-Dolmen_Towers_Karachi.jpg",
      realPath: "/images/cities/karachi.jpg",
    }),
    popularAreas: ["Clifton", "DHA", "Gulshan", "PECHS", "North Nazimabad"],
  },
  {
    slug: "rawalpindi",
    name: "Rawalpindi",
    nameUrdu: "راولپنڈی",
    listingCount: countFor("Rawalpindi"),
    startingPrice: 3500,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Rawalpindi",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Rawalpindi_railway_station_4.JPG/1280px-Rawalpindi_railway_station_4.JPG",
      realPath: "/images/cities/rawalpindi.jpg",
    }),
    popularAreas: ["Saddar", "Cantt", "Bahria Town", "Satellite Town"],
  },
  {
    slug: "faisalabad",
    name: "Faisalabad",
    nameUrdu: "فیصل آباد",
    listingCount: countFor("Faisalabad"),
    startingPrice: 3200,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Faisalabad",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Clock_Tower_Faisalabad_by_Usman_Nadeem.jpg/1280px-Clock_Tower_Faisalabad_by_Usman_Nadeem.jpg",
      realPath: "/images/cities/faisalabad.jpg",
    }),
    popularAreas: ["Madina Town", "Peoples Colony", "Susan Road", "D-Ground"],
  },
  {
    slug: "multan",
    name: "Multan",
    nameUrdu: "ملتان",
    listingCount: countFor("Multan"),
    startingPrice: 3000,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Multan",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Shrine_Shah_Rukn-e-Alam.jpg",
      realPath: "/images/cities/multan.jpg",
    }),
    popularAreas: ["Cantt", "Gulgasht", "Bosan Road", "Shah Rukn-e-Alam"],
  },
  {
    slug: "peshawar",
    name: "Peshawar",
    nameUrdu: "پشاور",
    listingCount: countFor("Peshawar"),
    startingPrice: 3200,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Peshawar",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg",
      realPath: "/images/cities/peshawar.jpg",
    }),
    popularAreas: ["University Town", "Hayatabad", "Cantt", "Saddar"],
  },
  {
    slug: "quetta",
    name: "Quetta",
    nameUrdu: "کوئٹہ",
    listingCount: countFor("Quetta"),
    startingPrice: 4500,
    heroImage: placeholder({
      width: 800,
      height: 600,
      label: "Quetta",
      realUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Quetta_cantt.jpg/1280px-Quetta_cantt.jpg",
      realPath: "/images/cities/quetta.jpg",
    }),
    popularAreas: ["Cantt", "Jinnah Town", "Satellite Town", "Samungli Road"],
  },
];

export function getCityBySlug(slug: string) {
  return cities.find((c) => c.slug === slug);
}
