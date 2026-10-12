"use client";

import * as React from "react";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { fmtRange } from "@/lib/admin/format";
import { Button } from "@/components/admin/ui/Button";
import { RadioCard } from "@/components/admin/ui/controls";
import { FieldError, TextInput } from "@/components/admin/ui/Field";
import { endPhrase, extensionEnd, extensionStart, type PlanItem } from "./plan-utils";

export type ExtendChoice = { months: number } | { endDate: string };

/**
 * Extend plan: 1 month / 3 months / pick an end date, continuing from the
 * old end date. Used in the desktop popover and the mobile sheet.
 */
export function ExtendPanel({
  item,
  today,
  onCancel,
  onSubmit,
  sheet = false,
}: {
  item: PlanItem;
  today: string;
  onCancel: () => void;
  /** Resolves with an error message, or null on success. */
  onSubmit: (choice: ExtendChoice) => Promise<string | null>;
  sheet?: boolean;
}) {
  const start = extensionStart(item, today);
  const one = extensionEnd(start, 1);
  const three = extensionEnd(start, 3);
  const [pick, setPick] = useState<"1" | "3" | "date">("1");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = `extend-${item.id}`;

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= start;
  const canSubmit = pick !== "date" || dateOk;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    const err = await onSubmit(pick === "date" ? { endDate: date } : { months: pick === "3" ? 3 : 1 });
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div className="flex flex-col">
      <div className="text-[17px]/[24px] font-bold text-ink">Extend {item.name}</div>
      <div className="num mb-3 text-[13px]/[18px] font-medium text-muted">
        {PLAN_LABEL[item.plan]} · {endPhrase(item, true)}
      </div>
      <div role="radiogroup" aria-label="New end date" className="flex flex-col gap-1.5">
        <RadioCard size="sm" name={name} value="1" checked={pick === "1"} onChange={() => setPick("1")} label="1 month" trailing={fmtRange(start, one)} />
        <RadioCard size="sm" name={name} value="3" checked={pick === "3"} onChange={() => setPick("3")} label="3 months" trailing={fmtRange(start, three)} />
        <RadioCard
          size="sm"
          name={name}
          value="date"
          checked={pick === "date"}
          onChange={() => setPick("date")}
          label="Pick an end date"
          trailing={<Calendar size={18} strokeWidth={1.75} className={pick === "date" ? "text-brand-700" : "text-muted"} aria-hidden="true" />}
        />
        {pick === "date" ? (
          <div className="flex flex-col gap-1.5 pt-1">
            <TextInput
              type="date"
              aria-label="New end date"
              value={date}
              min={start}
              onChange={(e) => setDate(e.target.value)}
              invalid={!!date && !dateOk}
              autoFocus
            />
            {date && !dateOk ? <FieldError>Pick a date after the plan&apos;s current end.</FieldError> : null}
          </div>
        ) : null}
      </div>
      <p className="mt-2.5 text-[13px]/[18px] font-medium text-muted [text-wrap:pretty]">
        Continues from the old end date so there&apos;s no gap. Change the start in Edit if they paid later.
      </p>
      {error ? <FieldError className="mt-2">{error}</FieldError> : null}
      <div className={sheet ? "mt-4 flex flex-col-reverse gap-2" : "mt-3.5 flex justify-end gap-2"}>
        <Button variant="secondary" onClick={onCancel} disabled={busy} fullWidth={sheet}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} loading={busy} loadingText="Extending…" disabled={!canSubmit} fullWidth={sheet}>
          Extend plan
        </Button>
      </div>
    </div>
  );
}
