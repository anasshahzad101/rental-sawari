import "server-only";
import nodemailer from "nodemailer";

/**
 * A short email to the owner when something lands in the admin inbox (a new
 * listing request, claim or problem report). Best effort: the item is
 * already saved before this runs, and a missing or broken SMTP setup only
 * means no email — never a failed form. Uses the same SMTP settings as
 * app/api/lead/route.ts.
 */
export function notifyOwner(subject: string, lines: string[], path: string): void {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return;
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const to = process.env.LEAD_TO_EMAIL || "hello@rentalsawari.com";
  const fromName = process.env.LEAD_FROM_NAME || "RentalSawari Website";
  const base = process.env.SITE_URL || "https://rentalsawari.com";
  const text = [...lines, "", `Open it: ${base}${path}`].join("\n");

  nodemailer
    .createTransport({ host, port, secure: port === 465, auth: { user, pass } })
    .sendMail({ from: `"${fromName}" <${user}>`, to, subject, text })
    .catch((err) => console.error("[notify] send failed:", err));
}
