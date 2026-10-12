import * as React from "react";
import { Store } from "lucide-react";
import { cx } from "@/components/admin/ui/cx";
import { PublicButton } from "./PublicButton";

/** Page 13, entry 1 — the side card on a company profile. */
export function ClaimCard({ slug, className }: { slug: string; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-3 rounded-card border border-line bg-page p-5", className)}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 flex-none place-items-center rounded-control bg-brand-50 text-brand-700">
          <Store size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 className="text-[17px]/[24px] font-extrabold text-ink">Is this your business?</h3>
      </div>
      <p className="text-[15px]/[24px] text-ink-2">Claim it to update your details: phone, prices, cars and photos.</p>
      <PublicButton href={`/companies/${slug}/claim`} variant="outline" fullWidth rel="nofollow">
        Claim this listing
      </PublicButton>
    </div>
  );
}
