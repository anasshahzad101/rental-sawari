import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import type { IconComponent } from "@/components/admin/ui/icons";
import { WhatsAppIcon } from "@/components/admin/ui/icons";

/**
 * Buttons for the public forms (List your business, Claim, Report).
 * primary  — orange #EA580C → #C2410C, 700 16/24 (the public site's main action)
 * outline  — white, 1.5 px teal border, teal 700 text ("Claim this listing")
 * secondary — white, 1 px #E7E5E4 border, 600 ("Cancel", "Close")
 * whatsapp — #25D366 → #1FAE54 with the WhatsApp glyph
 * back     — text-only "← Back", 600 #44403C
 * Sizes: lg 48 · md 44 · sm 40.
 */

export type PublicButtonVariant = "primary" | "outline" | "secondary" | "whatsapp" | "back";
export type PublicButtonSize = "lg" | "md" | "sm";

const VARIANT: Record<PublicButtonVariant, string> = {
  primary: "bg-accent-600 px-6 font-bold text-white hover:bg-accent-700 active:bg-accent-700",
  outline: "border-[1.5px] border-brand-700 bg-white px-4 font-bold text-brand-700 hover:bg-brand-50 active:bg-brand-50",
  secondary: "border border-line bg-white px-[18px] font-semibold text-ink hover:bg-fill active:bg-line",
  whatsapp: "bg-whatsapp px-[18px] font-bold text-white hover:bg-whatsapp-hover active:bg-whatsapp-hover",
  back: "gap-1.5 px-4 font-semibold text-ink-2 hover:text-ink",
};

const DISABLED: Record<PublicButtonVariant, string> = {
  primary: "bg-fill px-6 font-bold text-[#A8A29E]",
  outline: "border-[1.5px] border-line bg-white px-4 font-bold text-[#A8A29E]",
  secondary: "border border-line bg-page px-[18px] font-semibold text-[#A8A29E]",
  whatsapp: "bg-fill px-[18px] font-bold text-[#A8A29E]",
  back: "gap-1.5 px-4 font-semibold text-[#A8A29E]",
};

const SIZE: Record<PublicButtonSize, string> = {
  lg: "h-12 text-[16px]/[24px]",
  md: "h-11 text-[15px]/[20px]",
  sm: "h-10 text-[15px]/[20px]",
};

const SPIN: Record<PublicButtonVariant, string> = {
  primary: "border-white/35 border-t-white",
  whatsapp: "border-white/40 border-t-white",
  outline: "border-brand-200 border-t-brand-700",
  secondary: "border-line border-t-ink",
  back: "border-line border-t-ink",
};

interface OwnProps {
  variant?: PublicButtonVariant;
  size?: PublicButtonSize;
  /** Leading icon. "whatsapp" gets the glyph and "back" an arrow by default. */
  icon?: IconComponent | null;
  iconRight?: IconComponent | null;
  loading?: boolean;
  loadingText?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type AsLink = OwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof OwnProps | "href"> & { href: string; disabled?: undefined };
type AsButton = OwnProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof OwnProps> & { href?: undefined };

export type PublicButtonProps = AsLink | AsButton;

export function PublicButton(props: PublicButtonProps) {
  const {
    variant = "primary",
    size = "lg",
    icon,
    iconRight,
    loading = false,
    loadingText,
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;
  const disabled = !!(rest as { disabled?: boolean }).disabled;
  const Lead: IconComponent | null | undefined =
    icon !== undefined ? icon : variant === "whatsapp" ? WhatsAppIcon : variant === "back" ? ArrowLeft : undefined;
  const iconSize = variant === "whatsapp" ? 20 : 18;

  const classes = cx(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control outline-none transition-colors",
    SIZE[size],
    disabled ? cx("cursor-not-allowed", DISABLED[variant]) : VARIANT[variant],
    size === "sm" && variant === "outline" && "px-3.5",
    loading && "cursor-progress",
    fullWidth && "w-full",
    className,
  );

  const content = loading ? (
    <>
      <Spinner className={SPIN[variant]} />
      {loadingText ?? children}
    </>
  ) : (
    <>
      {Lead ? <Lead size={iconSize} strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
      {iconRight ? React.createElement(iconRight, { size: 18, strokeWidth: 1.75, "aria-hidden": true }) : null}
    </>
  );

  if (rest.href !== undefined) {
    const { href, target, rel, ...anchorRest } = rest as AsLink;
    if (/^(https?:|mailto:|tel:)/.test(href)) {
      return (
        <a
          href={href}
          target={target}
          rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
          className={classes}
          {...anchorRest}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} target={target} rel={rel} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  const { type = "button", onClick, ...buttonRest } = rest as AsButton;
  return (
    <button
      type={type}
      className={classes}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
