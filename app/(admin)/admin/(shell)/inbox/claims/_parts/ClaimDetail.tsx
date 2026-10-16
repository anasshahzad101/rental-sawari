"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChartColumn, CircleAlert, CircleX, Flag, RotateCcw, ShieldX } from "lucide-react";
import { applyClaimAction, rejectClaimAction, reopenClaimAction } from "@/app/(admin)/admin/_actions/inbox";
import { undoVersionAction } from "@/app/(admin)/admin/_actions/listings";
import { fmtPhone, fmtWhen, initials, plural, waLink } from "@/lib/admin/format";
import { Banner } from "@/components/admin/ui/Banner";
import { Button, LockedReason } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { useToast } from "@/components/admin/ui/Toast";
import { CopyButton } from "@/components/admin/ui/WhatsAppPreview";
import { InboxDetailFooter, InboxDetailFrame, MobileActionBar } from "../../_shared/layout";
import { inboxHref } from "../../_shared/params";
import { useInboxAction } from "../../_shared/useInboxAction";
import { ChangesTable } from "./ChangesTable";
import { ClaimPills } from "./ClaimCard";
import { RejectDialog } from "./RejectDialog";
import { changesContact, liveMessage, ROLE_LABEL, verifyMessage } from "./rows";
import type { ClaimDetailData } from "./types";
import { VerifyPanel } from "./VerifyPanel";

/**
 * The claim on the right of the split view (full screen on mobile), top to
 * bottom: header → verification → current against requested → action bar.
 * Updated and Rejected claims show their outcome banner instead.
 */
export function ClaimDetail({ d }: { d: ClaimDetailData }) {
  const router = useRouter();
  const { toast } = useToast();
  const { run, pending } = useInboxAction();
  const [off, setOff] = useState<Set<string>>(() => new Set());
  const [rejectOpen, setRejectOpen] = useState(false);

  const c = d.claim;
  const name = d.listing?.name ?? "This listing";
  const self = inboxHref("claims", { view: d.view, id: c.id });
  const open = c.status === "waiting" || c.status === "verified";
  const verified = c.status === "verified" && c.verification.status === "yes";
  const keys = d.rows.filter((r) => !off.has(r.key)).map((r) => r.key);

  const toggle = (key: string, on: boolean) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (on) next.delete(key);
      else next.add(key);
      return next;
    });

  const apply = () =>
    run("apply", () => applyClaimAction(c.id, keys), {
      go: () => self,
      toast: (r) => ({
        message: `${name} updated`,
        undo:
          r.versionId != null
            ? async () => {
                const u = await undoVersionAction(r.versionId as number);
                if (!u.ok) toast({ message: u.error, icon: CircleAlert });
                router.refresh();
              }
            : undefined,
      }),
    });

  const reject = async (reason: string, note: string) => {
    const r = await run("reject", () => rejectClaimAction(c.id, reason, note), {
      go: () => self,
      toast: () => ({
        message: "Claim rejected",
        undo: async () => {
          const u = await reopenClaimAction(c.id);
          if (!u.ok) toast({ message: u.error, icon: CircleAlert });
          router.refresh();
        },
      }),
    });
    return !!r && r.ok;
  };

  return (
    <InboxDetailFrame aria-label={`Claim on ${name}`} className={cx(open ? "max-lg:pb-8" : "lg:pb-6")}>
      <DetailHeader d={d} />

      {!d.listing ? (
        <Banner tone="error" title="This listing no longer exists." className="lg:mx-6 lg:mt-5">
          Nothing can be updated. Reject the claim to close it.
        </Banner>
      ) : null}

      {open && d.listing ? (
        <>
          <VerifyPanel
            key={`${c.status}-${c.verification.at ?? ""}`}
            className="lg:mx-6 lg:mt-5"
            claimId={c.id}
            view={d.view}
            verified={verified}
            verification={c.verification}
            verifiedBy={d.verifiedBy}
            listingNumber={d.listingNumber}
            claimantNumber={c.claimantWhatsapp}
            contactChanges={changesContact(d.rows)}
            message={verifyMessage(c.claimantName, name, d.summary)}
          />
          <ChangesTable
            className="max-lg:mt-1 lg:mx-6 lg:mt-5"
            mode="review"
            rows={d.rows}
            total={d.rows.length}
            listingName={name}
            off={off}
            onToggle={toggle}
            unchanged={d.unchanged}
            unchangedRows={d.unchangedRows}
          />
        </>
      ) : null}

      {c.status === "updated" ? (
        <>
          <UpdatedOutcome d={d} />
          {d.appliedRows.length ? (
            <ChangesTable
              className="max-lg:mt-1 lg:mx-6 lg:mt-5"
              mode="applied"
              rows={d.appliedRows}
              total={Math.max(d.rows.length, d.appliedRows.length)}
              listingName={name}
            />
          ) : null}
        </>
      ) : null}

      {c.status === "rejected" ? (
        <>
          <RejectedOutcome d={d} busy={pending !== null} onReopen={() => run("reopen", () => reopenClaimAction(c.id), { go: () => self })} reopening={pending === "reopen"} />
          {d.rows.length ? (
            <ChangesTable
              className="max-lg:mt-1 lg:mx-6 lg:mt-5"
              mode="readonly"
              rows={d.rows}
              total={d.rows.length}
              listingName={name}
              unchanged={d.unchanged}
              unchangedRows={d.unchangedRows}
            />
          ) : null}
        </>
      ) : null}

      {open ? (
        <ActionBar
          verified={verified && !!d.listing}
          ticked={keys.length}
          total={d.rows.length}
          applying={pending === "apply"}
          busy={pending !== null}
          onReject={() => setRejectOpen(true)}
          onApply={apply}
        />
      ) : null}

      <RejectDialog open={rejectOpen} onClose={() => setRejectOpen(false)} listingName={name} onReject={reject} />
    </InboxDetailFrame>
  );
}

// ── Header ───────────────────────────────────────────────────────────────

const linkCls = "inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 hover:underline";

function DetailHeader({ d }: { d: ClaimDetailData }) {
  const c = d.claim;
  const l = d.listing;
  const name = l?.name ?? "Listing removed";
  const when = fmtWhen(c.createdAt);
  const role = ROLE_LABEL[c.role];
  const done = c.status === "updated" || c.status === "rejected";

  const links = l ? (
    <div className="flex flex-none items-center gap-3.5 text-[14px]/[20px] font-semibold">
      <a href={`/companies/${l.slug}`} target="_blank" rel="noopener noreferrer" className={linkCls}>
        Open listing
        <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </a>
      <Link href={`/admin/listings/${l.id}`} className={linkCls}>
        Stats
        <ChartColumn size={16} strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-3 lg:border-b lg:border-fill lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h2 className="min-w-0 text-[22px]/[28px] font-extrabold tracking-[-0.02em] text-ink [overflow-wrap:anywhere] lg:tracking-[-0.01em]">
              Claim on <span className="lg:text-brand-700">{name}</span>
            </h2>
            {done ? <ClaimPills item={{ status: c.status, flagged: c.flagged, flaggedBefore: false }} /> : null}
          </div>
          <p className="num text-[13px]/[18px] font-medium text-muted lg:hidden">
            {c.claimantName} · {role} · {when}
          </p>
        </div>
        {links ? <div className="hidden lg:ml-auto lg:flex">{links}</div> : null}
      </div>

      {links ? <div className="lg:hidden">{links}</div> : null}

      {/* Desktop claimant row */}
      <div className="num hidden flex-wrap items-center gap-2 text-[13px]/[18px] font-medium text-ink-2 lg:flex">
        <span aria-hidden="true" className="grid size-7 flex-none place-items-center rounded-full bg-fill text-[12px] font-bold leading-none text-ink">
          {initials(c.claimantName) || "?"}
        </span>
        <b className="text-[15px] font-bold text-ink">{c.claimantName}</b>· {role} · WhatsApp {fmtPhone(c.claimantWhatsapp)} · {when}
      </div>

      {c.message ? (
        <div className="rounded-control bg-fill px-3.5 py-3 text-[16px]/[24px] text-ink-2 [overflow-wrap:anywhere] [text-wrap:pretty] lg:text-[15px]/[24px]">
          &quot;{c.message}&quot;
        </div>
      ) : null}

      {d.flaggedBefore ? (
        <Banner tone="warning" icon={Flag} title="Flagged before.">
          An earlier claim from {fmtPhone(c.claimantWhatsapp)} was rejected because the owner said NO. Verify with extra care.
        </Banner>
      ) : null}
    </div>
  );
}

// ── Outcomes ─────────────────────────────────────────────────────────────

function UpdatedOutcome({ d }: { d: ClaimDetailData }) {
  const c = d.claim;
  const name = d.listing?.name ?? "the listing";
  const applied = d.appliedRows.length || c.appliedKeys.length;
  const total = Math.max(d.rows.length, applied);
  const msg = liveMessage(c.claimantName, name);
  return (
    <>
      <Banner tone="success" className="lg:mx-6 lg:mt-4">
        {applied} of {plural(total, "change")} applied {fmtWhen(c.decidedAt)}. History says{" "}
        <b className="font-bold">&quot;Claim by {c.claimantName} applied&quot;</b>.
      </Banner>
      <div className="rounded-control border border-line bg-white px-4 py-3.5 lg:mx-6 lg:mt-4">
        <div className="num text-[13px]/[18px] font-semibold text-ink-2">
          To {c.claimantName} · {fmtPhone(c.claimantWhatsapp)}
        </div>
        <div className="mt-2 rounded-[14px_14px_4px_14px] border border-good-border bg-good-fill px-3 py-2.5 text-[16px]/[24px] text-ink [text-wrap:pretty] lg:text-[15px]/[22px]">
          {msg}
        </div>
        <div className="mt-2.5 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <Button
            variant="whatsapp"
            href={waLink(c.claimantWhatsapp, msg)}
            target="_blank"
            fullWidth
            className="max-lg:h-auto max-lg:min-h-12 max-lg:whitespace-normal max-lg:py-3 max-lg:text-center lg:w-auto lg:px-4"
          >
            Send &quot;Your changes are live&quot; on WhatsApp
          </Button>
          <CopyButton text={msg} fullWidth className="lg:w-auto" />
        </div>
      </div>
    </>
  );
}

function RejectedOutcome({ d, onReopen, busy, reopening }: { d: ClaimDetailData; onReopen: () => void; busy: boolean; reopening: boolean }) {
  const c = d.claim;
  const saidNo = c.verification.status === "no";
  const reopen = (
    <Button variant="secondary" icon={RotateCcw} onClick={onReopen} loading={reopening} loadingText="Reopening…" disabled={busy && !reopening}>
      Reopen
    </Button>
  );
  if (saidNo) {
    return (
      <Banner tone="error" icon={ShieldX} title="The owner said NO" actions={reopen} className="lg:mx-6 lg:mt-4">
        on {fmtPhone(d.listingNumber)}, {fmtWhen(c.verification.at ?? c.decidedAt)}. Nothing on the listing changed. Future claims from{" "}
        {fmtPhone(c.claimantWhatsapp)} will show a &quot;Flagged before&quot; warning.
      </Banner>
    );
  }
  return (
    <Banner tone="error" icon={CircleX} title={`Rejected · ${c.rejectReason ?? "Other"}.`} actions={reopen} className="lg:mx-6 lg:mt-4">
      {fmtWhen(c.decidedAt)}. Nothing on the listing changed.
      {c.note ? <span className="mt-1 block text-ink-2 [overflow-wrap:anywhere]">Note: {c.note}</span> : null}
    </Banner>
  );
}

// ── Action bar ───────────────────────────────────────────────────────────

interface ActionBarProps {
  verified: boolean;
  ticked: number;
  total: number;
  applying: boolean;
  busy: boolean;
  onReject: () => void;
  onApply: () => void;
}

/**
 * Reject claim on the left; Update listing on the right — locked with "Verify
 * ownership first" until a YES is recorded, then "Update listing · 8 changes"
 * (or "· 7 of 8 changes"). Desktop: the card footer, sticky to the bottom of
 * the window. Mobile: fixed to the bottom of the screen.
 */
function ActionBar({ verified, ticked, total, applying, busy, onReject, onApply }: ActionBarProps) {
  const all = ticked === total;
  const none = ticked === 0;
  const count = (short: boolean) => (all ? plural(total, "change") : short ? `${ticked} of ${total}` : `${ticked} of ${plural(total, "change")}`);
  const note = !verified ? (
    <LockedReason>Verify ownership first</LockedReason>
  ) : none ? (
    <span className="text-[13px]/[18px] font-medium text-muted">Tick at least one change</span>
  ) : null;

  const update = (short: boolean, className?: string) =>
    verified ? (
      <Button
        variant="success"
        className={className}
        loading={applying}
        loadingText="Updating…"
        disabled={none || (busy && !applying)}
        onClick={onApply}
      >
        Update listing<span className="font-medium opacity-90">· {count(short)}</span>
      </Button>
    ) : (
      <Button locked className={className}>
        Update listing
      </Button>
    );

  return (
    <>
      <InboxDetailFooter className="mt-5 gap-3 lg:sticky lg:bottom-0 lg:z-10">
        <Button variant="secondary" onClick={onReject} disabled={busy}>
          Reject claim
        </Button>
        <div className="ml-auto flex flex-col items-end gap-1">
          {update(false, "px-[18px]")}
          {note}
        </div>
      </InboxDetailFooter>

      <MobileActionBar>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onReject} disabled={busy} className="flex-none">
            Reject
          </Button>
          {update(true, "min-w-0 flex-1")}
        </div>
        {note ? <div className="flex justify-end">{note}</div> : null}
      </MobileActionBar>
    </>
  );
}
