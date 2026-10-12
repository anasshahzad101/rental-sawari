"use client";

import { useEffect } from "react";
import { trackVendorView } from "@/lib/analytics";
import { trackOpen } from "@/lib/track";

/**
 * Fires a `vendor_view` event after the visitor stays on a company profile
 * for ≥3 seconds. The delay filters out pogo-stick visits (back button
 * within 1-2s) so reported views correlate to actual interest.
 */

interface TrackVendorViewProps {
  companySlug: string;
  city: string;
}

export function TrackVendorView({ companySlug, city }: TrackVendorViewProps) {
  useEffect(() => {
    // Admin stats count the open straight away (lib/track.ts dedupes refreshes).
    trackOpen(companySlug);
    const referrer =
      typeof document !== "undefined" && document.referrer
        ? new URL(document.referrer).pathname
        : "(direct)";
    const t = setTimeout(() => {
      trackVendorView(companySlug, city, referrer);
    }, 3000);
    return () => clearTimeout(t);
  }, [companySlug, city]);

  return null;
}
