import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { UseCasePage } from "@/components/shared/UseCasePage";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Tourist Car Packages in Pakistan — Day Trips & Multi-City Tours",
  description:
    "Pre-built day trips and multi-city tour packages from verified Pakistani rental companies. Lahore-Islamabad, Karachi coastal, Northern Areas, and more.",
  alternates: { canonical: "/tourist-packages" },
};

export default function Page() {
  return (
    <UseCasePage
      slug="tourist-packages"
      eyebrow="Use Case"
      title="Tourist Packages"
      subtitle="Pre-built day trips and multi-city tours from verified vendors. Driver, vehicle, and route planned — you just enjoy the ride."
      Icon={MapPin}
      image={placeholder({
        width: 800,
        height: 600,
        label: "Tourist package",
        realUrl:
          "https://upload.wikimedia.org/wikipedia/commons/4/4f/Lahore_Fort_view_from_Baradari.jpg",
        realPath: "/images/use-cases/tourist-hero.jpg",
      })}
      imageAlt="Tourist tour van at a scenic stop in Pakistan"
      body="Tourist packages bundle the vehicle, driver, and route into one quote. They're popular with families, foreign visitors, and groups who don't want the friction of agreeing route + price + stops on every call. Verified vendors offer day trips around major cities and multi-day packages spanning 3–10 days."
      bullets={[
        "Day trips: Lahore Walled City, Karachi Coastal, Islamabad Margalla",
        "Multi-day: Hunza loop, Skardu trek, GT Road heritage",
        "All-inclusive pricing — vehicle, driver, fuel, tolls",
        "Family-friendly Hiace, APV, Coaster options for larger groups",
      ]}
      serviceMatch="Tourist Tours"
      faqs={[
        {
          q: "Are accommodation and food included?",
          a: "Standard packages cover the vehicle + driver only. Some vendors offer fully-bundled packages including hotels and meals — ask in your WhatsApp inquiry.",
        },
        {
          q: "Can we customise the route?",
          a: "Yes. Vendors quote packages as a starting point but adjust freely. If you want to add Murree or a side trip to Bahawalpur, just message and they'll requote.",
        },
        {
          q: "How many people can fit?",
          a: "Sedans seat 4. APV seats 7. Hiace seats 12. Coaster seats 26. Larger group? Most vendors can convoy two vehicles.",
        },
      ]}
    />
  );
}
