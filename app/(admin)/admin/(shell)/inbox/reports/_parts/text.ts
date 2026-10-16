import { REPORT_REASON_LABEL } from "@/lib/admin/constants";
import type { ReportReason } from "@/lib/admin/types";

/** WhatsApp copy for the problem-report screen (client-safe). */

const ASK: Record<ReportReason, string> = {
  scam: "Please reply with your office address and a photo of your shop board so we can check.",
  wrong_number: "Please reply to confirm the best number for customers to reach you, so we can check the listing.",
  closed: "Please reply to let us know if you are still taking bookings, so we can check the listing.",
  prices: "Please reply with your current prices so we can check the listing.",
  service: "Please reply with your side of it so we can check.",
  other: "Please reply so we can check it together.",
};

/** To the business: "A visitor reported a problem with your listing "…": {reason}. {ask} — RentalSawari" */
export function businessMessage(name: string, reason: ReportReason): string {
  const what = reason === "other" ? "something on the listing" : REPORT_REASON_LABEL[reason].toLowerCase();
  return `Assalam o Alaikum, this is RentalSawari. A visitor reported a problem with your listing "${name}": ${what}. ${ASK[reason]} — RentalSawari`;
}

/** To the reporter, while the report is open. */
export function reporterMessage(name: string): string {
  return `Assalam o Alaikum, this is RentalSawari. Thank you for reporting a problem with "${name}". We're checking it now and will let you know what we find. — RentalSawari`;
}

/** To the reporter, after it was resolved. */
export function reporterResolvedMessage(name: string, hidden: boolean): string {
  return `Assalam o Alaikum, this is RentalSawari. Thank you for reporting "${name}". We checked it and took action${
    hidden ? ": the listing is no longer on the site" : ""
  }. — RentalSawari`;
}
