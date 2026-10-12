"use client";

import * as React from "react";
import { cloneElement, createContext, useCallback, useContext, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cx } from "./cx";
import { useAnchorPosition, useEscape, useIsDesktop, useOutsidePointer } from "./hooks";
import type { IconComponent } from "./icons";
import { Sheet } from "./Modal";
import { Portal } from "./Portal";

interface PopoverCtx {
  close: () => void;
}

const PopoverContext = createContext<PopoverCtx | null>(null);

/** Inside a Popover or Menu: `usePopover()?.close()`. */
export function usePopover(): PopoverCtx | null {
  return useContext(PopoverContext);
}

export interface PopoverProps {
  /** The element that opens it (gets onClick + aria-expanded). */
  trigger: React.ReactElement;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end";
  side?: "bottom" | "top";
  offset?: number;
  /** Panel classes (width, padding). Defaults: radius 16, popover shadow, padding 6. */
  className?: string;
  /** Wrapper around the trigger. */
  triggerClassName?: string;
  "aria-label"?: string;
}

/** Anchored panel (radius 16, popover shadow). Closes on outside click and Esc. */
export function Popover({
  trigger,
  children,
  open: openProp,
  onOpenChange,
  align = "start",
  side = "bottom",
  offset = 8,
  className,
  triggerClassName,
  ...rest
}: PopoverProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = useCallback(
    (o: boolean) => {
      if (openProp === undefined) setOpenState(o);
      onOpenChange?.(o);
    },
    [openProp, onOpenChange],
  );
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useAnchorPosition(open, anchorRef, panelRef, { align, offset, side });
  const close = useCallback(() => setOpen(false), [setOpen]);

  useOutsidePointer([anchorRef, panelRef], close, open);
  useEscape(open, () => {
    close();
    (anchorRef.current?.querySelector("button,a,[tabindex]") as HTMLElement | null)?.focus();
  });

  const t = trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  const triggerEl = cloneElement(t, {
    onClick: (e: React.MouseEvent) => {
      t.props.onClick?.(e);
      if (!e.defaultPrevented) setOpen(!open);
    },
    "aria-expanded": open,
    "aria-haspopup": "true",
  } as Record<string, unknown>);

  return (
    <>
      <span ref={anchorRef} className={cx("inline-flex", triggerClassName)}>
        {triggerEl}
      </span>
      {open ? (
        <Portal>
          <div
            ref={panelRef}
            role="dialog"
            aria-label={rest["aria-label"]}
            style={{ position: "fixed", top: pos.top, left: pos.left, visibility: pos.ready ? "visible" : "hidden" }}
            className={cx("z-[65] animate-pop-in rounded-card border border-line bg-white p-1.5 shadow-pop", className)}
          >
            <PopoverContext.Provider value={{ close }}>{typeof children === "function" ? children(close) : children}</PopoverContext.Provider>
          </div>
        </Portal>
      ) : null}
    </>
  );
}

export interface MenuItem {
  key?: string;
  label: React.ReactNode;
  icon?: IconComponent;
  onSelect?: () => void;
  href?: string;
  /** Opens in a new tab and shows ↗. */
  external?: boolean;
  tone?: "danger";
  disabled?: boolean;
  /** Right-aligned 13 px muted text ("Free only"). */
  hint?: React.ReactNode;
  /** Renders the row as a submit button inside `<form action={formAction}>` (e.g. Log out). */
  formAction?: (formData: FormData) => void | Promise<void>;
}

export interface MenuDivider {
  key?: string;
  divider: true;
}

export type MenuEntry = MenuItem | MenuDivider;

function isDivider(e: MenuEntry): e is MenuDivider {
  return (e as MenuDivider).divider === true;
}

export interface MenuListProps {
  items: MenuEntry[];
  /** md: 40 px rows, 15 px · lg: 48 px rows, 16 px · auto (default): lg on mobile, md on desktop. */
  size?: "md" | "lg" | "auto";
  /** Called after any item runs (closes the surrounding popover/sheet). */
  onDone?: () => void;
  className?: string;
}

/** The rows of a menu. Inside a Popover it closes it after a pick. */
export function MenuList({ items, size = "auto", onDone, className }: MenuListProps) {
  const ctx = usePopover();
  const done = () => {
    onDone?.();
    ctx?.close();
  };
  return (
    <div role="menu" className={cx("flex flex-col", className)}>
      {items.map((it, i) => {
        if (isDivider(it)) return <div key={it.key ?? `d${i}`} role="separator" className="mx-2 my-1 h-px bg-line" />;
        const Icon = it.icon;
        const danger = it.tone === "danger";
        const cls = cx(
          "flex w-full items-center gap-3 rounded-[10px] px-3 text-left font-medium outline-none transition-colors focus-visible:bg-fill",
          size === "lg"
            ? "h-12 text-[16px]/[24px]"
            : size === "md"
              ? "h-10 text-[15px]/[20px]"
              : "h-12 text-[16px]/[24px] lg:h-10 lg:text-[15px]/[20px]",
          it.disabled ? "cursor-not-allowed text-[#A8A29E]" : danger ? "text-bad-text hover:bg-bad-fill" : "text-ink hover:bg-fill",
        );
        const inner = (
          <>
            {Icon ? (
              <Icon
                size={20}
                strokeWidth={1.75}
                aria-hidden="true"
                className={cx("flex-none", it.disabled ? "text-[#A8A29E]" : danger ? "text-bad-text" : "text-ink-2")}
              />
            ) : null}
            <span className="min-w-0 flex-1 truncate">{it.label}</span>
            {it.hint ? <span className="flex-none text-[13px]/[18px] font-medium text-muted">{it.hint}</span> : null}
            {it.external ? <ArrowUpRight size={16} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" /> : null}
          </>
        );
        const key = it.key ?? `i${i}`;
        if (it.formAction && !it.disabled) {
          return (
            <form key={key} action={it.formAction} className="contents">
              <button type="submit" role="menuitem" className={cls}>
                {inner}
              </button>
            </form>
          );
        }
        if (it.href && !it.disabled) {
          return (
            <a
              key={key}
              role="menuitem"
              href={it.href}
              target={it.external ? "_blank" : undefined}
              rel={it.external ? "noopener noreferrer" : undefined}
              className={cls}
              onClick={() => {
                it.onSelect?.();
                done();
              }}
            >
              {inner}
            </a>
          );
        }
        return (
          <button
            key={key}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            aria-disabled={it.disabled || undefined}
            className={cls}
            onClick={() => {
              it.onSelect?.();
              done();
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export interface MenuProps {
  items: MenuEntry[];
  trigger: React.ReactElement;
  align?: "start" | "end";
  /** Mobile: a bottom sheet with 48 px rows (default) or a dropdown with 48 px rows. */
  mobile?: "sheet" | "popover";
  /** Sheet title on mobile. */
  title?: React.ReactNode;
  /** Panel width on desktop (px). */
  width?: number;
  className?: string;
}

/** ⋯ menus: a popover on desktop, a bottom sheet on mobile. */
export function Menu({ items, trigger, align = "end", mobile = "sheet", title, width = 236, className }: MenuProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const asSheet = !isDesktop && mobile === "sheet";

  if (asSheet) {
    const t = trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    return (
      <>
        <span className="inline-flex">
          {cloneElement(t, {
            onClick: (e: React.MouseEvent) => {
              t.props.onClick?.(e);
              if (!e.defaultPrevented) setOpen(true);
            },
            "aria-expanded": open,
            "aria-haspopup": "true",
          } as Record<string, unknown>)}
        </span>
        <Sheet open={open} onClose={() => setOpen(false)} title={title} aria-label={typeof title === "string" ? title : "Menu"}>
          <MenuList items={items} size="lg" onDone={() => setOpen(false)} className="pb-2" />
        </Sheet>
      </>
    );
  }

  return (
    <Popover trigger={trigger} align={align} open={open} onOpenChange={setOpen} className={className}>
      <div style={{ width }} className="max-w-[calc(100vw-32px)]">
        <MenuList items={items} size={isDesktop ? "md" : "lg"} />
      </div>
    </Popover>
  );
}
