import type { Metadata } from "next";
import { Plane } from "lucide-react";
import { UseCasePage } from "@/components/shared/UseCasePage";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Airport Pickup in Pakistan — Fixed-Fare Rides from All Major Airports",
  description:
    "Reliable airport pickup from Lahore, Islamabad, Karachi airports. Driver waits at arrivals with your name. Fixed fares, no surge pricing.",
  alternates: { canonical: "/airport-pickup" },
};

export default function Page() {
  return (
    <UseCasePage
      slug="airport-pickup"
      eyebrow="Use Case"
      title="Airport Pickup"
      subtitle="Fixed-fare pickups from every major Pakistani airport. Driver waits at arrivals with your name, even on delayed flights."
      Icon={Plane}
      image={placeholder({
        width: 800,
        height: 600,
        label: "Airport pickup",
        realUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/PK_Karachi_Airport_asv2020-01.jpg/1280px-PK_Karachi_Airport_asv2020-01.jpg",
        realPath: "/images/use-cases/airport-hero.jpg",
      })}
      imageAlt="Driver waiting at Islamabad airport arrivals"
      body="Airport pickups are the single most common rental in Pakistan. The big advantage over Careem / inDrive is a flat upfront fare, a driver who tracks your flight, and a guarantee they'll be at arrivals (not 'on the way'). Book at least 2 hours before landing for best availability."
      bullets={[
        "Flight-tracking — driver shows up even if you're delayed",
        "Fixed fare quoted upfront, no surge pricing",
        "Driver with name sign at international arrivals",
        "Available from ISB, LHE, KHI, PEW, MUX, LYP, UET, SKZ",
      ]}
      serviceMatch="Airport Pickup"
      faqs={[
        {
          q: "How early should I book an airport pickup?",
          a: "Aim for 4 hours before landing on weekdays, 24 hours during weekends or holidays. Verified vendors confirm within 30 minutes.",
        },
        {
          q: "What if my flight is delayed?",
          a: "The driver tracks your flight. As long as the rental company has your flight number, they wait — usually with no extra charge unless the delay exceeds 2 hours.",
        },
        {
          q: "Can I pay in cash at pickup?",
          a: "Yes, every verified vendor accepts cash. Most also accept JazzCash, Easypaisa, and bank transfer.",
        },
      ]}
    />
  );
}
