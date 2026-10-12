import { Suspense } from "react";
import type { Listing, RangeInfo } from "@/lib/admin/types";
import { parseRange, rangeQuery } from "@/lib/admin/ranges";
import { getListingStats, getMonthStats, monthlyMessage, type ListingStats, type MonthStats } from "@/lib/admin/repo/analytics";
import { Banner } from "@/components/admin/ui/Banner";
import { RetryButton } from "./_stats/RetryButton";
import { StatsLoading } from "./_stats/StatsLoading";
import {
  BusiestCard,
  CityCard,
  CompletenessCard,
  ContactMethodsCard,
  DevicesCard,
  EntriesCard,
  FunnelCard,
  ListsCard,
  MonthlyCard,
  OverTimeCard,
  SourcesCard,
  StatCards,
  StatsFooter,
  StatsNotes,
} from "./_stats/sections";

/**
 * Listing › Stats: the deep numbers for one listing, in the design's order
 * (Page 5). Every number follows the date range in the URL. The body streams
 * in behind the loading skeleton; a new range shows the skeleton again.
 */
export default async function StatsTab({
  listing,
  searchParams,
}: {
  listing: Listing;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const range = parseRange(searchParams);
  return (
    <Suspense key={`${listing.id}?${rangeQuery(range)}`} fallback={<StatsLoading />}>
      <StatsBody listing={listing} range={range} />
    </Suspense>
  );
}

async function StatsBody({ listing, range }: { listing: Listing; range: RangeInfo }) {
  let s: ListingStats;
  let month: MonthStats;
  try {
    [s, month] = await Promise.all([getListingStats(listing, range), getMonthStats(listing)]);
  } catch (err) {
    console.error("[admin] listing stats failed", err);
    return (
      <Banner tone="error" title="Couldn't load the numbers." actions={<RetryButton />}>
        Check your connection and try again.
      </Banner>
    );
  }

  return (
    <>
      <StatsNotes s={s} />
      <StatCards s={s} />
      <FunnelCard s={s} />
      <OverTimeCard s={s} />
      <div className="grid gap-3 lg:gap-6 xl:grid-cols-2">
        <ContactMethodsCard s={s} />
        <CityCard s={s} />
      </div>
      <ListsCard s={s} />
      <div className="grid gap-3 lg:gap-6 xl:grid-cols-2">
        <SourcesCard s={s} />
        <EntriesCard s={s} />
      </div>
      <div className="grid gap-3 lg:gap-6 min-[1384px]:grid-cols-[minmax(0,1fr)_360px]">
        <BusiestCard s={s} />
        <DevicesCard s={s} />
      </div>
      <div className="grid gap-3 lg:gap-6 xl:grid-cols-2">
        <CompletenessCard listing={listing} s={s} />
        <MonthlyCard listing={listing} month={month} message={monthlyMessage(listing, month)} />
      </div>
      <StatsFooter s={s} />
    </>
  );
}
