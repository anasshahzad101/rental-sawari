"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Lock, Star } from "lucide-react";
import type { Plan } from "@/lib/admin/types";
import { PLAN_LABEL, SITE_HOST } from "@/lib/admin/constants";
import { plural, slugify } from "@/lib/admin/format";
import { createListingAction, saveListingAction, undoVersionAction, type ListingFormInput } from "@/app/(admin)/admin/_actions/listings";
import { AreaInput } from "@/components/admin/ui/AreaInput";
import { Banner } from "@/components/admin/ui/Banner";
import { Button } from "@/components/admin/ui/Button";
import { CarsRepeater } from "@/components/admin/ui/CarsRepeater";
import { CityPicker } from "@/components/admin/ui/CityPicker";
import { Field, FieldError, innerInput, PhoneInput, Select, shellClasses, Textarea, TextInput } from "@/components/admin/ui/Field";
import { LogoUpload } from "@/components/admin/ui/LogoUpload";
import { ServiceChips } from "@/components/admin/ui/ServiceChips";
import { Segmented, ToggleRow } from "@/components/admin/ui/controls";
import { useToast } from "@/components/admin/ui/Toast";
import { cx } from "@/components/admin/ui/cx";
import { DateField } from "./DateField";
import { MobileCars } from "./MobileCars";
import {
  cleanSlug,
  defaultPlanDates,
  FIELD_NAME,
  FORM_KEYS,
  fieldChanged,
  focusKey,
  formDiff,
  fromInput,
  localErrors,
  SECTION_OF,
  SECTIONS,
  slugChanged,
  toInput,
  type FormKey,
  type FormValues,
  type SectionKey,
} from "./model";

export interface ListingFormProps {
  mode: "edit" | "add";
  /** Edit only. */
  listingId?: number;
  /** Starting values (the listing as saved, or empty for Add). */
  initial: ListingFormInput;
  /** The listing's updatedAt: when it changes the form takes the saved values. */
  stamp?: string;
  /** Areas already used per city (AreaInput suggestions). */
  areas: Record<string, string[]>;
}

const PLAN_OPTIONS = (Object.keys(PLAN_LABEL) as Plan[]).map((p) => ({ value: p, label: PLAN_LABEL[p] }));

const INPUTS = 'input:not([type="hidden"]):not([type="file"]), textarea, select';
const CONTROLS = 'button:not([disabled]), [role="button"][tabindex]';

function visible(el: HTMLElement) {
  return el.offsetParent !== null && !el.hasAttribute("disabled");
}

/** Dot + teal text after a group title ("1 price changed"). */
function ChangedMark({ text }: { text: React.ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="size-2 flex-none rounded-full bg-brand-700" />
      <span className="text-[13px]/[18px] font-medium text-brand-700">{text}</span>
    </>
  );
}

function Group({
  id,
  title,
  mark,
  className,
  titleClassName,
  children,
}: {
  id: SectionKey;
  title: React.ReactNode;
  mark?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`sec-${id}`}
      data-section={id}
      className={cx("flex min-w-0 scroll-mt-[72px] flex-col rounded-card border border-line bg-white p-4 lg:scroll-mt-6 lg:p-6 lg:shadow-card", className)}
    >
      <h3 className={cx("flex flex-wrap items-center gap-2 text-card-title-m text-ink lg:text-card-title", titleClassName)}>
        {title}
        {mark ? <ChangedMark text={mark} /> : null}
      </h3>
      {children}
    </section>
  );
}

/**
 * The Edit tab form and the Add listing form. Nothing reaches the site until
 * Update listing (or Publish listing) is pressed; every change is tracked per
 * field against the saved listing and counted in the sticky bar.
 */
export function ListingForm({ mode, listingId, initial, stamp, areas }: ListingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const edit = mode === "edit";

  const [original, setOriginal] = useState<FormValues>(() => fromInput(initial));
  const [values, setValues] = useState<FormValues>(() => fromInput(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [carErrors, setCarErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [active, setActive] = useState<SectionKey>("basics");

  const rootRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const latestInitial = useRef(initial);
  latestInitial.current = initial;
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const originalRef = useRef(original);
  originalRef.current = original;
  /** Set before a save or undo: the next saved version replaces the form. */
  const pendingReset = useRef(false);
  const lastStamp = useRef(stamp);
  const reveal = useRef(false);
  const scrollLock = useRef(0);

  // The saved listing changed (after Update, Undo, or elsewhere): take it.
  useEffect(() => {
    if (stamp === lastStamp.current) return;
    lastStamp.current = stamp;
    const next = fromInput(latestInitial.current);
    const dirty = FORM_KEYS.some((k) => fieldChanged(k, originalRef.current, valuesRef.current));
    setOriginal(next);
    if (pendingReset.current || !dirty) {
      setValues(next);
      setErrors({});
      setCarErrors({});
    }
    pendingReset.current = false;
  }, [stamp]);

  const diff = useMemo(() => formDiff(original, values), [original, values]);
  const count = diff.items.length || diff.keys.size;
  const ch = (k: FormKey) => edit && diff.keys.has(k);

  const update = useCallback(<K extends FormKey>(k: K, v: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((e) => {
      if (!(k in e)) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
  }, []);

  const setPlan = (p: Plan) => {
    setValues((prev) => {
      const next = { ...prev, plan: p };
      if (p !== "free" && (!prev.planStart || !prev.planEnd)) {
        const d = defaultPlanDates();
        next.planStart = prev.planStart || d.start;
        next.planEnd = prev.planEnd || d.end;
      }
      return next;
    });
  };

  // ── Focus a field (?focus=, the error summary) ──────────────────────────
  const focusField = useCallback((k: FormKey, smooth = true) => {
    if (SECTION_OF[k] === "admin") setAdminOpen(true);
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`field-${k}`);
      if (!el) return;
      el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
      const target =
        Array.from(el.querySelectorAll<HTMLElement>(INPUTS)).find(visible) ?? Array.from(el.querySelectorAll<HTMLElement>(CONTROLS)).find(visible);
      target?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    const k = focusKey(new URLSearchParams(window.location.search).get("focus"));
    if (!k) return;
    const t = window.setTimeout(() => focusField(k), 80);
    return () => window.clearTimeout(t);
  }, [focusField]);

  // ── Section index: highlight the section in view ────────────────────────
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (Date.now() < scrollLock.current) return;
      let cur: SectionKey = SECTIONS[0].key;
      for (const s of SECTIONS) {
        const el = document.getElementById(`sec-${s.key}`);
        if (el && el.getBoundingClientRect().top <= 140) cur = s.key;
      }
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 8) cur = SECTIONS[SECTIONS.length - 1].key;
      setActive(cur);
    };
    const on = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const goSection = (k: SectionKey) => {
    setActive(k);
    scrollLock.current = Date.now() + 700;
    if (k === "admin") setAdminOpen(true);
    document.getElementById(`sec-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Leaving with unsaved changes ────────────────────────────────────────
  useEffect(() => {
    if (!count || saving) return;
    const on = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [count, saving]);

  useEffect(() => {
    if (!reveal.current) return;
    reveal.current = false;
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors, formError]);

  // ── Save ────────────────────────────────────────────────────────────────
  const showErrors = (fieldErrors: Record<string, string> | undefined, message: string | null, cars: Record<number, string> = {}) => {
    reveal.current = true;
    setErrors(fieldErrors ?? {});
    setCarErrors(cars);
    setFormError(message);
    const keys = Object.keys(fieldErrors ?? {});
    if (keys.some((k) => SECTION_OF[k as FormKey] === "admin")) setAdminOpen(true);
  };

  const save = async () => {
    if (saving) return;
    const local = localErrors(values);
    if (Object.keys(local.errors).length) {
      showErrors(local.errors, null, local.carErrors);
      return;
    }
    setSaving(true);
    setFormError(null);
    setErrors({});
    setCarErrors({});
    setSaved(false);
    const input = toInput(values);
    const snapshot = values;

    if (!edit) {
      let r: Awaited<ReturnType<typeof createListingAction>>;
      try {
        r = await createListingAction(input);
      } catch {
        r = { ok: false, error: "Couldn't publish. Check the connection and try again." };
      }
      if (!r.ok) {
        setSaving(false);
        if (r.fieldErrors && Object.keys(r.fieldErrors).length) showErrors(r.fieldErrors, null);
        else showErrors(undefined, r.error);
        return;
      }
      setOriginal(snapshot);
      toast({ message: `${input.name} added` });
      router.push(`/admin/listings/${r.id}?tab=edit`);
      return;
    }

    pendingReset.current = true;
    let r: Awaited<ReturnType<typeof saveListingAction>>;
    try {
      r = await saveListingAction(listingId as number, input);
    } catch {
      r = { ok: false, error: "Couldn't save. Check the connection and try again." };
    }
    setSaving(false);
    if (!r.ok) {
      pendingReset.current = false;
      if (r.fieldErrors && Object.keys(r.fieldErrors).length) showErrors(r.fieldErrors, null);
      else showErrors(undefined, r.error);
      return;
    }
    // Clear the dots now; the saved version replaces the form when it arrives.
    if (pendingReset.current) setOriginal(snapshot);
    if (r.versionId == null) {
      pendingReset.current = false;
      toast({ message: "Nothing to save. The listing already looks like this.", icon: null });
      router.refresh();
      return;
    }
    setSaved(true);
    const vid = r.versionId;
    toast({
      message: `${input.name} updated`,
      undo: async () => {
        pendingReset.current = true;
        let u: Awaited<ReturnType<typeof undoVersionAction>>;
        try {
          u = await undoVersionAction(vid);
        } catch {
          u = { ok: false, error: "Couldn't undo. Try again." };
        }
        if (!u.ok) {
          pendingReset.current = false;
          toast({ message: u.error, icon: null });
        }
        setSaved(false);
        router.refresh();
      },
    });
    router.refresh();
  };

  const discard = () => {
    setValues(original);
    setErrors({});
    setCarErrors({});
    setFormError(null);
  };

  // ── Derived bits ────────────────────────────────────────────────────────
  const errorKeys = FORM_KEYS.filter((k) => errors[k]);
  const extraErrorKeys = Object.keys(errors).filter((k) => !(FORM_KEYS as string[]).includes(k));
  const nErrors = errorKeys.length + extraErrorKeys.length;
  const paid = values.plan !== "free";
  const adminExpanded = adminOpen || errorKeys.some((k) => SECTION_OF[k] === "admin");
  const slugMoved = edit && slugChanged(original, values);
  const showSaved = edit && saved && count === 0;
  const showBar = !edit || count > 0 || saving;

  const field = (k: FormKey) => ({ id: `field-${k}`, htmlFor: `f-${k}`, changed: ch(k), error: errors[k] });

  return (
    <div ref={rootRef} className="flex min-w-0 flex-col gap-6">
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,760px)] lg:items-start lg:gap-10">
        {/* Section index */}
        <nav aria-label="Form sections" className="sticky top-6 hidden flex-col gap-0.5 text-[15px]/[20px] font-medium text-quiet-text lg:flex">
          {SECTIONS.map((s) => {
            const on = active === s.key;
            const mark = edit && diff.sections.has(s.key);
            return (
              <a
                key={s.key}
                href={`#sec-${s.key}`}
                aria-current={on ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  goSection(s.key);
                }}
                className={cx(
                  "flex h-10 items-center gap-2 rounded-[10px] px-3 outline-none transition-colors hover:text-ink",
                  on && "bg-fill font-semibold text-ink",
                  s.key === "admin" && "gap-1.5",
                )}
              >
                {s.key === "admin" ? <Lock size={14} strokeWidth={1.75} className="flex-none" aria-hidden="true" /> : null}
                {s.label}
                {mark ? <span aria-label="Has unsaved changes" className="size-2 flex-none rounded-full bg-brand-700" /> : null}
              </a>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-col gap-3 lg:gap-6">
          {/* Notes at the top */}
          {showSaved ? (
            <Banner
              tone="success"
              layout="inline"
              title="Saved."
              actions={
                <Link href={`/admin/listings/${listingId}?tab=history`} className="text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline lg:px-1.5">
                  See it in History
                </Link>
              }
            >
              Live on the site within a minute.
            </Banner>
          ) : null}
          {nErrors > 0 ? (
            <div ref={summaryRef} className="scroll-mt-24">
              <Banner tone="error" layout="stacked" title={`${nErrors} ${nErrors === 1 ? "field needs" : "fields need"} fixing before saving:`}>
                {errorKeys.map((k, i) => (
                  <React.Fragment key={k}>
                    {i ? ", " : ""}
                    <button type="button" onClick={() => focusField(k)} className="font-medium text-brand-700 hover:text-brand-800 hover:underline">
                      {FIELD_NAME[k]}
                    </button>
                  </React.Fragment>
                ))}
                {extraErrorKeys.map((k, i) => (
                  <React.Fragment key={k}>
                    {i || errorKeys.length ? ", " : ""}
                    {errors[k]}
                  </React.Fragment>
                ))}
                .
              </Banner>
            </div>
          ) : formError ? (
            <div ref={summaryRef} className="scroll-mt-24">
              <Banner tone="error" title={edit ? "Couldn't save." : "Couldn't publish."}>
                {formError}
              </Banner>
            </div>
          ) : null}

          {/* Basics */}
          <Group id="basics" title="Basics" className="gap-4 lg:gap-5">
            <Field label="Listing name" {...field("name")}>
              <TextInput
                id="f-name"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={edit ? undefined : "e.g. Margalla Rent A Car"}
                changed={ch("name")}
                invalid={!!errors.name}
                autoComplete="off"
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="City" {...field("city")}>
                <CityPicker
                  id="f-city"
                  value={values.city || null}
                  onChange={(c) => update("city", c)}
                  changed={ch("city")}
                  invalid={!!errors.city}
                />
              </Field>
              <Field label="Area" {...field("area")}>
                <AreaInput
                  id="f-area"
                  value={values.area}
                  onChange={(a) => update("area", a)}
                  areas={areas[values.city] ?? []}
                  city={values.city || null}
                  changed={ch("area")}
                  invalid={!!errors.area}
                />
              </Field>
            </div>
          </Group>

          {/* Contact */}
          <Group id="contact" title="Contact" className="gap-4 lg:gap-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="WhatsApp number" {...field("whatsapp")}>
                <PhoneInput
                  id="f-whatsapp"
                  value={values.whatsapp}
                  onChange={(n, local) => update("whatsapp", n ?? local)}
                  changed={ch("whatsapp")}
                  invalid={!!errors.whatsapp}
                />
              </Field>
              <Field label="Phone number" {...field("phone")}>
                <PhoneInput
                  id="f-phone"
                  value={values.phone}
                  onChange={(n, local) => update("phone", n ?? local)}
                  placeholder="Same as WhatsApp"
                  changed={ch("phone")}
                  invalid={!!errors.phone}
                />
              </Field>
              <Field label="Second phone" optional {...field("phone2")}>
                <PhoneInput
                  id="f-phone2"
                  value={values.phone2}
                  onChange={(n, local) => update("phone2", n ?? local)}
                  placeholder={edit ? "Missing: adds to completeness" : undefined}
                  changed={ch("phone2")}
                  invalid={!!errors.phone2}
                />
              </Field>
              <Field label="Website" optional {...field("website")}>
                <TextInput
                  id="f-website"
                  value={values.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="e.g. margallarentacar.pk"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  changed={ch("website")}
                  invalid={!!errors.website}
                />
              </Field>
            </div>
          </Group>

          {/* About */}
          <Group id="about" title="About" mark={ch("about") ? "Changed" : null} className="gap-1.5" titleClassName="mb-1.5 lg:mb-3">
            <Field id="field-about" error={errors.about} hint="Two or three sentences: what you rent, where, and what makes you different.">
              <Textarea
                id="f-about"
                aria-label="About"
                value={values.about}
                onChange={(e) => update("about", e.target.value)}
                changed={ch("about")}
                invalid={!!errors.about}
                className="min-h-[120px]"
              />
            </Field>
          </Group>

          {/* Services */}
          <Group id="services" title="Services" mark={edit ? diff.services.summary : null} className="gap-3.5">
            <div id="field-services">
              <ServiceChips value={values.services} onChange={(s) => update("services", s)} />
            </div>
          </Group>

          {/* Cars and prices */}
          <Group id="cars" title="Cars and prices" mark={edit ? diff.cars.summary : null} className="gap-1" titleClassName="mb-2 lg:mb-3">
            <div id="field-cars" className="flex flex-col gap-2">
              {/* Design columns (price 180, driver 200) leave the car name room to breathe. */}
              <div className="hidden lg:block [&_.grid.gap-3]:[grid-template-columns:24px_minmax(0,1fr)_180px_200px_40px]">
                <CarsRepeater
                  value={values.cars}
                  onChange={(rows) => update("cars", rows)}
                  markers={edit ? diff.cars.markers : undefined}
                  errors={carErrors}
                />
              </div>
              <div className="lg:hidden">
                <MobileCars value={values.cars} onChange={(rows) => update("cars", rows)} markers={edit ? diff.cars.markers : undefined} errors={carErrors} />
              </div>
              {errors.cars ? <FieldError>{errors.cars}</FieldError> : null}
            </div>
          </Group>

          {/* Logo */}
          <Group id="logo" title="Logo" mark={edit ? diff.logo : null} className="gap-3.5">
            <div id="field-logo" className="flex flex-col gap-1.5">
              <LogoUpload value={values.logo} onChange={(d) => update("logo", d)} changed={ch("logo")} />
              {errors.logo ? <FieldError>{errors.logo}</FieldError> : null}
            </div>
          </Group>

          {/* Admin only */}
          <section id="sec-admin" data-section="admin" className="min-w-0 scroll-mt-[72px] lg:scroll-mt-6">
            {!adminExpanded ? (
              <button
                type="button"
                aria-expanded={false}
                onClick={() => setAdminOpen(true)}
                className="flex min-h-14 w-full items-center gap-2 rounded-card border border-line bg-white px-4 text-left text-[16px]/[22px] font-semibold text-ink active:bg-fill lg:hidden"
              >
                <Lock size={18} strokeWidth={1.75} className="flex-none text-quiet-text" aria-hidden="true" />
                Admin only
                {edit && diff.sections.has("admin") ? <span aria-label="Has unsaved changes" className="size-2 flex-none rounded-full bg-brand-700" /> : null}
                <span className="ml-auto truncate text-[13px]/[18px] font-medium text-muted">Plan, status, address…</span>
                <ChevronDown size={18} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" />
              </button>
            ) : null}
            <div
              className={cx(
                "flex flex-col gap-4 rounded-card border border-line bg-white p-4 lg:gap-5 lg:p-6 lg:shadow-card",
                !adminExpanded && "max-lg:hidden",
              )}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <Lock size={18} strokeWidth={1.75} className="flex-none text-quiet-text" aria-hidden="true" />
                <h3 className="text-card-title-m text-ink lg:text-card-title">Admin only</h3>
                <span className="text-[13px]/[18px] font-medium text-muted max-lg:order-last max-lg:w-full">Not shown on business forms</span>
                <button
                  type="button"
                  aria-label="Collapse Admin only"
                  onClick={() => setAdminOpen(false)}
                  className="-my-2 -mr-2 ml-auto grid size-10 place-items-center rounded-control text-muted active:bg-fill lg:hidden"
                >
                  <ChevronUp size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>

              <Field label="Google Maps link" {...field("mapsUrl")}>
                <TextInput
                  id="f-mapsUrl"
                  value={values.mapsUrl}
                  onChange={(e) => update("mapsUrl", e.target.value)}
                  placeholder="https://maps.app.goo.gl/…"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  changed={ch("mapsUrl")}
                  invalid={!!errors.mapsUrl}
                  inputClassName="text-ink-2"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <Field label="Google rating" {...field("googleRating")}>
                  <TextInput
                    id="f-googleRating"
                    icon={Star}
                    iconClassName="text-wait-text"
                    value={values.googleRating}
                    onChange={(e) => update("googleRating", e.target.value.replace(/[^\d.]/g, "").slice(0, 3))}
                    inputMode="decimal"
                    autoComplete="off"
                    inputClassName="num"
                    changed={ch("googleRating")}
                    invalid={!!errors.googleRating}
                  />
                </Field>
                <Field label="Review count" {...field("googleReviews")}>
                  <TextInput
                    id="f-googleReviews"
                    value={values.googleReviews}
                    onChange={(e) => update("googleReviews", e.target.value.replace(/[^\d]/g, "").slice(0, 8))}
                    inputMode="numeric"
                    autoComplete="off"
                    inputClassName="num"
                    changed={ch("googleReviews")}
                    invalid={!!errors.googleReviews}
                  />
                </Field>
              </div>

              <div id="field-verified">
                <ToggleRow
                  id="f-verified"
                  title={
                    <span className="inline-flex flex-wrap items-center gap-2">
                      Verified
                      {ch("verified") ? <ChangedMark text="Changed" /> : null}
                    </span>
                  }
                  description="Shows a Verified badge on the site"
                  checked={values.verified}
                  onChange={(v) => update("verified", v)}
                  className="border-y border-fill py-3 [&>button]:order-last"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <Field label="Plan" {...field("plan")} className="min-[400px]:col-span-2 lg:col-span-1">
                  <Select
                    id="f-plan"
                    value={values.plan}
                    onChange={(e) => setPlan(e.target.value as Plan)}
                    options={PLAN_OPTIONS}
                    changed={ch("plan")}
                  />
                </Field>
                {paid ? (
                  <>
                    <Field label="Starts" {...field("planStart")}>
                      <DateField
                        id="f-planStart"
                        value={values.planStart}
                        onChange={(d) => update("planStart", d)}
                        changed={ch("planStart")}
                        invalid={!!errors.planStart}
                      />
                    </Field>
                    <Field label="Ends" {...field("planEnd")}>
                      <DateField
                        id="f-planEnd"
                        value={values.planEnd}
                        onChange={(d) => update("planEnd", d)}
                        changed={ch("planEnd")}
                        invalid={!!errors.planEnd}
                      />
                    </Field>
                  </>
                ) : null}
              </div>

              <Field label="Status" {...field("status")} htmlFor={undefined}>
                <Segmented
                  size="lg"
                  aria-label="Status"
                  value={values.status}
                  onChange={(v) => update("status", v)}
                  options={[
                    { value: "live", label: "Live", dot: "#16A34A", activeClassName: "text-good-text" },
                    { value: "hidden", label: "Hidden" },
                  ]}
                  className={cx("self-start", ch("status") && "ring-1 ring-brand-200")}
                />
              </Field>

              <div className="flex flex-col gap-2.5">
                <Field label="Page address" {...field("slug")}>
                  <div
                    className={cx(
                      "flex h-12 w-full items-center overflow-hidden lg:h-11",
                      shellClasses({ changed: ch("slug"), invalid: !!errors.slug }),
                    )}
                  >
                    <span className="flex h-full flex-none items-center whitespace-nowrap border-r border-line bg-fill px-3 text-[13px]/[18px] text-quiet-text min-[400px]:text-[15px]/[22px]">
                      {SITE_HOST}/companies/
                    </span>
                    <input
                      id="f-slug"
                      value={values.slug}
                      onChange={(e) => update("slug", cleanSlug(e.target.value))}
                      placeholder={edit ? undefined : slugify(values.name) || "made-from-the-name"}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className={cx(innerInput, "px-3")}
                    />
                  </div>
                </Field>
                {slugMoved ? (
                  <Banner tone="warning">
                    The old address <b className="font-bold">{`${SITE_HOST}/companies/${original.slug}`}</b> will redirect to the new one, so existing links and
                    Google results keep working.
                  </Banner>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky action bar (above the tab bar on mobile) */}
      {showBar ? (
        <div className="sticky bottom-[calc(88px+env(safe-area-inset-bottom))] z-20 -mx-4 -mb-3 animate-sheet-up border-t border-line bg-white shadow-bar lg:bottom-0 lg:-mx-8 lg:-mb-8">
          <div className="flex flex-col gap-2 px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-8 lg:py-3.5">
            {edit ? (
              <div className="flex min-w-0 items-center gap-2 lg:flex-1 lg:gap-3">
                {saving ? (
                  <span className="num text-[15px]/[22px] font-semibold text-muted">Saving {plural(count, "change")}…</span>
                ) : (
                  <>
                    <span aria-hidden="true" className="size-2 flex-none rounded-full bg-brand-700 lg:size-2.5" />
                    <span className="num flex-none text-[15px]/[22px] font-semibold text-ink">{plural(count, "unsaved change")}</span>
                    <span className="hidden min-w-0 truncate text-[13px]/[18px] font-medium text-muted lg:block">{diff.items.join(" · ")}</span>
                  </>
                )}
              </div>
            ) : (
              <p className="text-[13px]/[18px] font-medium text-muted lg:flex-1 lg:text-[15px]/[22px]">
                New listings start on Free and Live. You can change both under Admin only.
              </p>
            )}
            <div className="flex gap-2 lg:ml-auto lg:flex-none">
              {edit ? (
                <>
                  <Button variant="secondary" onClick={discard} disabled={saving}>
                    Discard
                  </Button>
                  <Button variant="success" onClick={save} loading={saving} loadingText="Updating…" className="flex-1 lg:flex-none lg:px-[18px]">
                    Update listing
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => router.push("/admin/listings")} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="success" onClick={save} loading={saving} loadingText="Publishing…" className="flex-1 lg:flex-none lg:px-[18px]">
                    Publish listing
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
