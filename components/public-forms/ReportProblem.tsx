"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { CircleCheck, Flag, X } from "lucide-react";
import { REPORT_REASON_LABEL, REPORT_REASONS } from "@/lib/admin/constants";
import type { ReportReason } from "@/lib/admin/types";
import { RadioMark } from "@/components/admin/ui/controls";
import { cx } from "@/components/admin/ui/cx";
import { FieldError, PhoneInput, Textarea } from "@/components/admin/ui/Field";
import { useIsDesktop } from "@/components/admin/ui/hooks";
import { Modal } from "@/components/admin/ui/Modal";
import { PublicButton } from "./PublicButton";
import { Honeypot, postJson, SuccessMark, useFormClock } from "./shared";

/**
 * Page 14 — "Report a problem with this listing": a quiet link at the bottom
 * of the profile that opens a dialog (a bottom sheet on mobile). Only the
 * reason is required. Opens by itself when the page URL has ?report=1.
 */
export function ReportProblem({ slug, name, city, className }: { slug: string; name: string; city: string; className?: string }) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { elapsed, restart } = useFormClock();

  const show = () => {
    restart();
    setOpen(true);
  };

  // ?report=1 (from the claim flow's "I'm a customer…") opens the dialog.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("report") === "1") {
      url.searchParams.delete("report");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      show();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (sending) return;
    setOpen(false);
    if (sent) {
      setSent(false);
      setReason(null);
      setDetails("");
      setWhatsapp(null);
    }
    setError(null);
  };

  const send = async () => {
    if (!reason || sending) return;
    setSending(true);
    setError(null);
    const r = await postJson<{ ok?: boolean; error?: string }>("/api/reports", {
      slug,
      reason,
      details: details.trim(),
      whatsapp: whatsapp ?? "",
      hp,
      elapsedMs: elapsed(),
    });
    setSending(false);
    if (r.data?.ok) setSent(true);
    else setError(r.data?.error || "Your report couldn't be sent. Please try again.");
  };

  return (
    <>
      <div className={cx("relative flex items-center gap-1.5 border-t border-line pt-3.5 text-[14px]/[20px] font-medium text-quiet-text", className)}>
        {/* Kept outside the dialog so its focus trap never lands on it. */}
        <Honeypot value={hp} onChange={setHp} />
        <Flag size={15} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
        <button type="button" onClick={show} className="text-quiet-text underline underline-offset-2 hover:text-ink" aria-haspopup="dialog">
          Report a problem
        </button>
        <span className="text-[#A8A29E]">with this listing</span>
      </div>

      <Modal
        open={open}
        onClose={close}
        dismissible={!sending}
        aria-label="Report a problem"
        className={isDesktop ? cx("max-w-[520px] p-7", sent && "px-7 pb-7 pt-10") : "pb-[max(30px,env(safe-area-inset-bottom))]"}
      >
        {sent ? (
          <div className={cx("flex flex-col items-center gap-2.5 text-center", !isDesktop && "-mt-1 pt-2")}>
            <SuccessMark icon={CircleCheck} size="md" />
            <div className="mt-1.5 text-[22px]/[28px] font-extrabold text-ink">Thank you. We&apos;ll look into it.</div>
            <PublicButton variant="secondary" fullWidth onClick={close} className={isDesktop ? "mt-3" : "mt-4"}>
              Close
            </PublicButton>
          </div>
        ) : (
          <form
            noValidate
            className={cx("relative", !isDesktop && "-mt-1")}
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-[22px]/[28px] font-extrabold tracking-[-0.01em] text-ink">Report a problem</h2>
                <p className="text-[13px]/[18px] font-medium text-muted lg:text-[14px]/[20px]">
                  With {name}
                  <span className="max-lg:hidden"> · {city}</span>
                </p>
              </div>
              {isDesktop ? (
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="-mr-2 -mt-1.5 grid size-10 flex-none place-items-center rounded-control text-quiet-text hover:bg-fill"
                >
                  <X size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <fieldset className="mt-2.5 lg:mt-[18px]">
              <legend className="sr-only text-[13px]/[18px] font-semibold text-ink-2 lg:not-sr-only lg:block">What&apos;s wrong?</legend>
              <div className="flex flex-col lg:mt-1">
                {REPORT_REASONS.map((r, i) => {
                  const on = reason === r;
                  return (
                    <label
                      key={r}
                      className={cx(
                        "relative flex h-12 cursor-pointer items-center gap-3 text-[16px]/[24px] text-ink",
                        on ? "font-semibold" : "font-medium",
                        // Mobile: divided rows · Desktop: rounded rows that tint when chosen.
                        i < REPORT_REASONS.length - 1 && "border-b border-fill lg:border-0",
                        "lg:-mx-3 lg:rounded-control lg:px-3",
                        on ? "lg:bg-brand-50" : "lg:hover:bg-page",
                      )}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={on}
                        onChange={() => {
                          setReason(r);
                          setError(null);
                        }}
                        className="peer absolute size-px opacity-0"
                      />
                      <span className="rounded-full peer-focus-visible:shadow-focus">
                        <RadioMark checked={on} size={isDesktop ? "md" : "lg"} />
                      </span>
                      {REPORT_REASON_LABEL[r]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-2.5 flex flex-col gap-1.5 lg:mt-3">
              <label htmlFor="report-details" className="hidden text-[13px]/[18px] font-semibold text-ink-2 lg:block">
                Details <span className="font-medium text-muted">· optional</span>
              </label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What happened? Anything that helps us check."
                aria-label="Details (optional)"
                maxLength={2000}
                className="min-h-16 lg:min-h-[76px] lg:text-[15px]/[22px]"
              />
            </div>

            <div className="mt-2.5 flex flex-col gap-1.5 lg:mt-3">
              <label htmlFor="report-whatsapp" className="text-[13px]/[18px] font-semibold text-ink-2">
                Your WhatsApp{" "}
                <span className="font-medium text-muted">
                  · <span className="hidden lg:inline">optional, </span>only if you want a reply
                </span>
              </label>
              <PhoneInput
                id="report-whatsapp"
                value={whatsapp}
                onChange={(n) => setWhatsapp(n)}
                placeholder={isDesktop ? "300 1234567" : "Optional"}
              />
            </div>

            {error ? <FieldError className="mt-3">{error}</FieldError> : null}

            <div className="mt-3.5 flex flex-col gap-2 lg:mt-[22px] lg:flex-row lg:justify-end">
              {isDesktop ? (
                <PublicButton variant="secondary" onClick={close} disabled={sending}>
                  Cancel
                </PublicButton>
              ) : null}
              <PublicButton
                type="submit"
                disabled={!reason}
                loading={sending}
                loadingText="Sending…"
                fullWidth={!isDesktop}
                className="lg:px-[22px]"
              >
                Send report
              </PublicButton>
            </div>
            {!reason ? (
              <p className="mt-1.5 text-center text-[13px]/[18px] font-medium text-muted lg:text-right">Choose a reason to send</p>
            ) : null}
          </form>
        )}
      </Modal>
    </>
  );
}
