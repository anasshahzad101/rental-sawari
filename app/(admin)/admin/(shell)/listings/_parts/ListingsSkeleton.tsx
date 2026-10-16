import * as React from "react";
import { Download, Plus, Search } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { Skeleton } from "@/components/admin/ui/Skeleton";

const WIDTHS = [190, 150, 210, 170, 140, 200, 160, 180];
const COLS = "grid-cols-[minmax(0,1fr)_104px_64px_64px_64px_80px_76px_60px_80px_72px_100px]";

/** Loading: the toolbar as it will look, then a skeleton table (cards on mobile). */
export function ListingsSkeleton({ exportHref }: { exportHref: string }) {
  return (
    <div className="flex flex-col gap-3 lg:gap-4" aria-busy="true" aria-label="Loading listings">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-full items-center gap-2.5 rounded-control border border-line bg-white px-3.5 text-[16px]/[24px] text-[#A8A29E] lg:h-11 lg:max-w-[420px] lg:text-[15px]/[22px]">
          <Search size={20} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" />
          Filter by name, phone or area
        </div>
        <div className="ml-auto hidden gap-2 lg:flex">
          <Button variant="secondary" size="lg" icon={Download} href={exportHref} className="lg:px-4">
            Export CSV
          </Button>
          <Button variant="primary" size="lg" icon={Plus} href="/admin/listings/new" className="lg:px-4">
            Add listing
          </Button>
        </div>
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        {[64, 64, 64, 84, 74].map((w, i) => (
          <Skeleton key={i} shimmer={false} className="h-9 rounded-full" style={{ width: w }} />
        ))}
        <span className="mx-1 h-6 w-px bg-line" />
        <Skeleton shimmer={false} className="h-9 w-[150px] rounded-full" />
        <Skeleton shimmer={false} className="h-9 w-[118px] rounded-full" />
        <Skeleton className="ml-auto h-3 w-[220px] rounded-md" />
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-card border border-line bg-white shadow-card lg:block">
        <div className="h-12 border-b border-line bg-page" />
        {WIDTHS.map((w, i) => (
          <div key={i} className={`grid h-14 items-center gap-2 border-b border-fill px-5 last:border-b-0 ${COLS}`}>
            <span className="flex items-center gap-3">
              <Skeleton className="size-10 flex-none rounded-control" />
              <span className="flex flex-col gap-1.5">
                <Skeleton className="h-3 rounded-md" style={{ width: w }} />
                <Skeleton shimmer={false} className="h-2.5 w-[110px] rounded-[5px]" />
              </span>
            </span>
            <Skeleton shimmer={false} className="h-[22px] w-20 rounded-full" />
            {[44, 40, 36, 32, 40, 28, 48].map((cw, k) => (
              <Skeleton key={k} shimmer={false} className="h-3 justify-self-end rounded-md" style={{ width: cw }} />
            ))}
            <Skeleton shimmer={false} className="h-[18px] w-16 justify-self-end rounded-md" />
            <Skeleton shimmer={false} className="h-3 w-20 justify-self-end rounded-md" />
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex gap-2">
          <Skeleton shimmer={false} className="h-11 flex-1 rounded-control" />
          <Skeleton shimmer={false} className="h-11 w-[92px] rounded-control" />
        </div>
        {WIDTHS.slice(0, 5).map((w, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-card border border-line bg-white px-4 py-3.5">
            <span className="flex items-center gap-3">
              <Skeleton className="size-10 flex-none rounded-control" />
              <span className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 rounded-md" style={{ width: Math.min(w, 180) }} />
                <Skeleton shimmer={false} className="h-2.5 w-24 rounded-[5px]" />
              </span>
              <Skeleton shimmer={false} className="h-6 w-14 rounded-full" />
            </span>
            <span className="grid grid-cols-3 gap-2 border-t border-fill pt-3">
              {[0, 1, 2].map((k) => (
                <Skeleton key={k} shimmer={false} className="h-8 rounded-md" />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
