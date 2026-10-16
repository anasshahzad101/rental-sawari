"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { Banner } from "@/components/admin/ui/Banner";

/** A reminder on every admin page except the Overview, which has the kill switch itself. */
export function DemoNotice() {
  const path = usePathname();
  if (path === "/admin") return null;
  return (
    <div className="px-4 pt-3 lg:px-8 lg:pt-6">
      <Banner tone="warning" icon={FlaskConical} layout="inline" title="Demo data is on.">
        Stats, listings marked (Demo) and sample inbox items are made up.{" "}
        <Link href="/admin" className="font-semibold text-wait-text underline underline-offset-2 hover:no-underline">
          Delete it on the Overview
        </Link>
      </Banner>
    </div>
  );
}
