"use client";

import * as React from "react";
import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CarMode, CarRow } from "@/lib/admin/types";
import { CAR_TYPES } from "@/lib/admin/constants";
import { fmtPKR } from "@/lib/admin/format";
import type { CarRowMarker } from "@/components/admin/ui/CarsRepeater";
import { FieldError, PriceInput, TextInput } from "@/components/admin/ui/Field";
import { Segmented } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";

const MODES: Array<{ value: CarMode; label: string }> = [
  { value: "driver", label: "With driver" },
  { value: "self", label: "Self-drive" },
];

/**
 * Cars on mobile: compact rows ("Suzuki Cultus · PKR 4,500 · driver"). A
 * changed or new car opens as a teal-50 card with its inputs; tap any other
 * row to edit it.
 */
export function MobileCars({
  value,
  onChange,
  markers,
  errors,
}: {
  value: CarRow[];
  onChange: (rows: CarRow[]) => void;
  markers?: CarRowMarker[];
  errors?: Record<number, string>;
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const listId = useId();

  const set = (i: number, patch: Partial<CarRow>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => {
    onChange(value.filter((_, j) => j !== i));
    setOpen((s) => new Set(Array.from(s).filter((j) => j !== i).map((j) => (j > i ? j - 1 : j))));
  };
  const add = () => onChange([...value, { name: "", pricePerDay: 0, mode: "driver" }]);
  const toggle = (i: number, on: boolean) =>
    setOpen((s) => {
      const n = new Set(s);
      if (on) n.add(i);
      else n.delete(i);
      return n;
    });

  return (
    <div className="flex flex-col gap-2" data-cars-mobile>
      <datalist id={listId}>
        {CAR_TYPES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {value.map((row, i) => {
        const m = markers?.[i];
        const marked = !!(m && (m.isNew || m.name || m.price || m.mode));
        const expanded = marked || open.has(i) || !!errors?.[i];
        if (!expanded) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i, true)}
              className="flex min-h-12 items-center justify-between gap-3 rounded-control border border-line bg-white px-3 text-left text-[16px]/[22px] font-medium text-ink active:bg-fill"
            >
              <span className="min-w-0 truncate">{row.name || "Car"}</span>
              <span className="num flex-none text-[14px]/[20px] text-muted">
                {row.pricePerDay ? fmtPKR(row.pricePerDay) : "No price"} · {row.mode === "self" ? "self-drive" : "driver"}
              </span>
            </button>
          );
        }
        return (
          <div
            key={i}
            className={cx("flex flex-col gap-2 rounded-control border p-3", marked ? "border-brand-200 bg-brand-50" : "border-line bg-white")}
          >
            <div className="flex items-center justify-between gap-3 text-[16px]/[22px] font-semibold text-ink">
              <span className="min-w-0 truncate">{row.name || "New car"}</span>
              {marked ? (
                <span className="flex-none text-[13px]/[18px] font-medium text-brand-700">{m?.isNew ? "New" : "Changed"}</span>
              ) : (
                <button type="button" onClick={() => toggle(i, false)} className="flex-none text-[14px]/[20px] font-semibold text-brand-700">
                  Done
                </button>
              )}
            </div>
            <TextInput
              value={row.name}
              placeholder="Car name"
              list={listId}
              aria-label="Car name"
              autoComplete="off"
              invalid={!!errors?.[i]}
              changed={!!m?.name}
              onChange={(e) => set(i, { name: e.target.value })}
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
  );
}
