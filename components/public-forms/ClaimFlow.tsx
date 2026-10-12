"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, X } from "lucide-react";
import { SITE_HOST, SITE_WHATSAPP } from "@/lib/admin/constants";
import { fmtPhone, normalizePhone, phoneLocal, waLink } from "@/lib/admin/format";
import type { CarRow, ClaimRole } from "@/lib/admin/types";
import { AreaInput } from "@/components/admin/ui/AreaInput";
import { Banner } from "@/components/admin/ui/Banner";
import { CityPicker } from "@/components/admin/ui/CityPicker";
import { RadioCard } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { Field, PhoneInput, TextInput, Textarea } from "@/components/admin/ui/Field";
import { useBodyScrollLock, useIsDesktop } from "@/components/admin/ui/hooks";
import { ServiceChips } from "@/components/admin/ui/ServiceChips";
import { type CarItem, carChange, carsFromListing, ClaimCars, modeLabel } from "./ClaimCars";
import { ClaimField } from "./ClaimField";
import { LogoField } from "./LogoField";
import { PublicButton } from "./PublicButton";
import { Honeypot, MobileBar, postJson, scrollToForm, StepSegments, SuccessMark, useFormClock } from "./shared";

/**
 * Page 13 — Claim this listing (/companies/{slug}/claim). Three client-side
 * steps: who you are → your details, pre-filled from the listing, with a
 * "Changed" pill and Reset on each change → a Before / After review of only
 * what changed. Posts to /api/claims with just the changed fields.
 * Mobile: every step is full screen with its own header and a sticky button.
 */

export interface ClaimListing {
  slug: string;
  name: string;
  city: string;
  area: string;
  whatsapp: string;
  phone: string;
  website: string;
  about: string;
  services: string[];
  cars: CarRow[];
  logo: string | null;
}

type Step = 0 | 1 | 2;
type Status = "idle" | "sending" | "failed" | "sent";

interface Draft {
  name: string;
  city: string;
  area: string;
  whatsapp: string | null;
  whatsappLocal: string;
  phone: string | null;
  phoneLocal: string;
  website: string;
  about: string;
  services: string[];
  logo: string | null;
}

type ErrKey = "claimantName" | "claimantWhatsapp" | "name" | "whatsapp" | "phone" | "logo";
type Errors = Partial<Record<ErrKey, string>>;

const ERR_STEP: Record<ErrKey, Step> = { claimantName: 0, claimantWhatsapp: 0, name: 1, whatsapp: 1, phone: 1, logo: 1 };
const ERR_ID: Record<ErrKey, string> = {
  claimantName: "cl-you-name",
  claimantWhatsapp: "cl-you-whatsapp",
  name: "cl-name",
  whatsapp: "cl-whatsapp",
  phone: "cl-phone",
  logo: "cl-logo",
};

const MOBILE_TITLES = ["", "Update your details", "Review your changes"] as const;
const TITLES = ["Who are you?", "Update your details", "Review your changes"] as const;

function draftFrom(l: ClaimListing): Draft {
  return {
    name: l.name,
    city: l.city,
    area: l.area,
    whatsapp: normalizePhone(l.whatsapp),
    whatsappLocal: phoneLocal(l.whatsapp),
    phone: normalizePhone(l.phone),
    phoneLocal: phoneLocal(l.phone),
    website: l.website,
    about: l.about,
    services: [...l.services],
    logo: l.logo,
  };
}

const normUrl = (s: string) =>
  s.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

function shorten(s: string, max = 70): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

/** Typed value as E.164, "" when empty, or a marker when it isn't a valid number yet. */
function phoneValue(n: string | null, local: string): string {
  if (!local.trim()) return "";
  return n ?? `?${local}`;
}

type Tone = "old" | "new" | "none" | "removed";
interface Cell {
  tone: Tone;
  text?: string;
  img?: string;
}
interface ReviewRow {
  key: string;
  label: string;
  before: Cell;
  after: Cell;
  /** For the "+ 4 more" line ("new About text"). */
  short: string;
}

function cellText(c: Cell): string {
  if (c.tone === "none") return "—";
  if (c.tone === "removed") return "Removed";
  if (c.img) return c.tone === "new" ? "New logo" : "Current logo";
  return c.text ?? "";
}

function CellView({ cell }: { cell: Cell }) {
  if (cell.tone === "none") return <span className="text-[#A8A29E]">—</span>;
  if (cell.tone === "removed") return <span className="text-bad-text">Removed</span>;
  if (cell.img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cell.img}
        alt={cell.tone === "new" ? "New logo" : "Current logo"}
        className={cx(
          "size-11 rounded-[10px] bg-white object-cover",
          cell.tone === "new" ? "border-2 border-good-solid" : "border border-line opacity-80",
        )}
      />
    );
  }
  return (
    <span
      className={cx(
        "num min-w-0 [overflow-wrap:anywhere]",
        cell.tone === "old" ? "text-bad-text line-through" : "font-semibold text-good-text",
      )}
    >
      {cell.text}
    </span>
  );
}

export function ClaimFlow({ listing, areasByCity }: { listing: ClaimListing; areasByCity: Record<string, string[]> }) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [role, setRole] = useState<ClaimRole>("owner");
  const [you, setYou] = useState<{ name: string; whatsapp: string | null; local: string }>({ name: "", whatsapp: null, local: "" });
  const orig = useMemo(() => draftFrom(listing), [listing]);
  const [d, setD] = useState<Draft>(orig);
  const origCars = useMemo(() => carsFromListing(listing.cars), [listing.cars]);
  const [cars, setCars] = useState<CarItem[]>(origCars);
  const [editingCar, setEditingCar] = useState<string | null>(null);
  const [closeRequested, setCloseRequested] = useState(false);
  const [message, setMessage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [hp, setHp] = useState("");
  const { elapsed } = useFormClock();
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sent = status === "sent";
  const shown = useRef({ step, sent });
  const profileHref = `/companies/${listing.slug}`;

  // Mobile steps are full screen: keep the page behind them still.
  useBodyScrollLock(!sent && !isDesktop);

  useEffect(() => {
    if (shown.current.step === step && shown.current.sent === sent) return;
    shown.current = { step, sent };
    if (isDesktop) scrollToForm(rootRef.current);
    else if (sent) window.scrollTo({ top: 0 });
    else if (mainRef.current) mainRef.current.scrollTop = 0;
    titleRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, sent]);

  const clearError = (k: ErrKey) => {
    if (errors[k]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== k)) as Errors);
  };
  const setDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setD((prev) => ({ ...prev, [key]: value }));
    if (key in ERR_STEP) clearError(key as ErrKey);
  };

  // ── What changed ───────────────────────────────────────────────────────
  const origWa = orig.whatsapp ?? "";
  const draftWa = phoneValue(d.whatsapp, d.whatsappLocal);
  const origPhone = orig.phone || origWa;
  // An empty phone means "same as WhatsApp" (that's how the listing stores it).
  const draftPhone = phoneValue(d.phone, d.phoneLocal) || origWa;
  const servicesAdded = d.services.filter((s) => !orig.services.includes(s));
  const servicesRemoved = orig.services.filter((s) => !d.services.includes(s));

  const ch = {
    name: d.name.trim() !== orig.name.trim(),
    city: d.city !== orig.city,
    area: d.area.trim() !== orig.area.trim(),
    whatsapp: draftWa !== origWa,
    phone: draftPhone !== origPhone,
    website: normUrl(d.website) !== normUrl(orig.website),
    about: d.about.trim() !== orig.about.trim(),
    services: !sameSet(d.services, orig.services),
    logo: d.logo !== orig.logo,
  };
  const carChanges = cars
    .map((it) => ({ it, kind: carChange(it) }))
    .filter((x): x is { it: CarItem; kind: "changed" | "new" | "removed" } => x.kind !== null);
  const fieldCount = Object.values(ch).filter(Boolean).length;
  const count = fieldCount + carChanges.length + (closeRequested ? 1 : 0);
  const reset = <K extends keyof Draft>(...keys: K[]) =>
    setD((prev) => {
      const next = { ...prev };
      for (const k of keys) next[k] = orig[k];
      return next;
    });

  const rows: ReviewRow[] = useMemo(() => {
    const out: ReviewRow[] = [];
    const text = (t: string, tone: Tone): Cell => (t ? { tone, text: t } : { tone: "none" });
    if (closeRequested) {
      out.push({
        key: "close",
        label: "Listing",
        before: { tone: "old", text: "On the site" },
        after: { tone: "removed" },
        short: "remove the listing (closed)",
      });
    }
    if (ch.name) out.push({ key: "name", label: "Name", before: text(orig.name, "old"), after: text(d.name.trim(), "new"), short: "name" });
    if (ch.city) out.push({ key: "city", label: "City", before: text(orig.city, "old"), after: text(d.city, "new"), short: "city" });
    if (ch.area) out.push({ key: "area", label: "Area", before: text(orig.area, "old"), after: text(d.area.trim(), "new"), short: "area" });
    if (ch.whatsapp)
      out.push({
        key: "whatsapp",
        label: "WhatsApp",
        before: text(origWa ? fmtPhone(origWa) : "", "old"),
        after: text(d.whatsapp ? fmtPhone(d.whatsapp) : "", "new"),
        short: "WhatsApp number",
      });
    if (ch.phone)
      out.push({
        key: "phone",
        label: "Phone",
        before: text(origPhone ? fmtPhone(origPhone) : "", "old"),
        after: text(fmtPhone(draftPhone), "new"),
        short: "phone",
      });
    const order = { changed: 0, new: 1, removed: 2 } as const;
    [...carChanges]
      .sort((a, b) => order[a.kind] - order[b.kind])
      .forEach(({ it, kind }) => {
        const price = (c: CarRow) => (c.pricePerDay ? `PKR ${c.pricePerDay.toLocaleString("en-US")}/day` : "Price on request");
        if (kind === "new") {
          out.push({
            key: it.key,
            label: it.cur.name.trim(),
            before: { tone: "none" },
            after: { tone: "new", text: `${price(it.cur)} · ${modeLabel(it.cur.mode).toLowerCase()}` },
            short: it.cur.name.trim(),
          });
        } else if (kind === "removed") {
          out.push({ key: it.key, label: it.orig!.name.trim(), before: { tone: "old", text: price(it.orig!) }, after: { tone: "removed" }, short: it.orig!.name.trim() });
        } else {
          const o = it.orig!;
          const c = it.cur;
          const nameChanged = o.name.trim() !== c.name.trim();
          const modeChanged = o.mode !== c.mode;
          const desc = (car: CarRow, withName: boolean) =>
            [withName ? car.name.trim() : "", price(car), modeChanged ? modeLabel(car.mode).toLowerCase() : ""].filter(Boolean).join(" · ");
          out.push({
            key: it.key,
            label: c.name.trim(),
            before: { tone: "old", text: desc(o, nameChanged) },
            after: { tone: "new", text: desc(c, false) },
            short: c.name.trim(),
          });
        }
      });
    if (ch.services)
      out.push({
        key: "services",
        label: "Services",
        before: text(orig.services.join(", "), "old"),
        after: d.services.length ? { tone: "new", text: d.services.join(", ") } : { tone: "removed" },
        short: servicesAdded.length === 1 && servicesRemoved.length === 0 ? `${servicesAdded[0]} service` : "services",
      });
    if (ch.about)
      out.push({
        key: "about",
        label: "About",
        before: text(shorten(orig.about), "old"),
        after: d.about.trim() ? { tone: "new", text: shorten(d.about) } : { tone: "removed" },
        short: "new About text",
      });
    if (ch.website)
      out.push({
        key: "website",
        label: "Website",
        before: text(orig.website.trim(), "old"),
        after: d.website.trim() ? { tone: "new", text: d.website.trim() } : { tone: "removed" },
        short: "website",
      });
    if (ch.logo)
      out.push({
        key: "logo",
        label: "Logo",
        before: orig.logo ? { tone: "old", img: orig.logo } : { tone: "none" },
        after: d.logo ? { tone: "new", img: d.logo } : { tone: "removed" },
        short: "logo",
      });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, cars, closeRequested, orig]);

  const LIMIT = 4;
  const collapsed = rows.length > LIMIT + 1 && !showAll;
  const visible = collapsed ? rows.slice(0, LIMIT) : rows;
  const hidden = collapsed ? rows.slice(LIMIT) : [];
  const moreText = hidden.map((r) => r.short).join(", ");

  // ── Steps ──────────────────────────────────────────────────────────────
  const focusField = (k: ErrKey) =>
    window.setTimeout(() => {
      const el = document.getElementById(ERR_ID[k]);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 50);

  const validate = (s: Step): Errors => {
    const e: Errors = {};
    if (s === 0) {
      if (!you.name.trim()) e.claimantName = "Enter your name";
      if (!you.whatsapp) e.claimantWhatsapp = "Enter a WhatsApp number like 0300 1234567";
    }
    if (s === 1) {
      if (!d.name.trim()) e.name = "Enter the company name";
      if (!d.whatsapp) e.whatsapp = "Enter a WhatsApp number like 0300 1234567";
      if (d.phoneLocal.trim() && !d.phone) e.phone = "Enter a phone number like 051 2345678";
    }
    return e;
  };

  const fail = (e: Errors) => {
    const keys = Object.keys(e) as ErrKey[];
    const first = keys.reduce((a, b) => (ERR_STEP[b] < ERR_STEP[a] ? b : a));
    setErrors(e);
    setStep(ERR_STEP[first]);
    focusField(first);
  };

  const next = () => {
    if (step === 2) {
      void send();
      return;
    }
    const e = validate(step);
    if (Object.keys(e).length) {
      fail(e);
      return;
    }
    if (step === 1 && editingCar) {
      // Close the open car editor (drops an empty new car).
      const it = cars.find((c) => c.key === editingCar);
      if (it && !it.cur.name.trim()) {
        setCars((prev) =>
          it.orig ? prev.map((c) => (c.key === it.key ? { ...c, cur: { ...c.cur, name: it.orig!.name } } : c)) : prev.filter((c) => c.key !== it.key),
        );
      }
      setEditingCar(null);
    }
    setErrors({});
    setShowAll(false);
    setStep((step + 1) as Step);
  };

  const back = () => {
    if (status === "failed") setStatus("idle");
    if (step > 0) setStep((step - 1) as Step);
  };

  const summaryText = () => {
    const lines = [
      `Assalam o Alaikum RentalSawari, I'm ${role === "staff" ? "from" : "the owner of"} ${listing.name} (${SITE_HOST}${profileHref}). Please update the listing:`,
      ...rows.map((r) => `- ${r.label}: ${cellText(r.before)} → ${cellText(r.after)}`),
      `My name: ${you.name.trim()}`,
      you.whatsapp ? `My WhatsApp: ${fmtPhone(you.whatsapp)}` : "",
      message.trim() ? `Message: ${message.trim()}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  };

  async function send() {
    if (status === "sending") return;
    for (const s of [0, 1] as Step[]) {
      const e = validate(s);
      if (Object.keys(e).length) {
        fail(e);
        return;
      }
    }
    const changes: Record<string, unknown> = {};
    if (ch.name) changes.name = d.name.trim();
    if (ch.city) changes.city = d.city;
    if (ch.area) changes.area = d.area.trim();
    if (ch.whatsapp) changes.whatsapp = d.whatsapp;
    if (ch.phone) changes.phone = d.phone ?? "";
    if (ch.website) changes.website = d.website.trim();
    if (ch.about) changes.about = d.about.trim();
    if (ch.services) changes.services = d.services;
    if (carChanges.length) changes.cars = cars.filter((c) => !c.removed && c.cur.name.trim()).map((c) => ({ ...c.cur, name: c.cur.name.trim() }));
    if (ch.logo && d.logo?.startsWith("data:")) changes.logo = d.logo;
    // null = remove the current logo; it shows as its own change row in the admin.
    if (ch.logo && !d.logo) changes.logo = null;
    const fullMessage = message.trim();

    setStatus("sending");
    const r = await postJson<{ ok?: boolean; error?: string; fieldErrors?: Record<string, string> }>("/api/claims", {
      slug: listing.slug,
      role,
      name: you.name.trim(),
      whatsapp: you.whatsapp,
      message: fullMessage,
      changes,
      closeRequested,
      hp,
      elapsedMs: elapsed(),
    });
    if (r.data?.ok) {
      setStatus("sent");
      return;
    }
    const fe = r.data?.fieldErrors;
    if (r.status === 400 && fe && Object.keys(fe).length) {
      const mapped: Errors = {};
      if (fe.name) mapped.claimantName = fe.name;
      if (fe.whatsapp) mapped.claimantWhatsapp = fe.whatsapp;
      if (fe.logo) mapped.logo = fe.logo;
      if (Object.keys(mapped).length) {
        setStatus("idle");
        fail(mapped);
        return;
      }
    }
    setStatus("failed");
  }

  const areas = areasByCity[d.city] ?? [];
  const changedBorder = "border-[1.5px]";

  // ── Success ────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div ref={rootRef} className="mx-auto w-full max-w-[720px] lg:pb-16 lg:pt-14">
        <section
          aria-live="polite"
          className="flex flex-col max-lg:min-h-[calc(100dvh-65px)] lg:rounded-card lg:border lg:border-line lg:bg-white lg:shadow-card"
        >
          <div className="flex flex-1 flex-col items-center gap-3 px-6 py-24 text-center lg:gap-2.5 lg:px-10 lg:py-12">
            <SuccessMark icon={ShieldCheck} />
            <h1 ref={titleRef} tabIndex={-1} className="mt-2 text-[26px]/[32px] font-extrabold tracking-[-0.02em] text-ink outline-none lg:text-[28px]/[34px]">
              Thanks!
            </h1>
            <p className="max-w-[540px] text-[16px]/[24px] text-ink-2 [text-wrap:pretty] lg:text-[17px]/[26px]">
              To protect your listing, we&apos;ll message the WhatsApp number already on it to confirm it&apos;s really you. Your changes go live once confirmed.
            </p>
            <Link href={profileHref} className="mt-2 hidden text-[15px]/[22px] font-semibold text-brand-700 hover:text-brand-800 hover:underline lg:inline">
              Back to {listing.name}
            </Link>
          </div>
          <MobileBar className="mx-0">
            <PublicButton href={profileHref} variant="secondary" fullWidth className="font-bold">
              Back to the listing
            </PublicButton>
          </MobileBar>
        </section>
      </div>
    );
  }

  const primaryLabel = step === 0 ? "Next: Update details" : step === 1 ? "Review my changes" : "Send changes";
  const mobileLabel =
    step === 0 ? "Next" : step === 1 ? (count ? `Review ${count} ${count === 1 ? "change" : "changes"}` : "Review") : "Send changes";

  return (
    <div
      ref={rootRef}
      className="mx-auto w-full max-w-[720px] max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:flex max-lg:flex-col max-lg:bg-white lg:pb-16 lg:pt-14"
    >
      {/* Mobile header: × on step 1, ← later; title; "1 of 3" */}
      <div className="flex h-14 flex-none items-center gap-1 border-b border-line pl-1 pr-4 lg:hidden">
        {step === 0 ? (
          <Link href={profileHref} aria-label={`Close and go back to ${listing.name}`} className="grid size-11 flex-none place-items-center rounded-control text-ink active:bg-fill">
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : (
          <button type="button" onClick={back} aria-label="Back" className="grid size-11 flex-none place-items-center rounded-control text-ink active:bg-fill">
            <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
        <span className="min-w-0 flex-1 truncate text-[16px]/[22px] font-bold text-ink">
          {step === 0 ? `Claim ${listing.name}` : MOBILE_TITLES[step]}
        </span>
        <span className="num flex-none text-[13px]/[18px] font-semibold text-muted">{step + 1} of 3</span>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="relative flex min-h-0 flex-1 flex-col lg:rounded-card lg:border lg:border-line lg:bg-white lg:p-8 lg:shadow-card"
      >
        <Honeypot value={hp} onChange={setHp} />
        <div
          ref={mainRef}
          className={cx(
            "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 lg:overflow-visible lg:p-0",
            step === 0 ? "gap-3 lg:gap-[18px]" : step === 1 ? "gap-3.5 lg:gap-[18px]" : "gap-4",
          )}
        >
          {/* Desktop progress */}
          <div className="hidden flex-col gap-2 lg:flex">
            <span className="text-[13px]/[18px] font-semibold text-ink">
              Step {step + 1} of 3 · Claiming {listing.name}
            </span>
            <StepSegments total={3} done={step + 1} />
          </div>

          <div className={cx("flex items-baseline justify-between gap-4", step > 0 && "max-lg:sr-only")}>
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="text-[26px]/[32px] font-extrabold tracking-[-0.02em] text-ink outline-none max-lg:mb-1 lg:text-[24px]/[30px]"
            >
              {TITLES[step]}
            </h1>
            {step === 1 ? (
              <span className={cx("num flex-none text-[13px]/[18px] font-semibold", count ? "text-brand-700" : "text-muted")}>
                {count ? `${count} ${count === 1 ? "change" : "changes"}` : "No changes yet"}
              </span>
            ) : null}
          </div>

          {/* ── Step 1 · Who are you? ──────────────────────────────── */}
          {step === 0 ? (
            <>
              <div role="radiogroup" aria-label="Who are you?" className="flex flex-col gap-3 lg:gap-2">
                <RadioCard name="claim-role" value="owner" checked={role === "owner"} onChange={() => setRole("owner")} label="I'm the owner" />
                <RadioCard name="claim-role" value="staff" checked={role === "staff"} onChange={() => setRole("staff")} label="I work here" />
                <RadioCard
                  name="claim-role"
                  value="customer"
                  checked={false}
                  onChange={() => router.push(`${profileHref}?report=1`)}
                  label="I'm a customer and something is wrong"
                  trailing={<span className="max-lg:hidden">Opens the report form</span>}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 max-lg:mt-2 lg:grid-cols-2 lg:gap-4">
                <Field label="Your name" htmlFor={ERR_ID.claimantName} error={errors.claimantName}>
                  <TextInput
                    id={ERR_ID.claimantName}
                    value={you.name}
                    onChange={(e) => {
                      setYou((p) => ({ ...p, name: e.target.value }));
                      clearError("claimantName");
                    }}
                    invalid={!!errors.claimantName}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Your WhatsApp" htmlFor={ERR_ID.claimantWhatsapp} error={errors.claimantWhatsapp}>
                  <PhoneInput
                    id={ERR_ID.claimantWhatsapp}
                    value={you.whatsapp}
                    onChange={(n, local) => {
                      setYou((p) => ({ ...p, whatsapp: n, local }));
                      clearError("claimantWhatsapp");
                    }}
                    invalid={!!errors.claimantWhatsapp}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {/* ── Step 2 · Update your details ───────────────────────── */}
          {step === 1 ? (
            <>
              <ClaimField label="Company name" htmlFor={ERR_ID.name} changed={ch.name} onReset={() => reset("name")} error={errors.name}>
                <TextInput
                  id={ERR_ID.name}
                  value={d.name}
                  onChange={(e) => setDraft("name", e.target.value)}
                  changed={ch.name}
                  invalid={!!errors.name}
                  className={cx(ch.name && changedBorder)}
                />
              </ClaimField>
              <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-4">
                <ClaimField label="City" htmlFor="cl-city" changed={ch.city} onReset={() => reset("city")}>
                  <CityPicker id="cl-city" value={d.city || null} onChange={(c) => setDraft("city", c)} changed={ch.city} />
                </ClaimField>
                <ClaimField label="Area" htmlFor="cl-area" changed={ch.area} onReset={() => reset("area")}>
                  <AreaInput id="cl-area" value={d.area} onChange={(a) => setDraft("area", a)} areas={areas} city={d.city} changed={ch.area} />
                </ClaimField>
              </div>
              <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-4">
                <ClaimField
                  label="WhatsApp number"
                  htmlFor={ERR_ID.whatsapp}
                  changed={ch.whatsapp}
                  onReset={() => reset("whatsapp", "whatsappLocal")}
                  error={errors.whatsapp}
                >
                  <PhoneInput
                    id={ERR_ID.whatsapp}
                    value={d.whatsapp}
                    onChange={(n, local) => {
                      setD((p) => ({ ...p, whatsapp: n, whatsappLocal: local }));
                      clearError("whatsapp");
                    }}
                    changed={ch.whatsapp}
                    invalid={!!errors.whatsapp}
                    className={cx(ch.whatsapp && !errors.whatsapp && changedBorder)}
                  />
                </ClaimField>
                <ClaimField
                  label="Phone number"
                  htmlFor={ERR_ID.phone}
                  changed={ch.phone}
                  onReset={() => reset("phone", "phoneLocal")}
                  error={errors.phone}
                >
                  <PhoneInput
                    id={ERR_ID.phone}
                    value={d.phone}
                    onChange={(n, local) => {
                      setD((p) => ({ ...p, phone: n, phoneLocal: local }));
                      clearError("phone");
                    }}
                    changed={ch.phone}
                    invalid={!!errors.phone}
                    className={cx(ch.phone && !errors.phone && changedBorder)}
                  />
                </ClaimField>
              </div>

              <ClaimCars
                items={cars}
                onChange={setCars}
                editing={editingCar}
                onEditing={setEditingCar}
                onReset={() => {
                  setCars(origCars);
                  setEditingCar(null);
                }}
              />

              <ClaimField label="Services" changed={ch.services} onReset={() => reset("services")}>
                <ServiceChips value={d.services} onChange={(s) => setDraft("services", s)} aria-label="Services" />
              </ClaimField>
              <ClaimField label="About" htmlFor="cl-about" changed={ch.about} onReset={() => reset("about")}>
                <Textarea
                  id="cl-about"
                  value={d.about}
                  onChange={(e) => setDraft("about", e.target.value)}
                  changed={ch.about}
                  className={cx(ch.about && changedBorder)}
                />
              </ClaimField>
              <ClaimField label="Website" htmlFor="cl-website" changed={ch.website} onReset={() => reset("website")}>
                <TextInput
                  id="cl-website"
                  value={d.website}
                  onChange={(e) => setDraft("website", e.target.value)}
                  changed={ch.website}
                  inputMode="url"
                  placeholder="e.g. ravirentacar.pk"
                  className={cx(ch.website && changedBorder)}
                />
              </ClaimField>
              <ClaimField label="Logo" changed={ch.logo} onReset={() => reset("logo")}>
                <LogoField id={ERR_ID.logo} value={d.logo} onChange={(l) => setDraft("logo", l)} changed={ch.logo} error={errors.logo} />
              </ClaimField>

              <label className="relative flex cursor-pointer gap-3 rounded-control border border-line bg-page p-3.5 lg:px-4">
                <input
                  type="checkbox"
                  checked={closeRequested}
                  onChange={(e) => setCloseRequested(e.target.checked)}
                  className="peer absolute size-px opacity-0"
                />
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-px grid size-[22px] flex-none place-items-center rounded-md transition-colors peer-focus-visible:shadow-focus lg:size-5",
                    closeRequested ? "bg-brand-700 text-white" : "border-[1.5px] border-[#A8A29E] bg-white",
                  )}
                >
                  {closeRequested ? <Check size={14} strokeWidth={3} /> : null}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px]/[22px] font-semibold text-ink">This business has closed. Remove the listing.</span>
                  <span className="hidden text-[13px]/[18px] font-medium text-muted lg:block">
                    We&apos;ll confirm with the number on the listing before removing it.
                  </span>
                </span>
              </label>
            </>
          ) : null}

          {/* ── Step 3 · Review your changes ───────────────────────── */}
          {step === 2 ? (
            <>
              {rows.length ? (
                <div className="rounded-[14px] border border-line text-[15px]/[22px] font-medium text-ink">
                  <div className="hidden h-9 grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 rounded-t-[14px] border-b border-line bg-page px-4 text-[12px]/[16px] font-semibold uppercase tracking-[0.06em] text-muted lg:grid">
                    <span />
                    <span>Before</span>
                    <span>After</span>
                  </div>
                  {visible.map((r, i) => (
                    <div
                      key={r.key}
                      className={cx(
                        "grid grid-cols-1 gap-1 px-4 py-2.5 lg:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-3",
                        (i < visible.length - 1 || hidden.length > 0) && "border-b border-fill",
                      )}
                    >
                      <b className="min-w-0 font-semibold [overflow-wrap:anywhere]">{r.label}</b>
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 lg:contents">
                        <CellView cell={r.before} />
                        <ArrowRight size={14} strokeWidth={1.75} className="flex-none text-muted lg:hidden" aria-hidden="true" />
                        <CellView cell={r.after} />
                      </div>
                    </div>
                  ))}
                  {hidden.length ? (
                    <div className="grid grid-cols-1 gap-1 px-4 py-2.5 lg:grid-cols-[140px_minmax(0,1fr)] lg:gap-3">
                      <b className="font-semibold">+ {hidden.length} more</b>
                      <span className="text-quiet-text">
                        {moreText.charAt(0).toUpperCase() + moreText.slice(1)} ·{" "}
                        <button type="button" onClick={() => setShowAll(true)} className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                          Show
                        </button>
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="rounded-[14px] border border-line px-4 py-3.5 text-[15px]/[22px] font-medium text-quiet-text">
                  You haven&apos;t changed any details. You can still send this to claim the listing as it is.
                </p>
              )}
              <Field label="Message to RentalSawari" optional htmlFor="cl-message">
                <Textarea
                  id="cl-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  className="min-h-[72px] lg:text-[15px]/[22px]"
                />
              </Field>
              {status === "failed" ? (
                <Banner tone="error" title="Your changes couldn't be sent." layout="stacked">
                  Your details are still here. Try again, or send them to us on WhatsApp.
                </Banner>
              ) : null}
            </>
          ) : null}

          {/* Desktop footer */}
          <div
            className={cx(
              "hidden items-center gap-3 lg:flex",
              step === 0 ? "justify-end" : "justify-between",
              step < 2 && "border-t border-fill pt-2",
            )}
          >
            {step > 0 ? (
              <PublicButton variant="back" onClick={back}>
                Back
              </PublicButton>
            ) : null}
            <div className="flex items-center gap-2">
              {step === 2 && status === "failed" ? (
                <PublicButton href={waLink(SITE_WHATSAPP, summaryText())} target="_blank" variant="whatsapp">
                  Send on WhatsApp instead
                </PublicButton>
              ) : null}
              <PublicButton
                type="submit"
                iconRight={step < 2 ? ArrowRight : null}
                loading={status === "sending"}
                loadingText="Sending…"
              >
                {step === 2 && status === "failed" ? "Try again" : primaryLabel}
              </PublicButton>
            </div>
          </div>
        </div>

        {/* Mobile sticky button */}
        <div className="flex flex-none flex-col gap-2 border-t border-line bg-white px-4 pb-[30px] pt-3 lg:hidden">
          {step === 2 && status === "failed" ? (
            <PublicButton href={waLink(SITE_WHATSAPP, summaryText())} target="_blank" variant="whatsapp" fullWidth>
              Send on WhatsApp instead
            </PublicButton>
          ) : null}
          <PublicButton type="submit" fullWidth loading={status === "sending"} loadingText="Sending…">
            {step === 2 && status === "failed" ? "Try again" : mobileLabel}
          </PublicButton>
        </div>
      </form>
    </div>
  );
}
