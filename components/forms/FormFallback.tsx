"use client";

import { AlertTriangle, Mail, MessageCircle } from "lucide-react";
import { business } from "@/lib/business";
import { buildWhatsAppLink } from "@/lib/utils";

/**
 * Shown when /api/lead could not deliver a submission. Never pretend a message
 * was sent — give the visitor the two channels that always work instead.
 */
export function FormFallback({
  error,
  whatsappMessage = "Hi RentalSawari, I tried the website form but it didn't go through. Here's my question:",
  source = "form-fallback",
}: {
  error: string;
  whatsappMessage?: string;
  source?: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"
    >
      <p className="flex items-start gap-2 font-semibold text-stone-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        {error}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={buildWhatsAppLink(business.whatsappNumber, whatsappMessage, {
            source,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-whatsapp px-3 py-2 text-xs font-bold text-white"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp us
        </a>
        <a
          href={`mailto:${business.email}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800"
        >
          <Mail className="h-3.5 w-3.5" />
          {business.email}
        </a>
      </div>
    </div>
  );
}

/** Hidden honeypot + timing pair used by every form. */
export function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
