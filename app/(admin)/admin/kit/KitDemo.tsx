"use client";

import * as React from "react";
import { useState } from "react";
import {
  CalendarClock,
  Copy,
  Download,
  Ellipsis,
  EyeOff,
  Flag,
  Inbox,
  Link2,
  MessageSquareText,
  Pencil,
  Phone,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import type { CarRow } from "@/lib/admin/types";
import { countDelta, rateDelta } from "@/lib/admin/format";
import {
  AreaInput,
  Avatar,
  Banner,
  Button,
  Card,
  CarsRepeater,
  Checkbox,
  CityPicker,
  ConfirmDialog,
  Delta,
  DiffCompact,
  DiffNew,
  DiffOld,
  DiffTable,
  EmptyState,
  Field,
  IconButton,
  InfoTooltip,
  LogoUpload,
  Menu,
  MenuList,
  Modal,
  PhoneInput,
  PlanBadge,
  Popover,
  QuietNote,
  Radio,
  RadioCard,
  Segmented,
  Select,
  ServiceChips,
  Skeleton,
  StatCard,
  StatusPill,
  Tabs,
  Textarea,
  TextInput,
  Toggle,
  ToggleRow,
  VerifiedBadge,
  VerifiedMark,
  WhatsAppPreview,
  useToast,
  type DiffRowData,
} from "@/components/admin/ui";
import {
  BarList,
  CompletenessRing,
  DevicesBar,
  Donut,
  Funnel,
  HeatLegend,
  Heatmap,
  LineChart,
  MethodTotals,
  Sparkline,
  StackedBar,
  WebsiteClicksFooter,
} from "@/components/admin/charts";
import { InboxTabs, ListingHeader, PageBody, PageTop } from "@/components/admin/shell";
import {
  ABOUT_NEW,
  ABOUT_OLD,
  CALL,
  CHENAB,
  CONFIRM_MESSAGE,
  CONTACTED,
  DAYS,
  FORM,
  HEAT,
  ISLAMABAD_AREAS,
  MONTHLY_MESSAGE,
  OPENED,
  PREV_DAYS,
  PREV_OPENED,
  RANGE90,
  RATE,
  SHOWN,
  WA,
  mockSearch,
} from "./sample";

function Section({ n, title, children, sub }: { n: number; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 lg:gap-6" id={`s${n}`}>
      <div className="max-w-[900px] border-t border-line pt-6 lg:pt-10">
        <div className="text-[13px]/[18px] font-bold tracking-[0.06em] text-brand-700">{n}</div>
        <h2 className="mt-1 text-[22px]/[28px] font-extrabold tracking-[-0.02em] text-ink lg:text-[32px]/[38px]">{title}</h2>
        {sub ? <p className="mt-2 text-body-m text-ink-2 lg:text-body">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-overline uppercase text-muted">{children}</div>;
}

const SOURCES = [
  { key: "google", label: "Google", count: 783 },
  { key: "direct", label: "Direct", count: 180 },
  { key: "social", label: "Facebook & Instagram", count: 116 },
  { key: "ai", label: "AI assistants", count: 77 },
  { key: "wa", label: "WhatsApp shares", count: 51 },
  { key: "bing", label: "Bing", count: 39 },
  { key: "other", label: "Other websites", count: 38 },
];

const DEVICES = [
  { key: "phone", label: "Phone", value: 1079, color: "#0F766E" },
  { key: "desktop", label: "Desktop", value: 180, color: "#14B8A6" },
  { key: "tablet", label: "Tablet", value: 25, color: "#99F6E4" },
];

const MARGALLA = {
  id: 8,
  slug: "margalla-rent-a-car",
  name: "Margalla Rent A Car",
  city: "Islamabad",
  area: "F-10 Markaz",
  plan: "city" as const,
  verified: true,
  status: "live" as const,
  logoUrl: null,
  whatsapp: "+923001234567",
};

const SKELETON_ROWS = [
  [180, 120, 56, 40, 48],
  [150, 100, 48, 36, 48],
  [200, 110, 52, 40, 44],
];

export function KitDemo() {
  const { toast } = useToast();

  // Buttons
  const [saving, setSaving] = useState(false);
  // Diff ticks
  const [ticks, setTicks] = useState<Record<string, boolean>>({ phone: true, civic: true, fortuner: true, cultus: true, services: true, about: true, logo: true, website: false });
  // Dialogs
  const [confirm, setConfirm] = useState(false);
  const [alsoResolve, setAlsoResolve] = useState(true);
  const [modal, setModal] = useState(false);
  const [reason, setReason] = useState("Duplicate");
  // Form controls
  const [name, setName] = useState("Margalla Rent A Car");
  const [area, setArea] = useState("F-1");
  const [about, setAbout] = useState(ABOUT_OLD);
  const [city, setCity] = useState<string | null>("Islamabad");
  const [cityMissing, setCityMissing] = useState<string | null>(null);
  const [plan, setPlan] = useState("city");
  const [wa, setWa] = useState<string | null>("+92300123");
  const [phone, setPhone] = useState<string | null>("+923001234567");
  const [verified, setVerified] = useState(true);
  const [compare, setCompare] = useState(false);
  const [status, setStatus] = useState<"live" | "hidden">("live");
  const [driver, setDriver] = useState<"driver" | "self">("driver");
  const [grain, setGrain] = useState<"day" | "week">("day");
  const [services, setServices] = useState<string[]>(["With Driver", "Wedding", "Airport Pickup", "Tourist Tours"]);
  const [logo, setLogo] = useState<string | null>(null);
  const [cars, setCars] = useState<CarRow[]>([
    { name: "Suzuki Cultus", pricePerDay: 4500, mode: "driver" },
    { name: "Toyota Corolla", pricePerDay: 6000, mode: "driver" },
    { name: "Honda Civic", pricePerDay: 7500, mode: "driver" },
    { name: "Toyota Prado", pricePerDay: 16000, mode: "driver" },
  ]);
  const [ticked, setTicked] = useState(true);
  const [who, setWho] = useState("owner");
  const [extend, setExtend] = useState("1");
  const [tab, setTab] = useState("stats");

  const tick = (k: string) => (v: boolean) => setTicks((t) => ({ ...t, [k]: v }));
  const tickedCount = Object.values(ticks).filter(Boolean).length;

  const diffRows: DiffRowData[] = [
    { key: "phone", field: "Phone", kind: "changed", old: "+92 300 1234567", new: "+92 51 2345678", ticked: ticks.phone, onTick: tick("phone") },
    {
      key: "civic",
      field: "Honda Civic",
      sub: "Car · price changed",
      kind: "changed",
      old: (
        <>
          With driver · <DiffOld>PKR 7,000/day</DiffOld>
        </>
      ),
      new: (
        <>
          With driver · <DiffNew>PKR 7,500/day</DiffNew>
        </>
      ),
      ticked: ticks.civic,
      onTick: tick("civic"),
    },
    { key: "fortuner", field: "Toyota Fortuner", sub: "Car · added", kind: "added", new: "Toyota Fortuner · PKR 14,000/day · With driver", ticked: ticks.fortuner, onTick: tick("fortuner") },
    { key: "cultus", field: "Suzuki Cultus", sub: "Car · removed", kind: "removed", old: "Suzuki Cultus · PKR 4,500/day · With driver", ticked: ticks.cultus, onTick: tick("cultus") },
    {
      key: "services",
      field: "Services",
      sub: "1 added",
      kind: "changed",
      old: <ServiceList items={["With Driver", "Airport Pickup", "Wedding", "Tourist Tours"]} />,
      new: <ServiceList items={["With Driver", "Airport Pickup", "Wedding", "Tourist Tours"]} added="Self-Drive" />,
      ticked: ticks.services,
      onTick: tick("services"),
    },
    { key: "about", field: "About", sub: "Changed words marked", kind: "text", oldText: ABOUT_OLD, newText: ABOUT_NEW, ticked: ticks.about, onTick: tick("about") },
    {
      key: "logo",
      field: "Logo",
      sub: "Added",
      kind: "changed",
      old: (
        <span className="flex items-center gap-2.5 text-[13px]/[18px] text-muted">
          <Avatar name="Margalla Rent A Car" size={48} />
          No logo, initials shown
        </span>
      ),
      new: (
        <span className="flex items-center gap-2.5 text-[13px]/[18px] text-muted">
          <span className="grid size-12 place-items-center rounded-control border-2 border-good-solid bg-[repeating-linear-gradient(45deg,#F5F5F4_0_6px,#FFFFFF_6px_12px)] text-[12px] font-semibold">
            logo
          </span>
          margalla-logo.png · 512 × 512
        </span>
      ),
      ticked: ticks.logo,
      onTick: tick("logo"),
    },
    { key: "website", field: "Website", kind: "changed", old: <span className="text-[#A8A29E]">None</span>, new: "margallarentacar.pk", ticked: ticks.website, onTick: tick("website") },
  ];

  const fakeSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast({ message: "Margalla Rent A Car updated", undo: () => new Promise((r) => setTimeout(r, 900)) });
    }, 1200);
  };

  return (
    <>
      <PageTop title="Design system" dateRange search={mockSearch} />
      <PageBody className="gap-10 lg:gap-12">
        <QuietNote>Dev-only page. Every shared admin component and state, with the sample data from Page 01. It 404s in production.</QuietNote>

        {/* 1 · Buttons */}
        <Section n={1} title="Buttons, pills, badges, deltas" sub="40 px on desktop and 48 px on mobile, 12 px radius. Hover and press them to see the states.">
          <Card title="Button styles × states" className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[112px_repeat(4,minmax(0,1fr))] items-center gap-3">
              <span />
              <Label>Default</Label>
              <Label>Disabled</Label>
              <Label>Loading</Label>
              <Label>With icon</Label>
              {(
                [
                  ["primary", "Main action", "Save changes", "Saving…"],
                  ["success", "Publish, update", "Update listing", "Updating…"],
                  ["secondary", "Everything else", "Export CSV", "Exporting…"],
                  ["soft-teal", "Meaning tint", "Open listing", "Opening…"],
                  ["whatsapp", "Opens a chat", "WhatsApp", "Opening…"],
                  ["destructive", "In dialogs only", "Hide listing", "Hiding…"],
                ] as const
              ).map(([v, hint, label, loading]) => (
                <React.Fragment key={v}>
                  <span className="flex flex-col border-t border-fill pt-3">
                    <span className="text-[14px]/[20px] font-bold capitalize">{v.replace("-", " ")}</span>
                    <span className="text-[12px]/[16px] font-medium text-muted">{hint}</span>
                  </span>
                  <span className="border-t border-fill pt-3">
                    <Button variant={v}>{label}</Button>
                  </span>
                  <span className="border-t border-fill pt-3">
                    <Button variant={v} disabled>
                      {label}
                    </Button>
                  </span>
                  <span className="border-t border-fill pt-3">
                    <Button variant={v} loading loadingText={loading}>
                      {label}
                    </Button>
                  </span>
                  <span className="border-t border-fill pt-3">
                    <Button variant={v} icon={v === "secondary" ? Download : v === "whatsapp" ? undefined : v === "destructive" ? EyeOff : v === "soft-teal" ? Link2 : Pencil}>
                      {label}
                    </Button>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
            <Card title="Locked" subtitle="Grey fill, lock icon, the reason underneath. Can't be pressed. Unlocks into Success.">
              <div className="flex flex-wrap items-start gap-8">
                <Button variant="success" locked lockedReason="Verify ownership first">
                  Update listing
                </Button>
                <div className="flex flex-col gap-2">
                  <Button variant="success" loading={saving} loadingText="Updating…" onClick={fakeSave}>
                    Update listing<span className="font-medium opacity-[0.85]">· 7 of 8 changes</span>
                  </Button>
                  <span className="text-label text-muted">Unlocked · press it for the toast</span>
                </div>
              </div>
            </Card>
            <Card title="Soft tints, icon buttons, links" subtitle="Soft buttons take the meaning of what they do.">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button variant="soft-green">Mark resolved</Button>
                <Button variant="soft-amber">Extend plan</Button>
                <Button variant="soft-red">Reject</Button>
                <Button variant="soft-grey">Dismiss</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <IconButton icon={Ellipsis} label="More" variant="secondary" />
                <IconButton icon={Copy} label="Copy" variant="soft" />
                <IconButton icon={X} label="Close" variant="ghost" />
                <span className="mx-1 h-7 w-px bg-line" />
                <Button variant="link" href="#s1" iconRight={undefined}>
                  See all →
                </Button>
                <Button variant="link" href="/" target="_blank">
                  View on site ↗
                </Button>
              </div>
            </Card>
          </div>

          <Card title="Status pills, flags, plan badges">
            <div className="flex flex-col gap-5">
              <PillRow label="Request status">
                <StatusPill kind="new" />
                <StatusPill kind="waiting" />
                <StatusPill kind="verified" />
                <StatusPill kind="approved" />
                <StatusPill kind="updated" />
                <StatusPill kind="rejected" />
                <StatusPill kind="resolved" />
                <StatusPill kind="dismissed" />
              </PillRow>
              <PillRow label="Listing">
                <StatusPill kind="live" />
                <StatusPill kind="hidden" />
                <VerifiedBadge verified size="md" />
                <StatusPill kind="notVerified" />
                <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold">
                  Margalla Rent A Car <VerifiedMark />
                </span>
              </PillRow>
              <PillRow label="Flags & warnings">
                <StatusPill kind="urgent" />
                <StatusPill kind="duplicate" />
                <StatusPill kind="cityNotOnSite" />
                <StatusPill kind="daysLeft" days={3} />
                <StatusPill kind="ended" date="2026-10-05" />
                <StatusPill kind="flagged" />
              </PillRow>
              <PillRow label="Dense (24 px)">
                <StatusPill kind="live" size="sm" />
                <StatusPill kind="hidden" size="sm" />
                <VerifiedBadge verified />
                <VerifiedBadge verified={false} />
              </PillRow>
              <PillRow label="Plan">
                <PlanBadge plan="free" />
                <PlanBadge plan="city" />
                <PlanBadge plan="plus" />
                <PlanBadge plan="city" size="sm" />
              </PillRow>
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
            <Card title="Deltas" subtitle="Arrow + sign + colour, never colour alone. Hover or tap the first two.">
              <div className="flex flex-col gap-3.5">
                <DeltaRow label="Up">
                  <Delta delta={countDelta(187, 151)} tooltip="vs previous 30 days (14 Aug – 12 Sep) · 151 → 187" />
                  <span className="text-label text-muted">vs previous 30 days</span>
                </DeltaRow>
                <DeltaRow label="Down">
                  <Delta delta={countDelta(23, 25)} tooltip="vs previous 30 days (14 Aug – 12 Sep) · 25 → 23" />
                  <span className="text-label text-muted">vs previous 30 days</span>
                </DeltaRow>
                <DeltaRow label="Flat (under ±1%)">
                  <Delta delta={countDelta(500, 498)} />
                  <span className="text-label text-muted">vs previous 30 days</span>
                </DeltaRow>
                <DeltaRow label="Rate (points)">
                  <Delta delta={rateDelta(0.146, 0.139)} />
                </DeltaRow>
                <DeltaRow label="Under 30 opens">
                  <Delta delta={null} notEnough />
                </DeltaRow>
                <DeltaRow label="Rate with its base">
                  <span className="num text-[15px]/[22px] font-bold">14.6%</span>
                  <span className="num text-label text-muted">· 187 of 1,284</span>
                </DeltaRow>
              </div>
            </Card>
            <Card title="ⓘ definitions, avatars, notes" subtitle="Every stat label has an ⓘ. Hover on desktop, tap on mobile.">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-label text-ink-2">
                {(["shown", "opened", "openRate", "contacted", "contactRate", "web", "rank"] as const).map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    {k === "openRate" ? "Open rate" : k === "contactRate" ? "Contact rate" : k === "web" ? "Website clicks" : k === "rank" ? "Rank in city" : k[0].toUpperCase() + k.slice(1)}
                    <InfoTooltip info={k} />
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-fill pt-5">
                <Avatar name="Margalla Rent A Car" size={56} />
                <Avatar name="Margalla Rent A Car" size={44} />
                <Avatar name="Margalla Rent A Car" size={40} />
                <Avatar name="Margalla Rent A Car" size={32} />
                <Avatar name="Logo" logoUrl="/admin/logo-tile.png" size={40} />
                <span className="text-label text-muted">56 · 44 · 40 · 32 initials, or the logo</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-6">
                <QuietNote>Counting since 13 Aug 2026</QuietNote>
                <QuietNote tone="good">Live on the site within a minute</QuietNote>
              </div>
            </Card>
          </div>
        </Section>

        {/* 2 · Stat cards & charts */}
        <Section n={2} title="Stat cards & charts" sub="Margalla Rent A Car, 13 Sep – 12 Oct 2026. Hover a day or a cell; click the chips to turn series on and off.">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
            <StatCard label="Opened" info="opened" value="1,284" delta={countDelta(1284, 1088)} deltaTooltip="vs previous 30 days (14 Aug – 12 Sep) · 1,088 → 1,284" spark={OPENED} />
            <StatCard label="Contacted" info="contacted" value="187" delta={countDelta(187, 151)} spark={CONTACTED} sparkColor="#EA580C" />
            <StatCard label="Contact rate" info="contactRate" value="14.6%" base="187 of 1,284" delta={rateDelta(0.146, 0.139)} spark={RATE} />
            <StatCard label="Website clicks" info="web" value="23" delta={countDelta(23, 25)} note="Clicks on the company's own website link. Not counted as contacts." />
            <StatCard label="Opened" info="opened" value="9" notEnough="count" spark={CHENAB} note="Chenab Car Rental · counts still shown" />
            <StatCard label="Contact rate" info="contactRate" notEnough="rate" note="Rates show from 30 opens. This listing has 9 opens and 1 contact." />
            <StatCard label="Opened" loading />
            <StatCard label="Unique visitors" info="visitors" value="1,031" rangeText="13 Sep – 12 Oct · comparison off" spark={OPENED.map((v) => Math.round(v * 0.8))} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
            <StatCard size="md" label="Listings live" value="1,419" delta={countDelta(1419, 1402)} />
            <StatCard size="md" label="Contact rate" value="13.9%" base="6,815 of 48,920" delta={rateDelta(0.139, 0.137)} />
          </div>

          <Card>
            <LineChart
              title="Over time"
              info="opened"
              subtitle="Per day · 13 Sep – 12 Oct 2026"
              days={DAYS}
              opened={OPENED}
              contacted={CONTACTED}
              shown={SHOWN}
              prevOpened={PREV_OPENED}
              prevDays={PREV_DAYS}
              defaultHover={26}
            />
          </Card>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
            <Card title="How they contacted" info="contacted" subtitle="187 contacts · 13 Sep – 12 Oct 2026">
              <MethodTotals
                wa={121}
                call={48}
                form={18}
                chart={<StackedBar days={DAYS} wa={WA} call={CALL} form={FORM} />}
                footer={<WebsiteClicksFooter count={23} />}
              />
            </Card>
            <Card title="Where visitors came from" info="source" subtitle="Share of 1,284 opens">
              <BarList rows={SOURCES} header={{ label: "Source", count: "Opens", pct: "Share" }} mobileTop={4} showAllLabel={(n) => `Show all ${n} sources`} />
              <div className="mt-3 border-t border-fill pt-3.5 text-label text-muted max-lg:hidden">
                Bar length is the share of the total, so rows are comparable across cards.
              </div>
            </Card>
          </div>

          <Card title="From shown to contacted" info="openRate">
            <Funnel shown={18420} opened={1284} contacted={187} enough />
          </Card>
          <Card title="From shown to contacted · Chenab Car Rental (9 opens)">
            <Funnel shown={410} opened={9} contacted={1} enough={false} />
          </Card>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
            <Card title="Busiest times" info="opened" subtitle="Opens by day and hour · Pakistan time" actions={<HeatLegend className="max-lg:hidden" />}>
              <Heatmap values={HEAT} legend={false} />
              <div className="mt-4 border-t border-fill pt-3.5 text-label text-ink-2">
                Busiest: <span className="font-bold text-ink">Friday to Sunday, 6–10 PM</span>
              </div>
            </Card>
            <Card title="Devices" info="device" subtitle="Share of 1,284 opens">
              <Donut slices={DEVICES} className="mx-auto mt-2" />
              <div className="mt-4 border-t border-fill pt-2">
                <Label>Mobile 3-part bar</Label>
                <DevicesBar slices={DEVICES} />
              </div>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">
            <Card title="Profile completeness" info="completeness">
              <div className="flex flex-wrap items-center gap-5">
                <CompletenessRing pct={80} />
                <CompletenessRing pct={80} size={72} />
                <div>
                  <div className="text-[16px]/[22px] font-bold">2 things missing</div>
                  <div className="text-label text-muted">Add a logo · Add a second phone</div>
                </div>
              </div>
            </Card>
            <Card title="Sparklines" subtitle="200 × 40 in stat cards, 80 × 24 in tables">
              <div className="flex flex-col gap-4">
                <Sparkline values={OPENED} />
                <div className="flex gap-4">
                  <Sparkline values={OPENED} width={80} height={24} />
                  <Sparkline values={CONTACTED} width={80} height={24} color="#EA580C" />
                  <Sparkline values={CHENAB} width={80} height={24} color="#A8A29E" area={false} />
                </div>
              </div>
            </Card>
            <Card title="Opened and contacted" subtitle="Empty state">
              <LineChart days={DAYS} opened={DAYS.map(() => 0)} contacted={DAYS.map(() => 0)} height={180} />
            </Card>
          </div>

          <Card>
            <LineChart
              title="Over time · range starts before tracking"
              subtitle="Per day · 15 Jul – 12 Oct 2026"
              days={RANGE90.days}
              opened={RANGE90.opened}
              contacted={RANGE90.contacted}
              untracked={RANGE90.untracked}
              height={220}
            />
            <QuietNote className="mt-3">
              Counting since 13 Aug 2026. The first 29 days of this range have no numbers, and comparison is off because there&apos;s no earlier period to compare with.
            </QuietNote>
          </Card>
        </Section>

        {/* 3 · Diff rows & feedback */}
        <Section n={3} title="Diff rows & feedback" sub="Old values are red and struck through, new values green; the tick box means “apply this change”.">
          <DiffTable
            title="Current against requested"
            subtitle={`8 changes · ${tickedCount} ticked to apply`}
            actions={
              <>
                <button type="button" className="text-brand-700 hover:underline" onClick={() => setTicks((t) => Object.fromEntries(Object.keys(t).map((k) => [k, true])))}>
                  Tick all
                </button>
                <button type="button" className="text-brand-700 hover:underline" onClick={() => setTicks((t) => Object.fromEntries(Object.keys(t).map((k) => [k, false])))}>
                  Untick all
                </button>
              </>
            }
            rows={diffRows}
            unchanged={["Name", "City", "Area", "WhatsApp"]}
            unchangedRows={[
              { key: "name", field: "Name", value: "Margalla Rent A Car" },
              { key: "city", field: "City", value: "Islamabad" },
              { key: "area", field: "Area", value: "F-10 Markaz" },
              { key: "wa", field: "WhatsApp", value: "+92 300 1234567" },
            ]}
          />
          <Card title="Compact rows, used in History">
            <DiffCompact
              rows={[
                { key: "p", field: "Phone", old: "+92 300 1234567", new: "+92 51 2345678" },
                { key: "c", field: "Honda Civic", old: "PKR 7,000", new: "PKR 7,500" },
                {
                  key: "cars",
                  field: "Cars",
                  items: (
                    <>
                      <span className="rounded-md bg-good-fill px-1.5 font-semibold text-good-text">+ Toyota Fortuner</span>
                      <span className="rounded-md bg-bad-fill px-1.5 text-bad-text line-through">Suzuki Cultus</span>
                    </>
                  ),
                },
              ]}
            />
          </Card>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
            <Card>
              <WhatsAppPreview
                title="Monthly stats message"
                toName="Margalla Rent A Car"
                toNumber="+923001234567"
                message={MONTHLY_MESSAGE}
                hint="Opens WhatsApp with this text. You press send there."
              />
            </Card>
            <Card>
              <WhatsAppPreview
                title="Ask the owner to confirm"
                toNumber="+923001234567"
                toLabel="To the number on the listing · +92 300 1234567"
                message={CONFIRM_MESSAGE}
                extraActions={
                  <Button variant="secondary" icon={Phone} href="tel:+923001234567" fullWidth className="lg:w-auto">
                    Call instead
                  </Button>
                }
              />
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
            <Card title="Toasts" subtitle="Bottom centre (above the tab bar on mobile). 8 s with Undo, 4 s without.">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => toast({ message: "Margalla Rent A Car updated", undo: () => new Promise((r) => setTimeout(r, 1200)) })}
                >
                  Toast with Undo
                </Button>
                <Button variant="secondary" icon={Copy} onClick={() => toast({ message: "Message copied", icon: Copy })}>
                  Toast without Undo
                </Button>
              </div>
            </Card>
            <Card title="Dialogs" subtitle="Confirmation only for Hide, Reject, Delete and Restore. A bottom sheet on mobile.">
              <div className="flex flex-wrap gap-2">
                <Button variant="soft-red" icon={EyeOff} onClick={() => setConfirm(true)}>
                  Hide listing…
                </Button>
                <Button variant="secondary" onClick={() => setModal(true)}>
                  Reject with a reason
                </Button>
                <Menu
                  title="Listing actions"
                  trigger={<IconButton icon={Ellipsis} label="Row actions" variant="secondary" className="aria-expanded:bg-fill" />}
                  items={[
                    { key: "site", label: "View on site", icon: Link2, href: "/", external: true },
                    { key: "copy", label: "Copy page link", icon: Copy, onSelect: () => toast({ message: "Page link copied", icon: Copy }) },
                    { key: "sales", label: "Sales message", icon: MessageSquareText, hint: "Free only", disabled: true },
                    { key: "d", divider: true },
                    { key: "hide", label: "Hide listing…", icon: EyeOff, tone: "danger", onSelect: () => setConfirm(true) },
                  ]}
                />
                <Popover trigger={<Button variant="soft-amber">Extend plan</Button>} className="w-[340px] p-4">
                  {(close) => (
                    <div className="flex flex-col">
                      <div className="text-[17px]/[24px] font-bold">Extend Lahore Luxury Wheels</div>
                      <div className="mb-3 text-label text-muted">Featured City · ended 5 Oct 2026</div>
                      <div className="flex flex-col gap-1.5">
                        <RadioCard size="sm" checked={extend === "1"} onChange={() => setExtend("1")} label="1 month" trailing="6 Oct – 5 Nov 2026" />
                        <RadioCard size="sm" checked={extend === "3"} onChange={() => setExtend("3")} label="3 months" trailing="6 Oct 2026 – 5 Jan 2027" />
                        <RadioCard size="sm" checked={extend === "pick"} onChange={() => setExtend("pick")} label="Pick an end date" />
                      </div>
                      <div className="mt-2.5 text-label text-muted">Continues from the old end date so there&apos;s no gap.</div>
                      <div className="mt-3.5 flex justify-end gap-2">
                        <Button variant="secondary" onClick={close}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            close();
                            toast({ message: "Plan extended to 5 Nov 2026", undo: () => {} });
                          }}
                        >
                          Extend plan
                        </Button>
                      </div>
                    </div>
                  )}
                </Popover>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <Banner tone="error" title="Couldn't load the numbers." actions={<Button variant="secondary" className="border-bad-border text-bad-text">Try again</Button>}>
              Check your connection and try again.
            </Banner>
            <Banner
              tone="warning"
              actions={
                <>
                  <Button variant="secondary">Open that listing</Button>
                  <Button variant="soft-teal">Treat as a claim instead</Button>
                </>
              }
            >
              This WhatsApp number is already on <b className="font-bold">Al Noor Car Rental</b> (Rawalpindi · Saddar).
            </Banner>
            <Banner tone="info" title="New listings start on Free and Live.">
              You can change the plan after publishing.
            </Banner>
            <Banner tone="success" title="Saved.">
              Live on the site within a minute · See it in History
            </Banner>
            <Banner tone="neutral">Only 9 opens in this period. Rates and comparisons show once a listing has 30 opens; the counts below are exact.</Banner>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
            <Card padded={false}>
              <EmptyState title="No new requests" body="You're all caught up." action={<Button variant="secondary">See done requests</Button>} className="h-[300px]" />
            </Card>
            <Card padded={false} className="overflow-hidden">
              <div className="text-overline uppercase text-muted grid h-11 grid-cols-[minmax(0,2.4fr)_repeat(3,minmax(0,1fr))] items-center gap-4 border-b border-line bg-page px-4 lg:px-6">
                <span>Listing</span>
                <span className="text-right">Opened</span>
                <span className="text-right">Contacted</span>
                <span className="text-right">Trend</span>
              </div>
              {SKELETON_ROWS.map(([w1, w2, a, b, c], i) => (
                <div key={i} className="grid h-14 grid-cols-[minmax(0,2.4fr)_repeat(3,minmax(0,1fr))] items-center gap-4 border-b border-fill px-4 last:border-0 lg:px-6">
                  <span className="flex items-center gap-3">
                    <Skeleton className="size-10 flex-none rounded-control" />
                    <span className="flex min-w-0 flex-col gap-1.5">
                      <Skeleton className="h-3 max-w-full rounded-md" style={{ width: w1 }} />
                      <Skeleton className="h-2.5 rounded-[5px]" shimmer={false} style={{ width: w2 }} />
                    </span>
                  </span>
                  <Skeleton className="h-3 justify-self-end rounded-md" shimmer={false} style={{ width: a }} />
                  <Skeleton className="h-3 justify-self-end rounded-md" shimmer={false} style={{ width: b }} />
                  <Skeleton className="h-5 justify-self-end rounded-md" shimmer={false} style={{ width: c + 24 }} />
                </div>
              ))}
            </Card>
          </div>
        </Section>

        {/* 4 · Form controls */}
        <Section n={4} title="Form controls" sub="Labels above fields. 44 px on desktop, 48 px on mobile. A teal dot means “changed, not saved yet”.">
          <div className="grid items-start gap-3 lg:grid-cols-2 lg:gap-6">
            <div className="flex flex-col gap-3 lg:gap-6">
              <Card title="Text input · states">
                <div className="flex flex-col gap-5">
                  <Field label="Listing name" htmlFor="k-name">
                    <TextInput id="k-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Margalla Rent A Car" />
                  </Field>
                  <Field label="Area" changed hint="Teal border and dot until saved.">
                    <TextInput value="F-10 Markaz, Street 7" changed readOnly={false} onChange={() => {}} />
                  </Field>
                  <Field label="WhatsApp number" error="Enter a WhatsApp number like +92 300 1234567">
                    <PhoneInput value={wa} onChange={(v) => setWa(v)} invalid />
                  </Field>
                  <Field label="Google rating" hint="From Google. Can't be edited here.">
                    <TextInput value="4.8 · 212 reviews" readOnly icon={Star} iconClassName="text-wait-text" />
                  </Field>
                  <Field label="About" optional hint="Two or three sentences: what you rent, where, and what makes you different.">
                    <Textarea value={about} onChange={(e) => setAbout(e.target.value)} />
                  </Field>
                </div>
              </Card>

              <Card title="Select, plan dates, toggle, segmented">
                <div className="flex flex-col gap-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Plan">
                      <Select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        options={[
                          { value: "free", label: "Free" },
                          { value: "city", label: "Featured City" },
                          { value: "plus", label: "Featured Plus" },
                        ]}
                      />
                    </Field>
                    <Field label="Starts">
                      <TextInput type="date" defaultValue="2026-10-01" />
                    </Field>
                    <Field label="Ends">
                      <TextInput type="date" defaultValue="2026-10-31" />
                    </Field>
                  </div>
                  <Field label="City" error={cityMissing ? undefined : "Choose a city"}>
                    <Select value={cityMissing ?? ""} onChange={(e) => setCityMissing(e.target.value)} options={["Islamabad", "Lahore", "Karachi"]} placeholder="Choose a city" invalid={!cityMissing} />
                  </Field>
                  <div className="flex flex-col gap-3">
                    <ToggleRow title="Verified" checked={verified} onChange={setVerified} trailing={verified ? "Yes" : "No"} boxed />
                    <ToggleRow title="Compare with previous period" description="14 Aug – 12 Sep 2026" checked={compare} onChange={setCompare} />
                    <div className="flex items-center gap-3 text-label text-muted">
                      <Toggle checked label="On" /> <Toggle checked={false} label="Off" /> <Toggle checked disabled label="Disabled" /> bare toggles
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <Field label="Status">
                      <Segmented
                        size="lg"
                        value={status}
                        onChange={setStatus}
                        options={[
                          { value: "live", label: "Live", dot: "#16A34A", activeClassName: "text-good-text" },
                          { value: "hidden", label: "Hidden" },
                        ]}
                      />
                    </Field>
                    <Field label="Driver">
                      <Segmented
                        size="lg"
                        value={driver}
                        onChange={setDriver}
                        options={[
                          { value: "driver", label: "With driver" },
                          { value: "self", label: "Self-drive" },
                        ]}
                      />
                    </Field>
                    <Field label="Chart">
                      <Segmented
                        size="sm"
                        value={grain}
                        onChange={setGrain}
                        options={[
                          { value: "day", label: "Day" },
                          { value: "week", label: "Week" },
                        ]}
                      />
                    </Field>
                  </div>
                </div>
              </Card>

              <Card title="Checkbox, radio, option cards">
                <div className="flex flex-wrap gap-6">
                  <Checkbox checked={ticked} onChange={setTicked} label="Ticked" />
                  <Checkbox checked={false} label="Not ticked" />
                  <Checkbox checked={false} disabled label="Disabled" />
                </div>
                <div className="mt-4 flex flex-col">
                  <span className="mb-1 text-[13px]/[18px] font-semibold text-ink-2">Why reject?</span>
                  {["Duplicate", "Not a rental company", "Can't reach them", "Other"].map((r) => (
                    <Radio key={r} name="reason" checked={reason === r} onChange={() => setReason(r)} label={r} />
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-[13px]/[18px] font-semibold text-ink-2">Who are you?</span>
                  <RadioCard name="who" checked={who === "owner"} onChange={() => setWho("owner")} label="I'm the owner" />
                  <RadioCard name="who" checked={who === "staff"} onChange={() => setWho("staff")} label="I work here" />
                  <RadioCard name="who" checked={who === "customer"} onChange={() => setWho("customer")} label="I'm a customer and something is wrong" trailing="Opens the report form" />
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-3 lg:gap-6">
              <Card title="City picker · searchable, 21 cities">
                <div className="flex flex-col gap-5">
                  <Field label="City" changed={city !== "Islamabad"}>
                    <CityPicker value={city} onChange={setCity} />
                  </Field>
                  <Field label="City · with an extra option">
                    <CityPicker value={null} onChange={setCity} extraOption={{ value: "__other", label: "My city isn't listed" }} />
                  </Field>
                </div>
              </Card>
              <Card title="Area with suggestions · phone">
                <div className="flex flex-col gap-5">
                  <Field label="Area">
                    <AreaInput value={area} onChange={setArea} areas={ISLAMABAD_AREAS} city={city ?? "Islamabad"} />
                  </Field>
                  <Field label="Phone number" hint="Pasted numbers like 0300-1234567 are cleaned up automatically.">
                    <PhoneInput value={phone} onChange={(v) => setPhone(v)} />
                  </Field>
                  <div className="num text-label text-muted">Value: {phone ?? "— (incomplete)"}</div>
                </div>
              </Card>
              <Card title="Services · chips, pick any">
                <ServiceChips value={services} onChange={setServices} />
              </Card>
              <Card title="Logo upload · empty and with preview" subtitle="Pictures are downscaled to 512 px WebP in the browser.">
                <div className="flex flex-col gap-4">
                  <LogoUpload value={logo} onChange={(d) => setLogo(d)} />
                  <LogoUpload value="/admin/logo-tile.png" fileName="margalla-logo.png" onChange={() => {}} />
                </div>
              </Card>
            </div>
          </div>

          <Card title="Cars and prices · repeater" subtitle="Drag to reorder · names suggested from the 12 car types, any name allowed">
            <CarsRepeater value={cars} onChange={setCars} markers={[null, null, { price: true }, null]} />
          </Card>
        </Section>

        {/* 5 · Shell parts */}
        <Section n={5} title="Listing header, inbox tabs, tabs" sub="The search and date range in the top bar are live; search uses sample data here.">
          <Card>
            <ListingHeader
              listing={MARGALLA}
              tab="stats"
              query="range=last30&compare=1"
              menu={
                <MenuList
                  items={[
                    { key: "hide", label: "Hide listing…", icon: EyeOff, tone: "danger", onSelect: () => setConfirm(true) },
                    { key: "copy", label: "Copy page link", icon: Link2, onSelect: () => toast({ message: "Page link copied", icon: Copy }) },
                  ]}
                />
              }
            />
          </Card>
          <Card>
            <ListingHeader listing={{ ...MARGALLA, id: 16, name: "Chenab Car Rental", city: "Gujrat", area: "GT Road", plan: "free", verified: false, status: "hidden" }} tab="history" />
          </Card>
          <Card>
            <InboxTabs active="requests" counts={{ requests: 3, claims: 2, reports: 4 }} view="new" viewCounts={{ new: 3, done: 18, rejected: 4 }} />
          </Card>
          <Card>
            <Tabs
              active={tab}
              onChange={setTab}
              items={[
                { key: "stats", label: "Stats", icon: RotateCcw, count: 12 },
                { key: "flags", label: "Flags", icon: Flag, count: 2 },
                { key: "inbox", label: "Inbox", icon: Inbox },
                { key: "history", label: "History", icon: CalendarClock },
              ]}
            />
          </Card>
        </Section>
      </PageBody>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        tone="danger"
        icon={EyeOff}
        title="Hide Margalla Rent A Car?"
        body="It will disappear from the site but stay in the admin. You can show it again any time."
        actionLabel="Hide listing"
        loadingLabel="Hiding…"
        onConfirm={() =>
          new Promise<void>((r) =>
            setTimeout(() => {
              r();
              toast({ message: "Margalla Rent A Car hidden from the site", undo: () => {} });
            }, 900),
          )
        }
      >
        <Checkbox checked={alsoResolve} onChange={setAlsoResolve} label="Also mark this report resolved" />
      </ConfirmDialog>

      <Modal open={modal} onClose={() => setModal(false)} title="Reject this request?" size="md">
        <div className="flex flex-col">
          <span className="mb-1 text-[13px]/[18px] font-semibold text-ink-2">Why reject?</span>
          {["Duplicate", "Not a rental company", "Can't reach them", "Other"].map((r) => (
            <Radio key={r} name="reason2" checked={reason === r} onChange={() => setReason(r)} label={r} />
          ))}
          <Field label="Private note" optional className="mt-3">
            <Textarea placeholder="Only you see this" className="min-h-[88px]" />
          </Field>
          <div className="mt-6 flex flex-col gap-2 lg:flex-row-reverse">
            <Button
              variant="destructive"
              onClick={() => {
                setModal(false);
                toast({ message: "Request rejected", undo: () => {} });
              }}
            >
              Reject
            </Button>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function PillRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 lg:grid-cols-[150px_minmax(0,1fr)] lg:items-center lg:gap-4">
      <span className="text-[13px]/[18px] font-semibold text-ink-2">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function DeltaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="w-[150px] text-label text-muted">{label}</span>
      {children}
    </div>
  );
}

function ServiceList({ items, added }: { items: string[]; added?: string }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="inline-flex h-[26px] items-center rounded-full bg-fill px-2.5 text-[13px]/[18px] font-medium text-ink-2">
          {s}
        </span>
      ))}
      {added ? (
        <span className="inline-flex h-[26px] items-center gap-1 rounded-full border border-good-border bg-good-fill px-2.5 text-[13px]/[18px] font-semibold text-good-text">
          + {added}
        </span>
      ) : null}
    </span>
  );
}
