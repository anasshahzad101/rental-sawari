import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 group", className)}
      aria-label="RentalSawari home"
    >
      <BrandMark size="md" className="group-hover:opacity-90 transition-opacity" />
      <span className="flex flex-col leading-none">
        <span className="text-base font-extrabold tracking-tight text-stone-900">
          Rental<span className="text-brand">Sawari</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
          Pakistan
        </span>
      </span>
    </Link>
  );
}
