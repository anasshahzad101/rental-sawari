import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The RentalSawari brand mark — the icon tile from the Canva-designed logo:
 * a teal rounded square with a stylised white "R" drawn as a flowing road,
 * accented by a small orange dash above.
 *
 * Source asset: `/public/logo-mark.png` (cropped from `/public/logo-full.png`
 * by `scripts/cropLogo.mjs`). To refresh the artwork, re-export the Canva
 * design as `public/logo.png` and re-run the script.
 *
 * Sizes:
 *   sm — 24px (favicon-ish)
 *   md — 36px (header default)
 *   lg — 64px (footer / list-your-business hero)
 */

interface BrandMarkProps {
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

const sizeMap = { sm: 24, md: 36, lg: 64 };

export function BrandMark({ size = "md", className }: BrandMarkProps) {
  const px = typeof size === "number" ? size : sizeMap[size];

  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={px}
      height={px}
      priority
      className={cn("shrink-0 select-none", className)}
      style={{ width: px, height: px }}
    />
  );
}
