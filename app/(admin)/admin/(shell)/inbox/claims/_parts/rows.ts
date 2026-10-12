import type { ClaimRow } from "@/lib/admin/repo/claims";

/**
 * Pure helpers for the claim change rows (safe in server and client parts).
 * ClaimRow comes from lib/admin/repo/claims (type only).
 */

export type { ClaimRow };

/** Display order: contact details, cars, services, website, about, logo, status. */
function rank(key: string): number {
  if (key.startsWith("cars:")) return 10;
  if (key.startsWith("services:")) return 20;
  switch (key) {
    case "name":
      return 0;
    case "city":
      return 1;
    case "area":
      return 2;
    case "whatsapp":
      return 3;
    case "phone":
      return 4;
    case "phone2":
      return 5;
    case "website":
      return 30;
    case "about":
      return 31;
    case "logoUrl":
      return 32;
    case "status":
      return 40;
    default:
      return 50;
  }
}

/** Stable sort into the order the design shows them. */
export function sortRows(rows: ClaimRow[]): ClaimRow[] {
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank(a.r.key) - rank(b.r.key) || a.i - b.i)
    .map((x) => x.r);
}

/** "Honda Civic" → "Civic", "Toyota Land Cruiser" → "Land Cruiser". */
export function shortCar(name: string): string {
  const w = name.trim().split(/\s+/);
  return w.length > 1 ? w.slice(1).join(" ") : name.trim();
}

const priceOf = (t: string | null) => (t ?? "").match(/PKR\s?[\d,]+/)?.[0] ?? "";

/** True when a changed car row changes the price (not only the driver option). */
export function carPriceChanged(r: ClaimRow): boolean {
  return priceOf(r.oldText) !== priceOf(r.newText);
}

/** One short phrase per change, for the verification message. */
function phrase(r: ClaimRow): string {
  const k = r.key;
  if (k.startsWith("cars:~")) return `${shortCar(r.field)} ${carPriceChanged(r) ? "price" : "details"}`;
  if (k.startsWith("cars:+")) return `adds ${shortCar(r.field)}`;
  if (k.startsWith("cars:-")) return `removes ${shortCar(r.field)}`;
  if (k.startsWith("services:+")) return `adds ${r.field}`;
  if (k.startsWith("services:-")) return `removes ${r.field}`;
  switch (k) {
    case "name":
      return "new name";
    case "city":
      return "new city";
    case "area":
      return "new area";
    case "whatsapp":
      return r.kind === "removed" ? "removes the WhatsApp number" : "new WhatsApp number";
    case "phone":
      return r.kind === "removed" ? "removes the phone number" : "new phone number";
    case "phone2":
      return r.kind === "removed" ? "removes the second phone" : r.kind === "added" ? "adds a second phone" : "new second phone";
    case "website":
      return r.kind === "added" ? "adds a website" : r.kind === "removed" ? "removes the website" : "new website";
    case "about":
      return "new description";
    case "logoUrl":
      return !r.newText ? "removes the logo" : r.oldText ? "new logo" : "adds a logo";
    case "status":
      return "closing the listing";
    default:
      return `new ${r.field.toLowerCase()}`;
  }
}

/** "new phone number, Civic price, adds Fortuner" — the first three changes. */
export function changeSummary(rows: ClaimRow[], max = 3): string {
  return rows.slice(0, max).map(phrase).join(", ");
}

/** The small line under the field name ("Price changed", "Car added", "Words marked"). */
export function rowSub(r: ClaimRow): string | undefined {
  const k = r.key;
  if (k.startsWith("cars:~")) return carPriceChanged(r) ? "Price changed" : "Changed";
  if (k.startsWith("cars:+")) return "Car added";
  if (k.startsWith("cars:-")) return "Car removed";
  if (k.startsWith("services:+")) return "Service added";
  if (k.startsWith("services:-")) return "Service removed";
  if (r.kind === "text") return "Words marked";
  if (r.kind === "logo") return undefined;
  if (r.kind === "added") return "Added";
  if (r.kind === "removed") return "Removed";
  return "Changed";
}

/** Does the claim change a contact number (verify on the OLD one)? */
export function changesContact(rows: ClaimRow[]): boolean {
  return rows.some((r) => r.key === "whatsapp" || r.key === "phone");
}

export const ROLE_LABEL = { owner: "Owner", staff: "Works here" } as const;

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** The message to the number already on the listing. */
export function verifyMessage(claimant: string, listing: string, summary: string): string {
  return `Assalam o Alaikum, this is RentalSawari. ${claimant} has asked to update the ${listing} listing${
    summary ? ` (${summary})` : ""
  }. Was this you or your team? Please reply YES or NO.`;
}

/** The message to the claimant once the changes are live. */
export function liveMessage(claimant: string, listing: string): string {
  return `Assalam o Alaikum ${firstName(claimant)}, your changes to ${listing} are now live on RentalSawari. — RentalSawari`;
}
