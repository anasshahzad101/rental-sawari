import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getListing } from "@/lib/admin/repo/listings";
import { parseRange, rangeQuery } from "@/lib/admin/ranges";
import { PageBody, PageTop } from "@/components/admin/shell";
import { ListingTop } from "./ListingTop";
import StatsTab from "./StatsTab";
import EditTab from "./EditTab";
import HistoryTab from "./HistoryTab";

/**
 * /admin/listings/{id}            → Stats (default)
 * /admin/listings/{id}?tab=edit   → Edit
 * /admin/listings/{id}?tab=history → History
 */

type SP = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const l = await getListing(Number(params.id));
  return { title: l ? l.name : "Listing" };
}

export default async function ListingPage({ params, searchParams }: { params: { id: string }; searchParams: SP }) {
  await requireAdmin();
  const listing = await getListing(Number(params.id));
  if (!listing) notFound();
  const raw = Array.isArray(searchParams.tab) ? searchParams.tab[0] : searchParams.tab;
  const tab = raw === "edit" ? "edit" : raw === "history" ? "history" : "stats";
  const query = tab === "stats" ? rangeQuery(parseRange(searchParams)) : "";

  return (
    <>
      <PageTop title="Listings" mobileTitle={listing.name} dateRange={tab === "stats"} back={{ href: "/admin/listings" }} />
      <PageBody>
        <ListingTop listing={listing} tab={tab} query={query} />
        {tab === "stats" && <StatsTab listing={listing} searchParams={searchParams} />}
        {tab === "edit" && <EditTab listing={listing} />}
        {tab === "history" && <HistoryTab listing={listing} />}
      </PageBody>
    </>
  );
}
