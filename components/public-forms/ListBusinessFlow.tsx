"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleCheck, Info } from "lucide-react";
import { SITE_WHATSAPP, isSiteCity } from "@/lib/admin/constants";
import { fmtNum, fmtPhone, phoneDigits, waLink } from "@/lib/admin/format";
import type { CarRow } from "@/lib/admin/types";
import { trackListBusinessSubmit } from "@/lib/analytics";
import { AreaInput } from "@/components/admin/ui/AreaInput";
import { Banner } from "@/components/admin/ui/Banner";
import { CityPicker } from "@/components/admin/ui/CityPicker";
import { cx } from "@/components/admin/ui/cx";
import { Field, PhoneInput, TextInput, Textarea } from "@/components/admin/ui/Field";
import { ServiceChips } from "@/components/admin/ui/ServiceChips";
import { CarsEditor, EMPTY_CAR } from "./CarsEditor";
import { ClaimSearch } from "./ClaimSearch";
import { LogoField } from "./LogoField";
import { PublicButton } from "./PublicButton";
import { Honeypot, MobileBar, postJson, scrollToForm, StepSegments, SuccessMark, useFormClock } from "./shared";

/**
 * Page 12 — List your business. Four client-side steps (Your business ·
 * Contact · Cars & services · About & logo), then Review and Send request.
 * Values are kept when going back. Posts to /api/listing-requests.
 */

const OTHER_CITY = "__other";
const STEP_LABELS: readonly string[] = ["Your business", "Contact", "Cars & services", "About & logo"];
const STEP_TITLES: readonly string[] = ["Your business", "Contact", "Your cars and services", "About and logo"];
const NEXT_LABELS: readonly string[] = ["Next: Contact", "Next: Cars & services", "Next: About & logo", "Review my details"];

type Step = 0 | 1 | 2 | 3 | 4; // 4 = review
type Status = "idle" | "sending" | "failed" | "sent";

interface Values {
  name: string;
  city: string; // one of the 21, OTHER_CITY, or ""
  cityOther: string;
  area: string;
  address: string;
  website: string;
  mapsUrl: string;
  ownerName: string;
  whatsapp: string | null; // E.164 once valid
  whatsappLocal: string; // as typed
  phone: string | null;
  phoneLocal: string;
  services: string[];
  cars: CarRow[];
  fleetSize: string;
  about: string;
  logo: string | null;
}

type FieldKey = "name" | "city" | "cityOther" | "ownerName" | "whatsapp" | "phone" | "logo";
type Errors = Partial<Record<FieldKey, string>>;

const INITIAL: Values = {
  name: "",
  city: "",
  cityOther: "",
  area: "",
  address: "",
  website: "",
  mapsUrl: "",
  ownerName: "",
  whatsapp: null,
  whatsappLocal: "",
  phone: null,
  phoneLocal: "",
  services: [],
  cars: [{ ...EMPTY_CAR }],
  fleetSize: "",
  about: "",
  logo: null,
};

const FIELD_STEP: Record<FieldKey, Step> = {
  name: 0,
  city: 0,
  cityOther: 0,
  ownerName: 1,
  whatsapp: 1,
  phone: 1,
  logo: 3,
};

const FIELD_ID: Record<FieldKey, string> = {
  name: "lb-name",
  city: "lb-city",
  cityOther: "lb-city-other",
  ownerName: "lb-owner",
  whatsapp: "lb-whatsapp",
  phone: "lb-phone",
  logo: "lb-logo",
};

interface DuplicateMatch {
  slug: string;
  name: string;
  city: string;
  area: string;
}

function cityLabel(v: Values): string {
  return v.city === OTHER_CITY ? v.cityOther.trim() : v.city;
}

function cleanCars(cars: CarRow[]): CarRow[] {
  return cars.filter((c) => c.name.trim()).map((c) => ({ ...c, name: c.name.trim() }));
}

function carText(c: CarRow): string {
  const mode = c.mode === "self" ? "self-drive" : "with driver";
  return c.pricePerDay ? `${c.name} PKR ${fmtNum(c.pricePerDay)} (${mode})` : `${c.name} (${mode})`;
}

function fleetText(n: string): string {
  const v = Number(n);
  return `${fmtNum(v)} ${v === 1 ? "car" : "cars"}`;
}

function shorten(s: string, max = 52): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function validate(step: Step, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.name.trim()) e.name = "Enter your company name";
    if (!v.city) e.city = "Choose your city";
    else if (v.city === OTHER_CITY && !v.cityOther.trim()) e.cityOther = "Enter your city";
  }
  if (step === 1) {
    if (!v.ownerName.trim()) e.ownerName = "Enter your name";
    if (!v.whatsapp) e.whatsapp = "Enter a WhatsApp number like 0300 1234567";
    if (v.phoneLocal.trim() && !v.phone) e.phone = "Enter a phone number like 0300 1234567";
  }
  return e;
}

/** The form as a WhatsApp message (fallback when sending fails). */
function summaryText(v: Values): string {
  const cars = cleanCars(v.cars);
  const lines = [
    "Assalam o Alaikum RentalSawari, please list my business.",
    `Company: ${v.name.trim()}`,
    `City: ${[cityLabel(v), v.area.trim()].filter(Boolean).join(", ")}`,
    v.address.trim() && `Address: ${v.address.trim()}`,
    v.website.trim() && `Website: ${v.website.trim()}`,
    v.mapsUrl.trim() && `Google Maps: ${v.mapsUrl.trim()}`,
    `Name: ${v.ownerName.trim()}`,
    v.whatsapp && `WhatsApp: ${fmtPhone(v.whatsapp)}`,
    v.phone && `Phone: ${fmtPhone(v.phone)}`,
    v.services.length > 0 && `Services: ${v.services.join(", ")}`,
    cars.length > 0 && `Cars: ${cars.map(carText).join(", ")}`,
    v.fleetSize && `Fleet: ${fleetText(v.fleetSize)}`,
    v.about.trim() && `About: ${v.about.trim()}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function ListBusinessFlow({ areasByCity }: { areasByCity: Record<string, string[]> }) {
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [v, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [hp, setHp] = useState("");
  const [dup, setDup] = useState<{ number: string; match: DuplicateMatch } | null>(null);
  const [dismissedDup, setDismissedDup] = useState<string | null>(null);
  const { elapsed } = useFormClock();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sent = status === "sent";
  const shown = useRef({ step, sent });

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in FIELD_STEP && errors[key as FieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as FieldKey];
        if (key === "city") delete next.cityOther;
        return next;
      });
    }
  };

  // Move to the top of the form and onto the new step's title.
  useEffect(() => {
    if (shown.current.step === step && shown.current.sent === sent) return;
    shown.current = { step, sent };
    scrollToForm(cardRef.current, window.innerWidth < 1024);
    titleRef.current?.focus({ preventScroll: true });
  }, [step, sent]);

  // Live duplicate check once the WhatsApp number has 10 digits.
  const waDigits = phoneDigits(v.whatsappLocal).length;
  useEffect(() => {
    const n = v.whatsapp;
    if (!n || waDigits !== 10) {
      setDup(null);
      return;
    }
    const ctl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/listing-lookup?whatsapp=${encodeURIComponent(n)}`, { signal: ctl.signal });
        const j = (await res.json()) as { match?: DuplicateMatch | null };
        setDup(j?.match ? { number: n, match: j.match } : null);
      } catch {
        /* the check is a nicety; ignore failures */
      }
    }, 300);
    return () => {
      window.clearTimeout(t);
      ctl.abort();
    };
  }, [v.whatsapp, waDigits]);
  const showDup = !!dup && dup.number === v.whatsapp && dismissedDup !== dup.number;

  const focusField = (key: FieldKey) => {
    window.setTimeout(() => {
      const el = document.getElementById(FIELD_ID[key]);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 50);
  };

  const next = () => {
    if (step === 4) {
      void send();
      return;
    }
    const e = validate(step, v);
    if (Object.keys(e).length) {
      setErrors(e);
      focusField(Object.keys(e)[0] as FieldKey);
      return;
    }
    setErrors({});
    setStep((step + 1) as Step);
  };

  const back = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const goTo = (s: Step) => {
    if (status === "failed") setStatus("idle");
    setStep(s);
  };

  async function send() {
    if (status === "sending") return;
    // Re-check the required steps in case something was cleared.
    for (const s of [0, 1] as Step[]) {
      const e = validate(s, v);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        focusField(Object.keys(e)[0] as FieldKey);
        return;
      }
    }
    setStatus("sending");
    const siteCity = isSiteCity(v.city);
    const fleet = v.fleetSize ? Number(v.fleetSize) : null;
    const r = await postJson<{ ok?: boolean; error?: string; fieldErrors?: Record<string, string> }>("/api/listing-requests", {
      name: v.name.trim(),
      city: siteCity ? v.city : "",
      cityOther: siteCity ? "" : v.cityOther.trim(),
      area: v.area.trim(),
      address: v.address.trim(),
      website: v.website.trim(),
      mapsUrl: v.mapsUrl.trim(),
      ownerName: v.ownerName.trim(),
      whatsapp: v.whatsapp,
      phone: v.phone ?? "",
      services: v.services,
      cars: cleanCars(v.cars),
      fleetSize: fleet,
      about: v.about.trim(),
      logo: v.logo,
      hp,
      elapsedMs: elapsed(),
    });
    if (r.data?.ok) {
      trackListBusinessSubmit(cityLabel(v) || "(unknown)", v.fleetSize);
      setStatus("sent");
      return;
    }
    const fe = r.data?.fieldErrors;
    if (r.status === 400 && fe && Object.keys(fe).length) {
      const mapped: Errors = {};
      for (const [k, msg] of Object.entries(fe)) {
        if (k === "city" && v.city === OTHER_CITY) mapped.cityOther = msg;
        else if (k in FIELD_STEP) mapped[k as FieldKey] = msg;
      }
      const keys = Object.keys(mapped) as FieldKey[];
      if (keys.length) {
        const first = keys.reduce((a, b) => (FIELD_STEP[b] < FIELD_STEP[a] ? b : a));
        setErrors(mapped);
        setStatus("idle");
        setStep(FIELD_STEP[first]);
        focusField(first);
        return;
      }
    }
    setStatus("failed");
  }

  const areas = useMemo(() => (v.city && v.city !== OTHER_CITY ? areasByCity[v.city] ?? [] : []), [areasByCity, v.city]);
  const cars = cleanCars(v.cars);

  const reviewRows: Array<{ label: string; value: string; step: Step }> = [
    {
      label: "Your business",
      value: [v.name.trim(), cityLabel(v), v.area.trim(), v.address.trim(), v.website.trim()].filter(Boolean).join(" · "),
      step: 0,
    },
    {
      label: "Contact",
      value: [
        v.ownerName.trim(),
        v.whatsapp ? `WhatsApp ${fmtPhone(v.whatsapp)}` : "",
        v.phone ? `Phone ${fmtPhone(v.phone)}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      step: 1,
    },
    {
      label: "Cars & services",
      value: capitalize(
        [v.services.join(", "), cars.map(carText).join(", "), v.fleetSize ? fleetText(v.fleetSize) : ""].filter(Boolean).join(" · ") ||
          "nothing added",
      ),
      step: 2,
    },
    {
      label: "About & logo",
      value: capitalize([v.about.trim() ? shorten(v.about) : "", v.logo ? "logo added" : "no logo"].filter(Boolean).join(" · ")),
      step: 3,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 pb-16 pt-5 lg:gap-6 lg:px-0 lg:pt-14">
      <div className={cx(sent && "max-lg:hidden")}>
        <h1 className="text-public-h1-m text-ink lg:text-public-h1">List your car rental business</h1>
        <p className="mt-2 text-[16px]/[24px] text-ink-2 [text-wrap:pretty] lg:mt-2.5 lg:text-[17px]/[26px]">
          Free to list. Customers contact you directly on WhatsApp or by phone, and RentalSawari takes no booking fee.
        </p>
      </div>

      {!sent ? <ClaimSearch /> : null}

      <div ref={cardRef} className={cx(sent && "max-lg:-mx-4 max-lg:-mb-16 max-lg:-mt-5")}>
      {sent ? (
        <section
          aria-live="polite"
          className="flex flex-col max-lg:min-h-[calc(100dvh-65px)] lg:rounded-card lg:border lg:border-line lg:bg-white lg:shadow-card"
        >
          <div className="flex flex-1 flex-col items-center gap-3 px-6 py-20 text-center lg:gap-2.5 lg:px-10 lg:py-12">
            <SuccessMark icon={CircleCheck} />
            <h2 ref={titleRef} tabIndex={-1} className="mt-2 text-[26px]/[32px] font-extrabold tracking-[-0.02em] text-ink outline-none lg:text-[28px]/[34px]">
              Request received
            </h2>
            <p className="max-w-[520px] text-[16px]/[24px] text-ink-2 [text-wrap:pretty] lg:text-[17px]/[26px]">
              We&apos;ll check your details and message you on WhatsApp within 24 hours. Free listings go live as soon as they&apos;re approved.
            </p>
            <Link
              href="/"
              className="mt-2 hidden text-[15px]/[22px] font-semibold text-brand-700 hover:text-brand-800 hover:underline lg:inline"
            >
              Back to RentalSawari
            </Link>
          </div>
          <MobileBar className="mx-0">
            <PublicButton href="/" variant="secondary" fullWidth className="font-bold">
              Back to RentalSawari
            </PublicButton>
          </MobileBar>
        </section>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className={cx(
            "relative flex scroll-mt-20 flex-col gap-4 lg:rounded-card lg:border lg:border-line lg:bg-white lg:p-8 lg:shadow-card",
            step === 0 ? "lg:gap-6" : "lg:gap-5",
          )}
        >
          <Honeypot value={hp} onChange={setHp} />

          {step < 4 ? (
            <div className="flex flex-col gap-2 lg:gap-2.5">
              <div className="flex min-h-[18px] items-center justify-between text-[13px]/[18px] font-semibold text-muted">
                <span className="text-ink">
                  Step {step + 1} of 4<span className="lg:hidden"> · {STEP_LABELS[step]}</span>
                </span>
                <span className="hidden lg:inline">About 3 minutes</span>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="-my-3 inline-flex items-center gap-1 py-3 text-[15px]/[20px] font-semibold text-ink-2 lg:hidden"
                  >
                    <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
                    Back
                  </button>
                ) : null}
              </div>
              <StepSegments total={4} done={step + 1} />
              <div className="hidden grid-cols-4 gap-1.5 text-[13px]/[18px] font-medium text-muted lg:grid">
                {STEP_LABELS.map((l, i) => (
                  <span key={l} className={cx(i === step && "font-bold text-accent-700")}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <h2
            ref={titleRef}
            tabIndex={-1}
            className="text-[26px]/[32px] font-extrabold tracking-[-0.02em] text-ink outline-none lg:text-[24px]/[30px]"
          >
            {step < 4 ? STEP_TITLES[step] : "Check your details"}
          </h2>

          {/* ── Step 1 · Your business ─────────────────────────────── */}
          {step === 0 ? (
            <div className="flex flex-col gap-4 lg:gap-6">
              <Field label="Company name" htmlFor={FIELD_ID.name} error={errors.name}>
                <TextInput
                  id={FIELD_ID.name}
                  value={v.name}
                  onChange={(e) => set("name", e.target.value)}
                  invalid={!!errors.name}
                  autoComplete="organization"
                  placeholder="e.g. Ravi Rent A Car"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field label="City" htmlFor={FIELD_ID.city} error={errors.city}>
                  <CityPicker
                    id={FIELD_ID.city}
                    value={v.city || null}
                    onChange={(c) => set("city", c)}
                    extraOption={{ value: OTHER_CITY, label: "My city isn't listed" }}
                    invalid={!!errors.city}
                  />
                </Field>
                <Field label="Area" htmlFor="lb-area">
                  <AreaInput
                    id="lb-area"
                    value={v.area}
                    onChange={(a) => set("area", a)}
                    areas={areas}
                    city={v.city && v.city !== OTHER_CITY ? v.city : null}
                    placeholder="e.g. Johar Town"
                  />
                </Field>
              </div>
              {v.city === OTHER_CITY ? (
                <Field
                  label="Your city"
                  htmlFor={FIELD_ID.cityOther}
                  error={errors.cityOther}
                  hint={`We're in 21 cities right now. Send your details anyway and we'll tell you when ${v.cityOther.trim() || "your city"} is added.`}
                >
                  <TextInput
                    id={FIELD_ID.cityOther}
                    value={v.cityOther}
                    onChange={(e) => set("cityOther", e.target.value)}
                    invalid={!!errors.cityOther}
                    autoComplete="address-level2"
                  />
                </Field>
              ) : null}
              <Field label="Address" optional htmlFor="lb-address">
                <TextInput
                  id="lb-address"
                  value={v.address}
                  onChange={(e) => set("address", e.target.value)}
                  autoComplete="street-address"
                  placeholder="e.g. 65-B, Block G1, Johar Town"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field label="Website" optional htmlFor="lb-website">
                  <TextInput
                    id="lb-website"
                    value={v.website}
                    onChange={(e) => set("website", e.target.value)}
                    inputMode="url"
                    autoComplete="url"
                    placeholder="e.g. ravirentacar.pk"
                  />
                </Field>
                <Field label="Google Maps link" optional htmlFor="lb-maps">
                  <TextInput
                    id="lb-maps"
                    value={v.mapsUrl}
                    onChange={(e) => set("mapsUrl", e.target.value)}
                    inputMode="url"
                    placeholder="Paste the link from Google Maps"
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {/* ── Step 2 · Contact ───────────────────────────────────── */}
          {step === 1 ? (
            <div className="flex flex-col gap-4 lg:gap-5">
              <Field label="Your name" htmlFor={FIELD_ID.ownerName} error={errors.ownerName}>
                <TextInput
                  id={FIELD_ID.ownerName}
                  value={v.ownerName}
                  onChange={(e) => set("ownerName", e.target.value)}
                  invalid={!!errors.ownerName}
                  autoComplete="name"
                />
              </Field>
              <div className="flex flex-col gap-1.5">
                <Field label="WhatsApp number" htmlFor={FIELD_ID.whatsapp} error={errors.whatsapp}>
                  <PhoneInput
                    id={FIELD_ID.whatsapp}
                    value={v.whatsapp}
                    onChange={(n, local) => {
                      setValues((prev) => ({ ...prev, whatsapp: n, whatsappLocal: local }));
                      if (errors.whatsapp) setErrors(({ whatsapp: _w, ...rest }) => rest);
                    }}
                    invalid={!!errors.whatsapp}
                  />
                </Field>
                {showDup && dup ? (
                  <div
                    role="status"
                    className="flex flex-col gap-2.5 rounded-control border border-wait-border bg-wait-fill p-3.5 lg:mt-1.5 lg:flex-row lg:gap-3 lg:px-4"
                  >
                    <Info size={20} strokeWidth={1.75} className="hidden flex-none text-wait-text lg:block" aria-hidden="true" />
                    <div className="flex min-w-0 flex-col gap-2.5">
                      <span className="text-[15px]/[22px] font-medium text-ink">
                        This number is already on <b className="font-bold">{dup.match.name}</b> ({dup.match.city}). Is that yours?
                      </span>
                      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3.5">
                        <PublicButton
                          href={`/companies/${dup.match.slug}/claim`}
                          variant="outline"
                          className="lg:h-11 lg:text-[15px]/[20px]"
                        >
                          Claim that listing instead
                        </PublicButton>
                        <button
                          type="button"
                          onClick={() => {
                            setDismissedDup(dup.number);
                            next();
                          }}
                          className="text-center text-[15px]/[22px] font-semibold text-ink-2 hover:text-ink hover:underline lg:text-left lg:leading-5"
                        >
                          No, it isn&apos;t mine · continue
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <Field label="Phone" optional htmlFor={FIELD_ID.phone} error={errors.phone}>
                <PhoneInput
                  id={FIELD_ID.phone}
                  value={v.phone}
                  onChange={(n, local) => {
                    setValues((prev) => ({ ...prev, phone: n, phoneLocal: local }));
                    if (errors.phone) setErrors(({ phone: _p, ...rest }) => rest);
                  }}
                  invalid={!!errors.phone}
                  placeholder="If different from WhatsApp"
                />
              </Field>
            </div>
          ) : null}

          {/* ── Step 3 · Cars & services ───────────────────────────── */}
          {step === 2 ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[13px]/[18px] font-semibold text-ink-2">What do you offer?</span>
                <ServiceChips value={v.services} onChange={(s) => set("services", s)} aria-label="What do you offer?" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[13px]/[18px] font-semibold text-ink-2">Cars and prices</span>
                <CarsEditor value={v.cars} onChange={(c) => set("cars", c)} />
              </div>
              <Field label="How many cars do you have?" htmlFor="lb-fleet" className="lg:w-[220px]">
                <TextInput
                  id="lb-fleet"
                  value={v.fleetSize}
                  onChange={(e) => set("fleetSize", e.target.value.replace(/\D/g, "").slice(0, 5))}
                  inputMode="numeric"
                  className="num"
                />
              </Field>
            </div>
          ) : null}

          {/* ── Step 4 · About & logo ──────────────────────────────── */}
          {step === 3 ? (
            <div className="flex flex-col gap-5">
              <Field
                label="About your business"
                htmlFor="lb-about"
                hint="Tip: say what you rent, which areas you cover, and what makes you different. Two or three sentences is enough."
              >
                <Textarea id="lb-about" value={v.about} onChange={(e) => set("about", e.target.value)} className="min-h-[110px]" />
              </Field>
              <Field label="Logo" optional>
                <LogoField id={FIELD_ID.logo} value={v.logo} onChange={(l) => set("logo", l)} error={errors.logo} />
              </Field>
            </div>
          ) : null}

          {/* ── Review ─────────────────────────────────────────────── */}
          {step === 4 ? (
            <div className="rounded-[14px] border border-line">
              {reviewRows.map((r, i) => (
                <div
                  key={r.label}
                  className={cx(
                    "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3.5 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:px-[18px]",
                    i < reviewRows.length - 1 && "border-b border-fill",
                  )}
                >
                  <b className="text-[13px]/[22px] font-semibold text-ink-2">{r.label}</b>
                  <span className="num col-span-2 row-start-2 text-[15px]/[22px] font-medium text-ink [overflow-wrap:anywhere] lg:col-span-1 lg:col-start-2 lg:row-start-1">
                    {r.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => goTo(r.step)}
                    className="col-start-2 row-start-1 self-start text-[14px]/[22px] font-semibold text-brand-700 hover:text-brand-800 hover:underline lg:col-start-3"
                  >
                    Edit<span className="sr-only"> {r.label}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {status === "failed" && step === 4 ? (
            <div className="flex flex-col gap-3.5">
              <Banner tone="error" title="Your request couldn't be sent." layout="stacked">
                Your details are still here. Try again, or send them to us on WhatsApp.
              </Banner>
              <div className="hidden justify-end gap-2 lg:flex">
                <PublicButton href={waLink(SITE_WHATSAPP, summaryText(v))} target="_blank" variant="whatsapp">
                  Send on WhatsApp instead
                </PublicButton>
                <PublicButton type="submit">Try again</PublicButton>
              </div>
            </div>
          ) : null}

          {/* Desktop footer */}
          {status !== "failed" || step !== 4 ? (
            <div
              className={cx(
                "hidden items-center justify-between gap-4 lg:flex",
                step === 4 ? "" : "border-t border-fill pt-2",
              )}
            >
              {step === 0 || step === 4 ? (
                <span className="text-[13px]/[18px] font-medium text-muted">
                  {step === 0
                    ? "Your details are only shared once we approve the listing."
                    : "We'll message you on WhatsApp once it's checked."}
                </span>
              ) : (
                <PublicButton variant="back" onClick={back}>
                  Back
                </PublicButton>
              )}
              <PublicButton
                type="submit"
                iconRight={step < 4 ? ArrowRight : null}
                loading={status === "sending"}
                loadingText="Sending…"
              >
                {step < 4 ? NEXT_LABELS[step] : "Send request"}
              </PublicButton>
            </div>
          ) : null}

          {/* Mobile notes + sticky button */}
          {step === 0 || step === 4 ? (
            <p className="text-[13px]/[18px] font-medium text-muted lg:hidden">
              {step === 0 ? "Your details are only shared once we approve the listing." : "We'll message you on WhatsApp once it's checked."}
            </p>
          ) : null}
          <MobileBar>
            {status === "failed" && step === 4 ? (
              <>
                <PublicButton href={waLink(SITE_WHATSAPP, summaryText(v))} target="_blank" variant="whatsapp" fullWidth>
                  Send on WhatsApp instead
                </PublicButton>
                <PublicButton type="submit" fullWidth>
                  Try again
                </PublicButton>
              </>
            ) : (
              <PublicButton
                type="submit"
                fullWidth
                iconRight={step < 4 ? ArrowRight : null}
                loading={status === "sending"}
                loadingText="Sending…"
              >
                {step < 4 ? NEXT_LABELS[step] : "Send request"}
              </PublicButton>
            )}
          </MobileBar>
        </form>
      )}
      </div>
    </div>
  );
}
