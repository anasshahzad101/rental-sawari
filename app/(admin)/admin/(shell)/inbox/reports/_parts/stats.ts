import "server-only";
import { parseRange } from "@/lib/admin/ranges";
import { getListingStats } from "@/lib/admin/repo/analytics";
import type { Listing } from "@/lib/admin/types";

/** The reported listing's last 30 days: Opened, Contacted and the daily opens (sparkline). One listing only. */
export interface MiniStats {
  opened: number;
  contacted: number;
  spark: number[];
}

export async function miniStats(listing: Listing): Promise<MiniStats | null> {
  try {
    const s = await getListingStats(listing, parseRange({ range: "last30", compare: "0" }));
    return { opened: s.totals.opened, contacted: s.totals.contacted, spark: s.series.opened };
  } catch {
    return null;
  }
}
