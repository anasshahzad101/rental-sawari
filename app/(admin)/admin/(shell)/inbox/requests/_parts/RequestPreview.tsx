"use client";

import * as React from "react";
import { useState } from "react";
import { MapPin, Pencil } from "lucide-react";
import { isSiteCity } from "@/lib/admin/constants";
import { fmtPhone, fmtPKRDay, normalizePhone, samePhone } from "@/lib/admin/format";
import type { CarRow, ListingRequestPayload } from "@/lib/admin/types";
import { AreaInput } from "@/components/admin/ui/AreaInput";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Button } from "@/components/admin/ui/Button";
import { CarsRepeater } from "@/components/admin/ui/CarsRepeater";
import { CityPicker } from "@/components/admin/ui/CityPicker";
import { cx } from "@/components/admin/ui/cx";
import { Field, FieldError, PhoneInput, TextInput, Textarea } from "@/components/admin/ui/Field";
import { LogoUpload } from "@/components/admin/ui/LogoUpload";
import { ServiceChips } from "@/components/admin/ui/ServiceChips";
import { PlanBadge } from "@/components/admin/ui/StatusPill";
import { bareUrl } from "./text";

type Block = "identity" | "services" | "cars" | "about" | "contact";

const LABEL: Record<Block, string> = {
  identity: "Name, city and logo",
  services: "Services",
  cars: "Cars and prices",
  about: "About",
  contact: "Contact",
};

export type FixResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export interface RequestPreviewProps {
  payload: ListingRequestPayload;
  /** Show the pencils (only while the request is New). */
  editable: boolean;
  areasByCity: Record<string, string[]>;
  onFix: (partial: Partial<ListingRequestPayload>) => Promise<FixResult | null>;
}

/**
 * "How it will look": the request as a listing preview. Each block has a
 * pencil; Fix turns the block teal-50 with the Edit-tab controls and
 * Cancel / Done. Fixes are saved on the request, not on the site.
 */
export function RequestPreview({ payload: p, editable, areasByCity, onFix }: RequestPreviewProps) {
  const [editing, setEditing] = useState<Block | null>(null);
  const city = p.city || p.cityOther;
  const place = [city, p.area].filter(Boolean).join(" · ");

  const fixBtn = (b: Block, mobileSize = 16) =>
    editable && !editing ? (
      <button
        type="button"
        aria-label={`Fix ${LABEL[b].toLowerCase()}`}
        title="Fix"
        onClick={() => setEditing(b)}
        className="-m-1.5 grid size-8 flex-none place-items-center rounded-lg text-brand-700 outline-none transition-colors hover:bg-brand-50 focus-visible:shadow-focus lg:-my-1.5"
      >
        <Pencil size={mobileSize} strokeWidth={1.75} className="lg:size-4" aria-hidden="true" />
      </button>
    ) : null;

  const editor = (b: Block) => <BlockEditor block={b} payload={p} areasByCity={areasByCity} onFix={onFix} onClose={() => setEditing(null)} />;

  const phoneLine = [
    p.phone && !samePhone(p.phone, p.whatsapp) ? `Phone ${fmtPhone(p.phone)}` : "No separate phone",
    p.website ? bareUrl(p.website) : "no website",
  ].join(" · ");

  return (
    <div className="rounded-card border border-line bg-white">
      {/* Identity */}
      {editing === "identity" ? (
        editor("identity")
      ) : (
        <div className="flex items-center gap-3 border-b border-fill px-4 py-3.5 lg:gap-3.5 lg:px-5 lg:py-[18px]">
          <Avatar name={p.name} logoUrl={p.logoUrl} size={56} className="max-lg:size-11 max-lg:rounded-control max-lg:text-[16px]" />
          <div className="flex min-w-0 flex-1 flex-col lg:gap-1">
            <span className="text-[16px]/[22px] font-bold text-ink lg:text-[20px]/[26px] lg:font-extrabold">{p.name || "No name"}</span>
            <span className="flex flex-wrap items-center gap-2 text-[13px]/[18px] font-medium text-muted">
              <MapPin size={14} strokeWidth={1.75} className="hidden flex-none lg:block" aria-hidden="true" />
              <span className="min-w-0">{place || "No city or area"}</span>
              <PlanBadge plan="free" size="sm" className="hidden lg:inline-flex" />
            </span>
          </div>
          {editable && !editing ? (
            <>
              <span className="lg:hidden">{fixBtn("identity", 18)}</span>
              <button
                type="button"
                onClick={() => setEditing("identity")}
                className="hidden h-9 flex-none items-center gap-1.5 rounded-[10px] px-2.5 text-[14px]/[20px] font-semibold text-brand-700 outline-none transition-colors hover:bg-brand-50 focus-visible:shadow-focus lg:inline-flex"
              >
                <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
                Fix
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* Services */}
      {editing === "services" ? (
        editor("services")
      ) : (
        <Row label="Services" fix={fixBtn("services")}>
          {p.services.length ? (
            <div className="flex flex-wrap gap-1.5">
              {p.services.map((s) => (
                <span key={s} className="inline-flex h-7 items-center rounded-full bg-fill px-2.5 text-[13px]/[18px] font-medium text-ink">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <Empty>No services picked</Empty>
          )}
        </Row>
      )}

      {/* Cars and prices */}
      {editing === "cars" ? (
        editor("cars")
      ) : (
        <Row label="Cars and prices" fix={fixBtn("cars")}>
          {p.cars.length ? (
            <div className="num flex flex-col gap-0 text-[15px]/[24px] font-medium text-ink lg:gap-1.5 lg:text-[15px]/[22px]">
              {p.cars.map((c, i) => (
                <div key={`${c.name}-${i}`} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    {c.name}{" "}
                    <span className="text-[13px] text-muted">· {c.mode === "self" ? "Self-drive" : "With driver"}</span>
                  </span>
                  <b className="flex-none font-bold">{fmtPKRDay(c.pricePerDay)}</b>
                </div>
              ))}
            </div>
          ) : (
            <Empty>No cars added</Empty>
          )}
        </Row>
      )}

      {/* About */}
      {editing === "about" ? (
        editor("about")
      ) : (
        <Row label="About" fix={fixBtn("about")}>
          {p.about ? (
            <p className="whitespace-pre-line text-[16px]/[24px] text-ink [text-wrap:pretty] lg:text-[15px]/[24px]">{p.about}</p>
          ) : (
            <Empty>No about text</Empty>
          )}
        </Row>
      )}

      {/* Contact */}
      {editing === "contact" ? (
        editor("contact")
      ) : (
        <Row label="Contact" fix={fixBtn("contact")} className="max-lg:border-b-0">
          <div className="num flex flex-col gap-0.5 text-[15px]/[22px] font-medium text-ink">
            <span>WhatsApp {p.whatsapp ? fmtPhone(p.whatsapp) : "—"}</span>
            <span className="text-[13px]/[18px] text-muted">{phoneLine}</span>
          </div>
        </Row>
      )}

      {/* Also sent (desktop row; mobile shows it as a line under the card) */}
      <div className="hidden border-fill px-5 py-3.5 lg:grid lg:grid-cols-[140px_minmax(0,1fr)_auto] lg:items-start lg:gap-4">
        <span className="text-[13px]/[20px] font-semibold text-ink-2">Also sent</span>
        <span className="num text-[15px]/[22px] font-medium text-ink-2">{alsoSent(p)}</span>
        <span />
      </div>
    </div>
  );
}

/** "Owner Usman Tariq · fleet of 12 cars · no logo · no address" */
export function alsoSent(p: ListingRequestPayload): string {
  return [
    p.ownerName ? `Owner ${p.ownerName}` : null,
    p.fleetSize ? `fleet of ${p.fleetSize} ${p.fleetSize === 1 ? "car" : "cars"}` : "fleet size not given",
    p.logoUrl ? "logo sent" : "no logo",
    p.address ? `address: ${p.address}` : "no address",
  ]
    .filter(Boolean)
    .join(" · ");
}

function Row({ label, fix, children, className }: { label: string; fix: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("border-b border-fill px-4 py-3 lg:grid lg:grid-cols-[140px_minmax(0,1fr)_auto] lg:items-start lg:gap-4 lg:px-5 lg:py-3.5", className)}>
      <div className="mb-2 flex min-h-[18px] items-center justify-between gap-2 lg:mb-0 lg:block">
        <span className="text-[13px]/[18px] font-semibold text-ink-2 lg:text-[13px]/[20px]">{label}</span>
        <span className="lg:hidden">{fix}</span>
      </div>
      <div className="min-w-0">{children}</div>
      <span className="hidden lg:block">{fix ?? <span className="block w-4" />}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-[15px]/[22px] font-medium text-muted">{children}</span>;
}

// ── Inline fix ───────────────────────────────────────────────────────────

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface Draft {
  name: string;
  city: string;
  area: string;
  logoUrl: string | null;
  services: string[];
  cars: CarRow[];
  about: string;
  whatsapp: string | null;
  whatsappLocal: string;
  phone: string | null;
  phoneLocal: string;
  website: string;
}

function BlockEditor({
  block,
  payload: p,
  areasByCity,
  onFix,
  onClose,
}: {
  block: Block;
  payload: ListingRequestPayload;
  areasByCity: Record<string, string[]>;
  onFix: RequestPreviewProps["onFix"];
  onClose: () => void;
}) {
  const [d, setD] = useState<Draft>(() => ({
    name: p.name,
    city: isSiteCity(p.city) ? p.city : "",
    area: p.area,
    logoUrl: p.logoUrl,
    services: p.services,
    cars: p.cars,
    about: p.about,
    whatsapp: p.whatsapp || null,
    whatsappLocal: p.whatsapp ? "x" : "",
    phone: p.phone || null,
    phoneLocal: p.phone ? "x" : "",
    website: p.website,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const done = async () => {
    const partial: Partial<ListingRequestPayload> = {};
    const errs: Record<string, string> = {};
    if (block === "identity") {
      if (!d.name.trim()) errs.name = "Enter the business name";
      if (d.name !== p.name) partial.name = d.name;
      if (d.city && d.city !== p.city) partial.city = d.city;
      if (d.area !== p.area) partial.area = d.area;
      if (d.logoUrl !== p.logoUrl) partial.logoUrl = d.logoUrl;
    } else if (block === "services") {
      if (!sameJson(d.services, p.services)) partial.services = d.services;
    } else if (block === "cars") {
      const cars = d.cars.filter((c) => c.name.trim() || c.pricePerDay);
      if (cars.some((c) => !c.name.trim())) errs.cars = "Give every car a name, or remove the row";
      else if (cars.some((c) => !c.pricePerDay)) errs.cars = "Add a price per day for every car";
      if (!sameJson(cars, p.cars)) partial.cars = cars;
    } else if (block === "about") {
      if (d.about !== p.about) partial.about = d.about;
    } else if (block === "contact") {
      if (!d.whatsapp) errs.whatsapp = "Enter a WhatsApp number like +92 300 1234567";
      else if (!samePhone(d.whatsapp, p.whatsapp)) partial.whatsapp = d.whatsapp;
      if (d.phoneLocal && !d.phone) errs.phone = "Enter a phone number like +92 51 2345678";
      else if ((d.phone ?? "") !== (normalizePhone(p.phone) ?? "")) partial.phone = d.phone ?? "";
      if (d.website.trim() !== p.website) partial.website = d.website.trim();
    }
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    if (!Object.keys(partial).length) {
      onClose();
      return;
    }
    setSaving(true);
    const r = await onFix(partial);
    setSaving(false);
    if (r?.ok) onClose();
    else if (r && !r.ok) {
      if (r.fieldErrors) setErrors(r.fieldErrors);
      setFormError(r.fieldErrors ? null : r.error);
    }
  };

  return (
    <div
      className={cx(
        "flex flex-col gap-2.5 border-b border-fill bg-brand-50 px-4 py-4 lg:px-5",
        block === "identity" && "rounded-t-[15px]",
        block === "contact" && "max-lg:rounded-b-[15px] max-lg:border-b-0",
      )}
    >
      <div className="flex items-center gap-2 text-[13px]/[18px] font-semibold text-ink-2">
        {LABEL[block]}
        <span aria-hidden="true" className="size-2 rounded-full bg-brand-700" />
        <span className="font-medium text-brand-700">Editing</span>
      </div>

      {block === "identity" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Business name" error={errors.name} className="lg:col-span-2">
            <TextInput value={d.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} autoFocus />
          </Field>
          <Field
            label="City"
            hint={!isSiteCity(p.city) && p.cityOther ? `They typed "${p.cityOther}"` : undefined}
            error={errors.city}
          >
            <CityPicker value={d.city || null} onChange={(c) => set("city", c)} aria-label="City" />
          </Field>
          <Field label="Area" error={errors.area}>
            <AreaInput value={d.area} onChange={(v) => set("area", v)} areas={areasByCity[d.city] ?? []} city={d.city || null} />
          </Field>
          <Field label="Logo" optional error={errors.logoUrl ?? errors.logo} className="lg:col-span-2">
            <LogoUpload value={d.logoUrl} onChange={(v) => set("logoUrl", v)} />
          </Field>
        </div>
      ) : null}

      {block === "services" ? <ServiceChips value={d.services} onChange={(v) => set("services", v)} /> : null}

      {block === "cars" ? (
        <div className="flex flex-col gap-1.5">
          <CarsRepeater value={d.cars} onChange={(v) => set("cars", v)} />
          {errors.cars ? <FieldError>{errors.cars}</FieldError> : null}
        </div>
      ) : null}

      {block === "about" ? (
        <Textarea value={d.about} onChange={(e) => set("about", e.target.value)} aria-label="About" autoFocus />
      ) : null}

      {block === "contact" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="WhatsApp" error={errors.whatsapp}>
            <PhoneInput
              value={d.whatsapp}
              onChange={(v, local) => setD((x) => ({ ...x, whatsapp: v, whatsappLocal: local }))}
              invalid={!!errors.whatsapp}
            />
          </Field>
          <Field label="Phone" optional error={errors.phone}>
            <PhoneInput value={d.phone} onChange={(v, local) => setD((x) => ({ ...x, phone: v, phoneLocal: local }))} invalid={!!errors.phone} />
          </Field>
          <Field label="Website" optional error={errors.website} className="lg:col-span-2">
            <TextInput value={d.website} onChange={(e) => set("website", e.target.value)} placeholder="e.g. ravirentacar.pk" inputMode="url" />
          </Field>
        </div>
      ) : null}

      {formError ? <FieldError>{formError}</FieldError> : null}

      <div className="flex justify-end gap-2 max-lg:[&>*]:flex-1">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={done} loading={saving} loadingText="Saving…">
          Done
        </Button>
      </div>
    </div>
  );
}

/** Mobile line under the preview card. */
export function AlsoSentLine({ payload, className }: { payload: ListingRequestPayload; className?: string }) {
  return <p className={cx("num text-[13px]/[18px] font-medium text-muted lg:hidden", className)}>{alsoSent(payload)}</p>;
}
