import { StatCard } from "@/components/admin/ui/StatCard";
import { Skeleton } from "@/components/admin/ui/Skeleton";

/** Loading state: six stat-card skeletons and one chart block (Page 5 › States › Loading). */
export function StatsLoading() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6" aria-busy="true" aria-label="Loading the numbers">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <StatCard key={k} label="" loading className="min-h-[136px] lg:min-h-[170px]" />
        ))}
      </div>
      <div className="flex h-[180px] gap-4 rounded-card border border-line bg-white p-4 shadow-card lg:gap-6 lg:p-6" aria-hidden="true">
        <Skeleton className="h-full flex-1 rounded-control" />
        <Skeleton className="h-full flex-1 rounded-control" shimmer={false} />
        <Skeleton className="h-full flex-1 rounded-control max-lg:hidden" shimmer={false} />
      </div>
    </>
  );
}
