import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { PopularCities } from "@/components/home/PopularCities";
import { CarTypes } from "@/components/home/CarTypes";
import { WhyUs } from "@/components/home/WhyUs";
import { FeaturedRentals } from "@/components/home/FeaturedRentals";
import { UseCases } from "@/components/home/UseCases";
import { PopularGuides } from "@/components/home/PopularGuides";
import { ForTourists } from "@/components/home/ForTourists";
import { ForBusinesses } from "@/components/home/ForBusinesses";
import { FAQSection } from "@/components/shared/FAQSection";
import { homepageFAQs } from "@/data/faqs";
import { business } from "@/lib/business";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RentalSawari Pakistan",
  url: "https://rentalsawari.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://rentalsawari.com/search?city={city}&car={car}",
    },
    "query-input": [
      "required name=city",
      "required name=car",
    ],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://rentalsawari.com/#organization",
  name: "RentalSawari Pakistan",
  alternateName: "RentalSawari",
  url: "https://rentalsawari.com",
  logo: {
    "@type": "ImageObject",
    url: "https://rentalsawari.com/logo-mark.png",
    width: 256,
    height: 256,
  },
  description:
    "Directory of 1,400+ verified rent-a-car companies across 21 Pakistani cities. Real prices, direct WhatsApp contact, no booking fees.",
  foundingDate: "2026",
  areaServed: { "@type": "Country", name: "Pakistan" },
  knowsAbout: [
    "car rental Pakistan",
    "rent a car Lahore",
    "rent a car Islamabad",
    "rent a car Karachi",
    "wedding car rental",
    "airport pickup Pakistan",
    "Northern Areas tours",
    "self-drive car rental",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.streetAddress,
    addressLocality: business.address.addressLocality,
    addressRegion: business.address.addressRegion,
    postalCode: business.address.postalCode,
    addressCountry: business.address.addressCountry,
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: business.phoneE164,
    email: business.email,
    areaServed: "PK",
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://www.facebook.com/rentalsawari",
    "https://www.instagram.com/rentalsawari",
    "https://www.linkedin.com/company/rentalsawari",
    "https://x.com/rentalsawari",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <Header />
      <main>
        <Hero />
        <PopularCities />
        <CarTypes />
        <WhyUs />
        <FeaturedRentals />
        <UseCases />
        <PopularGuides />
        <ForTourists />
        <FAQSection
          title="Common questions about RentalSawari"
          subtitle="Everything renters and rental companies ask before signing up."
          items={homepageFAQs}
        />
        <ForBusinesses />
      </main>
      <Footer />
    </>
  );
}
