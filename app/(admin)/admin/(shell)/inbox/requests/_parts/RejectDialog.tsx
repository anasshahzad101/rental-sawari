"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { REQUEST_REJECT_REASONS } from "@/lib/admin/constants";
import { Button } from "@/components/admin/ui/Button";
import { Radio } from "@/components/admin/ui/controls";
import { Textarea } from "@/components/admin/ui/Field";
import { Modal } from "@/components/admin/ui/Modal";

export interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  /** Pre-selected reason ("Duplicate" for a possible duplicate). */
  defaultReason?: string | null;
  onReject: (reason: string, note: string) => Promise<boolean>;
}

/** "Reject {name}?" with a reason (radios) and a private note. Mobile: bottom sheet. */
export function RejectDialog({ open, onClose, name, defaultReason, onReject }: RejectDialogProps) {
  const [reason, setReason] = useState<string>(defaultReason ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(defaultReason ?? "");
      setNote("");
    }
  }, [open, defaultReason]);

  const submit = async () => {
    if (!reason || busy) return;
    setBusy(true);
    const ok = await onReject(reason, note);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} dismissible={!busy} size="md" aria-label={`Reject ${name}?`}>
      <div className="text-dialog-title text-ink">Reject {name}?</div>
      <p className="mt-1.5 text-body-m text-ink-2 lg:text-body">The request moves to Rejected. Nothing on the site changes.</p>
      <div className="mt-4 text-[13px]/[18px] font-semibold text-ink-2">Why?</div>
      <div role="radiogroup" aria-label="Why?" className="flex flex-col">
        {REQUEST_REJECT_REASONS.map((r) => (
          <Radio key={r} name="reject-reason" value={r} checked={reason === r} onChange={() => setReason(r)} label={r} size="md" className="max-lg:min-h-12" />
        ))}
      </div>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional, only you see it)"
        aria-label="Note (optional, only you see it)"
        className="mt-2 min-h-[72px]"
        rows={2}
      />
      <div className="mt-5 flex flex-col gap-2 lg:flex-row-reverse lg:justify-start">
        <Button variant="destructive" onClick={submit} loading={busy} loadingText="Rejecting…" disabled={!reason} fullWidth className="lg:w-auto">
          Reject request
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={busy} fullWidth className="lg:w-auto">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
