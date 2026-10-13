"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Mail, MapPin, Phone, RotateCcw, Trash2 } from "lucide-react";
import { fmtPhone } from "@/lib/admin/format";
import type { MessageKind, MessageStatus } from "@/lib/admin/types";
import { deleteMessageAction, setMessageDoneAction } from "@/app/(admin)/admin/_actions/inbox";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Button } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";
import { InboxDetailFooter, InboxDetailFrame, MobileActionBar } from "../../_shared/layout";
import type { InboxView } from "@/components/admin/shell";
import { inboxHref } from "../../_shared/params";
import { useInboxAction } from "../../_shared/useInboxAction";
import { MessageButton } from "../../reports/_parts/MessageButton";
import { contactReplyMessage, forwardToBusinessMessage, inquiryReplyMessage } from "./text";

export interface MessageListing {
  id: number;
  name: string;
  city: string;
  area: string;
  whatsapp: string;
  logoUrl: string | null;
  status: "live" | "hidden";
}

export interface MessageDetailProps {
  id: number;
  kind: MessageKind;
  status: MessageStatus;
  name: string;
  /** "+92…" when the number is a valid Pakistani one, else null. */
  whatsapp: string | null;
  /** As typed, shown when it isn't a valid number. */
  phoneText: string | null;
  email: string | null;
  subject: string | null;
  body: string | null;
  details: Array<{ label: string; value: string }>;
  listingName: string;
  listing: MessageListing | null;
  /** fmtWhen(createdAt) */
  sentText: string;
  /** "Rent a car Islamabad" style name of the page it came from. */
  pageText: string | null;
  doneText: string | null;
  emailed: boolean;
  view: InboxView;
}

/** The right-hand detail of a contact message or inquiry (full screen on mobile). */
export function MessageDetail(p: MessageDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { run, pending, busy } = useInboxAction();
  const [deleting, setDeleting] = useState(false);
  const open = p.status === "new";
  const inquiry = p.kind === "inquiry";
  const title = inquiry ? "Rental inquiry" : p.subject || "Contact message";
  const shownPhone = p.whatsapp ? fmtPhone(p.whatsapp) : p.phoneText;

  // ── Actions ────────────────────────────────────────────────────────────
  const backToNew = async () => {
    const u = await setMessageDoneAction(p.id, false);
    if (u.ok) {
      router.replace(inboxHref("messages", { id: p.id }), { scroll: false });
      router.refresh();
    } else toast({ message: u.error });
  };

  const markDone = () =>
    run("done", () => setMessageDoneAction(p.id, true), {
      toast: () => ({ message: "Marked done", undo: backToNew }),
      go: () => inboxHref("messages", { view: "done", id: p.id }),
    });

  const reopen = () =>
    run("reopen", () => setMessageDoneAction(p.id, false), { toast: () => "Moved back to New", go: () => inboxHref("messages", { id: p.id }) });

  const remove = async () => {
    const r = await run("delete", () => deleteMessageAction(p.id), {
      toast: () => "Message deleted",
      go: () => inboxHref("messages", { view: p.view }),
    });
    if (!r?.ok) throw new Error("delete failed"); // keeps the dialog open
  };

  // ── Pieces ─────────────────────────────────────────────────────────────
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Name", value: p.name || "Not given" },
    ...(shownPhone ? [{ label: "Phone", value: <span className="num">{shownPhone}</span> }] : []),
    ...(p.email
      ? [
          {
            label: "Email",
            value: (
              <a href={`mailto:${p.email}`} className="font-semibold text-brand-700 hover:underline [overflow-wrap:anywhere]">
                {p.email}
              </a>
            ),
          },
        ]
      : []),
    ...(inquiry && p.subject ? [{ label: "Subject", value: p.subject }] : []),
    ...p.details.map((d) => ({ label: d.label, value: d.value })),
  ];

  const replies = (layout: "desktop" | "mobile") => (
    <>
      {p.whatsapp ? (
        <MessageButton
          layout={layout}
          label={`WhatsApp ${p.name ? p.name.split(/\s+/)[0] : "them"}`}
          title={inquiry ? "Reply to the customer" : "Reply on WhatsApp"}
          toName={p.name || undefined}
          toNumber={p.whatsapp}
          message={inquiry ? inquiryReplyMessage(p.name, p.listingName) : contactReplyMessage(p.name)}
        />
      ) : null}
      {inquiry && p.listing ? (
        <MessageButton
          layout={layout}
          variant="secondary"
          label="Forward to company"
          title="Forward the inquiry"
          toName={p.listing.name}
          toNumber={p.listing.whatsapp}
          message={forwardToBusinessMessage({ listingName: p.listing.name, name: p.name, phone: shownPhone, details: p.details, body: p.body })}
        />
      ) : null}
      {p.whatsapp ? (
        <Button variant="secondary" icon={Phone} href={`tel:${p.whatsapp}`} fullWidth={layout === "mobile"} className={layout === "desktop" ? "px-3.5" : undefined}>
          Call
        </Button>
      ) : null}
      {p.email ? (
        <Button
          variant="secondary"
          icon={Mail}
          href={`mailto:${p.email}?subject=${encodeURIComponent(`Re: ${p.subject || "your message to RentalSawari"}`)}`}
          fullWidth={layout === "mobile"}
          className={layout === "desktop" ? "px-3.5" : undefined}
        >
          Reply by email
        </Button>
      ) : null}
    </>
  );

  const hasReplies = !!(p.whatsapp || p.email || (inquiry && p.listing));

  const deleteButton = (mobile: boolean) => (
    <Button
      variant="ghost"
      icon={Trash2}
      onClick={() => setDeleting(true)}
      disabled={busy}
      className={cx("text-quiet-text", mobile ? "px-4" : "px-3.5")}
    >
      Delete
    </Button>
  );

  return (
    <InboxDetailFrame aria-label={title}>
      {/* Header */}
      <div className="flex flex-col gap-3 lg:gap-2.5 lg:border-b lg:border-fill lg:p-6">
        <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-2.5">
          <h2 className="min-w-0 text-page-title-m text-ink [overflow-wrap:anywhere] lg:text-dialog-title">{title}</h2>
        </div>
        <div className="text-[13px]/[18px] font-medium text-muted">
          {inquiry ? <>For {p.listingName || "a listing"} · </> : <>Contact form · </>}
          sent {p.sentText}
          {p.pageText && !inquiry ? <> from {p.pageText}</> : null}
        </div>

        {!open ? (
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex flex-1 gap-2.5 rounded-control bg-fill px-4 py-3 text-[16px]/[24px] font-medium text-ink-2 lg:text-[15px]/[22px]">
              <Check size={20} strokeWidth={1.75} className="mt-0.5 flex-none text-quiet-text lg:mt-px" aria-hidden="true" />
              <span>Marked done by you, {p.doneText}.</span>
            </div>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={reopen}
              loading={pending === "reopen"}
              loadingText="Reopening…"
              className="text-brand-700 hover:text-brand-800 max-lg:border max-lg:border-line lg:px-3.5"
            >
              Reopen
            </Button>
          </div>
        ) : null}

        {p.body ? (
          <div className="whitespace-pre-line rounded-control border border-line bg-fill px-3.5 py-3 text-[16px]/[24px] text-ink [overflow-wrap:anywhere] [text-wrap:pretty] lg:px-4 lg:py-3.5 lg:text-[15px]/[24px]">
            &ldquo;{p.body}&rdquo;
          </div>
        ) : (
          <div className="text-[13px]/[18px] font-medium text-muted">They didn&apos;t write a message.</div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 lg:gap-3.5 lg:px-6 lg:py-5">
        <span className="text-overline uppercase text-muted">{inquiry ? "The customer" : "From"}</span>
        <dl className="grid grid-cols-[minmax(96px,auto)_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-card border border-line bg-white px-4 py-3.5 text-[15px]/[22px] lg:rounded-[14px]">
          {rows.map((r) => (
            <React.Fragment key={r.label}>
              <dt className="font-medium text-muted">{r.label}</dt>
              <dd className="min-w-0 font-semibold text-ink [overflow-wrap:anywhere]">{r.value}</dd>
            </React.Fragment>
          ))}
        </dl>
        {p.phoneText && !p.whatsapp ? (
          <div className="text-[13px]/[18px] font-medium text-wait-text">That phone number doesn&apos;t look like a Pakistani mobile, so there&apos;s no WhatsApp button.</div>
        ) : null}

        {inquiry ? (
          <>
            <span className="mt-1.5 text-overline uppercase text-muted">The listing</span>
            {p.listing ? (
              <div className="flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3.5 lg:rounded-[14px]">
                <Avatar name={p.listing.name} logoUrl={p.listing.logoUrl} size={44} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[16px]/[22px] font-bold text-ink">{p.listing.name}</span>
                  <span className="flex items-center gap-1 text-[13px]/[18px] font-medium text-muted">
                    <MapPin size={14} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
                    {[p.listing.city, p.listing.area].filter(Boolean).join(" · ")}
                    {p.listing.status === "hidden" ? " · Hidden" : ""}
                  </span>
                </div>
                <Link
                  href={`/admin/listings/${p.listing.id}`}
                  className="flex flex-none items-center gap-1 text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  Stats
                  <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="rounded-[14px] border border-line bg-white p-4 text-[15px]/[22px] font-medium text-muted">
                {p.listingName ? `${p.listingName} isn't in the listings any more.` : "The listing wasn't recorded."}
              </div>
            )}
          </>
        ) : null}

        {hasReplies ? (
          <>
            <span className="mt-1.5 text-overline uppercase text-muted">Reply</span>
            <div className="hidden flex-wrap gap-2 lg:flex">{replies("desktop")}</div>
            <div className="flex flex-col gap-2 lg:hidden">{replies("mobile")}</div>
          </>
        ) : null}

        <div className="num text-[13px]/[18px] font-medium text-muted">
          {p.emailed ? "A copy was emailed to hello@rentalsawari.com." : "The email copy didn't go out, so this message is only here."}
        </div>
      </div>

      {/* Actions */}
      <InboxDetailFooter>
        {deleteButton(false)}
        <span className="ml-auto" />
        {open ? (
          <Button variant="soft-green" icon={Check} onClick={markDone} loading={pending === "done"} loadingText="Saving…" disabled={busy && pending !== "done"} className="px-3.5">
            Mark done
          </Button>
        ) : null}
      </InboxDetailFooter>
      <MobileActionBar>
        <div className="flex gap-2">
          {deleteButton(true)}
          {open ? (
            <Button variant="soft-green" icon={Check} onClick={markDone} loading={pending === "done"} loadingText="Saving…" disabled={busy && pending !== "done"} className="flex-1">
              Mark done
            </Button>
          ) : null}
        </div>
      </MobileActionBar>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        tone="danger"
        icon={Trash2}
        title="Delete this message?"
        body="It's removed from the Inbox for good. Use this for spam; for real messages, Mark done keeps a record."
        actionLabel="Delete message"
        loadingLabel="Deleting…"
        onConfirm={remove}
      />
    </InboxDetailFrame>
  );
}
