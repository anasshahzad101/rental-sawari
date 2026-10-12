"use client";

import * as React from "react";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleAlert, Phone, ShieldAlert, ShieldCheck, TriangleAlert, Undo2 } from "lucide-react";
import { clearVerificationAction, verifyClaimAction } from "@/app/(admin)/admin/_actions/inbox";
import { fmtPhone, fmtWhen, samePhone, telLink, waLink } from "@/lib/admin/format";
import type { ClaimVerification, VerifyMethod } from "@/lib/admin/types";
import type { InboxView } from "@/components/admin/shell";
import { Button, Spinner } from "@/components/admin/ui/Button";
import { RadioMark } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { FieldError, Textarea } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { CopyButton } from "@/components/admin/ui/WhatsAppPreview";
import { inboxHref } from "../../_shared/params";
import { useInboxAction } from "../../_shared/useInboxAction";

const METHODS: Array<{ value: VerifyMethod; label: string }> = [
  { value: "whatsapp", label: "WhatsApp reply" },
  { value: "call", label: "Phone call" },
  { value: "other", label: "Other proof" },
];

export interface VerifyPanelProps {
  claimId: number;
  view: InboxView;
  verified: boolean;
  verification: ClaimVerification;
  /** "WhatsApp reply" · "phone call" · "other proof". */
  verifiedBy: string;
  listingNumber: string;
  claimantNumber: string;
  /** The claim changes the WhatsApp or phone number. */
  contactChanges: boolean;
  /** The pre-filled message to the listing's number. */
  message: string;
  className?: string;
}

/**
 * Step 1 of a claim: confirm ownership on the number ALREADY on the listing.
 * Amber until a YES is recorded (WhatsApp reply / Phone call / Other proof
 * with a note); green "Verified by …" with Undo after. "They said NO"
 * rejects and flags the claim (toast with Undo).
 */
export function VerifyPanel(props: VerifyPanelProps) {
  return props.verified ? <VerifiedPanel {...props} /> : <NotVerifiedPanel {...props} />;
}

// ── Verified (green) ─────────────────────────────────────────────────────

function VerifiedPanel({ claimId, view, verification, verifiedBy, listingNumber, className }: VerifyPanelProps) {
  const { run, pending } = useInboxAction();
  const v = verification;
  const detail =
    v.method === "other"
      ? v.note || "Other proof"
      : v.method === "call"
        ? `the owner said YES on a call to ${fmtPhone(listingNumber)}`
        : `the owner replied YES from ${fmtPhone(listingNumber)}`;
  return (
    <div className={cx("rounded-card border border-good-border bg-good-fill p-4 lg:rounded-[14px] lg:p-5", className)}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 flex-none place-items-center rounded-full bg-white text-good-text">
          <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[16px]/[22px] font-bold text-good-text lg:text-[17px]/[24px]">Verified by {verifiedBy}</span>
          <span className="num text-[13px]/[18px] font-medium text-ink-2 [overflow-wrap:anywhere]">
            {fmtWhen(v.at)} · {detail}
          </span>
        </div>
        <button
          type="button"
          onClick={() => run("undo", () => clearVerificationAction(claimId), { go: () => inboxHref("claims", { view, id: claimId }) })}
          disabled={pending !== null}
          className="inline-flex h-11 flex-none items-center gap-1.5 rounded-control px-3 text-[15px]/[20px] font-semibold text-brand-700 outline-none transition-colors hover:bg-white/70 focus-visible:shadow-focus disabled:cursor-progress lg:h-10"
        >
          {pending === "undo" ? <Spinner className="size-4 border-brand-200 border-t-brand-700 lg:size-4" /> : <Undo2 size={16} strokeWidth={1.75} aria-hidden="true" />}
          Undo
        </button>
      </div>
    </div>
  );
}

// ── Not verified (amber) ─────────────────────────────────────────────────

function NotVerifiedPanel({ claimId, view, listingNumber, claimantNumber, contactChanges, message, className }: VerifyPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { run, pending } = useInboxAction();
  const [yes, setYes] = useState(false);
  const [method, setMethod] = useState<VerifyMethod | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const noteId = useId();
  const self = inboxHref("claims", { view, id: claimId });
  const sameNumber = samePhone(listingNumber, claimantNumber);
  const busy = pending !== null;

  const saveYes = (m: VerifyMethod, n: string | null) =>
    run(`yes-${m}`, () => verifyClaimAction(claimId, { choice: "yes", method: m, note: n }), { go: () => self });

  const pickMethod = (m: VerifyMethod) => {
    if (busy) return;
    setYes(true);
    setMethod(m);
    setNoteError(false);
    if (m !== "other") void saveYes(m, null);
  };

  const saveOther = () => {
    if (!note.trim()) {
      setNoteError(true);
      return;
    }
    void saveYes("other", note.trim());
  };

  const sayNo = () => {
    if (busy) return;
    void run("no", () => verifyClaimAction(claimId, { choice: "no", method: null, note: null }), {
      go: () => self,
      toast: () => ({
        message: "Claim rejected and flagged",
        undo: async () => {
          const r = await clearVerificationAction(claimId);
          if (!r.ok) toast({ message: r.error, icon: CircleAlert });
          router.refresh();
        },
      }),
    });
  };

  const wa = waLink(listingNumber, message);
  const contactLine = "This claim changes the contact number. Verify using the OLD number.";

  return (
    <div className={cx("flex flex-col gap-2.5 rounded-card border border-wait-border bg-wait-fill p-4 lg:block lg:rounded-[14px] lg:p-5", className)}>
      {/* Mobile: stacked */}
      <div className="flex flex-col gap-2.5 lg:hidden">
        <div className="flex items-center gap-2 text-[16px]/[22px] font-bold text-ink">
          <ShieldAlert size={18} strokeWidth={1.75} className="flex-none text-wait-text" aria-hidden="true" />
          Verify ownership
        </div>
        <p className="text-[15px]/[22px] font-medium text-ink [text-wrap:pretty]">Message the number already on the listing, not the claimant&apos;s.</p>
        {contactChanges ? <p className="text-[13px]/[18px] font-semibold text-wait-text">{contactLine}</p> : null}
        <div className="rounded-control border-[1.5px] border-brand-700 bg-white px-3 py-2.5">
          <div className="text-overline uppercase text-brand-700">On the listing</div>
          <div className="num text-[20px]/[28px] font-extrabold text-ink">{fmtPhone(listingNumber)}</div>
        </div>
        <Button variant="whatsapp" href={wa} target="_blank" fullWidth>
          Open in WhatsApp
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Phone} href={telLink(listingNumber)} className="flex-1">
            Call
          </Button>
          <CopyButton text={message} label="Copy" className="flex-1" />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-white text-wait-text">
            <ShieldAlert size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="text-[17px]/[24px] font-bold text-ink">Verify ownership</span>
          <span className="inline-flex h-6 items-center rounded-full border border-wait-border bg-white px-[9px] text-[12px]/[16px] font-semibold text-wait-text">
            Not verified yet
          </span>
        </div>
        <p className="mt-2.5 text-[15px]/[22px] font-medium text-ink [text-wrap:pretty]">
          Before updating, confirm this is really the owner. Message the number already on the listing, not the claimant&apos;s number.
        </p>
        {contactChanges ? (
          <p className="mt-2 flex items-center gap-2 text-[14px]/[20px] font-semibold text-wait-text">
            <TriangleAlert size={16} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
            {contactLine}
          </p>
        ) : null}
        <div className={cx("mt-4 grid gap-3", sameNumber ? "grid-cols-1" : "grid-cols-2")}>
          <div className="min-w-0 rounded-control border-[1.5px] border-brand-700 bg-white px-3.5 py-3">
            <div className="text-overline uppercase text-brand-700">Message this one · on the listing</div>
            <div className="num text-[20px]/[28px] font-extrabold text-ink">{fmtPhone(listingNumber)}</div>
            {sameNumber ? <div className="text-[13px]/[18px] font-medium text-muted">The claimant wrote from this same number.</div> : null}
          </div>
          {!sameNumber ? (
            <div className="min-w-0 rounded-control border border-line bg-white px-3.5 py-3 text-muted">
              <div className="text-overline uppercase">Not this one · claimant</div>
              <div className="num text-[20px]/[28px] font-semibold line-through">{fmtPhone(claimantNumber)}</div>
            </div>
          ) : null}
        </div>
        <div className="mt-3 rounded-[14px_14px_4px_14px] border border-good-border bg-good-fill px-3.5 py-3 text-[15px]/[24px] text-ink [text-wrap:pretty]">
          {message}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="whatsapp" href={wa} target="_blank" className="px-4">
            Open in WhatsApp
          </Button>
          <Button variant="secondary" icon={Phone} href={telLink(listingNumber)} className="px-3.5">
            Call instead
          </Button>
          <CopyButton text={message} className="px-3.5" />
        </div>
      </div>

      {/* What did they say? */}
      <div className="border-t border-wait-border pt-2.5 lg:mt-5 lg:pt-4">
        <div className="text-[15px]/[22px] font-bold text-ink">What did they say?</div>
        <div role="radiogroup" aria-label="What did they say?" className="mt-2 flex flex-col gap-2 lg:mt-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
          {/* YES */}
          <div
            onClick={() => !busy && setYes(true)}
            className={cx(
              "flex min-w-0 cursor-pointer flex-col rounded-control bg-white transition-colors",
              yes
                ? "gap-3 border-[1.5px] border-brand-700 p-3.5 lg:col-span-2 lg:p-4"
                : "gap-2.5 border border-line px-3.5 hover:bg-page max-lg:min-h-12 max-lg:justify-center lg:p-3.5",
            )}
          >
            <button
              type="button"
              role="radio"
              aria-checked={yes}
              onClick={(e) => {
                e.stopPropagation();
                if (!busy) setYes(true);
              }}
              className="flex items-center gap-2.5 self-start rounded-md text-left text-[16px]/[24px] font-semibold text-ink outline-none focus-visible:shadow-focus lg:text-[15px]/[22px]"
            >
              <RadioMark checked={yes} />
              They confirmed YES
            </button>
            <div className={cx("flex flex-wrap gap-1.5", !yes && "max-lg:hidden")} role="group" aria-label="How did they confirm?">
              {METHODS.map((m) => {
                const on = yes && method === m.value;
                const saving = pending === `yes-${m.value}`;
                return (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={on}
                    disabled={busy && !saving}
                    onClick={(e) => {
                      e.stopPropagation();
                      pickMethod(m.value);
                    }}
                    className={cx(
                      "inline-flex h-11 items-center gap-1 rounded-full border px-3.5 text-[15px]/[20px] outline-none transition-colors focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60",
                      yes ? "lg:h-9 lg:px-3 lg:text-[14px]/[20px]" : "lg:h-8 lg:px-2.5 lg:text-[13px]/[18px]",
                      on ? "border-brand-200 bg-brand-50 font-semibold text-brand-700" : "border-line bg-white font-medium text-ink hover:bg-fill",
                    )}
                  >
                    {saving ? (
                      <Spinner className="mr-0.5 size-3.5 border-brand-200 border-t-brand-700 lg:size-3.5" />
                    ) : on ? (
                      <Check size={14} strokeWidth={2.25} aria-hidden="true" />
                    ) : null}
                    {m.label}
                  </button>
                );
              })}
            </div>
            {yes && method === "other" ? (
              <>
                <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <label htmlFor={noteId} className="text-[13px]/[18px] font-semibold text-ink-2">
                    What proof? <span className="text-bad-text">· required for other proof</span>
                  </label>
                  <Textarea
                    id={noteId}
                    value={note}
                    invalid={noteError}
                    autoFocus
                    maxLength={1000}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (noteError && e.target.value.trim()) setNoteError(false);
                    }}
                    placeholder="e.g. Visited the office, or they sent a photo of the shop board"
                    className="min-h-[72px] lg:text-[15px]/[22px]"
                  />
                  {noteError ? <FieldError>Add a note about the proof before saving</FieldError> : null}
                </div>
                <Button
                  variant="primary"
                  className="max-lg:w-full lg:self-end"
                  loading={pending === "yes-other"}
                  loadingText="Saving…"
                  disabled={busy && pending !== "yes-other"}
                  onClick={(e) => {
                    e.stopPropagation();
                    saveOther();
                  }}
                >
                  Save as verified
                </Button>
              </>
            ) : null}
          </div>

          {/* NO */}
          <button
            type="button"
            role="radio"
            aria-checked={false}
            onClick={sayNo}
            disabled={busy && pending !== "no"}
            className={cx(
              "flex min-w-0 flex-col gap-2.5 rounded-control border border-line bg-white px-3.5 text-left outline-none transition-colors hover:bg-page focus-visible:shadow-focus disabled:cursor-not-allowed max-lg:min-h-12 max-lg:justify-center lg:p-3.5",
              yes && "lg:col-span-2",
            )}
          >
            <span className="flex items-center gap-2.5 text-[16px]/[24px] font-semibold text-ink lg:text-[15px]/[22px]">
              {pending === "no" ? <Spinner className="size-5 lg:size-5" /> : <RadioMark checked={false} />}
              They said NO
            </span>
            <span className="hidden text-[13px]/[18px] font-medium text-muted [text-wrap:pretty] lg:block">
              Rejects the claim and flags it. The listing doesn&apos;t change.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
