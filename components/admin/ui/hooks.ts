"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Desktop is ≥1024 px (Tailwind `lg:`). */
export const DESKTOP_QUERY = "(min-width: 1024px)";

export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/** True at ≥1024 px. Starts true so server HTML matches the desktop tree. */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY, true);
}

/** Calls `handler` on Escape while `active`. */
export function useEscape(active: boolean, handler: () => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") ref.current();
    };
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, [active]);
}

/** Calls `handler` when a pointer goes down outside every ref'd element. */
export function useOutsidePointer(
  refs: Array<React.RefObject<HTMLElement | null>>,
  handler: () => void,
  active: boolean,
) {
  const ref = useRef(handler);
  ref.current = handler;
  const refsRef = useRef(refs);
  refsRef.current = refs;
  useEffect(() => {
    if (!active) return;
    const on = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (refsRef.current.some((r) => r.current && r.current.contains(t))) return;
      ref.current();
    };
    document.addEventListener("pointerdown", on);
    return () => document.removeEventListener("pointerdown", on);
  }, [active]);
}

let scrollLocks = 0;
let prevOverflow = "";

/** Locks page scroll while any overlay is open. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (scrollLocks++ === 0) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (--scrollLocks === 0) document.body.style.overflow = prevOverflow;
    };
  }, [active]);
}

/** Width of an element, kept in sync with a ResizeObserver. Null until measured. */
export function useElementWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.floor(el.getBoundingClientRect().width));
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w != null) setWidth(Math.floor(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export interface AnchorPos {
  top: number;
  left: number;
  ready: boolean;
}

/**
 * Fixed position for a floating panel under (or above) an anchor, kept inside
 * the viewport and updated on scroll and resize.
 */
export function useAnchorPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  opts: { align?: "start" | "end"; offset?: number; side?: "bottom" | "top" } = {},
): AnchorPos {
  const { align = "start", offset = 8, side = "bottom" } = opts;
  const [pos, setPos] = useState<AnchorPos>({ top: 0, left: 0, ready: false });

  const place = useCallback(() => {
    const a = anchorRef.current;
    const p = panelRef.current;
    if (!a || !p) return;
    const r = a.getBoundingClientRect();
    const pw = p.offsetWidth;
    const ph = p.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = side === "bottom" ? r.bottom + offset : r.top - offset - ph;
    if (side === "bottom" && top + ph > vh - 8 && r.top - offset - ph > 8) top = r.top - offset - ph;
    if (side === "top" && top < 8) top = r.bottom + offset;
    let left = align === "end" ? r.right - pw : r.left;
    left = Math.max(8, Math.min(left, vw - pw - 8));
    setPos({ top, left, ready: true });
  }, [anchorRef, panelRef, align, offset, side]);

  useIsoLayoutEffect(() => {
    if (!open) {
      setPos((p) => (p.ready ? { ...p, ready: false } : p));
      return;
    }
    const on = () => place();
    let ro: ResizeObserver | null = null;
    const watch = () => {
      if (ro || typeof ResizeObserver === "undefined" || !panelRef.current) return;
      ro = new ResizeObserver(on);
      ro.observe(panelRef.current);
    };
    place();
    watch();
    // The panel may mount a frame later (portal): place again then.
    const raf = window.requestAnimationFrame(() => {
      place();
      watch();
    });
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
      ro?.disconnect();
    };
  }, [open, place]);

  return pos;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true" && el.offsetParent !== null,
  );
}

/** Basic focus trap: focus the first control on open, keep Tab inside, restore on close. */
export function useFocusTrap(active: boolean, rootRef: React.RefObject<HTMLElement | null>, initial?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;
    const prev = document.activeElement as HTMLElement | null;
    const first = initial?.current ?? focusables(root)[0] ?? root;
    // Defer so the panel is painted (animations) before focusing.
    const t = window.setTimeout(() => first.focus({ preventScroll: true }), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables(root);
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const a = list[0];
      const b = list[list.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      root.removeEventListener("keydown", onKey);
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [active, rootRef, initial]);
}
