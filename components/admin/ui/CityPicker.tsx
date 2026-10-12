"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, MapPin, Search } from "lucide-react";
import { CITIES } from "@/lib/admin/constants";
import { cx } from "./cx";
import { shellClasses } from "./Field";
import { useBodyScrollLock, useEscape, useIsDesktop, useOutsidePointer } from "./hooks";
import { Portal } from "./Portal";

export interface CityPickerProps {
  value: string | null;
  onChange: (city: string) => void;
  cities?: readonly string[];
  /** An extra row after the cities, e.g. { value: "__other", label: "My city isn't listed" }. */
  extraOption?: { value: string; label: string };
  placeholder?: string;
  invalid?: boolean;
  changed?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

/** Searchable dropdown of the 21 cities; full-screen list on mobile. */
export function CityPicker({
  value,
  onChange,
  cities = CITIES,
  extraOption,
  placeholder = "Choose a city",
  invalid,
  changed,
  disabled,
  id,
  className,
  ...rest
}: CityPickerProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = cities.filter((c) => !s || c.toLowerCase().includes(s)).map((c) => ({ value: c, label: c }));
    if (extraOption && (!s || extraOption.label.toLowerCase().includes(s))) list.push(extraOption);
    return list;
  }, [q, cities, extraOption]);

  const label = value ? (extraOption && value === extraOption.value ? extraOption.label : value) : null;

  const close = () => {
    setOpen(false);
    setQ("");
  };
  const pick = (v: string) => {
    onChange(v);
    close();
  };

  useOutsidePointer([wrapRef], close, open && isDesktop);
  useEscape(open, close);
  useBodyScrollLock(open && !isDesktop);

  useEffect(() => {
    if (!open) return;
    const i = Math.max(0, rows.findIndex((r) => r.value === value));
    setHi(i);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [hi]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(rows.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = rows[hi];
      if (r) pick(r.value);
    }
  };

  const list = (big: boolean) => (
    <div ref={listRef} id={listId} role="listbox" className={cx("flex flex-col gap-0.5 overflow-y-auto", big ? "flex-1 px-2 pb-6" : "max-h-[244px]")}>
      {rows.length === 0 ? <div className="px-3 py-2.5 text-[15px]/[22px] text-muted">No city matches “{q}”</div> : null}
      {rows.map((r, i) => {
        const sel = r.value === value;
        const extra = extraOption && r.value === extraOption.value;
        return (
          <button
            key={r.value}
            type="button"
            role="option"
            aria-selected={sel}
            data-i={i}
            onMouseEnter={() => setHi(i)}
            onClick={() => pick(r.value)}
            className={cx(
              "flex flex-none items-center rounded-[10px] px-3 text-left outline-none",
              big ? "min-h-12 text-[16px]/[24px]" : "min-h-10 text-[15px]/[22px]",
              sel ? "bg-brand-50 font-semibold text-brand-700" : i === hi ? "bg-fill font-medium text-ink" : "font-medium text-ink",
              extra && "mt-1 border-t border-fill text-brand-700",
            )}
          >
            <span className="min-w-0 flex-1">{r.label}</span>
            {sel ? <Check size={18} strokeWidth={1.75} className="flex-none" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );

  const Chevron = open && isDesktop ? ChevronUp : ChevronDown;

  return (
    <div ref={wrapRef} className={cx("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={rest["aria-label"]}
        onClick={() => (open ? close() : setOpen(true))}
        className={cx(
          "flex h-12 w-full items-center gap-2 pl-3.5 pr-3 text-left text-[16px]/[24px] font-medium outline-none lg:h-11 lg:pr-2.5 lg:text-[15px]/[22px]",
          shellClasses({ invalid, changed, disabled }),
          open && isDesktop && !invalid && "border-[1.5px] border-brand-700 shadow-input-focus",
          "focus-visible:!shadow-input-focus",
        )}
      >
        <MapPin size={18} strokeWidth={1.75} className={cx("flex-none", open && isDesktop ? "text-brand-700" : "text-muted")} aria-hidden="true" />
        <span className={cx("min-w-0 flex-1 truncate", label ? "text-ink" : "font-normal text-[#A8A29E]")}>{label ?? placeholder}</span>
        <Chevron size={18} strokeWidth={1.75} className={cx("flex-none", open && isDesktop ? "text-brand-700" : "text-muted")} aria-hidden="true" />
      </button>

      {open && isDesktop ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 animate-pop-in rounded-[14px] border border-line bg-white p-2 shadow-pop">
          <div className="mb-1.5 flex h-10 items-center gap-2 rounded-[10px] bg-fill px-3">
            <Search size={18} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setHi(0);
              }}
              onKeyDown={onKey}
              placeholder={`Search ${cities.length} cities`}
              aria-controls={listId}
              className="h-full w-full min-w-0 bg-transparent text-[15px]/[22px] text-ink outline-none placeholder:text-[#A8A29E] focus-visible:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
            />
          </div>
          {list(false)}
        </div>
      ) : null}

      {open && !isDesktop ? (
        <Portal>
          <div role="dialog" aria-modal="true" aria-label="Choose a city" className="fixed inset-0 z-[60] flex animate-sheet-up flex-col bg-white">
            <div className="flex items-center gap-1 border-b border-line pb-3 pl-1 pr-4 pt-[max(8px,env(safe-area-inset-top))]">
              <button type="button" aria-label="Back" onClick={close} className="grid size-11 flex-none place-items-center rounded-control text-ink hover:bg-fill">
                <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <div className={cx("flex h-12 flex-1 items-center gap-2.5 px-3.5", shellClasses({}))}>
                <Search size={20} strokeWidth={1.75} className="flex-none text-brand-700" aria-hidden="true" />
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setHi(0);
                  }}
                  onKeyDown={onKey}
                  placeholder={`Search ${cities.length} cities`}
                  className="h-full w-full min-w-0 bg-transparent text-[16px]/[24px] text-ink outline-none placeholder:text-[#A8A29E] focus-visible:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
                />
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col pt-2">{list(true)}</div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
}
