"use client";

import { StackedBar } from "@/components/admin/charts/StackedBar";
import { useIsDesktop } from "@/components/admin/ui/hooks";

/** The per-day WhatsApp / Call / Form columns at the design's heights (180 desktop, 150 mobile). */
export function ContactBars({ days, wa, call, form, className }: { days: string[]; wa: number[]; call: number[]; form: number[]; className?: string }) {
  const desktop = useIsDesktop();
  return <StackedBar days={days} wa={wa} call={call} form={form} height={desktop ? 180 : 150} className={className} />;
}
