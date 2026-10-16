"use client";

import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { STAT_INFO, type StatInfoKey } from "@/lib/admin/constants";
import { cx } from "./cx";
import { useIsoLayoutEffect } from "./hooks";
import { Portal } from "./Portal";

export interface TooltipProps {
  /** Card content. */
  content: React.ReactNode;
  /** The trigger's content. */
  children: React.ReactNode;
  /** Classes for the trigger. */
  className?: string;
  /** Extra classes on the trigger while open. */
  openClassName?: string;
  /** Classes for the dark card (padding, type). */
  cardClassName?: string;
  /** Max card width in px (clamped to the viewport). */
  maxWidth?: number;
  /** Accessible name when the trigger has no text. */
  label?: string;
}

interface Pos {
  left: number;
  top: number;
  arrow: number;
  below: boolean;
}

/**
 * Dark tooltip card (#1C1917, radius 10, 6 px arrow). Hover on desktop
 * (mouse), tap on touch, focus with the keyboard. Closes on outside tap and
 * Esc. Rendered in a portal so table and card overflow never clip it.
 */
export function Tooltip({ content, children, className, openClassName, cardClassName, maxWidth = 300, label }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const trigRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerType = useRef<string>("mouse");
  const id = useId();

  const place = React.useCallback(() => {
    const t = trigRef.current?.getBoundingClientRect();
    const c = cardRef.current;
    if (!t || !c) return;
    const cw = c.offsetWidth;
    const ch = c.offsetHeight;
    const vw = window.innerWidth;
    const cx0 = t.left + t.width / 2;
    let left = cx0 - 22;
    left = Math.max(8, Math.min(left, vw - cw - 8));
    let top = t.top - ch - 10;
    let below = false;
    if (top < 8) {
      top = t.bottom + 10;
      below = true;
    }
    const arrow = Math.max(12, Math.min(cx0 - left, cw - 12));
    setPos({ left, top, arrow, below });
  }, []);

  useIsoLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
    const raf = window.requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (trigRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <span
        ref={trigRef}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className={cx("cursor-default outline-none", className, open && openClassName)}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setOpen(false);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pointerType.current === "mouse") setOpen(true);
          else setOpen((o) => !o);
        }}
        onFocus={(e) => {
          let keyboard = false;
          try {
            keyboard = e.currentTarget.matches(":focus-visible");
          } catch {
            keyboard = false;
          }
          if (keyboard) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        {children}
      </span>
      {open ? (
        <Portal>
          <div
            ref={cardRef}
            id={id}
            role="tooltip"
            style={{
              position: "fixed",
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              maxWidth: `min(${maxWidth}px, calc(100vw - 16px))`,
              visibility: pos ? "visible" : "hidden",
            }}
            className={cx(
              "pointer-events-none z-[80] w-max rounded-[10px] bg-ink text-white shadow-[0_8px_24px_-8px_rgba(28,25,23,0.5)]",
              "px-3 py-2 text-[13px]/[18px] font-medium",
              cardClassName,
            )}
          >
            {content}
            <span
              aria-hidden="true"
              style={{ left: (pos?.arrow ?? 20) - 6 }}
              className={cx(
                "absolute size-0 border-x-[6px] border-x-transparent",
                pos?.below ? "bottom-full border-b-[6px] border-b-ink" : "top-full border-t-[6px] border-t-ink",
              )}
            />
          </div>
        </Portal>
      ) : null}
    </>
  );
}

export interface InfoContent {
  title: string;
  body: string;
  aka?: string;
}

export interface InfoTooltipProps {
  /** A key from STAT_INFO (word-for-word ⓘ copy) or custom content. */
  info: StatInfoKey | InfoContent;
  className?: string;
}

/** The ⓘ next to every stat label: 16 px `info` icon, dark definition card (max 340 px). */
export function InfoTooltip({ info, className }: InfoTooltipProps) {
  const c: InfoContent = typeof info === "string" ? (STAT_INFO[info] as InfoContent) : info;
  return (
    <Tooltip
      label={`What does “${c.title}” mean?`}
      maxWidth={340}
      cardClassName="px-3.5 py-2.5"
      className={cx(
        "-m-0.5 inline-grid size-5 flex-none place-items-center rounded-full text-muted transition-colors hover:bg-fill hover:text-ink-2",
        className,
      )}
      openClassName="bg-fill text-ink-2"
      content={
        <>
          <div className="text-[13px]/[18px] font-bold text-white">{c.title}</div>
          <div className="text-[13px]/[18px] font-normal text-line">{c.body}</div>
          {c.aka ? <div className="mt-1 text-[12px]/[16px] font-normal text-[#A8A29E]">{c.aka}</div> : null}
        </>
      }
    >
      <Info size={16} strokeWidth={1.75} aria-hidden="true" />
    </Tooltip>
  );
}
