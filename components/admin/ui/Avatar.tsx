import * as React from "react";
import { initials } from "@/lib/admin/format";
import { cx } from "./cx";

export type AvatarSize = 32 | 40 | 44 | 48 | 56 | 64;

const SIZE: Record<AvatarSize, string> = {
  32: "size-8 rounded-[10px] text-[12px]",
  40: "size-10 rounded-control text-[14px]",
  44: "size-11 rounded-control text-[15px]",
  48: "size-12 rounded-control text-[15px]",
  56: "size-14 rounded-[14px] text-[19px]",
  64: "size-16 rounded-control text-[20px]",
};

export interface AvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: AvatarSize;
  /** 2 px green ring (the new logo in a diff). */
  highlight?: boolean;
  className?: string;
}

/** The logo if there is one, otherwise two initials in #0F766E 700 on #F0FDFA. */
export function Avatar({ name, logoUrl, size = 40, highlight, className }: AvatarProps) {
  return (
    <span
      className={cx(
        "grid flex-none select-none place-items-center overflow-hidden font-bold leading-none",
        SIZE[size],
        logoUrl ? "border border-line bg-white" : "bg-brand-50 text-brand-700",
        highlight && "border-2 border-good-solid",
        className,
      )}
      aria-hidden={logoUrl ? undefined : true}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={`${name} logo`} className="size-full object-cover" loading="lazy" />
      ) : (
        initials(name) || "?"
      )}
    </span>
  );
}
