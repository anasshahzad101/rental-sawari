import type { Metadata } from "next";
import { Car } from "lucide-react";
import { UseCasePage } from "@/components/shared/UseCasePage";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Self-Drive Car Rental in Pakistan — Drive Yourself, Clear Terms",
  description:
    "Self-drive car rentals from verified Pakistani vendors. Clear deposit, documents, and km-limit terms upfront. Skip the chauffeur, take the wheel.",
  alternates: { canonical: "/self-drive-rental" },
};

export default function Page() {
  return (
    <UseCasePage
      slug="self-drive-rental"
      eyebrow="Use Case"
      title="Self-Drive Car Rentals"
      subtitle="Drive yourself. Verified vendors offering self-drive with transparent deposits, document requirements, and daily km limits."
      Icon={Car}
      image={placeholder({
        width: 800,
        height: 600,
        label: "Self-drive car",
        realUrl:
          "https://upload.wikimedia.org/wikipedia/commons/b/bc/KKH.png",
        realPath: "/images/use-cases/self-drive-hero.jpg",
      })}
      imageAlt="Self-drive rental car in Karachi"
      body="Self-drive rentals were rare in Pakistan until recently — most companies preferred drivers for safety. That's changed. A growing number of vendors now offer self-drive with clear contracts: refundable deposit, daily km cap, fuel return policy. RentalSawari marks vendors that explicitly offer self-drive so you don't waste WhatsApp messages."
      bullets={[
        "Refundable security deposit (PKR 25,000–100,000 depending on car)",
        "Daily km limit (usually 200–300 km, extra charged per km)",
        "Return with same fuel level or pay the difference",
        "CNIC, license, and one utility bill required",
      ]}
      serviceMatch="Self-Drive"
      faqs={[
        {
          q: "What documents do I need?",
          a: "Valid CNIC, a Pakistani driving license (or IDP for foreigners), and a utility bill showing your address. Some companies also ask for a guarantor's CNIC.",
        },
        {
          q: "Is insurance included?",
          a: "Most self-drive contracts include basic insurance but you're liable for damages up to a cap (often the deposit amount). Read the terms carefully — especially for luxury vehicles.",
        },
        {
          q: "Can I take a self-drive car to the Northern Areas?",
          a: "Most companies don't allow it. The roads are too unpredictable and recovery is expensive. If you need to go north, hire a vehicle with driver instead.",
        },
      ]}
    />
  );
}
