"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { fmtNum } from "@/lib/admin/format";
import type { CarRow } from "@/lib/admin/types";
import { Segmented } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { PriceInput } from "@/components/admin/ui/Field";
import { AddCarButton, CarNameInput, CAR_MODES, EMPTY_CAR } from "./CarsEditor";
import { ClaimField } from "./ClaimField";

/** One car in the claim form: its value on the listing (null when new) and now. */
export interface CarItem {
  key: string;
  orig: CarRow | null;
  cur: CarRow;
  removed: boolean;
}

export type CarChangeKind = "changed" | "new" | "removed";

export function carsFromListing(cars: CarRow[]): CarItem[] {
  return cars.map((c, i) => ({ key: `o${i}`, orig: { ...c }, cur: { ...c }, removed: false }));
}

export function sameCar(a: CarRow, b: CarRow): boolean {
  return a.name.trim() === b.name.trim() && Math.round(a.pricePerDay) === Math.round(b.pricePerDay) && a.mode === b.mode;
}

export function carChange(it: CarItem): CarChangeKind | null {
  if (it.orig && it.removed) return "removed";
  if (!it.orig) return it.cur.name.trim() ? "new" : null;
  return sameCar(it.orig, it.cur) ? null : "changed";
}

export const modeLabel = (m: CarRow["mode"]) => (m === "self" ? "Self-drive" : "With driver");

export function carLine(c: CarRow): string {
  return c.pricePerDay ? `${c.name.trim()} · PKR ${fmtNum(c.pricePerDay)}/day` : c.name.trim();
}

/** "Changed from 7,000" when only the price moved, and so on. */
function changedTag(it: CarItem): string {
  const o = it.orig!;
  const c = it.cur;
  const name = o.name.trim() !== c.name.trim();
  const price = Math.round(o.pricePerDay) !== Math.round(c.pricePerDay);
  const mode = o.mode !== c.mode;
  if (price && !name && !mode) return o.pricePerDay ? `Changed from ${fmtNum(o.pricePerDay)}` : "Price added";
  if (name && !price && !mode) return `Changed from ${o.name.trim()}`;
  if (mode && !price && !name) return `Changed from ${modeLabel(o.mode).toLowerCase()}`;
  return "Changed";
}

export interface ClaimCarsProps {
  items: CarItem[];
  onChange: (items: CarItem[]) => void;
  editing: string | null;
  onEditing: (key: string | null) => void;
  onReset: () => void;
}

/**
 * Cars and prices, pre-filled from the listing. Each car is a 48 px row
 * ("Honda Civic · PKR 7,500/day"); tap it to edit. Changed and new rows get a
 * #99F6E4 border and a tag; removed rows are struck through with Undo.
 */
export function ClaimCars({ items, onChange, editing, onEditing, onReset }: ClaimCarsProps) {
  const changes = items.filter((it) => carChange(it)).length;
  const patch = (key: string, p: Partial<CarItem>) => onChange(items.map((it) => (it.key === key ? { ...it, ...p } : it)));
  const setCur = (key: string, p: Partial<CarRow>) =>
    onChange(items.map((it) => (it.key === key ? { ...it, cur: { ...it.cur, ...p } } : it)));

  const finish = (it: CarItem) => {
    if (!it.cur.name.trim()) {
      if (!it.orig) onChange(items.filter((x) => x.key !== it.key));
      else setCur(it.key, { name: it.orig.name });
    }
    onEditing(null);
  };

  const remove = (it: CarItem) => {
    if (it.orig) patch(it.key, { removed: true, cur: { ...it.orig } });
    else onChange(items.filter((x) => x.key !== it.key));
    onEditing(null);
  };

  const add = () => {
    const key = `n${Date.now().toString(36)}`;
    onChange([...items, { key, orig: null, cur: { ...EMPTY_CAR }, removed: false }]);
    onEditing(key);
  };

  return (
    <ClaimField
      label="Cars and prices"
      changed={changes > 0}
      changedText={`${changes} changed`}
      onReset={onReset}
    >
      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const kind = carChange(it);
          if (editing === it.key) {
            return (
              <div key={it.key} className="flex flex-col gap-2.5 rounded-control border-[1.5px] border-brand-700 p-3 shadow-input-focus">
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_150px_200px]">
                  <CarNameInput value={it.cur.name} onChange={(v) => setCur(it.key, { name: v })} autoFocus />
                  <PriceInput
                    value={it.cur.pricePerDay}
                    onChange={(v) => setCur(it.key, { pricePerDay: v })}
                    aria-label={`Price per day for ${it.cur.name || "this car"}`}
                  />
                  <Segmented
                    size="lg"
                    fullWidth
                    options={CAR_MODES}
                    value={it.cur.mode}
                    onChange={(v) => setCur(it.key, { mode: v })}
                    aria-label="With driver or self-drive"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => remove(it)}
                    className="inline-flex h-11 items-center gap-1.5 text-[15px]/[20px] font-semibold text-bad-text hover:underline lg:h-10"
                  >
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                    Remove car
                  </button>
                  <button
                    type="button"
                    onClick={() => finish(it)}
                    className="inline-flex h-11 items-center rounded-control border border-line bg-white px-4 text-[15px]/[20px] font-semibold text-ink hover:bg-fill lg:h-10"
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          }
          if (kind === "removed") {
            return (
              <div
                key={it.key}
                className="flex min-h-12 items-center gap-2.5 rounded-control border border-line px-3.5 text-[16px]/[22px] font-medium lg:text-[15px]/[22px]"
              >
                <span className="num min-w-0 flex-1 truncate text-[#A8A29E] line-through">{carLine(it.orig!)}</span>
                <span className="flex-none text-[13px]/[18px] font-semibold text-bad-text">
                  Removed ·{" "}
                  <button
                    type="button"
                    onClick={() => patch(it.key, { removed: false })}
                    className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                  >
                    Undo
                  </button>
                </span>
              </div>
            );
          }
          const marked = kind === "changed" || kind === "new";
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onEditing(it.key)}
              aria-label={`Edit ${it.cur.name || "car"}`}
              className={cx(
                "group flex min-h-12 w-full items-center gap-2.5 rounded-control px-3.5 text-left text-[16px]/[22px] font-medium text-ink transition-colors hover:bg-page lg:text-[15px]/[22px]",
                marked ? "border-[1.5px] border-brand-200" : "border border-line",
              )}
            >
              <span className="num min-w-0 flex-1 truncate">{carLine(it.cur) || "New car"}</span>
              {kind === "new" ? <span className="flex-none text-[13px]/[18px] font-semibold text-brand-700">New</span> : null}
              {kind === "changed" ? (
                <span className="num flex-none text-[13px]/[18px] font-semibold text-brand-700">{changedTag(it)}</span>
              ) : null}
              <Pencil size={16} strokeWidth={1.75} className="flex-none text-[#A8A29E] group-hover:text-ink-2" aria-hidden="true" />
            </button>
          );
        })}
        <AddCarButton onClick={add} />
      </div>
    </ClaimField>
  );
}
