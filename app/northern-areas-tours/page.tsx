import type { Metadata } from "next";
import { Mountain } from "lucide-react";
import { UseCasePage } from "@/components/shared/UseCasePage";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Northern Areas Tours — Hunza, Skardu, Naran Car Rentals with Driver",
  description:
    "4x4 vehicles with experienced mountain drivers for Hunza, Skardu, Naran-Kaghan. Verified vendors specialising in Karakoram and Gilgit-Baltistan routes.",
  alternates: { canonical: "/northern-areas-tours" },
};

export default function Page() {
  return (
    <UseCasePage
      slug="northern-areas-tours"
      eyebrow="Use Case"
      title="Northern Areas Tours"
      subtitle="Karakoram Highway, Hunza Valley, Skardu, Naran-Kaghan. Experienced mountain drivers with 4x4s built for the terrain."
      Icon={Mountain}
      image={placeholder({
        width: 800,
        height: 600,
        label: "Karakoram Highway",
        realUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Pasu_cones.jpg/1280px-Pasu_cones.jpg",
        realPath: "/images/use-cases/northern-hero.jpg",
      })}
      imageAlt="4x4 on the Karakoram Highway near Hunza"
      body="Driving Pakistan's Northern Areas in a car you've never tested is risky. Verified tour vendors here use Land Cruisers, Prados, and Fortuners specifically maintained for mountain routes — high-altitude tuning, fresh tyres every season, and drivers who've made the run hundreds of times. Most also handle the NOCs required for foreign nationals."
      bullets={[
        "Land Cruiser V8, Prado, Fortuner — proven mountain vehicles",
        "Drivers with 5+ years of Karakoram experience",
        "NOC handling for foreign tourists",
        "Multi-day packages: 4-day Hunza, 7-day Skardu, 10-day grand tour",
      ]}
      serviceMatch="Northern Areas"
      faqs={[
        {
          q: "When is the best time to visit the Northern Areas?",
          a: "May to October. Karakoram Highway is fully open, Hunza is accessible, and weather is stable. Winter trips are possible to Hunza only and require 4x4 with snow chains.",
        },
        {
          q: "Should I drive myself or hire a driver?",
          a: "Always hire a driver. The roads are narrow, weather can change in minutes, and a mountain-experienced driver dramatically reduces risk. Self-drive in the Northern Areas is not recommended.",
        },
        {
          q: "How long does Islamabad to Hunza take?",
          a: "16-18 hours one-way. Most tour packages split this into two days with an overnight stop at Besham or Chilas.",
        },
      ]}
    />
  );
}
