import type { UseCase } from "@/lib/types";
import { placeholder } from "@/lib/placeholder";

const img = (label: string, slug: string, realUrl?: string) =>
  placeholder({
    width: 500,
    height: 320,
    label,
    realUrl,
    realPath: `/images/use-cases/${slug}.jpg`,
  });

export const useCases: UseCase[] = [
  {
    slug: "wedding-car-rental",
    title: "Wedding Cars",
    description:
      "Decorated Mercedes, Civics, and Land Cruisers for your baraat. Verified vendors with photo proof.",
    icon: "Heart",
    image: img(
      "Wedding Cars",
      "wedding",
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pakistani_weddings_Rituals.jpg",
    ),
  },
  {
    slug: "airport-pickup",
    title: "Airport Pickup",
    description:
      "Fixed-fare pickups from all major Pakistani airports. Driver waits at arrivals with your name.",
    icon: "Plane",
    image: img(
      "Airport Pickup",
      "airport",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/PK_Karachi_Airport_asv2020-01.jpg/1280px-PK_Karachi_Airport_asv2020-01.jpg",
    ),
  },
  {
    slug: "northern-areas-tours",
    title: "Northern Areas Tours",
    description:
      "Hunza, Skardu, Naran-Kaghan. 4x4 vehicles with experienced mountain drivers.",
    icon: "Mountain",
    image: img(
      "Northern Tours",
      "northern",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Pasu_cones.jpg/1280px-Pasu_cones.jpg",
    ),
  },
  {
    slug: "corporate-monthly",
    title: "Corporate Monthly",
    description:
      "Long-term rentals for businesses. Invoiced billing, dedicated drivers, fleet options.",
    icon: "Briefcase",
    image: img(
      "Corporate Monthly",
      "corporate",
      "https://upload.wikimedia.org/wikipedia/commons/b/b1/First_Mega_Mall_of_Islamabad_-_Centaurus.JPG",
    ),
  },
  {
    slug: "self-drive-rental",
    title: "Self-Drive Rentals",
    description:
      "Drive yourself. Verified vendors offering self-drive with clear deposit and document terms.",
    icon: "Car",
    image: img(
      "Self-Drive",
      "self-drive",
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
    ),
  },
  {
    slug: "tourist-packages",
    title: "Tourist Packages",
    description:
      "Day trips and multi-city packages. Lahore-Islamabad, Karachi coastal, and more.",
    icon: "MapPin",
    image: img(
      "Tourist Packages",
      "tourist",
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/Lahore_Fort_view_from_Baradari.jpg",
    ),
  },
];
