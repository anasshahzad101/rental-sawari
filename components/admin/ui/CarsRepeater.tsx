"use client";

import * as React from "react";
import { useId, useMemo, useRef, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { CarMode, CarRow } from "@/lib/admin/types";
import { CAR_TYPES } from "@/lib/admin/constants";
import { Highlight } from "./AreaInput";
import { Button } from "./Button";
import { cx } from "./cx";
import { FieldError, innerInput, PriceInput, shellClasses } from "./Field";
import { useOutsidePointer } from "./hooks";
import { Segmented } from "./controls";

/** Per-row markers for the edit page: which parts changed, or a new row. */
export interface CarRowMarker {
  name?: boolean;
  price?: boolean;
  mode?: boolean;
  isNew?: boolean;
}

export interface CarsRepeaterProps {
  value: CarRow[];
  onChange: (rows: CarRow[]) => void;
  suggestions?: readonly string[];
  /** Same index as `value`. */
  markers?: Array<CarRowMarker | null | undefined>;
  /** Error per row index. */
  errors?: Record<number, React.ReactNode>;
  /** Show the drag grip (default true). */
  reorder?: boolean;
  className?: string;
}

const MODES: Array<{ value: CarMode; label: string }> = [
  { value: "driver", label: "With driver" },
  { value: "self", label: "Self-drive" },
];

function CarNameInput({
  value,
  onChange,
  suggestions,
  changed,
  invalid,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: readonly string[];
  changed?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsidePointer([wrapRef], () => setOpen(false), open);
  const q = value.trim().toLowerCase();
  const list = useMemo(
    () => suggestions.filter((s) => (!q || s.toLowerCase().includes(q)) && s.toLowerCase() !== q).slice(0, 6),
    [suggestions, q],
  );
  const show = open && list.length > 0;
  return (
    <div ref={wrapRef} className="relative min-w-0">
      <div className={cx("flex h-12 items-center overflow-hidden px-3.5 lg:h-11", shellClasses({ changed, invalid }))}>
        <input
          value={value}
          placeholder="Car name"
          autoComplete="off"
          aria-label={ariaLabel ?? "Car name"}
          role="combobox"
          aria-controls={listId}
          aria-expanded={show}
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

/**
 * Cars and prices: grip | car name (suggestions, free text) | PKR [n] /day |
 * With driver / Self-drive | trash, then "Add a car". Each car is a card on mobile.
 */
export function CarsRepeater({ value, onChange, suggestions = CAR_TYPES, markers, errors, reorder = true, className }: CarsRepeaterProps) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const set = (i: number, patch: Partial<CarRow>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add = () => onChange([...value, { name: "", pricePerDay: 0, mode: "driver" }]);
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = value.slice();
    const [r] = next.splice(from, 1);
    next.splice(to, 0, r);
    onChange(next);
  };

  const cols = "grid-cols-[24px_minmax(0,1fr)_220px_240px_40px]";

  return (
    <div className={cx("flex flex-col", className)}>
      {/* Desktop rows */}
      <div className="hidden flex-col gap-1 lg:flex">
        <div className={cx("text-overline uppercase text-muted grid h-8 items-center gap-3", cols)}>
          <span />
          <span>Car</span>
          <span>Price per day</span>
          <span>Driver</span>
          <span />
        </div>
        {value.map((row, i) => {
          const m = markers?.[i];
          const marked = !!(m && (m.isNew || m.name || m.price || m.mode));
          return (
            <div key={i} className="flex flex-col gap-1">
              <div
                className={cx(
                  "grid min-h-14 items-center gap-3 rounded-control transition-colors",
                  cols,
                  dragOver === i && dragFrom !== null && dragFrom !== i && "bg-brand-50",
                  dragFrom === i && "opacity-50",
                )}
                onDragOver={(e) => {
                  if (dragFrom === null) return;
                  e.preventDefault();
                  setDragOver(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom !== null) move(dragFrom, i);
                  setDragFrom(null);
                  setDragOver(null);
                }}
              >
                <span className="relative grid place-items-center">
                  {reorder ? (
                    <button
                      type="button"
                      draggable
                      aria-label={`Move ${row.name || "car"} (use arrow keys)`}
                      onDragStart={(e) => {
                        setDragFrom(i);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(i));
                      }}
                      onDragEnd={() => {
                        setDragFrom(null);
                        setDragOver(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          move(i, i - 1);
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          move(i, i + 1);
                        }
                      }}
                      className="grid h-8 w-6 cursor-grab place-items-center rounded-md text-[#A8A29E] hover:text-ink-2 active:cursor-grabbing"
                    >
                      <GripVertical size={18} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  ) : null}
                  {marked ? (
                    <span
                      aria-label={m?.isNew ? "New" : "Changed"}
                      className={cx("size-2 rounded-full bg-brand-700", reorder && "absolute -left-1 top-1/2 -translate-y-1/2")}
                    />
                  ) : null}
                </span>
                <CarNameInput
                  value={row.name}
                  onChange={(v) => set(i, { name: v })}
                  suggestions={suggestions}
                  changed={!!(m?.name || m?.isNew)}
                  invalid={!!errors?.[i]}
                />
                <PriceInput
                  value={row.pricePerDay}
                  onChange={(v) => set(i, { pricePerDay: v })}
                  changed={!!(m?.price || m?.isNew)}
                  aria-label={`Price per day for ${row.name || "this car"}`}
                />
                <Segmented
                  size="lg"
                  fullWidth
                  options={MODES}
                  value={row.mode}
                  onChange={(v) => set(i, { mode: v })}
                  aria-label="Driver"
                  className={cx(m?.mode && "ring-1 ring-brand-200")}
                />
                <button
                  type="button"
                  aria-label={`Remove ${row.name || "car"}`}
                  onClick={() => remove(i)}
                  className="grid size-10 place-items-center rounded-control text-muted hover:bg-fill hover:text-bad-text"
                >
                  <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
              {errors?.[i] ? <FieldError className="pl-9">{errors[i]}</FieldError> : null}
            </div>
          );
        })}
        <div className="mt-2 flex pl-9">
          <Button variant="secondary" icon={Plus} onClick={add}>
            Add a car
          </Button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        {value.map((row, i) => {
          const m = markers?.[i];
          const marked = !!(m && (m.isNew || m.name || m.price || m.mode));
          return (
            <div
              key={i}
              className={cx(
                "flex flex-col gap-2.5 rounded-card border p-3.5",
                marked ? "border-brand-200 bg-brand-50" : "border-line bg-white",
              )}
            >
              {marked ? (
                <div className="flex items-center justify-between text-[16px]/[22px] font-semibold text-ink">
                  <span className="truncate">{row.name || "New car"}</span>
                  <span className="text-[13px]/[18px] font-medium text-brand-700">{m?.isNew ? "New" : "Changed"}</span>
                </div>
              ) : null}
              <CarNameInput
                value={row.name}
                onChange={(v) => set(i, { name: v })}
                suggestions={suggestions}
                changed={!!m?.name}
                invalid={!!errors?.[i]}
              />
              <div className="flex gap-2">
                <PriceInput
                  value={row.pricePerDay}
                  onChange={(v) => set(i, { pricePerDay: v })}
                  changed={!!m?.price}
                  className="flex-1"
                  aria-label={`Price per day for ${row.name || "this car"}`}
                />
                <button
                  type="button"
                  aria-label={`Remove ${row.name || "car"}`}
                  onClick={() => remove(i)}
                  className="grid size-12 flex-none place-items-center rounded-control border border-line bg-white text-muted active:bg-fill"
                >
                  <Trash2 size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
              <Segmented size="lg" fullWidth options={MODES} value={row.mode} onChange={(v) => set(i, { mode: v })} aria-label="Driver" />
              {errors?.[i] ? <FieldError>{errors[i]}</FieldError> : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={add}
          className="flex h-12 items-center justify-center gap-2 rounded-control border border-dashed border-[#A8A29E] bg-white text-[16px]/[24px] font-semibold text-ink active:bg-fill"
        >
          <Plus size={20} strokeWidth={1.75} aria-hidden="true" />
          Add a car
        </button>
      </div>
    </div>
  );
}
