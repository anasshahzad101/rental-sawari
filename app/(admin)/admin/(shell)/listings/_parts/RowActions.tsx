"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { ArrowUpRight, Ellipsis, Eye, EyeOff, Link2 } from "lucide-react";
import { IconButton } from "@/components/admin/ui/Button";
import { Banner } from "@/components/admin/ui/Banner";
import { Button } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { WhatsAppIcon, type IconProps } from "@/components/admin/ui/icons";
import { Modal } from "@/components/admin/ui/Modal";
import { Menu, type MenuEntry } from "@/components/admin/ui/Popover";
import { Skeleton } from "@/components/admin/ui/Skeleton";
import { WhatsAppPreview } from "@/components/admin/ui/WhatsAppPreview";
import { salesMessageAction } from "./actions";
import type { LRow } from "./model";

/** WhatsApp glyph in #1FAE54 for the menu row (MenuList greys icons by default). */
function GreenWhatsApp(p: IconProps) {
  return <WhatsAppIcon {...p} className={cx(p.className, "text-whatsapp-hover")} />;
}

export interface RowMenuProps {
  row: LRow;
  onView: (r: LRow) => void;
  onCopy: (r: LRow) => void;
  onSales: (r: LRow) => void;
  onHide: (r: LRow) => void;
  onShow: (r: LRow) => void;
}

/**
 * The 36 px ⋯ button at the end of the listing cell, shown on row hover:
 * View on site ↗ · Copy page link · Sales message (Free only) · Hide listing…
 */
export function RowMenu({ row, onView, onCopy, onSales, onHide, onShow }: RowMenuProps) {
  const free = row.plan === "free";
  const items: MenuEntry[] = [
    { key: "view", label: "View on site", icon: ArrowUpRight, onSelect: () => onView(row) },
    { key: "copy", label: "Copy page link", icon: Link2, onSelect: () => onCopy(row) },
    {
      key: "sales",
      label: "Sales message",
      icon: free ? GreenWhatsApp : WhatsAppIcon,
      hint: "Free only",
      disabled: !free,
      onSelect: () => onSales(row),
    },
    { key: "d", divider: true },
    row.hidden
      ? { key: "show", label: "Show on the site again", icon: Eye, onSelect: () => onShow(row) }
      : { key: "hide", label: "Hide listing…", icon: EyeOff, tone: "danger", onSelect: () => onHide(row) },
  ];
  return (
    <span className="ml-auto flex-none" onClick={(e) => e.stopPropagation()}>
      <Menu
        width={260}
        align="end"
        items={items}
        trigger={
          <IconButton
            icon={Ellipsis}
            iconSize={18}
            label={`More for ${row.name}`}
            variant="secondary"
            size="sm"
            className="invisible rounded-[10px] group-hover:visible group-focus-within:visible aria-expanded:visible"
          />
        }
      />
    </span>
  );
}

type SalesState = { status: "loading" } | { status: "ok"; text: string; name: string; whatsapp: string } | { status: "error"; error: string };

/** "Sales message" dialog: the listing's last 30 days as a pre-filled WhatsApp pitch for Featured City. */
export function SalesDialog({ row, onClose }: { row: LRow | null; onClose: () => void }) {
  const [state, setState] = useState<SalesState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const id = row?.id ?? null;

  useEffect(() => {
    if (id == null) return;
    let alive = true;
    setState({ status: "loading" });
    salesMessageAction(id)
      .then((r) => {
        if (!alive) return;
        setState(r.ok ? { status: "ok", text: r.text, name: r.name, whatsapp: r.whatsapp } : { status: "error", error: r.error });
      })
      .catch(() => alive && setState({ status: "error", error: "Couldn't build the message." }));
    return () => {
      alive = false;
    };
  }, [id, attempt]);

  return (
    <Modal open={!!row} onClose={onClose} title="Sales message" size="lg">
      {state.status === "loading" ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading the message">
          <Skeleton shimmer={false} className="h-3.5 w-56 rounded-md" />
          <Skeleton className="h-32 rounded-[14px]" />
          <div className="flex gap-2">
            <Skeleton shimmer={false} className="h-10 w-44 rounded-control" />
            <Skeleton shimmer={false} className="h-10 w-36 rounded-control" />
          </div>
        </div>
      ) : state.status === "error" ? (
        <Banner
          tone="error"
          title="Couldn't build the message."
          actions={
            <Button variant="secondary" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </Button>
          }
        >
          {state.error}
        </Banner>
      ) : (
        <WhatsAppPreview toName={state.name} toNumber={state.whatsapp} message={state.text} />
      )}
    </Modal>
  );
}
