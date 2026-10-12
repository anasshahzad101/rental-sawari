"use client";

import * as React from "react";
import { useId, useState } from "react";
import { CLAIM_REJECT_REASONS } from "@/lib/admin/constants";
import { Button } from "@/components/admin/ui/Button";
import { Radio } from "@/components/admin/ui/controls";
import { Textarea } from "@/components/admin/ui/Field";
import { Modal } from "@/components/admin/ui/Modal";

export interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  listingName: string;
  /** Resolves true when the claim was rejected (the dialog then closes). */
  onReject: (reason: string, note: string) => Promise<boolean>;
}

/**
 * "Reject this claim?" — reasons (Couldn't confirm ownership / Changes look
 * wrong / Other) + an optional note, Cancel + **Reject claim**. A centred
 * 480 px card on desktop, a bottom sheet on mobile.
 */
export function RejectDialog({ open, onClose, listingName, onReject }: RejectDialogProps) {
  const [reason, setReason] = useState<string>(CLAIM_REJECT_REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const name = useId();

  const close = () => {
    if (busy) return;
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    try {
      const ok = await onReject(reason, note.trim());
      if (ok) {
        setNote("");
        setReason(CLAIM_REJECT_REASONS[0]);
        onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} dismissible={!busy} size="md" aria-label="Reject this claim?">
      <h2 className="text-dialog-title text-ink">
        Reject this claim?
      </h2>
      <p className="mt-1.5 text-body-m text-ink-2 [text-wrap:pretty] lg:text-body">{listingName} stays exactly as it is.</p>
      <div className="mt-3.5 text-[13px]/[18px] font-semibold text-ink-2">Why?</div>
      <div role="radiogroup" aria-label="Why?" className="flex flex-col">
        {CLAIM_REJECT_REASONS.map((r) => (
          <Radio key={r} name={name} value={r} checked={reason === r} onChange={() => setReason(r)} label={r} />
        ))}
      </div>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        aria-label="Note (optional)"
        maxLength={2000}
        className="mt-1.5 min-h-16 lg:text-[15px]/[22px]"
      />
      <div className="mt-5 flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
        <Button variant="destructive" loading={busy} loadingText="Rejecting…" onClick={submit} fullWidth className="lg:w-auto">
          Reject claim
        </Button>
        <Button variant="secondary" onClick={close} disabled={busy} fullWidth className="lg:w-auto">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
