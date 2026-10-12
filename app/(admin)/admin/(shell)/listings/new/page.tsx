import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { areasByCity } from "@/lib/admin/repo/listings";
import { PageBody, PageTop } from "@/components/admin/shell";
import { ListingForm } from "../[id]/_edit/ListingForm";
import { EMPTY_INPUT } from "../[id]/_edit/model";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Add listing" };

/** Add listing: the Edit form, empty. New listings start on Free and Live. */
export default async function NewListingPage() {
  await requireAdmin();
  const areas = await areasByCity();
  return (
    <>
      <PageTop title="Add listing" back={{ href: "/admin/listings" }} />
      <PageBody>
        {/* Mobile has the back arrow and title in the top bar. */}
        <div className="hidden flex-col gap-5 lg:flex">
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-1.5 self-start text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            All listings
          </Link>
          <h2 className="text-page-title text-ink">Add listing</h2>
        </div>
        <ListingForm mode="add" initial={EMPTY_INPUT} areas={areas} />
      </PageBody>
    </>
  );
}
