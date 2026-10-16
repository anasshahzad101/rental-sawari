import * as React from "react";
import { Skeleton } from "@/components/admin/ui/Skeleton";
import { StatCard } from "@/components/admin/ui/StatCard";

/** Overview loading state: skeleton tiles, stat cards and chart. */
export function OverviewSkeleton() {
  return (
    <>
      <div aria-busy="true" aria-label="Loading" className="contents">
        {/* Needs you: heading, then 5 tiles (desktop) or one card of rows (mobile). */}
        <Skeleton className="mt-1 h-[18px] w-[120px] rounded-[9px] lg:mt-0" />
        <div className="hidden grid-cols-5 gap-4 lg:grid">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex h-[132px] flex-col gap-3 rounded-card border border-line bg-white p-[18px]">
              <Skeleton shimmer={false} className="size-9 rounded-[10px]" />
              <Skeleton className="h-6 w-10 rounded-md" />
              <Skeleton shimmer={false} className="h-3 w-[120px] rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex flex-col overflow-hidden rounded-card border border-line bg-white lg:hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex min-h-[60px] items-center gap-3 border-b border-fill px-3.5 py-2 last:border-b-0">
              <Skeleton shimmer={false} className="size-9 flex-none rounded-[10px]" />
              <span className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-36 rounded-md" />
                <Skeleton shimmer={false} className="h-2.5 w-24 rounded-md" />
              </span>
              <Skeleton className="h-6 w-8 rounded-md" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <StatCard key={i} label="" loading className="lg:h-[190px]" />
          ))}
        </div>

        <div className="flex h-[260px] flex-col gap-4 rounded-card border border-line bg-white p-4 lg:h-[340px] lg:p-6">
          <Skeleton shimmer={false} className="h-4 w-[200px] rounded-lg" />
          <Skeleton className="flex-1 rounded-control" />
        </div>
      </div>
    </>
  );
}
