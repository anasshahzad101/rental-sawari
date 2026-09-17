/**
 * Lead payload shapes shared by the three site forms and the /api/lead route.
 *
 * Every form posts the same envelope: a `formType` discriminator plus a flat
 * `fields` map of what the visitor typed. The API route turns that into an
 * email to the address in LEAD_TO_EMAIL (default hello@rentalsawari.com).
 *
 * Keep the field names here in sync with the `name` attributes in the form
 * components — the email body is generated from whatever keys arrive, so a
 * renamed input shows up under its new label without further changes.
 */

export type LeadFormType = "contact" | "inquiry" | "list-business";

export interface LeadPayload {
  formType: LeadFormType;
  /** Raw form values, keyed by input name. */
  fields: Record<string, string>;
  /** Path the form was submitted from, for context in the email. */
  page?: string;
  /** Anti-spam: hidden input that humans never fill. */
  website?: string;
  /** Anti-spam: ms between form mount and submit. */
  elapsedMs?: number;
}

/** Human labels for the email body. Unknown keys fall back to the raw name. */
export const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  owner: "Owner name",
  company: "Company",
  companyName: "Company",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  subject: "Subject",
  message: "Message",
  pickupDate: "Pickup date",
  days: "Days",
  city: "City",
  area: "Area",
  fleet: "Fleet size",
  services: "Services offered",
};

/** Subject line for each form type. */
export function leadSubject(payload: LeadPayload): string {
  const f = payload.fields;
  switch (payload.formType) {
    case "contact":
      return `Contact form: ${f.subject || "no subject"}`;
    case "inquiry":
      return `Rental inquiry: ${f.companyName || "a vendor"} — ${f.name || "unnamed"}`;
    case "list-business":
      return `New listing application: ${f.company || "unnamed"}${
        f.city ? ` (${f.city})` : ""
      }`;
  }
}

/** Which submitted field, if any, should become the email Reply-To. */
export function leadReplyTo(payload: LeadPayload): string | undefined {
  const email = payload.fields.email?.trim();
  if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return email;
  return undefined;
}

/** Order fields so the important ones lead, then anything else alphabetically. */
const FIELD_ORDER = [
  "name",
  "owner",
  "company",
  "companyName",
  "email",
  "phone",
  "whatsapp",
  "city",
  "area",
  "subject",
  "pickupDate",
  "days",
  "fleet",
  "services",
  "message",
];

export function orderedEntries(
  fields: Record<string, string>,
): Array<[string, string]> {
  const entries = Object.entries(fields).filter(
    ([, v]) => typeof v === "string" && v.trim() !== "",
  );
  return entries.sort(([a], [b]) => {
    const ia = FIELD_ORDER.indexOf(a);
    const ib = FIELD_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}
