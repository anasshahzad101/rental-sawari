import * as React from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { cx } from "./cx";
import type { IconComponent } from "./icons";
import { WhatsAppIcon } from "./icons";

export type ButtonVariant =
  | "primary"
  | "success"
  | "secondary"
  | "soft-teal"
  | "soft-green"
  | "soft-amber"
  | "soft-red"
  | "soft-grey"
  | "whatsapp"
  | "destructive"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-800 active:shadow-pressed",
  success: "bg-good-solid text-white hover:bg-good-text active:bg-good-text active:shadow-pressed",
  secondary: "border border-line bg-white text-ink hover:bg-fill active:border-line-strong active:bg-line",
  "soft-teal":
    "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 active:border-brand-400 active:bg-brand-100 active:shadow-[inset_0_2px_4px_rgba(15,118,110,0.2)]",
  "soft-green":
    "border border-good-border bg-good-fill text-good-text hover:bg-[#DCFCE7] active:border-good-solid active:bg-[#DCFCE7] active:shadow-[inset_0_2px_4px_rgba(21,128,61,0.2)]",
  "soft-amber":
    "border border-wait-border bg-wait-fill text-wait-text hover:bg-[#FEF3C7] active:border-wait-solid active:bg-[#FEF3C7] active:shadow-[inset_0_2px_4px_rgba(180,83,9,0.2)]",
  "soft-red":
    "border border-bad-border bg-bad-fill text-bad-text hover:bg-[#FEE2E2] active:border-bad-solid active:bg-[#FEE2E2] active:shadow-[inset_0_2px_4px_rgba(185,28,28,0.2)]",
  "soft-grey": "border border-line bg-fill text-quiet-text hover:bg-line active:border-line-strong active:bg-line",
  whatsapp:
    "bg-whatsapp text-white hover:bg-whatsapp-hover active:bg-whatsapp-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
  destructive: "bg-bad-solid text-white hover:bg-bad-text active:bg-bad-text active:shadow-pressed",
  ghost: "text-ink-2 hover:bg-fill hover:text-ink active:bg-line",
  link: "text-brand-700 hover:text-brand-800 hover:underline",
};

const DISABLED: Record<ButtonVariant, string> = {
  primary: "border border-line bg-fill text-[#A8A29E]",
  success: "border border-line bg-fill text-[#A8A29E]",
  secondary: "border border-line bg-page text-[#A8A29E]",
  "soft-teal": "border border-line bg-fill text-[#A8A29E]",
  "soft-green": "border border-line bg-fill text-[#A8A29E]",
  "soft-amber": "border border-line bg-fill text-[#A8A29E]",
  "soft-red": "border border-line bg-fill text-[#A8A29E]",
  "soft-grey": "border border-line bg-fill text-[#A8A29E]",
  whatsapp: "border border-line bg-fill text-[#A8A29E]",
  destructive: "border border-line bg-fill text-[#A8A29E]",
  ghost: "text-[#A8A29E]",
  link: "text-[#A8A29E]",
};

const SPIN: Record<ButtonVariant, string> = {
  primary: "border-white/35 border-t-white",
  success: "border-white/35 border-t-white",
  destructive: "border-white/35 border-t-white",
  whatsapp: "border-white/40 border-t-white",
  secondary: "border-line border-t-ink",
  ghost: "border-line border-t-ink",
  "soft-teal": "border-brand-200 border-t-brand-700",
  "soft-green": "border-good-border border-t-good-text",
  "soft-amber": "border-wait-border border-t-wait-text",
  "soft-red": "border-bad-border border-t-bad-text",
  "soft-grey": "border-line border-t-quiet-text",
  link: "border-brand-200 border-t-brand-700",
};

const SIZE: Record<ButtonSize, string> = {
  md: "h-12 gap-2 px-4 text-[16px]/[24px] lg:h-10 lg:text-[15px]/[20px]",
  sm: "h-9 gap-1.5 px-3 text-[14px]/[20px]",
  lg: "h-12 gap-2 px-5 text-[16px]/[24px] lg:h-11 lg:text-[15px]/[20px]",
};

const ICON_SIZE: Record<ButtonSize, string> = {
  md: "size-5 lg:size-[18px]",
  sm: "size-4",
  lg: "size-5 lg:size-[18px]",
};

/** 16 px ring spinner (18 on mobile), 2 px, 0.8 s linear. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-block size-[18px] flex-none animate-spin-fast rounded-full border-2 border-line border-t-ink lg:size-4",
        className,
      )}
    />
  );
}

/** The amber "why it's locked" line under a locked button. */
export function LockedReason({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cx("flex items-center gap-1.5 text-[13px]/[18px] font-medium text-wait-text", className)}>
      <ShieldAlert size={16} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
      {children}
    </span>
  );
}

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. The WhatsApp variant gets the WhatsApp glyph by default. */
  icon?: IconComponent | null;
  iconRight?: IconComponent | null;
  loading?: boolean;
  /** Shown next to the spinner while loading ("Saving…"). Falls back to children. */
  loadingText?: React.ReactNode;
  /** Grey, lock icon, not clickable. */
  locked?: boolean;
  /** Amber reason line under a locked button ("Verify ownership first"). */
  lockedReason?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type AnchorExtra = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps | "href"> & {
  href: string;
  disabled?: boolean;
};
type ButtonExtra = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { href?: undefined };

export type ButtonProps = ButtonOwnProps & (AnchorExtra | ButtonExtra);

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = "secondary",
    size = "md",
    icon,
    iconRight,
    loading = false,
    loadingText,
    locked = false,
    lockedReason,
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;

  const disabled = !!(rest as { disabled?: boolean }).disabled;
  const isLink = variant === "link";
  const LeadIcon: IconComponent | null | undefined =
    icon === undefined && variant === "whatsapp" ? WhatsAppIcon : icon;
  const iconCls = cx("flex-none", ICON_SIZE[size]);

  const classes = cx(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-control font-semibold outline-none transition-colors",
    isLink ? "h-auto gap-1.5 px-0 text-[15px]/[20px]" : SIZE[size],
    variant === "whatsapp" && !isLink && size !== "sm" && "px-3.5",
    locked
      ? "cursor-not-allowed border border-line bg-fill text-muted"
      : disabled
        ? cx("cursor-not-allowed", DISABLED[variant])
        : VARIANT[variant],
    loading && "cursor-progress",
    fullWidth && "w-full",
    className,
  );

  const content = loading ? (
    <>
      <Spinner className={cx(SPIN[variant], size === "sm" && "size-4 lg:size-4")} />
      {loadingText ?? children}
    </>
  ) : (
    <>
      {locked ? (
        <Lock className={iconCls} strokeWidth={1.75} aria-hidden="true" />
      ) : LeadIcon ? (
        <LeadIcon className={iconCls} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      {children}
      {!locked && iconRight ? (
        React.createElement(iconRight, { className: iconCls, strokeWidth: 1.75, "aria-hidden": true })
      ) : null}
    </>
  );

  let el: React.ReactElement;
  if ("href" in rest && rest.href !== undefined && !disabled && !locked && !loading) {
    const { href, target, rel, disabled: _d, ...anchorRest } = rest as AnchorExtra;
    void _d;
    el = (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        className={classes}
        {...anchorRest}
      >
        {content}
      </a>
    );
  } else {
    const {
      type = "button",
      onClick,
      href: _h,
      ...buttonRest
    } = rest as ButtonExtra & { href?: string; target?: string; rel?: string };
    void _h;
    const inert = locked || loading;
    const clean = { ...buttonRest } as Record<string, unknown>;
    delete clean.target;
    delete clean.rel;
    el = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        aria-disabled={inert || disabled || undefined}
        aria-busy={loading || undefined}
        onClick={inert ? (e) => e.preventDefault() : onClick}
        {...(clean as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        disabled={disabled}
      >
        {content}
      </button>
    );
  }

  if (locked && lockedReason) {
    return (
      <span className={cx("inline-flex flex-col items-start gap-2", fullWidth && "flex w-full items-stretch")}>
        {el}
        <LockedReason>{lockedReason}</LockedReason>
      </span>
    );
  }
  return el;
});

export type IconButtonVariant = "secondary" | "ghost" | "soft";

const ICON_BTN: Record<IconButtonVariant, string> = {
  secondary: "border border-line bg-white text-ink hover:bg-fill active:bg-line",
  ghost: "text-ink hover:bg-fill active:bg-line",
  soft: "bg-fill text-ink hover:bg-line",
};

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconComponent;
  /** Accessible name (required: there is no visible text). */
  label: string;
  variant?: IconButtonVariant;
  size?: "md" | "sm";
  /** Pressed/open look (bg #F5F5F4). */
  active?: boolean;
  iconSize?: number;
  href?: string;
  target?: string;
}

/** 40 × 40 on desktop, 44 × 44 on mobile. */
export const IconButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, variant = "ghost", size = "md", active, iconSize = 20, className, href, target, type = "button", ...rest },
  ref,
) {
  const classes = cx(
    "inline-grid flex-none place-items-center rounded-control outline-none transition-colors disabled:cursor-not-allowed disabled:text-[#A8A29E]",
    size === "md" ? "size-11 lg:size-10" : "size-9",
    ICON_BTN[variant],
    active && "bg-fill",
    className,
  );
  const inner = <Icon size={iconSize} strokeWidth={1.75} aria-hidden="true" />;
  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={label}
        title={label}
        className={classes}
      >
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={type} aria-label={label} title={label} className={classes} {...rest}>
      {inner}
    </button>
  );
});
