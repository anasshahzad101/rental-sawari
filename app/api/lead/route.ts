import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { normalizePhone } from "@/lib/admin/format";
import { getListingBySlug } from "@/lib/admin/repo/listings";
import { createMessage, markEmailed } from "@/lib/admin/repo/messages";
import {
  FIELD_LABELS,
  leadReplyTo,
  leadSubject,
  orderedEntries,
  type LeadFormType,
  type LeadPayload,
} from "@/lib/leads";

/**
 * Endpoint behind the contact form and the "Send inquiry" form on listing
 * pages. Each submission is saved to the admin Inbox (Messages) first, then
 * emailed to LEAD_TO_EMAIL. The visitor sees success when either worked, so a
 * message is never lost to an email problem. ("list-business" is the old
 * email-only listing form; the current one posts to /api/listing-requests.)
 *
 * Configure on the host (Hostinger → deployment settings → Environment
 * Variables). Nothing is hard-coded because the password is a secret and this
 * repository is public:
 *
 *   SMTP_HOST      default smtp.hostinger.com
 *   SMTP_PORT      default 465   (465 = implicit TLS, 587 = STARTTLS)
 *   SMTP_USER      the full mailbox address, e.g. hello@rentalsawari.com
 *   SMTP_PASS      that mailbox's password
 *   LEAD_TO_EMAIL  default hello@rentalsawari.com
 *   LEAD_FROM_NAME default "RentalSawari Website"
 *
 * If it could neither save nor email (no database and no SMTP_USER /
 * SMTP_PASS), the route returns an error and the forms show a fallback telling
 * the visitor to email or WhatsApp directly. It never reports success for a
 * message that went nowhere.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES: LeadFormType[] = ["contact", "inquiry", "list-business"];

const MAX_FIELD_LENGTH = 5000;
const MAX_FIELDS = 30;

// Very small in-memory throttle. Single-instance hosting, so a Map is enough;
// it resets on redeploy, which is acceptable for a contact form.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT_MAX;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SITE = process.env.SITE_URL || "https://rentalsawari.com";

/** Save a contact message or inquiry for the admin Inbox. Returns its id, or null. */
async function saveToInbox(payload: LeadPayload): Promise<number | null> {
  if (payload.formType !== "contact" && payload.formType !== "inquiry") return null;
  try {
    const rest = { ...payload.fields };
    const take = (k: string): string | null => {
      const v = rest[k];
      delete rest[k];
      return v || null;
    };
    const fromPage = /^\/companies\/([^/?#]+)/.exec(payload.page ?? "")?.[1];
    const slug = typeof payload.listing === "string" && payload.listing ? payload.listing : fromPage;
    const listing = payload.formType === "inquiry" && slug ? await getListingBySlug(slug.slice(0, 160)) : null;
    const companyName = take("companyName");
    const phone = take("phone");
    return await createMessage({
      kind: payload.formType,
      listingId: listing?.id ?? null,
      listingName: (companyName ?? listing?.name ?? "").slice(0, 255),
      name: (take("name") ?? "").slice(0, 200),
      phone: phone ? normalizePhone(phone) ?? phone.slice(0, 40) : null,
      email: take("email")?.slice(0, 255) ?? null,
      subject: take("subject")?.slice(0, 255) ?? null,
      body: take("message"),
      details: rest,
      page: (payload.page ?? "").slice(0, 191),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[lead] could not save to the admin Inbox:", err);
    return null;
  }
}

function buildBodies(payload: LeadPayload, meta: { ip: string; when: string; inboxUrl: string | null }) {
  const rows = orderedEntries(payload.fields).map(([key, value]) => ({
    label: FIELD_LABELS[key] ?? key,
    value,
  }));

  const text = [
    ...rows.map((r) => `${r.label}: ${r.value}`),
    "",
    "—",
    `Form: ${payload.formType}`,
    `Page: ${payload.page || "unknown"}`,
    `Received: ${meta.when}`,
    `IP: ${meta.ip}`,
    ...(meta.inboxUrl ? [`In the admin Inbox: ${meta.inboxUrl}`] : []),
  ].join("\n");

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#1c1917">
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
    ${rows
      .map(
        (r) =>
          `<tr><td style="vertical-align:top;color:#57534e;white-space:nowrap"><strong>${escapeHtml(
            r.label,
          )}</strong></td><td style="vertical-align:top">${escapeHtml(
            r.value,
          ).replace(/\n/g, "<br/>")}</td></tr>`,
      )
      .join("")}
  </table>
  <p style="margin-top:18px;color:#78716c;font-size:12px">
    Form: ${escapeHtml(payload.formType)} · Page: ${escapeHtml(
      payload.page || "unknown",
    )}<br/>Received: ${escapeHtml(meta.when)} · IP: ${escapeHtml(meta.ip)}${
      meta.inboxUrl ? `<br/><a href="${escapeHtml(meta.inboxUrl)}">Open in the admin Inbox</a>` : ""
    }
  </p>
</div>`;

  return { text, html };
}

export async function POST(req: Request) {
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload || !VALID_TYPES.includes(payload.formType)) {
    return NextResponse.json({ error: "Unknown form." }, { status: 400 });
  }

  // Honeypot: a hidden input real people never see. Pretend it worked so the
  // bot does not learn anything, but send nothing. (Fill time is not used to
  // drop anything: a quick person would see "sent" and the message be lost.)
  if (payload.website) {
    console.warn(`[lead] dropped a ${payload.formType} submission: honeypot filled`);
    return NextResponse.json({ ok: true });
  }

  const rawFields = payload.fields;
  if (!rawFields || typeof rawFields !== "object") {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawFields).slice(0, MAX_FIELDS)) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) fields[key] = trimmed.slice(0, MAX_FIELD_LENGTH);
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }
  payload.fields = fields;

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again shortly." },
      { status: 429 },
    );
  }

  // Into the admin Inbox first, so it's kept even if the email fails.
  const saved = await saveToInbox(payload);

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_TO_EMAIL || "hello@rentalsawari.com";
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const fromName = process.env.LEAD_FROM_NAME || "RentalSawari Website";

  if (!user || !pass) {
    // eslint-disable-next-line no-console
    console.error("[lead] SMTP_USER / SMTP_PASS are not configured");
    if (saved) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { error: "Email delivery is not configured yet." },
      { status: 503 },
    );
  }

  const when = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
  const inboxUrl = saved ? `${SITE}/admin/inbox/messages?id=${saved}` : null;
  const { text, html } = buildBodies(payload, { ip, when, inboxUrl });

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      // Hostinger only accepts a From that matches the authenticated mailbox.
      from: `"${fromName}" <${user}>`,
      to,
      replyTo: leadReplyTo(payload),
      subject: leadSubject(payload),
      text,
      html,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[lead] send failed:", err);
    if (saved) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { error: "We could not send your message. Please WhatsApp us instead." },
      { status: 502 },
    );
  }

  if (saved) await markEmailed(saved).catch(() => {});
  return NextResponse.json({ ok: true });
}
