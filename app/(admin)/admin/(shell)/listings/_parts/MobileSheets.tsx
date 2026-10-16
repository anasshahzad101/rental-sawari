"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { fmtNum } from "@/lib/admin/format";
import { Button } from "@/components/admin/ui/Button";
import { Segmented, ToggleRow } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { Field, Select } from "@/components/admin/ui/Field";
import { Sheet } from "@/components/admin/ui/Modal";
import type { Opt } from "./FilterBar";
import { SORTS, dirWords, type Dir, type FilterState, type SortKey } from "./model";

/** Mobile "Sort by" bottom sheet: 8 options + a High/Low segmented control. */
export function SortSheet({
  open,
  onClose,
  sort,
  dir,
  onSort,
  onDir,
}: {
  open: boolean;
  onClose: () => void;
  sort: SortKey;
  dir: Dir;
  onSort: (key: SortKey) => void;
  onDir: (dir: Dir) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Sort by" hideClose className="pb-[max(30px,env(safe-area-inset-bottom))]">
      <div className="flex flex-col text-[16px]/[24px] font-medium" role="radiogroup" aria-label="Sort by">
        {SORTS.map((s, i) => {
          const on = s.key === sort;
          const last = i === SORTS.length - 1;
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                onSort(s.key);
                onClose();
              }}
              className={cx(
                "flex h-[52px] flex-none items-center gap-3 text-left outline-none",
                on ? "-mx-2 rounded-control bg-brand-50 px-2 font-semibold text-brand-700" : "text-ink",
                !on && !last && "border-b border-fill",
              )}
            >
              {s.label}
              {on ? (
                <>
                  <span className="ml-auto text-[13px]/[18px] font-medium">{dirWords(sort, dir)}</span>
                  <Check size={18} strokeWidth={2} className="flex-none" aria-hidden="true" />
                </>
              ) : null}
            </button>
          );
        })}
      </div>
      <Segmented
        fullWidth
        size="lg"
        className="mt-3"
        aria-label="Order"
        value={dir}
        onChange={onDir}
        options={[
          { value: "desc", label: dirWords(sort, "desc") },
          { value: "asc", label: dirWords(sort, "asc") },
        ]}
      />
    </Sheet>
  );
}

export interface FiltersSheetProps {
  open: boolean;
  onClose: () => void;
  st: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  cityOpts: Opt[];
  areaOpts: Opt[];
  planOpts: Opt[];
  verifiedOpts: Opt[];
  statusOpts: Opt[];
  /** Listings matching right now ("Show 24 listings"). */
  count: number;
}

const withCount = (o: Opt) => ({ value: o.value, label: o.count != null ? `${o.label} (${fmtNum(o.count)})` : o.label });

/** Mobile "Filters" bottom sheet: the same filters as the desktop chips. Changes apply as you go. */
export function FiltersSheet({ open, onClose, st, onChange, onClear, cityOpts, areaOpts, planOpts, verifiedOpts, statusOpts, count }: FiltersSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Filters" className="pb-0">
      <div className="flex flex-col gap-4 pb-4">
        <Field label="City">
          <Select
            aria-label="City"
            value={st.city}
            onChange={(e) => onChange({ city: e.target.value, area: "" })}
            options={[{ value: "", label: "All cities" }, ...cityOpts.map(withCount)]}
          />
        </Field>
        <Field label="Area" hint={st.city ? undefined : "Pick a city to see only its areas."}>
          <Select
            aria-label="Area"
            value={st.area}
            onChange={(e) => onChange({ area: e.target.value })}
            options={[{ value: "", label: "All areas" }, ...areaOpts.slice(0, 300).map(withCount)]}
          />
        </Field>
        <Field label="Plan">
          <Select
            aria-label="Plan"
            value={st.plan}
            onChange={(e) => onChange({ plan: e.target.value as FilterState["plan"] })}
            options={[{ value: "", label: "All plans" }, ...planOpts.map(withCount)]}
          />
        </Field>
        <Field label="Verified">
          <Select
            aria-label="Verified"
            value={st.verified}
            onChange={(e) => onChange({ verified: e.target.value as FilterState["verified"] })}
            options={[{ value: "", label: "Verified or not" }, ...verifiedOpts.map(withCount)]}
          />
        </Field>
        <Field label="Status">
          <Select
            aria-label="Status"
            value={st.status}
            onChange={(e) => onChange({ status: e.target.value as FilterState["status"] })}
            options={[{ value: "", label: "Live and hidden" }, ...statusOpts.map(withCount)]}
          />
        </Field>
        <ToggleRow boxed title="Profile under 50%" checked={st.under50} onChange={(v) => onChange({ under50: v })} />
        <ToggleRow
          boxed
          title="Zero opens"
          description="Live, but nobody opened them"
          checked={st.zero}
          onChange={(v) => onChange({ zero: v })}
        />
      </div>
      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-line bg-white px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-3">
        <Button variant="secondary" onClick={onClear} className="flex-1">
          Clear all
        </Button>
        <Button variant="primary" onClick={onClose} className="flex-1">
          Show {fmtNum(count)} {count === 1 ? "listing" : "listings"}
        </Button>
      </div>
    </Sheet>
  );
}
