"use client";

import * as React from "react";
import { MessageCircle, Phone, Mail } from "lucide-react";
import {
  buildWhatsAppLink,
  DEFAULT_WHATSAPP_MESSAGE,
  cn,
} from "@/lib/utils";

interface MobileStickyCTAProps {
  whatsapp: string;
  phone: string;
  message?: string;
  onInquire?: () => void;
  className?: string;
  /** Optional company context — when present, lead clicks attribute to the vendor. */
  companySlug?: string;
  companyName?: string;
  city?: string;
  area?: string;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
}

/**
 * Fixed bottom action bar for company / listing pages on mobile.
 * Mounted in pages where direct contact is the primary action — not the homepage.
 */
export function MobileStickyCTA({
  whatsapp,
  phone,
  message = DEFAULT_WHATSAPP_MESSAGE,
  onInquire,
  className,
  companySlug,
  companyName,
  city,
  area,
  featured,
  rating,
  reviewCount,
}: MobileStickyCTAProps) {
  const trackingAttrs = companySlug
    ? ({
        "data-company": companySlug,
        "data-company-name": companyName,
        "data-city": city,
        "data-area": area,
        "data-featured": featured ? "true" : "false",
        "data-rating": rating,
        "data-review-count": reviewCount,
      } as Record<string, string | number | undefined>)
    : {};

  return (
    <div
      className={cn(
        "md:hidden fixed inset-x-0 bottom-0 z-40",
        "border-t border-stone-200 bg-white/95 backdrop-blur",
        "px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        "grid grid-cols-3 gap-2",
        className
      )}
    >
      <a
        href={buildWhatsAppLink(whatsapp, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-whatsapp text-white py-2.5 text-xs font-semibold"
        data-track="whatsapp"
        {...trackingAttrs}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        WhatsApp
      </a>
      <a
        href={`tel:${phone}`}
        className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-brand text-white py-2.5 text-xs font-semibold"
        data-track="phone"
        {...trackingAttrs}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        Call
      </a>
      <button
        type="button"
        onClick={onInquire}
        className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-stone-900 text-white py-2.5 text-xs font-semibold"
      >
        <Mail className="h-5 w-5" aria-hidden="true" />
        Inquire
      </button>
    </div>
  );
}
