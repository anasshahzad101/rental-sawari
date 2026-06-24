import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/**
 * Convert a city display name to its URL slug.
 * "Rahim Yar Khan" → "rahim-yar-khan", "Lahore" → "lahore".
 * City pages live at `/rent-a-car-{slug}`, so any link built from a raw
 * `company.city` / `a.city` name MUST go through this — a bare `.toLowerCase()`
 * leaves spaces in multi-word cities and produces a broken (404) link.
 */
export function citySlug(cityName: string) {
  return cityName.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Build a pre-filled WhatsApp link with a referral footer so vendors know
 * the lead came from RentalSawari. The footer also doubles as our internal
 * tracking: any incoming WhatsApp message a vendor screenshots to support
 * will carry the source.
 */
export function buildWhatsAppLink(
  phone: string,
  message: string,
  options?: { source?: string; companySlug?: string },
) {
  const normalized = phone.replace(/[^\d]/g, "");
  const ref = options?.source ?? "directory";
  const sourceTag = options?.companySlug ? `${ref}/${options.companySlug}` : ref;
  const fullMessage = `${message}\n\n— sent via rentalsawari.com (ref: ${sourceTag})`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(fullMessage)}`;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi, I saw your listing on RentalSawari and I'm interested in renting a car. Could you share availability and your best per-day rate?";
