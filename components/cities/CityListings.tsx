"use client";

import * as React from "react";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { CityFilterBar, type FilterValue } from "./CityFilterBar";
import type { Company } from "@/lib/types";

interface CityListingsProps {
  companies: Company[];
  areas: string[];
  carTypes: Array<{ slug: string; name: string }>;
  services: string[];
}

export function CityListings({
  companies,
  areas,
  carTypes,
  services,
}: CityListingsProps) {
  const [filter, setFilter] = React.useState<FilterValue>({
    area: "",
    carType: "",
    rental: "",
    service: "",
  });

  const filtered = React.useMemo(() => {
    return companies.filter((c) => {
      if (filter.area && c.area !== filter.area) return false;
      if (filter.service && !c.servicesOffered.includes(filter.service))
        return false;
      if (filter.carType) {
        // crude match — the mock company.topCars uses display names, not slugs.
        // Match by slug-ifying the topCar name. Works for the homepage data set.
        const hit = (c.topCars ?? []).some(
          (car) =>
            car.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") === filter.carType
        );
        if (!hit) return false;
      }
      if (filter.rental === "with-driver") {
        if (!c.servicesOffered.includes("With Driver")) return false;
      }
      if (filter.rental === "self-drive") {
        if (!c.servicesOffered.includes("Self-Drive")) return false;
      }
      return true;
    });
  }, [companies, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <CityFilterBar
        areas={areas}
        carTypes={carTypes}
        services={services}
        onChange={setFilter}
      />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-stone-600">
          Showing <span className="font-bold text-stone-900">{filtered.length}</span>{" "}
          of {companies.length} rental companies
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
          <p className="text-base font-semibold text-stone-900">
            No companies match your filters
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Try resetting filters or adjusting your search.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((c) => (
            <li key={c.slug}>
              <CompanyCard company={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
