"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { fmtNum } from "@/lib/admin/format";
import { cx } from "@/components/admin/ui/cx";
import { Popover } from "@/components/admin/ui/Popover";

/**
 * Filter chips (desktop): City ▾ · Area ▾ · Plan ▾ · Verified ▾ · Status ▾,
 * a divider, dashed toggles. An active filter turns into a teal chip with ×.
 */

export interface Opt {
  value: string;
  label: string;
  count?: number;
}

function OptionRow({ label, count, selected, onClick }: { label: string; count?: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cx(
        "flex h-10 w-full flex-none items-center gap-3 rounded-[10px] px-3 text-left text-[15px]/[20px] outline-none transition-colors focus-visible:bg-fill",
        selected ? "bg-brand-50 font-semibold text-brand-700" : "font-medium text-ink hover:bg-fill",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count != null ? <span className={cx("num flex-none text-[13px]/[18px] font-medium", selected ? "text-brand-700" : "text-muted")}>{fmtNum(count)}</span> : null}
      {selected ? <Check size={16} strokeWidth={2} className="flex-none" aria-hidden="true" /> : <span className="w-4 flex-none" />}
    </button>
  );
}

export interface FilterDropdownProps {
  name: string;
  value: string;
  /** "City: Okara" */
  activeLabel: string;
  options: Opt[];
  onChange: (value: string) => void;
  /** First row, clears the filter ("All cities"). */
  allLabel: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Text above the list (e.g. "Areas in Islamabad"). */
  heading?: string;
  emptyText?: string;
  width?: number;
}

export function FilterDropdown({
  name,
  value,
  activeLabel,
  options,
  onChange,
  allLabel,
  searchable,
  searchPlaceholder,
  heading,
  emptyText = "Nothing matches",
  width = 260,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const active = !!value;
  const shown = useMemo(() => {
    const t = term.trim().toLowerCase();
    const list = t ? options.filter((o) => o.label.toLowerCase().includes(t)) : options;
    return list.slice(0, 80);
  }, [options, term]);

  const trigger = active ? (
    <button
      type="button"
      className="inline-flex h-9 max-w-[260px] items-center truncate rounded-l-full pl-3.5 pr-1 text-[14px]/[20px] font-semibold text-brand-700 outline-none"
    >
      <span className="truncate">{activeLabel}</span>
    </button>
  ) : (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white pl-3.5 pr-2.5 text-[14px]/[20px] font-medium text-ink outline-none transition-colors hover:bg-fill aria-expanded:bg-fill"
    >
      {name}
      <ChevronDown size={16} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
    </button>
  );

  const pop = (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTerm("");
      }}
      trigger={trigger}
      aria-label={`${name} filter`}
    >
      {(close) => (
        <div style={{ width }} className="flex max-w-[calc(100vw-32px)] flex-col">
          {searchable ? (
            <div className="mb-1.5 flex h-10 items-center gap-2 rounded-[10px] border border-line px-3 focus-within:border-brand-700">
              <Search size={16} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent text-[15px]/[20px] text-ink outline-none placeholder:text-[#A8A29E] focus-visible:!shadow-none"
              />
            </div>
          ) : null}
          {heading ? <div className="text-overline px-3 pb-1 pt-1.5 uppercase text-muted">{heading}</div> : null}
          <div role="listbox" aria-label={name} className="flex max-h-[320px] flex-col overflow-y-auto">
            {!term ? (
              <OptionRow
                label={allLabel}
                selected={!value}
                onClick={() => {
                  onChange("");
                  close();
                }}
              />
            ) : null}
            {shown.map((o) => (
              <OptionRow
                key={o.value}
                label={o.label}
                count={o.count}
                selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
              />
            ))}
            {shown.length === 0 ? <div className="px-3 py-2.5 text-label text-muted">{emptyText}</div> : null}
          </div>
        </div>
      )}
    </Popover>
  );

  if (!active) return pop;
  return (
    <span className="inline-flex h-9 items-center rounded-full border border-ours-border bg-ours-fill text-brand-700">
      {pop}
      <button
        type="button"
        aria-label={`Remove ${name} filter`}
        onClick={() => onChange("")}
        className="mr-0.5 grid size-8 place-items-center rounded-full outline-none transition-colors hover:bg-brand-100"
      >
        <X size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </span>
  );
}

export function ToggleChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return on ? (
    <button
      type="button"
      aria-pressed="true"
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ours-border bg-ours-fill pl-3.5 pr-2 text-[14px]/[20px] font-semibold text-brand-700 outline-none transition-colors hover:bg-brand-100"
    >
      {label}
      <X size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  ) : (
    <button
      type="button"
      aria-pressed="false"
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-[#A8A29E] bg-white px-3.5 text-[14px]/[20px] font-medium text-ink-2 outline-none transition-colors hover:bg-fill"
    >
      <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </button>
  );
}
