import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders a company's brand mark. Prefers a real logo when one is supplied
 * (and isn't a placehold.co stub); otherwise falls back to initials on a
 * deterministically-coloured tile.
 *
 * Sizes are aligned to the two places it appears today:
 *   - md (48px) inside CompanyCard
 *   - lg (96px) at the top of the company profile page
 */

type Size = "sm" | "md" | "lg";

interface CompanyAvatarProps {
  name: string;
  logoUrl?: string;
  size?: Size;
  className?: string;
}

const sizeMap: Record<Size, { tile: string; text: string; pixels: number }> = {
  sm: { tile: "h-10 w-10", text: "text-sm", pixels: 40 },
  md: { tile: "h-12 w-12", text: "text-base", pixels: 48 },
  lg: { tile: "h-20 w-20 sm:h-24 sm:w-24", text: "text-2xl sm:text-3xl", pixels: 96 },
};

// On-brand palette. Each company hashes deterministically into one slot
// so the same company always renders the same colour across pages.
const palette = [
  { bg: "bg-brand", ring: "ring-brand/20" },
  { bg: "bg-brand-dark", ring: "ring-brand/20" },
  { bg: "bg-accent", ring: "ring-accent/20" },
  { bg: "bg-stone-800", ring: "ring-stone-300" },
  { bg: "bg-emerald-700", ring: "ring-emerald-200" },
  { bg: "bg-indigo-700", ring: "ring-indigo-200" },
  { bg: "bg-rose-700", ring: "ring-rose-200" },
  { bg: "bg-amber-700", ring: "ring-amber-200" },
];

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return "??";
}

function paletteIndexFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % palette.length;
}

function hasRealLogo(logoUrl?: string) {
  if (!logoUrl) return false;
  // Reject the placehold.co stubs we still emit from data files.
  return !logoUrl.includes("placehold.co");
}

export function CompanyAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}: CompanyAvatarProps) {
  const dims = sizeMap[size];

  if (hasRealLogo(logoUrl)) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-stone-200 shadow-sm",
          dims.tile,
          className
        )}
      >
        <Image
          src={logoUrl!}
          alt={`${name} logo`}
          fill
          sizes={`${dims.pixels}px`}
          className="object-cover"
        />
      </div>
    );
  }

  const colour = palette[paletteIndexFor(name)];

  return (
    <span
      aria-label={`${name} logo`}
      role="img"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-extrabold text-white tracking-tight",
        "shadow-sm ring-1",
        colour.bg,
        colour.ring,
        dims.tile,
        dims.text,
        className
      )}
    >
      {initialsFor(name)}
    </span>
  );
}
