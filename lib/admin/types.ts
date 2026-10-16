/**
 * Shared shapes for the admin and the public forms that feed it.
 * Client-safe: no server imports here.
 *
 * Timestamps are ISO strings in UTC ("2026-10-12T06:42:00.000Z").
 * Calendar days are Pakistan-time strings ("2026-10-12").
 */

export type Plan = "free" | "city" | "plus";
export type ListingStatus = "live" | "hidden";
export type CarMode = "driver" | "self";

export interface CarRow {
  name: string;
  pricePerDay: number;
  mode: CarMode;
}

export interface Listing {
  id: number;
  slug: string;
  name: string;
  city: string;
  area: string;
  whatsapp: string;
  phone: string;
  phone2: string | null;
  website: string | null;
  mapsUrl: string | null;
  about: string;
  services: string[];
  cars: CarRow[];
  logoUrl: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  responseTime: string | null;
  plan: Plan;
  planStart: string | null; // YYYY-MM-DD
  planEnd: string | null; // YYYY-MM-DD
  verified: boolean;
  status: ListingStatus;
  hiddenAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Demo data (never shown on the public site; removed by the kill switch). */
  demo?: boolean;
}

/** The fields a person can edit. Everything else is housekeeping. */
export type ListingEditable = Omit<Listing, "id" | "createdAt" | "updatedAt" | "hiddenAt">;

/** Field keys that appear in diffs, history and claims. */
export type ListingField =
  | "name"
  | "city"
  | "area"
  | "whatsapp"
  | "phone"
  | "phone2"
  | "website"
  | "mapsUrl"
  | "about"
  | "services"
  | "cars"
  | "logoUrl"
  | "googleRating"
  | "googleReviews"
  | "plan"
  | "planStart"
  | "planEnd"
  | "verified"
  | "status"
  | "slug";

export interface FieldChange {
  field: ListingField;
  old: unknown;
  new: unknown;
}

export type VersionKind = "import" | "edit" | "claim" | "request" | "restore" | "plan" | "create";

export interface ListingVersion {
  id: number;
  listingId: number;
  createdAt: string;
  kind: VersionKind;
  /** e.g. "Edited by you", "Claim by Bilal Ahmed applied". */
  actor: string;
  /** e.g. "7 of 8 changes · verified by WhatsApp reply". */
  note: string;
  changes: FieldChange[];
  /** The listing after this version. */
  snapshot: ListingEditable;
  /** The listing before this version (null for import/create). Used by Undo. */
  before: ListingEditable | null;
  /** Claim or request id this version came from, if any. */
  refId: number | null;
}

// ── Public form payloads ─────────────────────────────────────────────────

export interface ListingRequestPayload {
  name: string;
  city: string; // one of CITIES, or "" when cityOther is used
  cityOther: string;
  area: string;
  address: string;
  website: string;
  mapsUrl: string;
  ownerName: string;
  whatsapp: string;
  phone: string;
  services: string[];
  cars: CarRow[];
  fleetSize: number | null;
  about: string;
  logoUrl: string | null; // "/media/{id}" once stored
}

export type RequestStatus = "new" | "approved" | "rejected" | "converted";

export interface ListingRequest {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  payload: ListingRequestPayload;
  /** Admin fixes applied over the payload before approval. */
  fixes: Partial<ListingRequestPayload>;
  duplicateOf: number | null; // listing id whose WhatsApp matches
  rejectReason: string | null;
  note: string | null;
  listingId: number | null; // created listing (approved)
  claimId: number | null; // when converted to a claim
  decidedAt: string | null;
  demo?: boolean;
}

export type ClaimRole = "owner" | "staff";
export type ClaimStatus = "waiting" | "verified" | "updated" | "rejected";
export type VerifyMethod = "whatsapp" | "call" | "other";

export interface ClaimVerification {
  status: "none" | "yes" | "no";
  method: VerifyMethod | null;
  note: string | null;
  at: string | null;
}

/** Requested values for the fields the claimant changed (only those). */
export type ClaimChanges = Partial<Pick<
  Listing,
  "name" | "city" | "area" | "whatsapp" | "phone" | "phone2" | "website" | "about" | "services" | "cars" | "logoUrl"
>>;

export interface Claim {
  id: number;
  createdAt: string;
  updatedAt: string;
  listingId: number;
  claimantName: string;
  role: ClaimRole;
  claimantWhatsapp: string;
  message: string | null;
  changes: ClaimChanges;
  closeRequested: boolean;
  verification: ClaimVerification;
  /** Change keys that were applied (see claimChangeRows). */
  appliedKeys: string[];
  status: ClaimStatus;
  flagged: boolean;
  rejectReason: string | null;
  note: string | null;
  decidedAt: string | null;
  requestId: number | null;
  demo?: boolean;
}

export type ReportReason = "wrong_number" | "closed" | "prices" | "service" | "scam" | "other";
export type ReportStatus = "new" | "resolved" | "dismissed";

export interface Report {
  id: number;
  createdAt: string;
  updatedAt: string;
  listingId: number;
  reason: ReportReason;
  details: string | null;
  reporterWhatsapp: string | null;
  status: ReportStatus;
  resolvedNote: string | null;
  resolvedAt: string | null;
  demo?: boolean;
}

/** A contact-form message or a rental inquiry sent from a listing page. */
export type MessageKind = "contact" | "inquiry";
export type MessageStatus = "new" | "done";

export interface SiteMessage {
  id: number;
  createdAt: string;
  updatedAt: string;
  kind: MessageKind;
  /** The listing an inquiry was sent from (null for the contact form). */
  listingId: number | null;
  /** The company name shown on the form, kept in case the listing goes. */
  listingName: string;
  name: string;
  /** "+92…" when it's a valid Pakistani number, otherwise as typed. */
  phone: string | null;
  email: string | null;
  subject: string | null;
  body: string | null;
  /** Everything else the form sent (pickup date, days, city…), by field name. */
  details: Record<string, string>;
  /** The page it was sent from. */
  page: string;
  /** Whether the copy to hello@rentalsawari.com went out. */
  emailed: boolean;
  status: MessageStatus;
  doneAt: string | null;
}

// ── Stats ────────────────────────────────────────────────────────────────

export type SourceKey = "google" | "direct" | "social" | "ai" | "whatsapp" | "bing" | "other";
export type DeviceKey = "phone" | "desktop" | "tablet";
export type ContactMethod = "wa" | "call" | "form";
export type EventKind = "open" | ContactMethod | "web";

export interface Totals {
  shown: number;
  opened: number;
  visitors: number;
  wa: number;
  call: number;
  form: number;
  contacted: number;
  web: number;
}

export interface DailySeries {
  days: string[]; // YYYY-MM-DD, PKT
  shown: number[];
  opened: number[];
  contacted: number[];
  wa: number[];
  call: number[];
  form: number[];
  web: number[];
  visitors: number[];
  /** Same length as days; the matching day in the previous period. */
  prevDays: string[];
  prevOpened: number[];
  prevContacted: number[];
  /** Days before tracking began (hatched on charts). */
  untracked: boolean[];
}

export interface CountRow {
  key: string;
  label: string;
  count: number;
}

export interface RangeInfo {
  key: string;
  label: string; // "Last 30 days"
  start: string;
  end: string;
  days: number;
  text: string; // "13 Sep – 12 Oct 2026"
  shortText: string; // "13 Sep – 12 Oct"
  compare: boolean;
  prevStart: string;
  prevEnd: string;
  prevText: string;
}
