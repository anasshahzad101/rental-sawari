"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterValue {
  area: string;
  carType: string;
  rental: "" | "with-driver" | "self-drive";
  service: string;
}

interface CityFilterBarProps {
  areas: string[];
  carTypes: Array<{ slug: string; name: string }>;
  services: string[];
  onChange: (value: FilterValue) => void;
}

const initial: FilterValue = {
  area: "",
  carType: "",
  rental: "",
  service: "",
};

export function CityFilterBar({
  areas,
  carTypes,
  services,
  onChange,
}: CityFilterBarProps) {
  const [value, setValue] = React.useState<FilterValue>(initial);

  function update<K extends keyof FilterValue>(k: K, v: FilterValue[K]) {
    const next = { ...value, [k]: v };
    setValue(next);
    onChange(next);
  }

  function reset() {
    setValue(initial);
    onChange(initial);
  }

  const active =
    !!value.area || !!value.carType || !!value.rental || !!value.service;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-brand" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
          Filters
        </h2>
        {active && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs font-semibold text-brand hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Area"
          value={value.area}
          onChange={(v) => update("area", v)}
          options={areas.map((a) => ({ value: a, label: a }))}
        />
        <Select
          label="Car Type"
          value={value.carType}
          onChange={(v) => update("carType", v)}
          options={carTypes.map((c) => ({ value: c.slug, label: c.name }))}
        />
        <Select
          label="Rental"
          value={value.rental}
          onChange={(v) => update("rental", v as FilterValue["rental"])}
          options={[
            { value: "with-driver", label: "With Driver" },
            { value: "self-drive", label: "Self-Drive" },
          ]}
        />
        <Select
          label="Service"
          value={value.service}
          onChange={(v) => update("service", v)}
          options={services.map((s) => ({ value: s, label: s }))}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-stone-200 bg-white",
          "px-3 text-sm font-medium text-stone-900",
          "focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        )}
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export type { FilterValue };
