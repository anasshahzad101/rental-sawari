import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { UseCasePage } from "@/components/shared/UseCasePage";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Wedding Car Rental in Pakistan — Decorated Cars for Baraat",
  description:
    "Rent decorated Mercedes, Civics, and Land Cruisers for your baraat. Verified wedding vendors across Pakistan with photo proof and clear pricing.",
  alternates: { canonical: "/wedding-car-rental" },
};

export default function Page() {
  return (
    <UseCasePage
      slug="wedding-car-rental"
      eyebrow="Use Case"
      title="Wedding Car Rental"
      subtitle="Decorated cars for baraat, walima, and rukhsati — booked direct from verified vendors with no commission."
      Icon={Heart}
      image={placeholder({
        width: 800,
        height: 600,
        label: "Wedding car",
        realUrl:
          "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pakistani_weddings_Rituals.jpg",
        realPath: "/images/use-cases/wedding-hero.jpg",
      })}
      imageAlt="Decorated wedding car in Lahore"
      body="Wedding rentals in Pakistan are usually booked 2-4 weeks in advance for popular dates. RentalSawari-verified vendors share decoration photos before you commit, list clear per-hour or per-day rates, and confirm the exact car model — no last-minute substitutions."
      bullets={[
        "Decorated Mercedes, Civics, Corollas, Land Cruisers — your pick",
        "Per-event or per-day rates with chauffeur included",
        "Photo confirmation of the decoration before pickup",
        "Multi-car convoys for baraat available",
      ]}
      serviceMatch="Wedding"
      faqs={[
        {
          q: "How early should I book a wedding car?",
          a: "Book 3-4 weeks before the wedding for popular models. Decorated Mercedes get reserved earliest. Last-minute weekday bookings are usually possible.",
        },
        {
          q: "Is the decoration included?",
          a: "Most wedding rentals include basic floral decoration. Premium decorations (full flower coverage, branded ribbons) cost PKR 3,000–8,000 extra. Confirm in WhatsApp before booking.",
        },
        {
          q: "Can I rent multiple cars for the baraat?",
          a: "Yes. Many vendors offer convoy packages — 3 to 10 cars with coordinated decoration. Mention your needs in the inquiry.",
        },
      ]}
    />
  );
}
