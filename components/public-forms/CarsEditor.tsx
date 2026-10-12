"use client";

import * as React from "react";
import { useId, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CAR_TYPES } from "@/lib/admin/constants";
import type { CarMode, CarRow } from "@/lib/admin/types";
import { Highlight } from "@/components/admin/ui/AreaInput";
import { Segmented } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { innerInput, PriceInput, shellClasses } from "@/components/admin/ui/Field";
import { useOutsidePointer } from "@/components/admin/ui/hooks";

export const CAR_MODES: Array<{ value: CarMode; label: string }> = [
  { value: "driver", label: "With driver" },
  { value: "self", label: "Self-drive" },
];

export const EMPTY_CAR: CarRow = { name: "", pricePerDay: 0, mode: "driver" };

/** Car name with suggestions from the 12 car types (free text allowed). */
export function CarNameInput({
  value,
  onChange,
  changed,
  invalid,
  autoFocus,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  changed?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  useOutsidePointer([wrapRef], () => setOpen(false), open);
  const q = value.trim().toLowerCase();
  const list = useMemo(
    () => CAR_TYPES.filter((s) => (!q || s.toLowerCase().includes(q)) && s.toLowerCase() !== q).slice(0, 6),
    [q],
  );
  const show = open && list.length > 0;
  return (
    <div ref={wrapRef} className={cx("relative min-w-0", className)}>
      <div className={cx("flex h-12 items-center overflow-hidden px-3 lg:h-11", shellClasses({ changed, invalid }))}>
        <input
          value={value}
          placeholder="e.g. Toyota Corolla"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-label={ariaLabel ?? "Car name"}
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-invalid={invalid || undefined}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHi(0);
          }}
          onKeyDown={(e) => {
            if (!show) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((h) => Math.min(list.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              onChange(list[hi]);
              setOpen(false);
            } else if (e.key === "Escape") setOpen(false);
          }}
          className={innerInput}
        />
      </div>
      {show ? (
        <div id={listId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 animate-pop-in rounded-[14px] border border-line bg-white p-1.5 shadow-pop">
          {list.map((s, i) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={i === hi}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={cx(
                "flex h-11 w-full items-center rounded-[10px] px-2.5 text-left text-[16px]/[24px] font-medium text-ink lg:h-10 lg:text-[15px]/[22px]",
                i === hi && "bg-fill",
              )}
            >
              <span className="truncate">
                <Highlight text={s} query={value} />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** "Add a car": 40 px secondary with a plus (desktop); dashed full-width 48 px (mobile). */
export function AddCarButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="hidden h-10 items-center gap-1.5 self-start rounded-control border border-line bg-white px-3.5 text-[15px]/[20px] font-semibold text-ink hover:bg-fill lg:inline-flex"
      >
        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
        Add a car
      </button>
      <button
        type="button"
        onClick={onClick}
        className="flex h-12 items-center justify-center gap-2 rounded-control border border-dashed border-[#A8A29E] bg-white text-[16px]/[24px] font-semibold text-ink active:bg-fill lg:hidden"
      >
        <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
        Add a car
      </button>
    </>
  );
}

/**
 * Cars and prices for "List your business": car name | PKR [n] /day |
 * With driver / Self-drive | trash, then "Add a car". Each car is a card on mobile.
 */
export function CarsEditor({ value, onChange }: { value: CarRow[]; onChange: (rows: CarRow[]) => void }) {
  const [focusLast, setFocusLast] = useState(false);
  const set = (i: number, patch: Partial<CarRow>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add = () => {
    setFocusLast(true);
    onChange([...value, { ...EMPTY_CAR }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Desktop rows */}
      {value.map((row, i) => (
        <div key={`d${i}`} className="hidden grid-cols-[minmax(0,1fr)_170px_200px_40px] items-center gap-2 lg:grid">
          <CarNameInput
            value={row.name}
            onChange={(v) => set(i, { name: v })}
            autoFocus={focusLast && i === value.length - 1}
          />
          <PriceInput
            value={row.pricePerDay}
            onChange={(v) => set(i, { pricePerDay: v })}
            aria-label={`Price per day for ${row.name || "this car"}`}
          />
          <Segmented
            size="lg"
            fullWidth
            options={CAR_MODES}
            value={row.mode}
            onChange={(v) => set(i, { mode: v })}
            aria-label="With driver or self-drive"
          />
          <button
            type="button"
            aria-label={`Remove ${row.name || "this car"}`}
            onClick={() => remove(i)}
            className="grid size-10 place-items-center rounded-control text-muted hover:bg-fill hover:text-bad-text"
          >
            <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ))}

      {/* Mobile cards */}
      {value.map((row, i) => (
        <div key={`m${i}`} className="flex flex-col gap-2.5 rounded-card border border-line bg-white p-3.5 lg:hidden">
          <CarNameInput value={row.name} onChange={(v) => set(i, { name: v })} />
          <div className="flex gap-2">
            <PriceInput
              value={row.pricePerDay}
              onChange={(v) => set(i, { pricePerDay: v })}
              className="flex-1"
              aria-label={`Price per day for ${row.name || "this car"}`}
            />
            <button
              type="button"
              aria-label={`Remove ${row.name || "this car"}`}
              onClick={() => remove(i)}
              className="grid size-12 flex-none place-items-center rounded-control border border-line bg-white text-muted active:bg-fill"
            >
              <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <Segmented size="lg" fullWidth options={CAR_MODES} value={row.mode} onChange={(v) => set(i, { mode: v })} aria-label="With driver or self-drive" />
        </div>
      ))}

      <AddCarButton onClick={add} />
    </div>
  );
}
