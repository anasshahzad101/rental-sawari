import type { CarType } from "@/lib/types";
import { placeholder } from "@/lib/placeholder";

const img = (label: string, slug: string, realUrl?: string) =>
  placeholder({
    width: 400,
    height: 280,
    label,
    realUrl,
    realPath: `/images/cars/${slug}.jpg`,
  });

export const carTypes: CarType[] = [
  {
    slug: "toyota-corolla",
    name: "Toyota Corolla",
    category: "Sedan",
    startingPrice: 6500,
    capacity: 4,
    image: img(
      "Corolla",
      "toyota-corolla",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/1280px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
    ),
    popular: true,
  },
  {
    slug: "honda-civic",
    name: "Honda Civic",
    category: "Sedan",
    startingPrice: 7500,
    capacity: 4,
    image: img(
      "Civic",
      "honda-civic",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg/1280px-Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg",
    ),
    popular: true,
  },
  {
    slug: "toyota-hiace",
    name: "Toyota Hiace",
    category: "Van",
    startingPrice: 9000,
    capacity: 12,
    image: img(
      "Hiace",
      "toyota-hiace",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/2020_Toyota_HiAce_%28front%29.jpg/1280px-2020_Toyota_HiAce_%28front%29.jpg",
    ),
    popular: true,
  },
  {
    slug: "suzuki-apv",
    name: "Suzuki APV",
    category: "Van",
    startingPrice: 6000,
    capacity: 7,
    image: img(
      "APV",
      "suzuki-apv",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/2014_Suzuki_APV_Arena_SGX_1.5_DN42V_%2820190623%29.jpg/1280px-2014_Suzuki_APV_Arena_SGX_1.5_DN42V_%2820190623%29.jpg",
    ),
    popular: true,
  },
  {
    slug: "toyota-prado",
    name: "Toyota Prado",
    category: "SUV",
    startingPrice: 22000,
    capacity: 6,
    image: img(
      "Prado",
      "toyota-prado",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2024_Toyota_Land_Cruiser_250_VX_in_Platinum_White_Pearl_Mica%2C_front_left.jpg/1280px-2024_Toyota_Land_Cruiser_250_VX_in_Platinum_White_Pearl_Mica%2C_front_left.jpg",
    ),
    popular: true,
  },
  {
    slug: "toyota-land-cruiser-v8",
    name: "Toyota Land Cruiser V8",
    category: "Luxury",
    startingPrice: 35000,
    capacity: 6,
    image: img(
      "Land Cruiser V8",
      "toyota-land-cruiser-v8",
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png",
    ),
    popular: true,
  },
  {
    slug: "suzuki-mehran",
    name: "Suzuki Mehran",
    category: "Economy",
    startingPrice: 3500,
    capacity: 4,
    image: img(
      "Mehran",
      "suzuki-mehran",
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Mehran_Model_2001_Right_Side_View_At_Lowari_Pass%2CChitral%2CKPK.jpg",
    ),
    popular: false,
  },
  {
    slug: "suzuki-cultus",
    name: "Suzuki Cultus",
    category: "Economy",
    startingPrice: 4500,
    capacity: 4,
    image: img(
      "Cultus",
      "suzuki-cultus",
      "https://upload.wikimedia.org/wikipedia/commons/f/f8/2nd_generation_Suzuki_Cultus.jpg",
    ),
    popular: true,
  },
  {
    slug: "toyota-fortuner",
    name: "Toyota Fortuner",
    category: "SUV",
    startingPrice: 18000,
    capacity: 6,
    image: img(
      "Fortuner",
      "toyota-fortuner",
      "https://upload.wikimedia.org/wikipedia/commons/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg",
    ),
    popular: true,
  },
  {
    slug: "mercedes-benz",
    name: "Mercedes-Benz",
    category: "Luxury",
    startingPrice: 28000,
    capacity: 4,
    image: img(
      "Mercedes",
      "mercedes-benz",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Mercedes-Benz_W223_IMG_6663.jpg/1280px-Mercedes-Benz_W223_IMG_6663.jpg",
    ),
    popular: false,
  },
  {
    slug: "suzuki-bolan",
    name: "Suzuki Bolan",
    category: "Van",
    startingPrice: 4000,
    capacity: 7,
    image: img(
      "Bolan",
      "suzuki-bolan",
      "https://upload.wikimedia.org/wikipedia/commons/2/21/Suzuki_Carry_Truck_KC_4WD_DA16T.JPG",
    ),
    popular: false,
  },
  {
    slug: "toyota-coaster",
    name: "Toyota Coaster",
    category: "Coaster",
    startingPrice: 15000,
    capacity: 26,
    image: img(
      "Coaster",
      "toyota-coaster",
      "https://upload.wikimedia.org/wikipedia/commons/9/90/Toyota_Coaster_GX_XZB70.jpg",
    ),
    popular: false,
  },
];

export const popularCarTypes = carTypes.filter((c) => c.popular);

export function getCarTypeBySlug(slug: string) {
  return carTypes.find((c) => c.slug === slug);
}
