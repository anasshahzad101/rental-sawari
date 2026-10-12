import type { Metadata } from "next";
import { Star } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { addMonths, fmtMonth, pktDay } from "@/lib/admin/format";
import { getPlanRows, last30ById } from "@/lib/admin/repo/analytics";
import { PageBody, PageTop } from "@/components/admin/shell";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { PlansView } from "./_parts/PlansView";
import { SummaryCards } from "./_parts/SummaryCards";
import { ended, type MonthOption, type PlanItem } from "./_parts/plan-utils";

/**
 * /admin/plans — Featured plans: who's paying, when it ends, and what they
 * got for it. Sorted by days left; nothing switches back to Free by itself.
 */

export const metadata: Metadata = { title: "Featured plans" };
export const dynamic = "force-dynamic";

/** Months for the monthly stats picker: tracking start (max 12 back) → last month, newest first. */
function monthOptions(trackingStart: string, today: string): MonthOption[] {
  const last = addMonths(`${today.slice(0, 8)}01`, -1);
  const earliest = addMonths(last, -11);
  let m = `${trackingStart.slice(0, 8)}01`;
  if (m < earliest) m = earliest;
  const out: MonthOption[] = [];
  while (m <= last) {
    out.push({ value: m, label: fmtMonth(m) });
    m = addMonths(m, 1);
  }
  if (!out.length) out.push({ value: last, label: fmtMonth(last) });
  return out.reverse();
}

export default async function PlansPage() {
  await requireAdmin();
  const [data, last30] = await Promise.all([getPlanRows(), last30ById()]);
  const today = pktDay();

  const items: PlanItem[] = data.rows.map(({ listing: l, daysLeft, opened, contacted }) => {
    const t = last30.get(l.id);
    return {
      id: l.id,
      name: l.name,
      city: l.city,
      logoUrl: l.logoUrl,
      whatsapp: l.whatsapp,
      plan: l.plan,
      planStart: l.planStart,
      planEnd: l.planEnd,
      daysLeft,
      opened,
      contacted,
      opened30: t?.opened ?? 0,
      contacted30: t?.contacted ?? 0,
    };
  });

  const endingSoon = items.filter((p) => p.daysLeft != null && p.daysLeft >= 0 && p.daysLeft <= 7).map((p) => p.name);
  const endedNames = items.filter(ended).map((p) => p.name);

  return (
    <>
      <PageTop title="Featured plans" />
      <PageBody>
        {items.length === 0 ? (
          <div className="rounded-card border border-line bg-white shadow-card">
            <EmptyState
              icon={Star}
              className="py-12 lg:py-16"
              title="No Featured listings right now"
              body="When a company pays for Featured City or Featured Plus, set the plan and its dates in the listing's Edit tab. It will show here with its end date."
              action={
                <Button variant="secondary" href="/admin/listings">
                  Go to Listings
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <SummaryCards
              total={items.length}
              city={items.filter((p) => p.plan === "city").length}
              plus={items.filter((p) => p.plan === "plus").length}
              endingSoon={endingSoon}
              endedNames={endedNames}
              featuredAvg30={data.featuredAvg30}
              freeAvg30={data.freeAvg30}
              multiple={data.multiple}
            />
            <PlansView items={items} today={today} months={monthOptions(data.trackingStart, today)} />
          </>
        )}
      </PageBody>
    </>
  );
}
