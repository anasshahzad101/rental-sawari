import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/**
 * Build a pre-filled WhatsApp link. The phone number should include the
 * country code with a leading "+" (e.g. "+923001234567"). wa.me requires the
 * "+" stripped, so we normalize here.
 */
export function buildWhatsAppLink(phone: string, message: string) {
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi, I saw your listing on RentalSawari Pakistan. I'm interested in renting a car.";
