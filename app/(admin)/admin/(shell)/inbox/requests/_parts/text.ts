import { SITE_HOST } from "@/lib/admin/constants";
import { addDays, fmtDayShort, pktDay } from "@/lib/admin/format";

/** Copy for the listing-request screen (client-safe). */

export function firstName(full: string | null | undefined): string {
  return (full ?? "").trim().split(/\s+/)[0] ?? "";
}

/** "Today" · "Yesterday" · "8 Oct" — the date on Done / Rejected cards. */
export function shortDay(iso: string | null | undefined): string {
  if (!iso) return "";
  const today = pktDay();
  const d = pktDay(iso);
  if (d === today) return "Today";
  if (d === addDays(today, -1)) return "Yesterday";
  return fmtDayShort(d);
}

/** "rentalsawari.com/companies/ravi-rent-a-car" */
export function publicPath(slug: string): string {
  return `${SITE_HOST}/companies/${slug}`;
}

/** Reject reason as it reads after "Rejected · " on a card. */
export function rejectedLabel(reason: string | null | undefined): string {
  if (!reason || reason === "Other") return "Rejected";
  return `Rejected · ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`;
}

const REASON_SENTENCE: Record<string, string> = {
  Duplicate: "the business is already listed on the site",
  "Not a rental company": "it doesn't look like a car rental business",
  "Can't reach them": "we couldn't reach you on this number",
};

export interface Template {
  key: "received" | "live" | "rejected";
  title: string;
  message: string;
  /** Shown in the menu instead of the message (the reject one before a reason exists). */
  hint?: string;
}

/** The three messages in "WhatsApp the applicant ▾". */
export function applicantTemplates(o: { owner: string; name: string; slug: string; rejectReason: string | null }): Template[] {
  const first = firstName(o.owner);
  const hello = first ? `Assalam o Alaikum ${first}` : "Assalam o Alaikum";
  const why = o.rejectReason ? REASON_SENTENCE[o.rejectReason] : undefined;
  return [
    {
      key: "received",
      title: "Received, we'll check it",
      message: `${hello}, thank you for listing ${o.name} on RentalSawari. We've received your details and will check them today.`,
    },
    {
      key: "live",
      title: "Your listing is live",
      message: `Good news! ${o.name} is now live on RentalSawari: ${publicPath(o.slug)}`,
    },
    {
      key: "rejected",
      title: "We couldn't approve it",
      message: `${hello}, thank you for sending ${o.name} to RentalSawari. We couldn't approve the listing${
        why ? ` because ${why}` : ""
      }. Reply here if anything should change. — RentalSawari`,
      hint: o.rejectReason ? undefined : "Includes the reason you pick when rejecting.",
    },
  ];
}

/** The "Tell Usman it's live" message after approving. */
export function liveMessage(name: string, slug: string): string {
  return `Good news! ${name} is now live on RentalSawari: ${publicPath(slug)}. Customers can WhatsApp or call you directly. — RentalSawari`;
}

/** "ravirentacar.pk" from "https://ravirentacar.pk/". */
export function bareUrl(u: string | null | undefined): string {
  return (u ?? "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
