"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fmtPhone, waLink } from "@/lib/admin/format";
import { Button } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { Sheet } from "@/components/admin/ui/Modal";
import { Popover } from "@/components/admin/ui/Popover";
import { CopyButton } from "@/components/admin/ui/WhatsAppPreview";
import type { Template } from "./text";

export interface ApplicantWhatsAppProps {
  toName: string;
  toNumber: string;
  templates: Template[];
  defaultKey: Template["key"];
  /** Desktop: 40 px button in the header with a 420 px menu. Mobile: full-width 48 px button + sheet. */
  variant: "desktop" | "mobile";
}

/** "WhatsApp the applicant ▾": pick a template, then Open in WhatsApp / Copy message. Nothing is sent from here. */
export function ApplicantWhatsApp({ toName, toNumber, templates, defaultKey, variant }: ApplicantWhatsAppProps) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<Template["key"]>(defaultKey);
  const current = templates.find((t) => t.key === key) ?? templates[0];
  const to = `To ${toName ? `${toName} · ` : ""}${fmtPhone(toNumber)}`;

  const body = (big: boolean) => (
    <div className="flex flex-col">
      <div className="num px-2.5 pb-1 pt-2 text-overline uppercase text-muted">{to}</div>
      <div role="radiogroup" aria-label="Message" className="flex flex-col gap-0.5">
        {templates.map((t) => {
          const on = t.key === key;
          return (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setKey(t.key)}
              className={cx(
                "flex flex-col gap-0.5 rounded-[10px] p-2.5 text-left outline-none transition-colors focus-visible:shadow-focus",
                on ? "bg-fill" : "hover:bg-page",
              )}
            >
              <span className={cx("font-semibold text-ink", big ? "text-[16px]/[24px]" : "text-[15px]/[22px]")}>{t.title}</span>
              <span className="text-[13px]/[18px] text-quiet-text [text-wrap:pretty]">{t.hint && !on ? t.hint : t.message}</span>
            </button>
          );
        })}
      </div>
      <div className={cx("mt-1 flex gap-2 border-t border-fill px-1.5 pb-1 pt-2", big && "flex-col")}>
        <Button variant="whatsapp" href={waLink(toNumber, current.message)} target="_blank" fullWidth className={big ? undefined : "flex-1"}>
          Open in WhatsApp
        </Button>
        <CopyButton text={current.message} fullWidth={big} />
      </div>
    </div>
  );

  if (variant === "mobile") {
    return (
      <>
        <Button variant="whatsapp" fullWidth iconRight={ChevronDown} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
          WhatsApp the applicant
        </Button>
        <Sheet open={open} onClose={() => setOpen(false)} title="WhatsApp the applicant">
          {body(true)}
        </Sheet>
      </>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      aria-label="WhatsApp the applicant"
      className="w-[420px] max-w-[calc(100vw-32px)] rounded-[14px]"
      trigger={
        <Button variant="whatsapp" iconRight={open ? ChevronUp : ChevronDown} className="pl-3.5 pr-3">
          WhatsApp the applicant
        </Button>
      }
    >
      {body(false)}
    </Popover>
  );
}
