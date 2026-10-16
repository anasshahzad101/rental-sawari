"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";
import { ArrowRight, ChevronsUpDown } from "lucide-react";
import { cx } from "./cx";
import { Checkbox } from "./controls";

// ── Word diff ────────────────────────────────────────────────────────────

export type DiffPart = { text: string; kind: "same" | "removed" | "added" };

function tokenize(s: string): string[] {
  return s.match(/\s+|[^\s.,;:!?()]+|[.,;:!?()]/g) ?? [];
}

/**
 * Word-level diff (LCS over words, spaces and punctuation). Returns the old
 * text as same/removed parts and the new text as same/added parts.
 */
export function wordDiff(oldText: string, newText: string): { old: DiffPart[]; new: DiffPart[] } {
  const a = tokenize(oldText);
  const b = tokenize(newText);
  const n = a.length;
  const m = b.length;
  if (n * m > 400_000) {
    return { old: [{ text: oldText, kind: "removed" }], new: [{ text: newText, kind: "added" }] };
  }
  // Weighted LCS: long words anchor the alignment, spaces barely count, so
  // "Islamabad and Rawalpindi" → "Islamabad, Rawalpindi and Murree" keeps
  // "Rawalpindi" and marks "and" (not the other way round).
  const weight = (t: string) => (/^\s+$/.test(t) ? 1 : /^[.,;:!?()]$/.test(t) ? 4 : t.length * 10);
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + weight(a[i]) : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const oldParts: DiffPart[] = [];
  const newParts: DiffPart[] = [];
  const push = (list: DiffPart[], text: string, kind: DiffPart["kind"]) => {
    const last = list[list.length - 1];
    if (last && last.kind === kind) last.text += text;
    else list.push({ text, kind });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j] && dp[i][j] === dp[i + 1][j + 1] + weight(a[i])) {
      push(oldParts, a[i], "same");
      push(newParts, b[j], "same");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(oldParts, a[i++], "removed");
    } else {
      push(newParts, b[j++], "added");
    }
  }
  while (i < n) push(oldParts, a[i++], "removed");
  while (j < m) push(newParts, b[j++], "added");
  // A lone space between two changed runs reads better inside the mark.
  const tidy = (parts: DiffPart[], kind: DiffPart["kind"]) => {
    for (let k = 1; k < parts.length - 1; k++) {
      if (parts[k].kind === "same" && /^\s+$/.test(parts[k].text) && parts[k - 1].kind === kind && parts[k + 1].kind === kind) {
        parts[k - 1].text += parts[k].text + parts[k + 1].text;
        parts.splice(k, 2);
        k--;
      }
    }
    return parts;
  };
  return { old: tidy(oldParts, "removed"), new: tidy(newParts, "added") };
}

/** Renders word-diff parts with removed words red/struck and added words green 600. */
export function DiffWords({ parts, muted }: { parts: DiffPart[]; muted?: boolean }) {
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === "same") return <React.Fragment key={i}>{p.text}</React.Fragment>;
        const lead = p.text.match(/^\s*/)?.[0] ?? "";
        const trail = p.text.match(/\s*$/)?.[0] ?? "";
        const core = p.text.slice(lead.length, p.text.length - trail.length);
        return (
          <React.Fragment key={i}>
            {lead}
            <span
              className={cx(
                "rounded px-[3px] py-px",
                muted
                  ? "bg-fill text-muted"
                  : p.kind === "removed"
                    ? "bg-bad-fill text-bad-text line-through"
                    : "bg-good-fill font-semibold text-good-text",
              )}
            >
              {core}
            </span>
            {trail}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ── Chips ────────────────────────────────────────────────────────────────

const MutedContext = createContext(false);

/** Old value: #B91C1C on #FEF2F2, struck through, padding 2 8, radius 8. */
export function DiffOld({ children, className }: { children: React.ReactNode; className?: string }) {
  const muted = useContext(MutedContext);
  return (
    <span
      className={cx(
        "num inline-block rounded-lg px-2 py-0.5 font-medium",
        muted ? "bg-fill text-muted" : "bg-bad-fill text-bad-text line-through",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** New value: #15803D 600 on #F0FDF4. */
export function DiffNew({ children, className }: { children: React.ReactNode; className?: string }) {
  const muted = useContext(MutedContext);
  return (
    <span
      className={cx(
        "num inline-block rounded-lg px-2 py-0.5",
        muted ? "bg-fill font-medium text-muted" : "bg-good-fill font-semibold text-good-text",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Solid green "Added" / red "Removed" pill (22 px, white 700 12). */
export function DiffTag({ kind }: { kind: "added" | "removed" }) {
  return (
    <span
      className={cx(
        "inline-flex h-[22px] flex-none items-center rounded-full px-2 text-[12px]/[16px] font-bold text-white",
        kind === "added" ? "bg-good-solid" : "bg-bad-solid",
      )}
    >
      {kind === "added" ? "Added" : "Removed"}
    </span>
  );
}

// ── Rows ─────────────────────────────────────────────────────────────────

export type DiffKind = "changed" | "added" | "removed" | "text";

export interface DiffRowData {
  key: string;
  /** Field name ("Phone", "Honda Civic"). */
  field: React.ReactNode;
  /** Small line under the field ("Car · price changed"). */
  sub?: React.ReactNode;
  kind: DiffKind;
  /** Rendered old value. Strings are wrapped in a red struck chip. */
  old?: React.ReactNode;
  /** Rendered new value. Strings are wrapped in a green chip. */
  new?: React.ReactNode;
  /** For kind "text": the raw texts, word-diffed. */
  oldText?: string;
  newText?: string;
  /** Tick state; rows without `onTick` have no tick box. */
  ticked?: boolean;
  onTick?: (ticked: boolean) => void;
  /** Note next to the "Removed" pill (default "Taken off the listing"). */
  removedNote?: React.ReactNode;
  /** Mobile tag for changed rows (default "Changed"). */
  tag?: React.ReactNode;
}

const wrapOld = (v: React.ReactNode) => (typeof v === "string" || typeof v === "number" ? <DiffOld>{v}</DiffOld> : v);
const wrapNew = (v: React.ReactNode) => (typeof v === "string" || typeof v === "number" ? <DiffNew>{v}</DiffNew> : v);

function rowCells(r: DiffRowData, unticked: boolean) {
  const nothing = <span className="text-[16px]/[24px] font-medium text-[#A8A29E] lg:text-[15px]/[24px]">Not on the listing</span>;
  if (r.kind === "text") {
    const d = wordDiff(r.oldText ?? "", r.newText ?? "");
    return {
      old: (
        <span className="text-[16px]/[26px] text-ink-2 [text-wrap:pretty] lg:text-[15px]/[26px]">
          <DiffWords parts={d.old} muted={unticked} />
        </span>
      ),
      new: (
        <span className="text-[16px]/[26px] text-ink-2 [text-wrap:pretty] lg:text-[15px]/[26px]">
          <DiffWords parts={d.new} muted={unticked} />
        </span>
      ),
    };
  }
  if (r.kind === "added") {
    return {
      old: r.old ?? nothing,
      new: (
        <span className="flex flex-wrap items-center gap-2">
          {wrapNew(r.new)}
          <DiffTag kind="added" />
        </span>
      ),
    };
  }
  if (r.kind === "removed") {
    return {
      old: wrapOld(r.old),
      new: (
        <span className="flex flex-wrap items-center gap-2">
          <DiffTag kind="removed" />
          <span className="text-[13px]/[18px] font-medium text-muted">{r.removedNote ?? "Taken off the listing"}</span>
        </span>
      ),
    };
  }
  return { old: wrapOld(r.old), new: wrapNew(r.new) };
}

export interface DiffTableProps {
  rows: DiffRowData[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Header actions ("Tick all · Untick all"). */
  actions?: React.ReactNode;
  oldLabel?: React.ReactNode;
  newLabel?: React.ReactNode;
  mobileOldLabel?: React.ReactNode;
  mobileNewLabel?: React.ReactNode;
  /** Field column width, 120–168 (default 168). */
  fieldWidth?: number;
  /** Names of unchanged fields for the collapsed footer. */
  unchanged?: string[];
  /** Rows shown when "Show" is pressed. */
  unchangedRows?: Array<{ key: string; field: React.ReactNode; value: React.ReactNode }>;
  /** Wrap the desktop table in a card (default true). */
  card?: boolean;
  className?: string;
}

/**
 * Current against requested. Desktop: grid `28px 168px 1fr 1fr`, 56 px rows.
 * Mobile: each change is a card with NOW / REQUESTED.
 */
export function DiffTable({
  rows,
  title,
  subtitle,
  actions,
  oldLabel = "Current listing",
  newLabel = "Requested",
  mobileOldLabel = "Now",
  mobileNewLabel = "Requested",
  fieldWidth = 168,
  unchanged,
  unchangedRows,
  card = true,
  className,
}: DiffTableProps) {
  const [showUnchanged, setShowUnchanged] = useState(false);
  const cols = { gridTemplateColumns: `28px ${fieldWidth}px minmax(0,1fr) minmax(0,1fr)` };
  const n = unchanged?.length ?? unchangedRows?.length ?? 0;

  const footer = (mobile: boolean) =>
    n > 0 ? (
      <div
        className={cx(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]/[22px] font-medium text-muted",
          mobile ? "min-h-12 px-1" : "min-h-[52px] px-6 py-2",
        )}
      >
        <ChevronsUpDown size={18} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
        <span>
          {n} {n === 1 ? "field" : "fields"} unchanged
        </span>
        <span className="text-[#A8A29E]">·</span>
        <button type="button" onClick={() => setShowUnchanged((s) => !s)} className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          {showUnchanged ? "Hide" : "Show"}
        </button>
        {!mobile && unchanged?.length && !showUnchanged ? (
          <span className="ml-2 text-[13px]/[18px] font-medium text-[#A8A29E]">{unchanged.join(", ")}</span>
        ) : null}
      </div>
    ) : null;

  const unchangedList = (mobile: boolean) =>
    showUnchanged && unchangedRows?.length ? (
      <div className={cx("flex flex-col", mobile ? "gap-2" : "gap-0")}>
        {unchangedRows.map((u) =>
          mobile ? (
            <div key={u.key} className="flex flex-col gap-1 rounded-card border border-line bg-white p-4">
              <span className="text-overline uppercase text-muted">{u.field}</span>
              <span className="text-[16px]/[24px] font-medium text-quiet-text">{u.value}</span>
            </div>
          ) : (
            <div key={u.key} className="grid min-h-[52px] items-center gap-4 border-b border-fill px-6 py-2" style={cols}>
              <span />
              <span className="text-[15px]/[22px] font-medium text-muted">{u.field}</span>
              <span className="text-[15px]/[22px] font-medium text-quiet-text">{u.value}</span>
              <span className="text-[13px]/[18px] font-medium text-[#A8A29E]">Unchanged</span>
            </div>
          ),
        )}
      </div>
    ) : null;

  return (
    <div className={className}>
      {/* Desktop */}
      <div className={cx("hidden lg:block", card && "overflow-hidden rounded-card border border-line bg-white shadow-card")}>
        {title || actions ? (
          <div className="flex items-center justify-between gap-4 px-6 pb-4 pt-5">
            <div>
              {title ? <div className="text-card-title text-ink">{title}</div> : null}
              {subtitle ? <div className="num text-label text-muted">{subtitle}</div> : null}
            </div>
            {actions ? <div className="flex items-center gap-4 text-[14px]/[20px] font-semibold">{actions}</div> : null}
          </div>
        ) : null}
        <div className="text-overline uppercase text-muted grid h-10 items-center gap-4 border-y border-line bg-page px-6" style={cols}>
          <span />
          <span>Field</span>
          <span>{oldLabel}</span>
          <span>{newLabel}</span>
        </div>
        {rows.map((r) => (
          <DiffRowDesktop key={r.key} row={r} fieldWidth={fieldWidth} />
        ))}
        {unchangedList(false)}
        {footer(false)}
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 lg:hidden">
        {title ? (
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-card-title-m text-ink">{title}</div>
              {subtitle ? <div className="num text-label text-muted">{subtitle}</div> : null}
            </div>
            {actions ? <div className="flex items-center gap-3 text-[14px]/[20px] font-semibold">{actions}</div> : null}
          </div>
        ) : null}
        {rows.map((r) => (
          <DiffRowCard key={r.key} row={r} oldLabel={mobileOldLabel} newLabel={mobileNewLabel} />
        ))}
        {unchangedList(true)}
        {footer(true)}
      </div>
    </div>
  );
}

const tickLabel = (r: DiffRowData) => `Apply ${typeof r.field === "string" ? r.field : "this change"}`;

/** One desktop diff row (grid `28px {fieldWidth}px 1fr 1fr`). */
export function DiffRowDesktop({ row: r, fieldWidth = 168, className }: { row: DiffRowData; fieldWidth?: number; className?: string }) {
  const tickable = !!r.onTick;
  const unticked = tickable && !r.ticked;
  const cells = rowCells(r, unticked);
  return (
    <MutedContext.Provider value={unticked}>
      <div
        className={cx(
          "grid min-h-14 gap-4 border-b border-fill px-6 text-[15px]/[24px]",
          r.kind === "text" ? "items-start py-4" : "items-center py-2.5",
          unticked && "bg-page",
          className,
        )}
        style={{ gridTemplateColumns: `28px ${fieldWidth}px minmax(0,1fr) minmax(0,1fr)` }}
      >
        <span className={cx(r.kind === "text" && "mt-0.5")}>
          {tickable ? <Checkbox checked={!!r.ticked} onChange={r.onTick} aria-label={tickLabel(r)} /> : null}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className={cx("text-[15px]/[22px] font-semibold", unticked ? "text-muted" : "text-ink")}>{r.field}</span>
          {unticked ? (
            <span className="text-[13px]/[18px] font-medium text-muted">Unticked · won&apos;t apply</span>
          ) : r.sub ? (
            <span className="text-[13px]/[18px] font-medium text-muted">{r.sub}</span>
          ) : null}
        </span>
        <span className={cx("min-w-0 font-medium text-ink-2", unticked && typeof r.old !== "string" && r.kind !== "text" && "opacity-60")}>
          {cells.old}
        </span>
        <span className={cx("min-w-0 font-medium text-ink-2", unticked && typeof r.new !== "string" && r.kind !== "text" && "opacity-60")}>
          {cells.new}
        </span>
      </div>
    </MutedContext.Provider>
  );
}

/** One mobile diff card: tick + field + tag, then NOW / REQUESTED. */
export function DiffRowCard({
  row: r,
  oldLabel = "Now",
  newLabel = "Requested",
  className,
}: {
  row: DiffRowData;
  oldLabel?: React.ReactNode;
  newLabel?: React.ReactNode;
  className?: string;
}) {
  const tickable = !!r.onTick;
  const unticked = tickable && !r.ticked;
  const cells = rowCells(r, unticked);
  return (
    <MutedContext.Provider value={unticked}>
      <div className={cx("flex flex-col gap-3 rounded-card border border-line bg-white p-4 shadow-card", className)}>
        <div className="flex items-center gap-3">
          {tickable ? <Checkbox size="lg" checked={!!r.ticked} onChange={r.onTick} aria-label={tickLabel(r)} /> : null}
          <span className={cx("min-w-0 flex-1 text-[16px]/[22px] font-bold", unticked ? "text-muted" : "text-ink")}>{r.field}</span>
          {r.kind === "added" ? (
            <DiffTag kind="added" />
          ) : r.kind === "removed" ? (
            <DiffTag kind="removed" />
          ) : (
            <span className="text-[13px]/[18px] font-medium text-muted">{r.tag ?? "Changed"}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-overline uppercase text-muted">{oldLabel}</span>
          <span className={cx("text-[16px]/[24px] font-medium text-ink-2", unticked && r.kind !== "text" && typeof r.old !== "string" && "opacity-60")}>
            {r.kind === "removed" && unticked ? r.old : cells.old}
          </span>
        </div>
        {r.kind !== "removed" ? (
          <div className="flex flex-col gap-1">
            <span className="text-overline uppercase text-muted">{newLabel}</span>
            <span className={cx("text-[16px]/[24px] font-medium text-ink-2", unticked && r.kind !== "text" && typeof r.new !== "string" && "opacity-60")}>
              {r.kind === "added" ? wrapNew(r.new) : cells.new}
            </span>
          </div>
        ) : null}
        {unticked ? <div className="text-[13px]/[18px] font-medium text-muted">Unticked · won&apos;t apply</div> : null}
      </div>
    </MutedContext.Provider>
  );
}

/** A single change: the desktop grid row at ≥1024 px, the NOW / REQUESTED card below. */
export function DiffRow({ row, fieldWidth, oldLabel, newLabel }: { row: DiffRowData; fieldWidth?: number; oldLabel?: React.ReactNode; newLabel?: React.ReactNode }) {
  return (
    <>
      <DiffRowDesktop row={row} fieldWidth={fieldWidth} className="max-lg:hidden" />
      <DiffRowCard row={row} oldLabel={oldLabel} newLabel={newLabel} className="lg:hidden" />
    </>
  );
}

// ── Compact (History) ────────────────────────────────────────────────────

export interface DiffCompactRow {
  key: string;
  field: React.ReactNode;
  old?: React.ReactNode;
  new?: React.ReactNode;
  /** Free-form chips instead of old → new (e.g. "+ Toyota Fortuner", struck "Suzuki Cultus"). */
  items?: React.ReactNode;
}

/** Old chip → new chip rows, 14/22, field column 140 px. */
export function DiffCompact({ rows, fieldWidth = 140, className }: { rows: DiffCompactRow[]; fieldWidth?: number; className?: string }) {
  return (
    <div className={cx("num flex flex-col gap-1.5 text-[14px]/[22px] font-medium text-ink-2", className)}>
      {rows.map((r) => (
        <div key={r.key} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="w-full flex-none font-semibold text-ink lg:w-[var(--fw)]" style={{ ["--fw" as string]: `${fieldWidth}px` }}>
            {r.field}
          </span>
          {r.items ?? (
            <>
              {r.old != null ? <CompactOld>{r.old}</CompactOld> : null}
              {r.old != null && r.new != null ? <ArrowRight size={16} strokeWidth={1.75} className="flex-none text-[#A8A29E]" aria-hidden="true" /> : null}
              {r.new != null ? <CompactNew>{r.new}</CompactNew> : null}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function CompactOld({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-bad-fill px-1.5 text-bad-text line-through">{children}</span>;
}

export function CompactNew({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-good-fill px-1.5 font-semibold text-good-text">{children}</span>;
}
