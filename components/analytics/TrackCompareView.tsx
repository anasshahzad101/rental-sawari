"use client";

import { useEffect } from "react";
import { trackVendorCompare } from "@/lib/analytics";

interface TrackCompareViewProps {
  vendorA: string;
  vendorB: string;
  city: string;
}

export function TrackCompareView({ vendorA, vendorB, city }: TrackCompareViewProps) {
  useEffect(() => {
    trackVendorCompare(vendorA, vendorB, city);
  }, [vendorA, vendorB, city]);
  return null;
}
