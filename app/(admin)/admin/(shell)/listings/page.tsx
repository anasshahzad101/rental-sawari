import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { normalizePhone } from "@/lib/admin/format";
import { parseRange, rangeQuery } from "@/lib/admin/ranges";
import { getListingRows, type ListingRow } from "@/lib/admin/repo/analytics";
import type { RangeInfo } from "@/lib/admin/types";
import { PageBody, PageTop } from "@/components/admin/shell";
import { ListingsSkeleton } from "./_parts/ListingsSkeleton";
import { ListingsView } from "./_parts/ListingsView";
import { pack, type LRow } from "./_parts/model";

/**
 * /admin/listings — every listing with its numbers for the chosen range.
 * Filtering, sorting and paging run in the browser on the rows sent here,
 * and are kept in the URL (?q=&city=&area=&plan=&verified=&status=&under50=1
 * &zero=1&sort=contacted&dir=desc&page=1) next to the range.
 */

type SP = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Listings" };

/** At most 30 points for the 72 px trend line. */
function downsample(v: number[], n = 30): number[] {
  if (!v.some(Boolean)) return [];
  if (v.length <= n) return v;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.floor((i * v.length) / n);
    const b = Math.floor(((i + 1) * v.length) / n);
    let s = 0;
    for (let k = a; k < b; k++) s += v[k];
    out.push(s);
  }
  return out;
}

function lean(r: ListingRow): LRow {
  const l = r.listing;
  const phones = Array.from(
    new Set(
      [l.whatsapp, l.phone, l.phone2]
        .map((p) => normalizePhone(p)?.slice(3))
        .filter((p): p is string => !!p),
    ),
  );
  return {
    id: l.id,
    slug: l.slug,
    name: l.name,
    city: l.city,
    area: l.area.trim(),
    logo: l.logoUrl,
    plan: l.plan,
    verified: l.verified,
    hidden: l.status === "hidden",
    hiddenAt: l.hiddenAt,
    updatedAt: l.updatedAt,
    phones,
    shown: r.totals.shown,
    opened: r.totals.opened,
    contacted: r.totals.contacted,
    avgPos: r.avgPos == null ? null : Math.round(r.avgPos * 10) / 10,
    rank: r.rank?.rank ?? null,
    of: r.rank?.of ?? null,
    spark: downsample(r.spark),
    comp: r.completeness,
  };
}

async function ListingsData({ range }: { range: RangeInfo }) {
  const { rows } = await getListingRows(range);
  return <ListingsView data={rows.map((r) => pack(lean(r)))} rangeQ={rangeQuery(range)} rangeLabel={range.label} />;
}

export default async function ListingsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const range = parseRange(searchParams);
  return (
    <>
      <PageTop title="Listings" dateRange />
      <PageBody className="lg:pt-7">
        {/* Keyed by the range: a new range shows the skeleton while it loads. */}
        <Suspense key={rangeQuery(range)} fallback={<ListingsSkeleton exportHref={`/api/admin/export/listings?${rangeQuery(range)}`} />}>
          <ListingsData range={range} />
        </Suspense>
      </PageBody>
    </>
  );
}
