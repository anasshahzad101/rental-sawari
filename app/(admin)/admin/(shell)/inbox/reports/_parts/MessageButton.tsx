"use client";

import * as React from "react";
import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { WhatsAppIcon, type IconProps } from "@/components/admin/ui/icons";
import { Sheet } from "@/components/admin/ui/Modal";
import { Popover } from "@/components/admin/ui/Popover";
import { WhatsAppPreview } from "@/components/admin/ui/WhatsAppPreview";

/** The WhatsApp glyph in #1FAE54, for secondary buttons ("Tell the reporter"). */
function GreenWhatsApp(p: IconProps) {
  return <WhatsAppIcon {...p} className={cx(p.className, "text-whatsapp-hover")} />;
}

export interface MessageButtonProps {
  label: React.ReactNode;
  /** Preview title ("Someone reported a problem"). */
  title: React.ReactNode;
  toName?: React.ReactNode;
  toNumber: string;
  message: string;
  /** whatsapp (green) or secondary with a green glyph. */
  variant?: Extract<ButtonVariant, "whatsapp" | "secondary">;
  /** Desktop: popover anchored to the button. Mobile: full-width 48 px button + bottom sheet. */
  layout: "desktop" | "mobile";
  className?: string;
}

/** A button that opens a pre-filled WhatsApp message (Open in WhatsApp / Copy message). Nothing is sent from the admin. */
export function MessageButton({ label, title, toName, toNumber, message, variant = "whatsapp", layout, className }: MessageButtonProps) {
  const [open, setOpen] = useState(false);
  const icon = variant === "whatsapp" ? undefined : GreenWhatsApp;
  const preview = <WhatsAppPreview title={title} toName={toName} toNumber={toNumber} message={message} />;

  if (layout === "mobile") {
    return (
      <>
        <Button variant={variant} icon={icon} fullWidth onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className={className}>
          {label}
        </Button>
        <Sheet open={open} onClose={() => setOpen(false)} aria-label={typeof title === "string" ? title : "WhatsApp message"}>
          <div className="pb-2">{preview}</div>
        </Sheet>
      </>
    );
  }
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      aria-label={typeof title === "string" ? title : "WhatsApp message"}
      className="w-[520px] max-w-[calc(100vw-32px)] p-5"
      trigger={
        <Button variant={variant} icon={icon} className={cx("px-4", variant === "secondary" && "px-3.5", className)}>
          {label}
        </Button>
      }
    >
      {preview}
    </Popover>
  );
}
