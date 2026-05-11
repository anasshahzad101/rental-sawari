/**
 * Shared schema for the RentalSawari Pakistan directory.
 * This is the contract every mock data file follows, and what the eventual
 * database tables will mirror. When the backend lands, swap the imports in
 * `/data/*` for DB queries — components consume these types directly.
 */

export type CarCategory =
  | "Economy"
  | "Sedan"
  | "SUV"
  | "Van"
  | "Luxury"
  | "Coaster";

export type RentalType = "with-driver" | "self-drive";

export interface City {
  slug: string;
  name: string;
  nameUrdu: string;
  listingCount: number;
  startingPrice: number;
  heroImage: string;
  popularAreas: string[];
  /**
   * Optional 600-800 word editorial intro shown on the city's listing page.
   * Provides the "information gain" AEO requires — local context that AI
   * engines reward over thin metadata-only pages.
   */
  context?: {
    intro: string;
    whereToRent: string;
    pricingNotes: string;
    bestFor: string;
  };
}

export interface CarType {
  slug: string;
  name: string;
  category: CarCategory;
  startingPrice: number;
  capacity: number;
  image: string;
  popular: boolean;
  /**
   * Optional Pakistan-context "About this car" copy shown on /cars/[slug].
   * Information-gain content that AI engines can extract.
   */
  context?: {
    summary: string;
    bestFor: string;
    fuelEconomy: string;
    quirks: string;
  };
}

export interface CompanyCar {
  name: string;
  pricePerDay: number;
  withDriver: boolean;
}

export interface Company {
  slug: string;
  name: string;
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  /** Optional — CSV-imported companies don't have a known response SLA. */
  responseTime?: string;
  /**
   * Optional — CSV-imported companies don't ship fleet data. When empty,
   * UI falls back to a "Contact for fleet & pricing" prompt.
   */
  topCars?: CompanyCar[];
  whatsapp: string;
  phone: string;
  /** Optional Google Maps place URL (for cross-reference, never user-visible). */
  googleMapsUrl?: string;
  /** Free-text "About" pulled from the listing source. Optional. */
  about?: string;
  website?: string;
  /**
   * Optional real logo URL. When omitted (or pointing at a placehold.co stub)
   * components render a deterministic initials avatar via CompanyAvatar.
   */
  logo?: string;
  servicesOffered: string[];
}

export interface UseCase {
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  readTime: number;
  publishedDate: string;
  image: string;
  category: string;
}
