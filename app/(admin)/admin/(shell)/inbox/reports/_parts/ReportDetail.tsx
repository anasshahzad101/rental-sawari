"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, EyeOff, MapPin, Pencil, RotateCcw } from "lucide-react";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { fmtNum, fmtPhone, plural } from "@/lib/admin/format";
import type { Plan, ReportReason, ReportStatus } from "@/lib/admin/types";
import {
  dismissReportAction,
  hideFromReportAction,
  reopenReportAction,
  resolveReportAction,
} from "@/app/(admin)/admin/_actions/inbox";
import { undoVersionAction } from "@/app/(admin)/admin/_actions/listings";
import { Sparkline } from "@/components/admin/charts/Sparkline";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Button } from "@/components/admin/ui/Button";
import { Checkbox } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { Field, Textarea } from "@/components/admin/ui/Field";
import { WhatsAppIcon } from "@/components/admin/ui/icons";
import { ConfirmDialog, Sheet } from "@/components/admin/ui/Modal";
import { Popover } from "@/components/admin/ui/Popover";
import { PlanBadge, StatusPill } from "@/components/admin/ui/StatusPill";
import { useToast } from "@/components/admin/ui/Toast";
import { InboxDetailFooter, InboxDetailFrame, MobileActionBar } from "../../_shared/layout";
import { inboxHref } from "../../_shared/params";
import { useInboxAction } from "../../_shared/useInboxAction";
import { MessageButton } from "./MessageButton";
import { businessMessage, reporterMessage, reporterResolvedMessage } from "./text";

export interface ReportListing {
  id: number;
  name: string;
  city: string;
  area: string;
  plan: Plan;
  verified: boolean;
  status: "live" | "hidden";
  whatsapp: string;
  logoUrl: string | null;
  /** fmtDay of createdAt: "4 Sep 2026" */
  listedSince: string;
}

export interface ReportDetailProps {
  id: number;
  status: ReportStatus;
  reason: ReportReason;
  headline: string;
  details: string | null;
  reporterWhatsapp: string | null;
  /** fmtWhen(createdAt) */
  sentText: string;
  /** fmtWhen(resolvedAt) */
  closedText: string | null;
  resolvedNote: string | null;
  listing: ReportListing | null;
  stats: { opened: number; contacted: number; spark: number[] } | null;
  /** Other reports on this listing sent before this one. */
  earlier: number;
}

/** The right-hand detail of a problem report (full screen on mobile). */
export function ReportDetail(props: ReportDetailProps) {
  const { id, status, reason, headline, details, reporterWhatsapp, sentText, closedText, resolvedNote, listing, stats, earlier } = props;
  const router = useRouter();
  const { toast } = useToast();
  const { run, pending, busy } = useInboxAction();
  const [hideOpen, setHideOpen] = useState(false);
  const [alsoResolve, setAlsoResolve] = useState(true);

  const urgent = reason === "scam";
  const open = status === "new";
  const name = listing?.name ?? "this listing";
  const hidden = listing?.status === "hidden";

  // ── Actions ────────────────────────────────────────────────────────────
  const backToNew = async () => {
    const u = await reopenReportAction(id);
    if (u.ok) {
      router.replace(inboxHref("reports", { id }), { scroll: false });
      router.refresh();
    } else toast({ message: u.error });
  };

  const resolve = (note: string) =>
    run("resolve", () => resolveReportAction(id, note), {
      toast: () => ({ message: "Report marked resolved", undo: backToNew }),
      go: () => inboxHref("reports", { view: "done", id }),
    });

  const dismiss = () =>
    run("dismiss", () => dismissReportAction(id), {
      toast: () => ({ message: "Report dismissed", undo: backToNew }),
      go: () => inboxHref("reports", { view: "done", id }),
    });

  const reopen = () => run("reopen", () => reopenReportAction(id), { toast: () => "Report reopened", go: () => inboxHref("reports", { id }) });

  const hide = async () => {
    const resolveToo = alsoResolve;
    const r = await run("hide", () => hideFromReportAction(id, resolveToo), {
      toast: (ok) => ({
        message: `${name} hidden`,
        icon: EyeOff,
        undo: ok.versionId
          ? async () => {
              const u = await undoVersionAction(ok.versionId as number);
              if (!u.ok) {
                toast({ message: u.error });
                return;
              }
              if (resolveToo) await backToNew();
              else router.refresh();
            }
          : undefined,
      }),
      go: () => (resolveToo ? inboxHref("reports", { view: "done", id }) : null),
    });
    if (!r?.ok) throw new Error("hide failed"); // keeps the dialog open
  };

  // ── Pieces ─────────────────────────────────────────────────────────────
  const noteBox = details ? (
    <div
      className={cx(
        "rounded-control border px-3.5 py-3 text-[16px]/[24px] text-ink [overflow-wrap:anywhere] [text-wrap:pretty] lg:px-4 lg:py-3.5 lg:text-[15px]/[24px]",
        urgent && open ? "border-bad-border bg-bad-fill" : "border-line bg-fill",
      )}
    >
      &ldquo;{details}&rdquo;
    </div>
  ) : (
    <div className="text-[13px]/[18px] font-medium text-muted">The reporter didn&apos;t add a note.</div>
  );

  const reporterLine = reporterWhatsapp ? (
    <div className="num hidden items-center gap-2 text-[13px]/[18px] font-medium text-ink-2 lg:flex">
      <WhatsAppIcon size={15} className="text-whatsapp-hover" />
      Reporter: {fmtPhone(reporterWhatsapp)} · left it to get a reply
    </div>
  ) : (
    <div className="hidden text-[13px]/[18px] font-medium text-muted lg:block">The reporter left no contact.</div>
  );

  const mobileMeta = (
    <div className="num text-[13px]/[18px] font-medium text-muted lg:hidden">
      {sentText}
      {reporterWhatsapp ? ` · reporter ${fmtPhone(reporterWhatsapp)}` : " · no contact left"}
    </div>
  );

  const talk = (layout: "desktop" | "mobile") =>
    listing ? (
      <>
        <MessageButton
          layout={layout}
          label="WhatsApp the business"
          title="Someone reported a problem"
          toName={listing.name}
          toNumber={listing.whatsapp}
          message={businessMessage(listing.name, reason)}
        />
        {reporterWhatsapp ? (
          <MessageButton
            layout={layout}
            label="WhatsApp the reporter"
            title="Reply to the reporter"
            toName="the reporter"
            toNumber={reporterWhatsapp}
            message={reporterMessage(listing.name)}
          />
        ) : null}
      </>
    ) : null;

  const hideButton = (mobile: boolean) => (
    <Button
      variant="soft-red"
      icon={EyeOff}
      onClick={() => {
        setAlsoResolve(true);
        setHideOpen(true);
      }}
      disabled={!listing || hidden || busy}
      title={hidden ? "This listing is already hidden" : undefined}
      className={mobile ? "flex-1" : "lg:px-3.5"}
    >
      {hidden ? "Hidden" : mobile ? "Hide…" : "Hide listing…"}
    </Button>
  );

  const editButton = (mobile: boolean) =>
    listing ? (
      <Button variant="secondary" icon={Pencil} href={`/admin/listings/${listing.id}?tab=edit`} className={mobile ? "flex-1" : "lg:px-3.5"}>
        {mobile ? "Edit" : "Edit listing"}
      </Button>
    ) : null;

  return (
    <InboxDetailFrame aria-label={`Problem report: ${headline}`}>
      {/* Header */}
      <div className="flex flex-col gap-3 lg:gap-2.5 lg:border-b lg:border-fill lg:p-6">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-2.5">
          {urgent && open ? <StatusPill kind="urgent" className="gap-1 font-bold" /> : null}
          <h2 className="min-w-0 text-page-title-m text-ink lg:text-dialog-title">{headline}</h2>
          {status === "resolved" ? <StatusPill kind="resolved" size="sm" /> : status === "dismissed" ? <StatusPill kind="dismissed" size="sm" /> : null}
        </div>
        {open ? (
          <div className="hidden text-[13px]/[18px] font-medium text-muted lg:block">Problem report · sent {sentText} from the listing page</div>
        ) : (
          <div className="text-[13px]/[18px] font-medium text-muted">
            On {name}
            {listing ? ` · now ${hidden ? "Hidden" : "Live"}` : ""}
          </div>
        )}

        {/* Closed: what happened */}
        {!open ? (
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="flex gap-2.5 rounded-control bg-fill px-4 py-3 text-[16px]/[24px] font-medium text-ink-2 lg:text-[15px]/[22px]">
              <Check size={20} strokeWidth={1.75} className="mt-0.5 flex-none text-quiet-text lg:mt-px" aria-hidden="true" />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {status === "resolved" ? (
                  <>
                    Resolved by you, {closedText}.{resolvedNote ? <> &ldquo;{resolvedNote}&rdquo;</> : null}
                  </>
                ) : (
                  <>Dismissed by you, {closedText}. Nothing was changed.</>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              {status === "resolved" && reporterWhatsapp ? (
                <>
                  <span className="hidden lg:inline-flex">
                    <MessageButton
                      layout="desktop"
                      variant="secondary"
                      label="Tell the reporter"
                      title="Tell the reporter"
                      toName="the reporter"
                      toNumber={reporterWhatsapp}
                      message={reporterResolvedMessage(name, hidden)}
                    />
                  </span>
                  <span className="lg:hidden">
                    <MessageButton
                      layout="mobile"
                      variant="secondary"
                      label="Tell the reporter"
                      title="Tell the reporter"
                      toName="the reporter"
                      toNumber={reporterWhatsapp}
                      message={reporterResolvedMessage(name, hidden)}
                    />
                  </span>
                </>
              ) : null}
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
          </div>
        ) : null}

        {open ? (
          <>
            {noteBox}
            {mobileMeta}
            {reporterLine}
          </>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 lg:gap-3.5 lg:px-6 lg:py-5">
        {!open ? (
          <>
            <span className="text-overline uppercase text-muted">The report</span>
            {noteBox}
            <div className="num text-[13px]/[18px] font-medium text-muted">
              Sent {sentText} from the listing page
              {reporterWhatsapp ? ` · reporter ${fmtPhone(reporterWhatsapp)}` : " · no contact left"}
            </div>
          </>
        ) : null}

        <span className={cx("text-overline uppercase text-muted", open ? "hidden lg:block" : "mt-1.5")}>The listing</span>
        {listing ? <ListingBlock listing={listing} stats={stats} earlier={earlier} /> : (
          <div className="rounded-[14px] border border-line bg-white p-4 text-[15px]/[22px] font-medium text-muted">This listing no longer exists.</div>
        )}

        {open && listing ? (
          <>
            <span className="mt-1.5 hidden text-overline uppercase text-muted lg:block">Talk to them</span>
            <div className="hidden flex-wrap gap-2 lg:flex">{talk("desktop")}</div>
            <div className="flex flex-col gap-3 lg:hidden">
              {talk("mobile")}
              <div className="flex gap-2">
                {editButton(true)}
                {hideButton(true)}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Actions (open reports) */}
      {open ? (
        <>
          <InboxDetailFooter>
            <Button variant="ghost" onClick={dismiss} loading={pending === "dismiss"} loadingText="Dismissing…" disabled={busy && pending !== "dismiss"} className="px-3.5 text-quiet-text">
              Dismiss
            </Button>
            <span className="ml-auto" />
            {editButton(false)}
            {hideButton(false)}
            <ResolveControl layout="desktop" busy={busy} saving={pending === "resolve"} onResolve={resolve} />
          </InboxDetailFooter>
          <MobileActionBar>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={dismiss} loading={pending === "dismiss"} loadingText="Dismissing…" disabled={busy && pending !== "dismiss"} className="px-4 text-quiet-text">
                Dismiss
              </Button>
              <ResolveControl layout="mobile" busy={busy} saving={pending === "resolve"} onResolve={resolve} />
            </div>
          </MobileActionBar>
          <ConfirmDialog
            open={hideOpen}
            onClose={() => setHideOpen(false)}
            tone="danger"
            icon={EyeOff}
            title={`Hide ${name}?`}
            body="It will disappear from the site but stay in the admin. You can show it again any time."
            actionLabel="Hide listing"
            loadingLabel="Hiding…"
            onConfirm={hide}
          >
            <Checkbox checked={alsoResolve} onChange={setAlsoResolve} label="Also mark this report resolved" />
          </ConfirmDialog>
        </>
      ) : null}
    </InboxDetailFrame>
  );
}

// ── The listing ──────────────────────────────────────────────────────────

function Mini({ tone, children }: { tone: "amber" | "green" | "grey"; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex h-[22px] flex-none items-center gap-1 whitespace-nowrap rounded-full border px-2 text-[12px]/[16px] font-semibold",
        tone === "amber" && "border-wait-border bg-wait-fill text-wait-text",
        tone === "green" && "border-good-border bg-good-fill text-good-text",
        tone === "grey" && "border-quiet-border bg-quiet-fill text-quiet-text",
      )}
    >
      {children}
    </span>
  );
}

function ListingBlock({ listing: l, stats, earlier }: { listing: ReportListing; stats: ReportDetailProps["stats"]; earlier: number }) {
  const place = [l.city, l.area].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-white px-4 py-3.5 lg:gap-4 lg:rounded-[14px] lg:p-4">
      <div className="flex items-center gap-3">
        <Avatar name={l.name} logoUrl={l.logoUrl} size={48} className="max-lg:size-11" />
        <div className="flex min-w-0 flex-1 flex-col lg:gap-1">
          <span className="text-[16px]/[22px] font-bold text-ink lg:text-[17px]/[24px]">{l.name}</span>
          <span className="text-[13px]/[18px] font-medium text-muted lg:hidden">
            {place} · {PLAN_LABEL[l.plan]}
          </span>
          <span className="hidden flex-wrap items-center gap-1.5 text-[13px]/[18px] font-medium text-muted lg:flex">
            <MapPin size={14} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
            {place}
            <PlanBadge plan={l.plan} size="sm" />
            {l.verified ? <Mini tone="green">Verified</Mini> : <Mini tone="amber">Not verified</Mini>}
            {l.status === "live" ? (
              <Mini tone="green">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-good-solid" />
                Live
              </Mini>
            ) : (
              <Mini tone="grey">
                <EyeOff size={12} strokeWidth={2} aria-hidden="true" />
                Hidden
              </Mini>
            )}
          </span>
        </div>
        <Link
          href={`/admin/listings/${l.id}`}
          className="hidden flex-none items-center gap-1 text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline lg:inline-flex"
        >
          Stats
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>

      {/* Desktop: three columns with the sparkline */}
      <div className="hidden grid-cols-3 gap-3 border-t border-fill pt-3.5 lg:grid">
        <div className="flex flex-col">
          <span className="text-[13px]/[18px] font-medium text-ink-2">Opened · 30 days</span>
          <b className="num text-[24px]/[30px] font-extrabold text-ink">{stats ? fmtNum(stats.opened) : "—"}</b>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px]/[18px] font-medium text-ink-2">Contacted · 30 days</span>
          <b className="num text-[24px]/[30px] font-extrabold text-ink">{stats ? fmtNum(stats.contacted) : "—"}</b>
        </div>
        {stats && stats.spark.length > 1 ? <Sparkline values={stats.spark} width={160} height={48} fluid className="self-end" /> : <span />}
      </div>
      {/* Mobile: two numbers */}
      <div className="flex gap-6 border-t border-fill pt-3 text-[12px]/[16px] font-medium text-muted lg:hidden">
        <span className="flex flex-col">
          <b className="num text-[20px]/[26px] font-extrabold text-ink">{stats ? fmtNum(stats.opened) : "—"}</b>
          Opened · 30 days
        </span>
        <span className="flex flex-col">
          <b className="num text-[20px]/[26px] font-extrabold text-ink">{stats ? fmtNum(stats.contacted) : "—"}</b>
          Contacted
        </span>
      </div>

      <div className="num hidden flex-wrap gap-x-6 gap-y-1 text-[13px]/[18px] font-medium text-muted lg:flex">
        <span>WhatsApp {fmtPhone(l.whatsapp)}</span>
        <span>Listed since {l.listedSince}</span>
        <span>{earlier ? `${plural(earlier, "earlier report")}` : "No earlier reports"}</span>
      </div>
    </div>
  );
}

// ── Mark resolved ────────────────────────────────────────────────────────

function ResolveForm({ onCancel, onSubmit, saving, big }: { onCancel: () => void; onSubmit: (note: string) => void; saving: boolean; big?: boolean }) {
  const [note, setNote] = useState("");
  return (
    <div className="flex flex-col">
      <div className={cx("font-bold text-ink", big ? "hidden" : "text-[17px]/[24px]")}>Mark this report resolved</div>
      <Field label="What did you do?" optional className={big ? "mt-1" : "mt-3"}>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Hid the listing. Business didn't reply in 24 hours."
          className="min-h-[80px]"
          rows={3}
          autoFocus
        />
      </Field>
      <div className={cx("mt-4 flex gap-2", big ? "flex-col-reverse" : "justify-end")}>
        <Button variant="secondary" onClick={onCancel} disabled={saving} fullWidth={big}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSubmit(note)} loading={saving} loadingText="Saving…" fullWidth={big}>
          Mark resolved
        </Button>
      </div>
    </div>
  );
}

function ResolveControl({
  layout,
  busy,
  saving,
  onResolve,
}: {
  layout: "desktop" | "mobile";
  busy: boolean;
  saving: boolean;
  onResolve: (note: string) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const submit = async (note: string) => {
    const r = (await onResolve(note)) as { ok?: boolean } | null;
    if (r?.ok) setOpen(false);
  };
  if (layout === "mobile") {
    return (
      <>
        <Button variant="soft-green" icon={Check} className="flex-1" disabled={busy} onClick={() => setOpen(true)}>
          Mark resolved
        </Button>
        <Sheet open={open} onClose={() => (saving ? undefined : setOpen(false))} title="Mark this report resolved">
          <div className="pb-2">
            <ResolveForm big saving={saving} onCancel={() => setOpen(false)} onSubmit={submit} />
          </div>
        </Sheet>
      </>
    );
  }
  return (
    <Popover
      open={open}
      onOpenChange={(o) => (saving ? undefined : setOpen(o))}
      align="end"
      side="top"
      aria-label="Mark this report resolved"
      className="w-[440px] max-w-[calc(100vw-32px)] p-5"
      trigger={
        <Button variant="soft-green" icon={Check} disabled={busy && !saving} className="px-3.5">
          Mark resolved
        </Button>
      }
    >
      <ResolveForm saving={saving} onCancel={() => setOpen(false)} onSubmit={submit} />
    </Popover>
  );
}
