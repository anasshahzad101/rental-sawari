import type { CarRow, Plan } from "@/lib/admin/types";
import type { ListingFormInput } from "@/app/(admin)/admin/_actions/listings";
import type { CarRowMarker } from "@/components/admin/ui/CarsRepeater";
import { addDays, addMonths, normalizePhone, pktDay } from "@/lib/admin/format";

/**
 * The Edit / Add listing form: its values, how a field counts as changed,
 * and the words the sticky bar and the error summary use. Client-safe.
 */

export interface FormValues {
  name: string;
  slug: string;
  city: string;
  area: string;
  whatsapp: string;
  phone: string;
  phone2: string;
  website: string;
  mapsUrl: string;
  about: string;
  services: string[];
  cars: CarRow[];
  logo: string | null;
  /** Kept as typed ("4.8"), turned into a number on save. */
  googleRating: string;
  googleReviews: string;
  verified: boolean;
  plan: Plan;
  planStart: string;
  planEnd: string;
  status: "live" | "hidden";
}

export type FormKey = keyof FormValues;

export type SectionKey = "basics" | "contact" | "about" | "services" | "cars" | "logo" | "admin";

export const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: "basics", label: "Basics" },
  { key: "contact", label: "Contact" },
  { key: "about", label: "About" },
  { key: "services", label: "Services" },
  { key: "cars", label: "Cars and prices" },
  { key: "logo", label: "Logo" },
  { key: "admin", label: "Admin only" },
];

/** Form order: the sticky bar lists changes in this order. */
export const FORM_KEYS: FormKey[] = [
  "name",
  "city",
  "area",
  "whatsapp",
  "phone",
  "phone2",
  "website",
  "about",
  "services",
  "cars",
  "logo",
  "mapsUrl",
  "googleRating",
  "googleReviews",
  "verified",
  "plan",
  "planStart",
  "planEnd",
  "status",
  "slug",
];

export const SECTION_OF: Record<FormKey, SectionKey> = {
  name: "basics",
  city: "basics",
  area: "basics",
  whatsapp: "contact",
  phone: "contact",
  phone2: "contact",
  website: "contact",
  about: "about",
  services: "services",
  cars: "cars",
  logo: "logo",
  mapsUrl: "admin",
  googleRating: "admin",
  googleReviews: "admin",
  verified: "admin",
  plan: "admin",
  planStart: "admin",
  planEnd: "admin",
  status: "admin",
  slug: "admin",
};

/** Field names in the sticky bar and the "fields need fixing" summary. */
export const FIELD_NAME: Record<FormKey, string> = {
  name: "Listing name",
  slug: "Page address",
  city: "City",
  area: "Area",
  whatsapp: "WhatsApp number",
  phone: "Phone number",
  phone2: "Second phone",
  website: "Website",
  mapsUrl: "Google Maps link",
  about: "About",
  services: "Services",
  cars: "Cars and prices",
  logo: "Logo",
  googleRating: "Google rating",
  googleReviews: "Review count",
  verified: "Verified",
  plan: "Plan",
  planStart: "Plan starts",
  planEnd: "Plan ends",
  status: "Status",
};

/** `?focus=` keys from the Stats tab (ListingField names) → form keys. */
export function focusKey(k: string | null): FormKey | null {
  if (!k) return null;
  if (k === "logoUrl") return "logo";
  return (FORM_KEYS as string[]).includes(k) ? (k as FormKey) : null;
}

export const EMPTY_INPUT: ListingFormInput = {
  name: "",
  slug: "",
  city: "",
  area: "",
  whatsapp: "",
  phone: "",
  phone2: "",
  website: "",
  mapsUrl: "",
  about: "",
  services: [],
  cars: [],
  logo: null,
  googleRating: null,
  googleReviews: null,
  verified: false,
  plan: "free",
  planStart: null,
  planEnd: null,
  status: "live",
};

export function fromInput(i: ListingFormInput): FormValues {
  return {
    name: i.name ?? "",
    slug: i.slug ?? "",
    city: i.city ?? "",
    area: i.area ?? "",
    whatsapp: i.whatsapp ?? "",
    phone: i.phone ?? "",
    phone2: i.phone2 ?? "",
    website: i.website ?? "",
    mapsUrl: i.mapsUrl ?? "",
    about: i.about ?? "",
    services: [...(i.services ?? [])],
    cars: (i.cars ?? []).map((c) => ({ ...c })),
    logo: i.logo ?? null,
    googleRating: i.googleRating == null ? "" : String(i.googleRating),
    googleReviews: i.googleReviews == null ? "" : String(i.googleReviews),
    verified: !!i.verified,
    plan: i.plan ?? "free",
    planStart: i.planStart ?? "",
    planEnd: i.planEnd ?? "",
    status: i.status === "hidden" ? "hidden" : "live",
  };
}

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/** Rows that say something: an empty row just added isn't a car yet. */
export function realCars(cars: CarRow[]): CarRow[] {
  return cars
    .filter((c) => c.name.trim() || c.pricePerDay > 0)
    .map((c) => ({ name: squash(c.name), pricePerDay: c.pricePerDay || 0, mode: c.mode }));
}

const num = (s: string) => {
  const t = s.replace(/,/g, "").trim();
  return t === "" ? null : Number(t);
};

export function toInput(v: FormValues): ListingFormInput {
  const paid = v.plan !== "free";
  return {
    name: squash(v.name),
    slug: v.slug.trim(),
    city: v.city,
    area: squash(v.area),
    whatsapp: v.whatsapp.trim(),
    phone: v.phone.trim(),
    phone2: v.phone2.trim(),
    website: v.website.trim(),
    mapsUrl: v.mapsUrl.trim(),
    about: v.about,
    services: v.services,
    cars: realCars(v.cars),
    logo: v.logo,
    googleRating: num(v.googleRating),
    googleReviews: num(v.googleReviews),
    verified: v.verified,
    plan: v.plan,
    planStart: paid && v.planStart ? v.planStart : null,
    planEnd: paid && v.planEnd ? v.planEnd : null,
    status: v.status,
  };
}

/** A new paid plan starts today and runs a month (1 Oct → 31 Oct). */
export function defaultPlanDates(): { start: string; end: string } {
  const start = pktDay();
  return { start, end: addDays(addMonths(start, 1), -1) };
}

export function cleanSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-");
}

const finalSlug = (s: string) => cleanSlug(s.trim()).replace(/^-|-$/g, "");
const phoneKey = (s: string) => {
  const t = s.trim();
  return t ? normalizePhone(t) ?? t : "";
};
const numKey = (s: string) => {
  const n = num(s);
  return n == null ? "" : Number.isFinite(n) ? String(n) : s.trim();
};

/** Does field `k` differ between the saved values `a` and the form `b`? */
export function fieldChanged(k: FormKey, a: FormValues, b: FormValues): boolean {
  switch (k) {
    case "whatsapp":
    case "phone":
    case "phone2":
      return phoneKey(a[k]) !== phoneKey(b[k]);
    case "slug":
      return finalSlug(a.slug) !== finalSlug(b.slug) && finalSlug(b.slug) !== "";
    case "services":
      return [...a.services].sort().join("|") !== [...b.services].sort().join("|");
    case "cars":
      return JSON.stringify(realCars(a.cars)) !== JSON.stringify(realCars(b.cars));
    case "googleRating":
    case "googleReviews":
      return numKey(a[k]) !== numKey(b[k]);
    case "planStart":
    case "planEnd":
      // On Free the dates aren't used, so they don't count as changes.
      if (b.plan === "free") return false;
      return a[k] !== b[k];
    case "about":
      return a.about.replace(/[ \t]+/g, " ").trim() !== b.about.replace(/[ \t]+/g, " ").trim();
    case "logo":
    case "verified":
    case "plan":
    case "status":
      return a[k] !== b[k];
    default:
      return squash(String(a[k] ?? "")) !== squash(String(b[k] ?? ""));
  }
}

export function slugChanged(a: FormValues, b: FormValues): boolean {
  return fieldChanged("slug", a, b);
}

// ── Cars ────────────────────────────────────────────────────────────────

export interface CarsDiff {
  /** Same index as the form rows. */
  markers: CarRowMarker[];
  /** Sticky-bar words ("Honda Civic price", "Toyota Fortuner added"). */
  items: string[];
  /** Next to the group title ("1 price changed"). */
  summary: string | null;
}

export function carsDiff(orig: CarRow[], cur: CarRow[]): CarsDiff {
  const o = realCars(orig);
  const key = (s: string) => squash(s).toLowerCase();
  const used = new Set<number>();
  const match: Array<number | null> = cur.map(() => null);

  // 1) Same name.
  cur.forEach((row, i) => {
    if (!row.name.trim()) return;
    const j = o.findIndex((c, jj) => !used.has(jj) && key(c.name) === key(row.name));
    if (j >= 0) {
      used.add(j);
      match[i] = j;
    }
  });
  // 2) A renamed row keeps its place.
  cur.forEach((row, i) => {
    if (match[i] != null || (!row.name.trim() && !row.pricePerDay)) return;
    const j = i < o.length && !used.has(i) && !cur.some((r) => key(r.name) === key(o[i].name)) ? i : -1;
    if (j >= 0) {
      used.add(j);
      match[i] = j;
    }
  });

  const markers: CarRowMarker[] = [];
  const items: string[] = [];
  let price = 0;
  let added = 0;
  let other = 0;
  cur.forEach((row, i) => {
    const j = match[i];
    const label = squash(row.name) || "New car";
    if (j == null) {
      markers.push({ isNew: true });
      if (row.name.trim() || row.pricePerDay) {
        items.push(`${label} added`);
        added++;
      }
      return;
    }
    const was = o[j];
    const m: CarRowMarker = {
      name: key(was.name) !== key(row.name),
      price: was.pricePerDay !== (row.pricePerDay || 0),
      mode: was.mode !== row.mode,
    };
    markers.push(m);
    if (m.name) {
      items.push(`${label} name`);
      other++;
    }
    if (m.price) {
      items.push(`${label} price`);
      price++;
    }
    if (m.mode) {
      items.push(`${label} driver`);
      other++;
    }
  });
  const removed = o.filter((_, j) => !used.has(j));
  for (const c of removed) items.push(`${c.name} removed`);

  // Only the order moved.
  const order = match.filter((j): j is number => j != null);
  if (!items.length && order.some((j, i) => i > 0 && j < order[i - 1])) {
    items.push("Car order");
    other++;
  }

  let summary: string | null = null;
  if (items.length) {
    const parts: string[] = [];
    if (added) parts.push(`${added} ${added === 1 ? "car" : "cars"} added`);
    if (removed.length) parts.push(`${removed.length} removed`);
    if (price) parts.push(`${price} ${price === 1 ? "price" : "prices"} changed`);
    if (other) parts.push(`${other} other ${other === 1 ? "change" : "changes"}`);
    summary = parts.join(" · ");
  }
  return { markers, items, summary };
}

// ── Services ────────────────────────────────────────────────────────────

export function servicesDiff(orig: string[], cur: string[]): { items: string[]; summary: string | null } {
  const added = cur.filter((s) => !orig.includes(s));
  const removed = orig.filter((s) => !cur.includes(s));
  const items = [...added, ...removed.map((s) => `${s} removed`)];
  let summary: string | null = null;
  if (added.length === 1 && !removed.length) summary = `${added[0]} added`;
  else if (removed.length === 1 && !added.length) summary = `${removed[0]} removed`;
  else if (items.length) summary = `${items.length} changes`;
  return { items, summary };
}

// ── The whole form ──────────────────────────────────────────────────────

export interface FormDiff {
  keys: Set<FormKey>;
  sections: Set<SectionKey>;
  /** Sticky-bar list; its length is the "N unsaved changes" count. */
  items: string[];
  cars: CarsDiff;
  services: { items: string[]; summary: string | null };
  logo: string | null;
}

export function formDiff(a: FormValues, b: FormValues): FormDiff {
  const keys = new Set<FormKey>();
  const sections = new Set<SectionKey>();
  const items: string[] = [];
  const cars = carsDiff(a.cars, b.cars);
  const services = servicesDiff(a.services, b.services);
  for (const k of FORM_KEYS) {
    if (!fieldChanged(k, a, b)) continue;
    keys.add(k);
    sections.add(SECTION_OF[k]);
    if (k === "cars") items.push(...cars.items);
    else if (k === "services") items.push(...services.items);
    else items.push(FIELD_NAME[k]);
  }
  const logo = !keys.has("logo") ? null : !a.logo ? "New logo" : !b.logo ? "Removed" : "Replaced";
  return { keys, sections, items, cars, services, logo };
}

/** Checks the server doesn't make (it drops nameless cars, ignores bad counts). */
export function localErrors(v: FormValues): { errors: Record<string, string>; carErrors: Record<number, string> } {
  const errors: Record<string, string> = {};
  const carErrors: Record<number, string> = {};
  v.cars.forEach((c, i) => {
    if (!c.name.trim() && c.pricePerDay > 0) carErrors[i] = "Enter the car name";
  });
  if (Object.keys(carErrors).length) errors.cars = "Give every car a name, or remove the empty row";
  const r = num(v.googleRating);
  if (r != null && (!Number.isFinite(r) || r < 0 || r > 5)) errors.googleRating = "A rating is between 0 and 5";
  const n = num(v.googleReviews);
  if (n != null && (!Number.isInteger(n) || n < 0)) errors.googleReviews = "Enter a whole number, like 212";
  if (v.plan !== "free" && v.planStart && v.planEnd && v.planEnd < v.planStart) errors.planEnd = "The plan must end after it starts";
  return { errors, carErrors };
}
