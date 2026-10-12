import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MIN_OPENS } from "@/lib/admin/constants";
import { fmtNum, fmtPct } from "@/lib/admin/format";
import type { Listing, Totals } from "@/lib/admin/types";
import { Card } from "@/components/admin/ui/Card";
import { Avatar } from "@/components/admin/ui/Avatar";
import { PlanBadge } from "@/components/admin/ui/StatusPill";
import { cx } from "@/components/admin/ui/cx";
import { Sparkline } from "@/components/admin/charts/Sparkline";
import { MethodTotals, WebsiteClicksFooter } from "@/components/admin/charts/MethodTotals";
import { StackedBar } from "@/components/admin/charts/StackedBar";

/** Server-rendered Overview cards (the kit charts inside are client islands). */

const place = (l: Pick<Listing, "city" | "area">) => (l.area ? `${l.city} · ${l.area}` : l.city);

function SeeAll({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx("inline-flex items-center gap-1.5 text-[15px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline", className)}>
      {children}
      <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}

// ── Contacts by method ───────────────────────────────────────────────────

const METHODS = [
  { key: "wa", label: "WhatsApp", color: "#25D366" },
  { key: "call", label: "Call", color: "#0F766E" },
  { key: "form", label: "Inquiry form", color: "#EA580C" },
] as const;

export function MethodsCard({
  totals,
  days,
  wa,
  call,
  form,
  className,
}: {
  totals: Totals;
  days: string[];
  wa: number[];
  call: number[];
  form: number[];
  className?: string;
}) {
  const total = totals.wa + totals.call + totals.form;
  const share = (v: number) => (total ? v / total : null);
  return (
    <Card
      title="Contacts by method"
      info="contacted"
      subtitle={<span className="max-lg:hidden">{`${fmtNum(totals.contacted)} contacts`}</span>}
      className={className}
      headerClassName="max-lg:mb-0"
    >
      {/* Desktop: totals, 100% bar, per-day stacked bar, website clicks footer. */}
      <div className="hidden lg:block">
        <MethodTotals
          size="md"
          wa={totals.wa}
          call={totals.call}
          form={totals.form}
          chart={<StackedBar days={days} wa={wa} call={call} form={form} height={150} />}
          footer={<WebsiteClicksFooter count={totals.web} info={null} />}
        />
      </div>
      {/* Mobile: the 100% bar, then a list. */}
      <div className="lg:hidden">
        <div className="mb-3 mt-3.5 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
          {total ? (
            <>
              {totals.wa ? <span style={{ width: `${(totals.wa / total) * 100}%`, background: "#25D366" }} /> : null}
              {totals.call ? <span style={{ width: `${(totals.call / total) * 100}%`, background: "#0F766E" }} /> : null}
              {totals.form ? <span className="flex-1" style={{ background: "#EA580C" }} /> : null}
            </>
          ) : (
            <span className="flex-1 bg-fill" />
          )}
        </div>
        <div className="num flex flex-col text-[15px]/[22px] font-medium text-ink">
          {METHODS.map((m) => (
            <div key={m.key} className="flex h-10 items-center gap-2">
              <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px]" style={{ background: m.color }} />
              {m.label}
              <b className="ml-auto font-bold">{fmtNum(totals[m.key])}</b>
              <span className="w-12 text-right text-[13px] text-muted">{fmtPct(share(totals[m.key]))}</span>
            </div>
          ))}
          <div className="flex h-10 items-center gap-2 border-t border-fill text-muted">
            <span aria-hidden="true" className="size-2.5 flex-none rounded-[3px] bg-chart-website" />
            Website clicks
            <b className="ml-auto font-bold text-ink">{fmtNum(totals.web)}</b>
            <span className="w-12 text-right text-[12px]">separate</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Top cities ───────────────────────────────────────────────────────────

export function TopCitiesCard({
  rows,
  other,
  citiesOnSite,
  className,
}: {
  rows: { city: string; contacted: number; opened: number }[];
  other: { count: number; contacted: number };
  citiesOnSite: number;
  className?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.contacted));
  const w = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  const bar = (v: number) => (
    <span className="block h-2 overflow-hidden rounded-full bg-fill">
      <span className="block h-full rounded-full bg-accent-600" style={{ width: w(v) }} />
    </span>
  );
  const cols = "grid-cols-[110px_minmax(0,1fr)_72px_72px]";
  return (
    <Card
      title="Top cities"
      info={{ title: "Top cities", body: "Cities ranked by Contacted: WhatsApp clicks + Call clicks + Inquiry forms sent, for every listing in that city." }}
      subtitle={<span className="max-lg:hidden">{`By contacts · ${fmtNum(citiesOnSite)} cities on the site`}</span>}
      className={className}
      headerClassName="max-lg:mb-1.5"
    >
      {rows.length === 0 ? (
        <p className="py-6 text-center text-body text-muted">No contacts in this range yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className={cx("text-overline grid h-9 items-center gap-3 border-b border-line uppercase text-muted", cols)}>
              <span>City</span>
              <span />
              <span className="text-right">Contacted</span>
              <span className="text-right">Opened</span>
            </div>
            {rows.map((r) => (
              <div key={r.city} className={cx("num grid h-[52px] items-center gap-3 text-[15px]/[22px] font-medium text-ink", cols)}>
                <span className="truncate">{r.city}</span>
                {bar(r.contacted)}
                <span className="text-right font-bold">{fmtNum(r.contacted)}</span>
                <span className="text-right text-muted">{fmtNum(r.opened)}</span>
              </div>
            ))}
            <div className="num mt-2.5 border-t border-fill pt-3.5 text-label text-muted">
              Bars are scaled to the top city.
              {other.count > 0
                ? ` The other ${fmtNum(other.count)} ${other.count === 1 ? "city has" : "cities share"} ${fmtNum(other.contacted)} ${other.contacted === 1 ? "contact" : "contacts"}.`
                : null}
            </div>
          </div>
          {/* Mobile list */}
          <div className="flex flex-col lg:hidden">
            {rows.map((r, i) => (
              <div key={r.city} className={cx("flex flex-col gap-1.5 py-2", i < rows.length - 1 && "border-b border-fill")}>
                <div className="num flex justify-between gap-3 text-[15px]/[22px] font-medium text-ink">
                  <span className="truncate">{r.city}</span>
                  <span className="flex-none">
                    <b className="font-bold">{fmtNum(r.contacted)}</b> <span className="text-[13px] text-muted">· {fmtNum(r.opened)} opened</span>
                  </span>
                </div>
                {bar(r.contacted)}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ── Top listings ─────────────────────────────────────────────────────────

export interface TopListingRow {
  id: number;
  name: string;
  city: string;
  area: string;
  logoUrl: string | null;
  plan: Listing["plan"];
  opened: number;
  contacted: number;
  spark: number[];
}

function rateText(r: TopListingRow): string | null {
  return r.opened >= MIN_OPENS ? fmtPct(r.contacted / r.opened) : null;
}

export function TopListingsCard({ rows, query, className }: { rows: TopListingRow[]; query: string; className?: string }) {
  const seeAll = `/admin/listings?${query}`;
  const href = (id: number) => `/admin/listings/${id}?${query}`;
  const cols = "grid-cols-[28px_minmax(0,1fr)_120px_84px_96px_110px_88px]";
  return (
    <Card
      padded={false}
      title="Top listings"
      info="contacted"
      subtitle={<span className="max-lg:hidden">Top 10 by contacts</span>}
      actions={<SeeAll href={seeAll} className="max-lg:hidden">See all in Listings</SeeAll>}
      className={cx("overflow-hidden", className)}
      headerClassName="max-lg:mb-2"
    >
      {rows.length === 0 ? (
        <p className="border-t border-fill px-6 py-8 text-center text-body text-muted">No contacts in this range yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className={cx("text-overline grid h-10 items-center gap-4 border-y border-line bg-page px-6 uppercase text-muted", cols)}>
              <span>#</span>
              <span>Listing</span>
              <span>Plan</span>
              <span className="text-right">Opened</span>
              <span className="text-right">Contacted ↓</span>
              <span className="text-right">Contact rate</span>
              <span className="text-right">Trend</span>
            </div>
            {rows.map((r, i) => {
              const rate = rateText(r);
              return (
                <Link
                  key={r.id}
                  href={href(r.id)}
                  className={cx(
                    "num grid h-14 items-center gap-4 border-b border-fill px-6 text-[15px]/[22px] font-medium text-ink outline-none transition-colors last:border-b-0 hover:bg-fill focus-visible:bg-fill",
                    cols,
                  )}
                >
                  <span className="text-[13px]/[18px] font-semibold text-muted">{i + 1}</span>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={r.name} logoUrl={r.logoUrl} size={40} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px]/[22px] font-semibold">{r.name}</span>
                      <span className="truncate text-[13px]/[18px] font-medium text-muted">{place(r)}</span>
                    </span>
                  </span>
                  <span>
                    <PlanBadge plan={r.plan} />
                  </span>
                  <span className="text-right">{fmtNum(r.opened)}</span>
                  <span className="text-right font-bold">{fmtNum(r.contacted)}</span>
                  {rate ? (
                    <span className="text-right">{rate}</span>
                  ) : (
                    <span className="text-right text-[13px]/[18px] font-semibold text-quiet-text">Not enough data yet</span>
                  )}
                  <span className="flex justify-end">
                    <Sparkline values={r.spark} width={80} height={24} area={false} strokeWidth={1.5} />
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Mobile: top 5 */}
          <div className="flex flex-col lg:hidden">
            {rows.slice(0, 5).map((r) => {
              const rate = rateText(r);
              return (
                <Link key={r.id} href={href(r.id)} className="flex min-h-16 items-center gap-3 border-t border-fill px-4 py-2 active:bg-fill">
                  <Avatar name={r.name} logoUrl={r.logoUrl} size={40} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[16px]/[22px] font-semibold text-ink">{r.name}</span>
                    <span className="num truncate text-[13px]/[18px] font-medium text-muted">
                      {r.city} · {rate ? `${rate} contact rate` : "not enough data yet"}
                    </span>
                  </span>
                  <span className="flex flex-none flex-col items-end text-[12px]/[16px] font-medium text-muted">
                    <b className="num text-[17px]/[22px] font-extrabold text-ink">{fmtNum(r.contacted)}</b>
                    contacted
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
      <Link
        href={seeAll}
        className="flex h-12 items-center justify-center gap-1.5 border-t border-fill text-[15px]/[22px] font-semibold text-brand-700 lg:hidden"
      >
        See all in Listings
        <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </Card>
  );
}

// ── Featured against Free ────────────────────────────────────────────────

function fmtAvg(v: number): string {
  return v >= 10 ? fmtNum(v) : v.toFixed(1);
}

export function fmtMultiple(m: number): string {
  const s = m.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function FeaturedVsFreeCard({
  featured,
  free,
  multiple,
  periodText,
  className,
}: {
  featured: { count: number; avg: number };
  free: { count: number; avg: number };
  multiple: number | null;
  /** "last 30 days" */
  periodText: string;
  className?: string;
}) {
  const top = Math.max(featured.avg, free.avg);
  const w = (v: number) => (top ? `${Math.max(v > 0 ? 1 : 0, (v / top) * 100)}%` : "0%");

  let headline: React.ReactNode;
  if (multiple != null && multiple >= 1.05) {
    headline = (
      <>
        Featured listings got <span className="text-accent-700">{fmtMultiple(multiple)}×</span> more contacts
      </>
    );
  } else if (multiple != null && multiple > 0.95) {
    headline = <>Featured and Free listings got about the same contacts</>;
  } else if (multiple != null) {
    headline = (
      <>
        Featured listings got <span className="text-accent-700">{fmtMultiple(multiple)}×</span> the contacts of Free
      </>
    );
  } else {
    headline = (
      <span className="text-quiet-text">
        {featured.count === 0 ? "No listings are on a Featured plan yet" : "Not enough data yet to compare"}
      </span>
    );
  }

  const row = (label: string, n: number, avg: number, color: string) => (
    <div className="flex flex-col gap-1.5">
      <div className="num flex justify-between text-[15px]/[22px] font-medium text-ink">
        <span className="flex items-center gap-2">
          <span className="lg:hidden">
            {label} · {fmtNum(n)}
          </span>
          <span className="max-lg:hidden">{label}</span>
          <span className="text-label text-muted max-lg:hidden">{`${fmtNum(n)} ${n === 1 ? "listing" : "listings"}`}</span>
        </span>
        <b className="font-bold lg:text-[17px]/[24px] lg:font-extrabold">{fmtAvg(avg)}</b>
      </div>
      <span className="block h-3 overflow-hidden rounded-full bg-fill lg:h-3.5">
        <span className="block h-full rounded-full" style={{ width: w(avg), background: color }} />
      </span>
    </div>
  );

  return (
    <Card
      title="Featured against Free"
      info={{
        title: "Featured against Free",
        body: "Average Contacted per live listing on a Featured plan, against the average for a live listing on Free, in the chosen range.",
      }}
      subtitle={<span className="max-lg:hidden">{`Average contacts per listing, ${periodText}`}</span>}
      className={cx("flex flex-col", className)}
      headerClassName="max-lg:mb-0"
    >
      <div className="mt-2.5 text-[22px]/[28px] font-extrabold tracking-[-0.02em] text-ink [text-wrap:pretty] lg:mt-1 lg:text-[28px]/[34px]">
        {headline}
      </div>
      <div className="mt-4 flex flex-col gap-3 lg:mt-6 lg:gap-4">
        {row("Featured", featured.count, featured.avg, "#EA580C")}
        {row("Free", free.count, free.avg, "#A8A29E")}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-label text-muted lg:mt-auto lg:pt-5">
        <div className="hidden w-full items-center justify-between gap-3 border-t border-fill pt-3.5 lg:flex">
          <span>Use this when selling a plan.</span>
          <SeeAll href="/admin/plans">Featured plans</SeeAll>
        </div>
        <SeeAll href="/admin/plans" className="h-11 lg:hidden">
          Featured plans
        </SeeAll>
      </div>
    </Card>
  );
}
