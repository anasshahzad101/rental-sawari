"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { fmtPhone, waLink } from "@/lib/admin/format";
import { Button, type ButtonSize } from "./Button";
import { cx } from "./cx";
import { WhatsAppIcon } from "./icons";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the textarea fallback
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export interface CopyButtonProps {
  text: string;
  label?: React.ReactNode;
  copiedLabel?: React.ReactNode;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  onCopied?: () => void;
}

/** Secondary "Copy message" that turns green "Copied" with a check for 2 s. */
export function CopyButton({ text, label = "Copy message", copiedLabel = "Copied", size = "md", fullWidth, className, onCopied }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Button
      variant={copied ? "soft-green" : "secondary"}
      size={size}
      icon={copied ? Check : Copy}
      fullWidth={fullWidth}
      className={cx(copied && "px-3.5", className)}
      aria-live="polite"
      onClick={async () => {
        const ok = await copyText(text);
        if (!ok) return;
        setCopied(true);
        onCopied?.();
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

export interface WhatsAppPreviewProps {
  title?: React.ReactNode;
  /** "To {toName} · {number}" line. */
  toName?: React.ReactNode;
  toNumber: string;
  /** Replace the whole "To …" line ("To the number on the listing · +92 300 1234567"). */
  toLabel?: React.ReactNode;
  message: string;
  /** More buttons after Open / Copy (e.g. "Call instead"). */
  extraActions?: React.ReactNode;
  /** Small muted line under the buttons. */
  hint?: React.ReactNode;
  className?: string;
}

/**
 * A pre-filled WhatsApp message: green speech bubble, **Open in WhatsApp**
 * (wa.me link, new tab) and **Copy message**. Nothing is sent from the admin.
 */
export function WhatsAppPreview({ title, toName, toNumber, toLabel, message, extraActions, hint, className }: WhatsAppPreviewProps) {
  const to = toLabel ?? (
    <>
      To {toName ? <>{toName} · </> : null}
      {fmtPhone(toNumber)}
    </>
  );
  return (
    <div className={cx("flex min-w-0 flex-col", className)}>
      {title ? <div className="text-card-title-m text-ink lg:text-card-title">{title}</div> : null}
      <div className="num flex items-center gap-1.5 text-[13px]/[18px] font-medium text-muted">
        <WhatsAppIcon size={14} className="text-whatsapp" />
        <span className="min-w-0">{to}</span>
      </div>
      <div className="mt-3 lg:mt-4 lg:flex lg:justify-end lg:rounded-control lg:bg-fill lg:p-4">
        <div className="relative rounded-[14px_14px_4px_14px] border border-good-border bg-good-fill px-3.5 py-3 text-[16px]/[24px] text-ink [text-wrap:pretty] lg:max-w-[420px] lg:pb-[22px] lg:text-[15px]/[24px]">
          <span className="whitespace-pre-wrap">{message}</span>
          <span className="absolute bottom-1 right-2.5 hidden text-[12px]/[16px] font-medium text-muted lg:inline">Pre-filled</span>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 lg:mt-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Button variant="whatsapp" href={waLink(toNumber, message)} target="_blank" fullWidth className="lg:w-auto lg:px-4">
          Open in WhatsApp
        </Button>
        <CopyButton text={message} fullWidth className="lg:w-auto" />
        {extraActions}
      </div>
      {hint ? <div className="mt-2.5 text-[13px]/[18px] font-medium text-muted">{hint}</div> : null}
    </div>
  );
}
