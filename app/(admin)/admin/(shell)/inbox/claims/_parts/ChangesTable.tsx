"use client";

import * as React from "react";
import { initials, plural } from "@/lib/admin/format";
import { cx } from "@/components/admin/ui/cx";
import { DiffTable, type DiffRowData } from "@/components/admin/ui/Diff";
import { rowSub, type ClaimRow } from "./rows";

/** A 44 px logo thumbnail + caption (the new one gets a 2 px green border). */
function LogoThumb({ url, name, caption, isNew }: { url: string | null; name: string; caption: string; isNew?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px]/[18px] font-medium text-muted">
      {url ? (
        <span
          className={cx(
            "grid size-11 flex-none place-items-center overflow-hidden rounded-control bg-white",
            isNew ? "border-2 border-good-solid" : "border border-line",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`${caption}`} className="size-full object-cover" loading="lazy" />
        </span>
      ) : (
        <span className="grid size-11 flex-none place-items-center rounded-control bg-brand-50 text-[14px] font-bold leading-none text-brand-700" aria-hidden="true">
          {initials(name) || "?"}
        </span>
      )}
      <span className="min-w-0 break-all">{caption}</span>
    </span>
  );
}

function fileName(url: string): string {
  const base = url.split(/[?#]/)[0].split("/").pop() ?? "";
  return /\.[a-z0-9]{2,4}$/i.test(base) ? base : "New logo";
}

const NONE = <span className="text-[16px]/[24px] font-medium text-[#A8A29E] lg:text-[15px]/[24px]">None</span>;

/** ClaimRow → the kit's DiffRow shape. */
function toDiff(r: ClaimRow, listingName: string): DiffRowData {
  const sub = rowSub(r);
  const base = { key: r.key, field: r.field, sub, tag: sub };
  if (r.kind === "text") return { ...base, kind: "text", oldText: r.oldText ?? "", newText: r.newText ?? "" };
  if (r.kind === "logo") {
    const old = <LogoThumb url={r.oldText} name={listingName} caption={r.oldText ? "Current logo" : "No logo"} />;
    if (!r.newText) return { ...base, kind: "removed", old, removedNote: "" };
    return { ...base, kind: "changed", old, new: <LogoThumb url={r.newText} name={listingName} caption={fileName(r.newText)} isNew /> };
  }
  if (r.key.startsWith("services:")) {
    return r.kind === "added"
      ? { ...base, kind: "added", new: "Added to services" }
      : { ...base, kind: "removed", old: "In services", removedNote: "" };
  }
  if (r.kind === "added") {
    // Cars and services: "Not on the listing" (the kit default). Plain fields: "None".
    const scalar = !r.key.includes(":");
    return { ...base, kind: "added", old: scalar ? NONE : undefined, new: r.newText ?? "" };
  }
  if (r.kind === "removed") return { ...base, kind: "removed", old: r.oldText ?? "", removedNote: "" };
  return { ...base, kind: "changed", old: r.oldText ?? "", new: r.newText ?? "" };
}

export interface ChangesTableProps {
  rows: ClaimRow[];
  listingName: string;
  /**
   * review: tick boxes, "Current against requested".
   * applied: the applied rows, read-only, Before / After.
   * readonly: what was asked, no tick boxes (rejected claims).
   */
  mode: "review" | "applied" | "readonly";
  /** Keys the owner unticked (review). */
  off?: Set<string>;
  onToggle?: (key: string, on: boolean) => void;
  /** All changes in the claim (applied mode: "7 of 8"). */
  total: number;
  unchanged?: string[];
  unchangedRows?: Array<{ key: string; field: string; value: string }>;
  className?: string;
}

/**
 * "Current against requested": the kit's DiffTable inside a bordered box
 * (desktop), NOW / REQUESTED cards (mobile).
 */
export function ChangesTable({ rows, listingName, mode, off, onToggle, total, unchanged, unchangedRows, className }: ChangesTableProps) {
  const ticked = mode === "review" ? rows.filter((r) => !off?.has(r.key)).length : rows.length;
  const data = rows.map((r) => {
    const d = toDiff(r, listingName);
    if (mode !== "review") return d;
    return { ...d, ticked: !off?.has(r.key), onTick: (on: boolean) => onToggle?.(r.key, on) };
  });

  let title: React.ReactNode;
  let subtitle: React.ReactNode;
  if (mode === "review") {
    title = (
      <>
        <span className="max-lg:hidden">Current against requested</span>
        <span className="lg:hidden">{plural(total, "change")}</span>
      </>
    );
    subtitle = (
      <>
        <span className="max-lg:hidden">
          {ticked} of {plural(total, "change")} ticked
        </span>
        {ticked < total ? (
          <span className="lg:hidden">
            {ticked} of {total} ticked
          </span>
        ) : null}
      </>
    );
  } else if (mode === "applied") {
    title = "Applied changes";
    subtitle = `${rows.length} of ${plural(total, "change")} applied`;
  } else {
    title = (
      <>
        <span className="max-lg:hidden">Requested changes</span>
        <span className="lg:hidden">{plural(total, "change")} requested</span>
      </>
    );
    subtitle = <span className="max-lg:hidden">Nothing was applied</span>;
  }

  return (
    <div className={cx("min-w-0 lg:overflow-hidden lg:rounded-[14px] lg:border lg:border-line", className)}>
      <DiffTable
        card={false}
        fieldWidth={120}
        rows={data}
        title={title}
        subtitle={subtitle}
        oldLabel={mode === "applied" ? "Before" : "Current listing"}
        newLabel={mode === "applied" ? "After" : "Requested"}
        mobileOldLabel={mode === "applied" ? "Before" : "Now"}
        mobileNewLabel={mode === "applied" ? "After" : "Requested"}
        unchanged={mode === "applied" ? undefined : unchanged}
        unchangedRows={mode === "applied" ? undefined : unchangedRows}
      />
    </div>
  );
}
