import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { parseRange, rangeQuery } from "@/lib/admin/ranges";
import { PageBody, PageTop } from "@/components/admin/shell";
import { OverviewContent } from "./_overview/OverviewContent";
import { OverviewSkeleton } from "./_overview/OverviewSkeleton";

/**
 * /admin — "How is the site doing, and what needs me?" What needs you comes
 * first, then the numbers for the chosen range (?range=…&compare=…).
 */

type SP = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const range = parseRange(searchParams);
  return (
    <>
      <PageTop title="Overview" dateRange />
      <PageBody className="lg:pt-7">
        {/* Keyed by the range so a new range shows the skeleton while it loads. */}
        <Suspense key={rangeQuery(range)} fallback={<OverviewSkeleton />}>
          <OverviewContent range={range} />
        </Suspense>
      </PageBody>
    </>
  );
}
