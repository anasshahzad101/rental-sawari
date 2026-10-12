"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileInput, FilePlus2, Pencil, RotateCcw, UserCheck } from "lucide-react";
import type { FieldChange, VersionKind } from "@/lib/admin/types";
import { fmtDay, fmtDayShort, fmtTime, fmtWhen, pktDay, plural } from "@/lib/admin/format";
import { restoreVersionAction, undoVersionAction } from "@/app/(admin)/admin/_actions/listings";
import { Button } from "@/components/admin/ui/Button";
import { CompactNew, CompactOld } from "@/components/admin/ui/Diff";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";
import { cx } from "@/components/admin/ui/cx";
import type { IconComponent } from "@/components/admin/ui/icons";
import { changeRows, trimContext, unifiedWords, type FieldLabels, type HistoryRow } from "./rows";

export interface HistoryItem {
  id: number;
  createdAt: string;
  kind: VersionKind;
  actor: string;
  note: string;
  refId: number | null;
  changes: FieldChange[];
  /** Created / imported entries: what the listing started with. */
  created: { text: string; count: number } | null;
  /** The listing now → this version (what a restore would change). Empty for the newest. */
  restore: FieldChange[];
}

type Look = { icon: IconComponent; circle: string; chip: string };

const TEAL = "bg-brand-50 text-brand-700";
const GREEN = "bg-good-fill text-good-text";
const GREY = "bg-fill text-quiet-text";

const LOOK: Record<VersionKind, Look> = {
  edit: { icon: Pencil, circle: TEAL, chip: TEAL },
  plan: { icon: Pencil, circle: TEAL, chip: TEAL },
  create: { icon: Pencil, circle: TEAL, chip: TEAL },
  claim: { icon: UserCheck, circle: GREEN, chip: GREEN },
  request: { icon: FilePlus2, circle: TEAL, chip: TEAL },
  import: { icon: FileInput, circle: GREY, chip: GREY },
  restore: { icon: RotateCcw, circle: GREY, chip: GREY },
};

const LEGEND: Array<{ kind: VersionKind; label: string }> = [
  { kind: "edit", label: "Edited by you" },
  { kind: "claim", label: "Claim applied" },
  { kind: "request", label: "Created from listing request" },
  { kind: "import", label: "Imported" },
  { kind: "restore", label: "Restored" },
];

const MOBILE_FIRST = 4;
const ROWS_FIRST = 3;

const isCreated = (k: VersionKind) => k === "import" || k === "create" || k === "request";
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ── Rows ─────────────────────────────────────────────────────────────────

function Thumb({ src, kind }: { src: string | null; kind: "old" | "new" }) {
  if (!src) return <span className="text-quiet-text">No logo</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={kind === "old" ? "Old logo" : "New logo"}
      className={cx(
        "size-8 flex-none rounded-lg bg-white object-cover",
        kind === "old" ? "border border-bad-border opacity-70" : "border-2 border-good-solid",
      )}
    />
  );
}

function RowValue({ r }: { r: HistoryRow }) {
  switch (r.kind) {
    case "change":
      return (
        <>
          {r.old != null ? <CompactOld>{r.old}</CompactOld> : null}
          {r.old != null ? <ArrowRight size={16} strokeWidth={1.75} className="flex-none text-[#A8A29E]" aria-label="to" /> : null}
          {r.new != null ? <CompactNew>{r.new}</CompactNew> : r.old != null ? <span className="text-quiet-text">None</span> : null}
        </>
      );
    case "items":
      return (
        <>
          {r.added.map((t) => (
            <CompactNew key={`+${t}`}>+ {t}</CompactNew>
          ))}
          {r.removed.map((t) => (
            <CompactOld key={`-${t}`}>{t}</CompactOld>
          ))}
        </>
      );
    case "logo":
      return (
        <>
          <Thumb src={r.old} kind="old" />
          <ArrowRight size={16} strokeWidth={1.75} className="flex-none text-[#A8A29E]" aria-label="to" />
          <Thumb src={r.new} kind="new" />
        </>
      );
    case "text": {
      const parts = trimContext(unifiedWords(r.old, r.new));
      return (
        <span className="min-w-0 [text-wrap:pretty]">
          {parts.map((p, i) => {
            if (p.kind === "same") return <React.Fragment key={i}>{p.text}</React.Fragment>;
            const lead = p.text.match(/^\s*/)?.[0] ?? "";
            const trail = p.text.match(/\s*$/)?.[0] ?? "";
            // A removed run straight before its replacement needs a space between the marks.
            const gap = p.kind === "removed" && parts[i + 1]?.kind === "added" && !trail ? " " : "";
            return (
              <React.Fragment key={i}>
                {lead}
                <span
                  className={cx(
                    "rounded px-[3px]",
                    p.kind === "removed" ? "bg-bad-fill text-bad-text line-through" : "bg-good-fill font-semibold text-good-text",
                  )}
                >
                  {p.text.trim()}
                </span>
                {trail || gap}
              </React.Fragment>
            );
          })}
        </span>
      );
    }
    case "plain":
      return <span className="text-quiet-text">{r.text}</span>;
  }
}

/** Compact diff row: field (140 px, 600) then old → new; wraps under the field on mobile. */
function Row({ r, fieldWidth = 140 }: { r: HistoryRow; fieldWidth?: number }) {
  return (
    <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:gap-2">
      <span
        className="flex-none text-[13px]/[18px] font-semibold text-ink-2 lg:w-[var(--fw)] lg:text-[14px]/[22px] lg:text-ink"
        style={{ ["--fw" as string]: `${fieldWidth}px` }}
      >
        {r.field}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 lg:gap-x-2">
        <RowValue r={r} />
      </div>
    </div>
  );
}

function Rows({ rows }: { rows: HistoryRow[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, ROWS_FIRST);
  const hidden = rows.slice(ROWS_FIRST);
  return (
    <div className="num mt-2.5 flex flex-col gap-2 text-[14px]/[22px] font-medium text-ink-2 lg:mt-3 lg:gap-1.5 lg:border-t lg:border-fill lg:pt-3">
      {shown.map((r) => (
        <Row key={r.key} r={r} />
      ))}
      {hidden.length ? (
        <div className="text-muted">
          {all ? null : (
            <>
              + {hidden.length} more: {hidden.map((r) => r.field).join(", ")} ·{" "}
            </>
          )}
          <button type="button" onClick={() => setAll((a) => !a)} className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
            {all ? "Show less" : "Show all"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────

function refLink(it: HistoryItem): { href: string; label: string } | null {
  if (it.refId == null) return null;
  if (it.kind === "claim") return { href: `/admin/inbox/claims?id=${it.refId}`, label: "Open claim" };
  if (it.kind === "request") return { href: `/admin/inbox/requests?id=${it.refId}`, label: "Open request" };
  return null;
}

function Entry({
  it,
  labels,
  current,
  last,
  single,
  hiddenOnMobile,
  onRestore,
}: {
  it: HistoryItem;
  labels: FieldLabels;
  current: boolean;
  last: boolean;
  single: boolean;
  hiddenOnMobile: boolean;
  onRestore: () => void;
}) {
  const look = LOOK[it.kind] ?? LOOK.edit;
  const Icon = look.icon;
  const rows = useMemo<HistoryRow[]>(() => {
    if (isCreated(it.kind)) return it.created?.text ? [{ key: "created", field: "Created", kind: "plain", text: it.created.text }] : [];
    return changeRows(it.changes, labels);
  }, [it, labels]);
  const link = refLink(it);
  const note = single && it.created ? `${cap(it.note)}, ${plural(it.created.count, "field")}` : it.note || plural(it.changes.length, "field");

  return (
    <li className={cx("lg:grid lg:grid-cols-[40px_minmax(0,1fr)] lg:gap-4", hiddenOnMobile && "max-lg:hidden")}>
      <div className="hidden flex-col items-center lg:flex">
        <span className={cx("grid size-9 flex-none place-items-center rounded-full shadow-[0_0_0_4px_#FAFAF9]", look.circle)}>
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        {!last ? <span aria-hidden="true" className="w-0.5 flex-1 bg-line" /> : null}
      </div>
      <article className={cx("min-w-0 rounded-card border border-line bg-white px-4 py-3.5 lg:px-5 lg:py-[18px] lg:shadow-card", !last && "lg:mb-4")}>
        <div className="flex items-start gap-2.5 lg:gap-3">
          <span className={cx("grid size-8 flex-none place-items-center rounded-full lg:hidden", look.circle)}>
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col lg:gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px]/[22px] font-bold text-ink">{it.actor}</h3>
              {current ? (
                <span className="inline-flex h-[22px] items-center rounded-full border border-brand-200 bg-brand-50 px-2 text-[12px]/[16px] font-semibold text-brand-700">
                  Current version
                </span>
              ) : null}
            </div>
            <p className="num text-[13px]/[18px] font-medium text-muted">
              {fmtWhen(it.createdAt)}
              {note ? ` · ${note}` : ""}
              {link ? (
                <>
                  {" · "}
                  <Link href={link.href} className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                    {link.label}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          {!current ? (
            <Button variant="secondary" icon={RotateCcw} onClick={onRestore} className="hidden flex-none px-3.5 lg:inline-flex lg:text-[14px]/[20px]">
              Restore this version
            </Button>
          ) : null}
        </div>
        {!single && rows.length ? <Rows rows={rows} /> : null}
        {!current ? (
          <Button variant="secondary" icon={RotateCcw} onClick={onRestore} fullWidth className="mt-3 lg:hidden">
            Restore this version
          </Button>
        ) : null}
      </article>
    </li>
  );
}

/**
 * Listing › History: every version, newest first, with compact diff rows.
 * "Restore this version" asks first (listing the later changes it undoes);
 * the restore is saved as a new entry and the toast can undo it.
 */
export function HistoryList({
  listingId,
  listingName,
  items,
  labels,
}: {
  listingId: number;
  listingName: string;
  items: HistoryItem[];
  labels: FieldLabels;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<HistoryItem | null>(null);
  const [showAll, setShowAll] = useState(false);
  const single = items.length === 1;
  const older = Math.max(0, items.length - MOBILE_FIRST);

  const restoreRows = useMemo(() => (target ? changeRows(target.restore, labels) : []), [target, labels]);
  const tDay = target ? pktDay(target.createdAt) : "";

  const restore = async () => {
    if (!target) return;
    const day = fmtDayShort(pktDay(target.createdAt));
    let r: Awaited<ReturnType<typeof restoreVersionAction>>;
    try {
      r = await restoreVersionAction(listingId, target.id);
    } catch {
      r = { ok: false, error: "Couldn't restore. Check the connection and try again." };
    }
    if (!r.ok) {
      toast({ message: r.error, icon: null });
      return;
    }
    router.refresh();
    const vid = r.versionId;
    if (vid == null) {
      toast({ message: "Nothing to restore. The listing already looks like that version.", icon: null });
      return;
    }
    toast({
      message: `Restored the version from ${day}`,
      icon: RotateCcw,
      undo: async () => {
        let u: Awaited<ReturnType<typeof undoVersionAction>>;
        try {
          u = await undoVersionAction(vid);
        } catch {
          u = { ok: false, error: "Couldn't undo. Try again." };
        }
        if (!u.ok) toast({ message: u.error, icon: null });
        router.refresh();
      },
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:gap-6">
      {/* Legend */}
      <div className="hidden flex-wrap items-center gap-2 text-[13px]/[18px] font-medium text-muted lg:flex">
        <span className="mr-1">Entry types:</span>
        {LEGEND.map((l) => {
          const look = LOOK[l.kind];
          const Icon = look.icon;
          return (
            <span key={l.kind} className={cx("inline-flex h-[26px] items-center gap-[5px] rounded-full px-2.5 font-semibold", look.chip)}>
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              {l.label}
            </span>
          );
        })}
      </div>

      <div className="flex max-w-[920px] flex-col gap-3 lg:gap-4">
        <ol className="flex flex-col gap-3 lg:gap-0" aria-label="Changes, newest first">
          {items.map((it, i) => (
            <Entry
              key={it.id}
              it={it}
              labels={labels}
              current={i === 0}
              last={i === items.length - 1}
              single={single}
              hiddenOnMobile={!showAll && i >= MOBILE_FIRST}
              onRestore={() => setTarget(it)}
            />
          ))}
        </ol>

        {older > 0 && !showAll ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex h-12 items-center justify-center text-[15px]/[22px] font-semibold text-brand-700 active:bg-fill lg:hidden"
          >
            Show {plural(older, "older entry", "older entries")}
          </button>
        ) : null}

        {single ? (
          <div className="flex flex-col items-center gap-1 rounded-card border-[1.5px] border-dashed border-line-strong p-6 text-center">
            <span className="text-[15px]/[22px] font-bold text-ink">
              {items[0].kind === "import" ? "No changes since it was imported" : "No changes since it was added"}
            </span>
            <span className="text-[15px]/[24px] text-muted">Edits, claims and restores will show here.</span>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        tone="info"
        icon={RotateCcw}
        size="md"
        title={target ? `Restore the version from ${fmtDayShort(tDay)}?` : ""}
        body={
          target
            ? restoreRows.length
              ? `${listingName} goes back to how it was on ${fmtDay(tDay)}, ${fmtTime(target.createdAt)}. This undoes ${plural(restoreRows.length, "later change")}:`
              : `${listingName} already looks the way it did on ${fmtDay(tDay)}, ${fmtTime(target.createdAt)}, so nothing would change.`
            : null
        }
        actionLabel="Restore this version"
        loadingLabel="Restoring…"
        actionDisabled={!restoreRows.length}
        onConfirm={restore}
      >
        {restoreRows.length ? (
          <div className="-mt-1">
            <div className="num flex flex-col gap-1.5 rounded-[10px] bg-page px-3 py-2.5 text-[14px]/[22px] font-medium text-ink-2">
              {restoreRows.slice(0, 6).map((r) => (
                <Row key={r.key} r={r} fieldWidth={110} />
              ))}
              {restoreRows.length > 6 ? (
                <div className="text-muted">
                  + {restoreRows.length - 6} more: {restoreRows.slice(6).map((r) => r.field).join(", ")}
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-[13px]/[18px] font-medium text-muted">The restore is saved in History too, so you can undo it later.</p>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
