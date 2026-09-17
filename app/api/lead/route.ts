import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  FIELD_LABELS,
  leadReplyTo,
  leadSubject,
  orderedEntries,
  type LeadFormType,
  type LeadPayload,
} from "@/lib/leads";

/**
 * Single endpoint behind every form on the site (contact, vendor inquiry,
 * list-your-business). Delivers the submission by email to LEAD_TO_EMAIL.
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
 * Without SMTP_USER / SMTP_PASS the route returns 503 and the forms show a
 * fallback telling the visitor to email or WhatsApp directly. It never reports
 * success for a message it did not actually send.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES: LeadFormType[] = ["contact", "inquiry", "list-business"];

const MAX_FIELD_LENGTH = 5000;
const MAX_FIELDS = 30;
/** Forms completed faster than this are almost certainly bots. */
const MIN_ELAPSED_MS = 1500;

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

function buildBodies(payload: LeadPayload, meta: { ip: string; when: string }) {
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
    )}<br/>Received: ${escapeHtml(meta.when)} · IP: ${escapeHtml(meta.ip)}
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
  // bot does not learn anything, but send nothing.
  if (payload.website) {
    return NextResponse.json({ ok: true });
  }
  if (typeof payload.elapsedMs === "number" && payload.elapsedMs < MIN_ELAPSED_MS) {
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

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_TO_EMAIL || "hello@rentalsawari.com";
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const fromName = process.env.LEAD_FROM_NAME || "RentalSawari Website";

  if (!user || !pass) {
    // eslint-disable-next-line no-console
    console.error("[lead] SMTP_USER / SMTP_PASS are not configured");
    return NextResponse.json(
      { error: "Email delivery is not configured yet." },
      { status: 503 },
    );
  }

  const when = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
  const { text, html } = buildBodies(payload, { ip, when });

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
    return NextResponse.json(
      { error: "We could not send your message. Please WhatsApp us instead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
