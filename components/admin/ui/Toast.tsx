"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CircleCheck, Undo2, X } from "lucide-react";
import { cx } from "./cx";
import type { IconComponent } from "./icons";
import { Portal } from "./Portal";

export interface ToastOptions {
  message: React.ReactNode;
  /** Leading icon in #14B8A6 (default circle-check; null hides it). */
  icon?: IconComponent | null;
  /** Adds an **Undo** button. May be async: a spinner shows while it runs. */
  undo?: () => void | Promise<void>;
  /** ms. Defaults to 8 s with Undo, 4 s without. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  undoing?: boolean;
}

interface ToastApi {
  toast: (t: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const NOOP: ToastApi = {
  toast: () => {
    if (process.env.NODE_ENV !== "production") console.warn("useToast() used outside <ToastProvider>");
    return 0;
  },
  dismiss: () => {},
};

/** `const { toast } = useToast(); toast({ message: "Margalla Rent A Car updated", undo })` */
export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /**
   * Inside the admin shell: centre over the content column on desktop and sit
   * above the 88 px tab bar on mobile.
   */
  inShell?: boolean;
}

export function ToastProvider({ children, inShell = false }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (t: ToastOptions) => {
      const id = ++seq.current;
      setItems((xs) => {
        const keep = xs.slice(-2);
        for (const old of xs.slice(0, -2)) {
          const tm = timers.current.get(old.id);
          if (tm) clearTimeout(tm);
          timers.current.delete(old.id);
        }
        return [...keep, { ...t, id }];
      });
      const ms = t.duration ?? (t.undo ? 8000 : 4000);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const runUndo = useCallback(
    async (it: ToastItem) => {
      if (!it.undo || it.undoing) return;
      const t = timers.current.get(it.id);
      if (t) clearTimeout(t);
      setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, undoing: true } : x)));
      try {
        await it.undo();
      } finally {
        dismiss(it.id);
      }
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        <div
          aria-live="polite"
          className={cx(
            "pointer-events-none fixed inset-x-2 z-[70] flex flex-col items-stretch gap-2",
            inShell ? "bottom-[96px]" : "bottom-4",
            "lg:inset-x-auto lg:bottom-6 lg:left-1/2 lg:w-[min(560px,calc(100vw-48px))] lg:-translate-x-1/2 lg:items-center",
            inShell && "lg:left-[calc(50%+124px)] lg:w-[min(560px,calc(100vw-296px))]",
          )}
        >
          {items.map((it) => {
            const Icon = it.icon === undefined ? CircleCheck : it.icon;
            return (
              <div
                key={it.id}
                role="status"
                className="pointer-events-auto flex min-h-[52px] w-full animate-sheet-up items-center gap-2.5 rounded-control bg-ink py-1.5 pl-3.5 pr-1.5 text-[15px]/[22px] font-medium text-white shadow-toast lg:w-auto lg:min-w-[360px] lg:max-w-full lg:gap-3 lg:pl-4"
              >
                {Icon ? <Icon size={20} strokeWidth={1.75} className="flex-none text-brand-400" aria-hidden="true" /> : null}
                <span className="min-w-0 flex-1">{it.message}</span>
                {it.undo ? (
                  <button
                    type="button"
                    onClick={() => runUndo(it)}
                    disabled={it.undoing}
                    className="inline-flex h-11 flex-none items-center gap-1.5 rounded-lg px-3 text-[15px]/[20px] font-bold text-brand-400 outline-none transition-colors hover:bg-white/10 disabled:cursor-progress lg:h-10"
                  >
                    {it.undoing ? (
                      <span
                        aria-hidden="true"
                        className="inline-block size-[18px] animate-spin-fast rounded-full border-2 border-brand-400/30 border-t-brand-400"
                      />
                    ) : (
                      <Undo2 size={18} strokeWidth={1.75} aria-hidden="true" />
                    )}
                    Undo
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => dismiss(it.id)}
                  className={cx(
                    "grid size-10 flex-none place-items-center rounded-lg text-[#A8A29E] outline-none transition-colors hover:bg-white/10 hover:text-white",
                    it.undo && "max-lg:hidden",
                  )}
                >
                  <X size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}
