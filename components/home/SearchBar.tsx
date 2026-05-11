"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Car as CarIcon, ChevronDown } from "lucide-react";
import { cities } from "@/data/cities";
import { popularCarTypes } from "@/data/carTypes";
import type { RentalType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = React.useState("");
  const [carType, setCarType] = React.useState("");
  const [rental, setRental] = React.useState<RentalType>("with-driver");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No real routes yet — log for now and navigate to a city stub if chosen.
    // eslint-disable-next-line no-console
    console.log("[search]", { city, carType, rental });
    if (city) router.push(`/rent-a-car-${city}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "w-full max-w-4xl rounded-2xl bg-white shadow-lg ring-1 ring-stone-200",
        "p-3 sm:p-4"
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
        {/* City */}
        <div className="sm:col-span-4">
          <FieldLabel htmlFor="search-city">
            <MapPin className="h-3.5 w-3.5" /> City
          </FieldLabel>
          <SelectField
            id="search-city"
            value={city}
            onChange={(v) => setCity(v)}
            placeholder="Select city"
            options={cities.map((c) => ({
              value: c.slug,
              label: `${c.name} (${c.listingCount})`,
            }))}
          />
        </div>

        {/* Car type */}
        <div className="sm:col-span-4">
          <FieldLabel htmlFor="search-car">
            <CarIcon className="h-3.5 w-3.5" /> Car Type
          </FieldLabel>
          <SelectField
            id="search-car"
            value={carType}
            onChange={(v) => setCarType(v)}
            placeholder="Any car"
            options={popularCarTypes.map((c) => ({
              value: c.slug,
              label: c.name,
            }))}
          />
        </div>

        {/* Rental toggle */}
        <div className="sm:col-span-4">
          <FieldLabel>Rental Type</FieldLabel>
          <div className="flex h-11 rounded-xl bg-stone-100 p-1 text-sm font-semibold">
            <ToggleBtn
              active={rental === "with-driver"}
              onClick={() => setRental("with-driver")}
            >
              With Driver
            </ToggleBtn>
            <ToggleBtn
              active={rental === "self-drive"}
              onClick={() => setRental("self-drive")}
            >
              Self-Drive
            </ToggleBtn>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="mt-3 sm:mt-4 w-full text-base"
      >
        <Search className="h-5 w-5" />
        Search Rentals
      </Button>
    </form>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"
    >
      {children}
    </label>
  );
}

function SelectField({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white",
          "px-3 pr-9 text-sm font-medium text-stone-900",
          "focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg text-xs sm:text-sm transition-all",
        active
          ? "bg-white text-stone-900 shadow-sm"
          : "text-stone-600 hover:text-stone-900"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
