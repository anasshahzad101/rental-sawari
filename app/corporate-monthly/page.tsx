import type { Metadata } from "next";
import { Briefcase } from "lucide-react";
import { UseCasePage } from "@/components/shared/UseCasePage";
import { placeholder } from "@/lib/placeholder";

export const metadata: Metadata = {
  title: "Corporate Monthly Car Rental in Pakistan — Long-Term Fleet for Businesses",
  description:
    "Monthly and quarterly car rentals for Pakistani businesses. Dedicated drivers, invoiced billing, fleet options. Verified vendors with corporate experience.",
  alternates: { canonical: "/corporate-monthly" },
};

export default function Page() {
  return (
    <UseCasePage
      slug="corporate-monthly"
      eyebrow="Use Case"
      title="Corporate Monthly Rentals"
      subtitle="Long-term car rentals for businesses. Invoiced billing, dedicated drivers, fleet options for visiting executives or daily operations."
      Icon={Briefcase}
      image={placeholder({
        width: 800,
        height: 600,
        label: "Corporate fleet",
        realUrl:
          "https://upload.wikimedia.org/wikipedia/commons/b/b1/First_Mega_Mall_of_Islamabad_-_Centaurus.JPG",
        realPath: "/images/use-cases/corporate-hero.jpg",
      })}
      imageAlt="Corporate sedan with chauffeur in Islamabad"
      body="Pakistani companies often need a car for a visiting consultant, a project for 3 months, or to assign to a senior employee without the overhead of fleet ownership. Verified RentalSawari vendors offer invoiced monthly rates 15-30% below daily-rate equivalents, with the same driver allocated for continuity."
      bullets={[
        "Invoiced monthly billing, tax-deductible",
        "Same dedicated driver for the contract duration",
        "Vehicles serviced and rotated by the vendor",
        "Custom packages: 1, 3, 6, 12-month commitments",
      ]}
      serviceMatch="Corporate Monthly"
      faqs={[
        {
          q: "How much cheaper is monthly vs daily?",
          a: "Typically 15-30%. A Corolla at PKR 6,500/day becomes ~PKR 130,000/month (vs ~PKR 195,000 if you paid daily). SUVs save proportionally more.",
        },
        {
          q: "What's included?",
          a: "Fuel is usually not included — that's a per-km or per-month allowance you agree separately. Maintenance, insurance, and driver salary are all on the vendor.",
        },
        {
          q: "Can we get an invoice in our company name?",
          a: "Yes — all verified vendors issue GST-compliant invoices for corporate clients.",
        },
      ]}
    />
  );
}
