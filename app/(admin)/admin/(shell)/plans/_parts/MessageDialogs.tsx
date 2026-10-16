"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { Banner } from "@/components/admin/ui/Banner";
import { Modal } from "@/components/admin/ui/Modal";
import { Skeleton } from "@/components/admin/ui/Skeleton";
import { WhatsAppPreview } from "@/components/admin/ui/WhatsAppPreview";
import { monthlyMessageAction } from "../../../_actions/plans";
import { DaysPill } from "./bits";
import { endPhrase, reminderText, type MonthOption, type PlanItem } from "./plan-utils";

/** Dialog title 800 22/28 + close (the kit's Modal title row has no sub line slot). */
function DialogHead({ title, onClose, children }: { title: string; onClose: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <h2 className="min-w-0 flex-1 text-dialog-title text-ink">{title}</h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mr-2 grid size-11 flex-none place-items-center rounded-control text-quiet-text hover:bg-fill lg:size-10"
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  );
}

/** Renewal reminder: the WhatsApp text with last-30-day numbers and the plan price. */
export function ReminderDialog({ item, onClose }: { item: PlanItem | null; onClose: () => void }) {
  const open = !!item;
  return (
    <Modal open={open} onClose={onClose} size="md" className="lg:max-w-[520px]" aria-label="Renewal reminder">
      {item ? (
        <>
          <DialogHead title="Renewal reminder" onClose={onClose}>
            <div className="num mt-1.5 flex flex-wrap items-center gap-2 text-[13px]/[18px] font-medium text-muted">
              {item.planEnd ? `${PLAN_LABEL[item.plan]} ${endPhrase(item, true)}` : `${PLAN_LABEL[item.plan]} · no end date`}
              <DaysPill days={item.daysLeft} size="sm" />
            </div>
          </DialogHead>
          <WhatsAppPreview className="mt-3.5" toName={item.name} toNumber={item.whatsapp} message={reminderText(item)} />
        </>
      ) : null}
    </Modal>
  );
}

/** Monthly stats message with a month picker (text from monthlyMessageAction). */
export function MonthlyDialog({
  item,
  months,
  onClose,
}: {
  item: PlanItem | null;
  months: MonthOption[];
  onClose: () => void;
}) {
  const open = !!item;
  const [month, setMonth] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  async function load(id: number, m?: string) {
    const n = ++seq.current;
    setLoading(true);
    setError(null);
    const r = await monthlyMessageAction(id, m || undefined);
    if (n !== seq.current) return;
    setLoading(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setText(r.text);
    setMonth(r.month);
  }

  useEffect(() => {
    if (!item) return;
    setText("");
    setMonth("");
    void load(item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  // The server picks last month by default; make sure it is in the list.
  const options = month && !months.some((o) => o.value === month) ? [...months, { value: month, label: month }] : months;

  return (
    <Modal open={open} onClose={onClose} size="md" className="lg:max-w-[520px]" aria-label="Monthly stats message">
      {item ? (
        <>
          <DialogHead title="Monthly stats message" onClose={onClose}>
            <div className="mt-3 flex items-center gap-2">
              <label className="relative inline-flex h-11 items-center rounded-full border border-line bg-white hover:bg-fill lg:h-9">
                <span className="sr-only">Month</span>
                <select
                  value={month}
                  disabled={!month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    void load(item.id, e.target.value);
                  }}
                  className="h-full cursor-pointer appearance-none rounded-full bg-transparent pl-3 pr-8 text-[14px]/[20px] font-semibold text-ink outline-none disabled:cursor-progress"
                >
                  {!month ? <option value="">Loading…</option> : null}
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-2.5 text-ink" aria-hidden="true" />
              </label>
            </div>
          </DialogHead>
          {error ? (
            <Banner tone="error" title="Couldn't build the message." className="mt-3.5">
              {error}
            </Banner>
          ) : loading || !text ? (
            <div className="mt-3.5 flex flex-col gap-3" aria-busy="true" aria-label="Loading the message">
              <Skeleton className="h-4 w-48 rounded-md" />
              <div className="rounded-control lg:bg-fill lg:p-4">
                <Skeleton className="h-[120px] rounded-[14px_14px_4px_14px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-12 w-full rounded-control lg:h-10 lg:w-44" shimmer={false} />
                <Skeleton className="h-12 w-full rounded-control lg:h-10 lg:w-36" shimmer={false} />
              </div>
            </div>
          ) : (
            <WhatsAppPreview className="mt-3.5" toName={item.name} toNumber={item.whatsapp} message={text} />
          )}
        </>
      ) : null}
    </Modal>
  );
}
