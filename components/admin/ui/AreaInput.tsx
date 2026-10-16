"use client";

import * as React from "react";
import { useId, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cx } from "./cx";
import { innerInput, shellClasses } from "./Field";
import { useOutsidePointer } from "./hooks";

/** Splits `text` around the first case-insensitive match of `q`. */
export function splitMatch(text: string, q: string): [string, string, string] | null {
  const s = q.trim();
  if (!s) return null;
  const i = text.toLowerCase().indexOf(s.toLowerCase());
  if (i < 0) return null;
  return [text.slice(0, i), text.slice(i, i + s.length), text.slice(i + s.length)];
}

/** Text with the matched part in bold. */
export function Highlight({ text, query, className }: { text: string; query: string; className?: string }) {
  const m = splitMatch(text, query);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[0]}
      <b className={cx("font-bold", className)}>{m[1]}</b>
      {m[2]}
    </>
  );
}

export interface AreaInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Areas already used in the chosen city. */
  areas: string[];
  /** For the overline "AREAS IN ISLAMABAD". */
  city?: string | null;
  placeholder?: string;
  invalid?: boolean;
  changed?: boolean;
  id?: string;
  className?: string;
  maxSuggestions?: number;
}

/** Free-text area with suggestions from the city ('Use "F-1" as typed'). */
export function AreaInput({
  value,
  onChange,
  areas,
  city,
  placeholder = "e.g. F-10 Markaz",
  invalid,
  changed,
  id,
  className,
  maxSuggestions = 6,
}: AreaInputProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsidePointer([wrapRef], () => setOpen(false), open);

  const typed = value.trim();
  const matches = useMemo(() => {
    const s = typed.toLowerCase();
    const list = areas.filter((a) => !s || a.toLowerCase().includes(s));
    list.sort((a, b) => {
      const ai = a.toLowerCase().indexOf(s);
      const bi = b.toLowerCase().indexOf(s);
      return ai - bi || a.localeCompare(b);
    });
    return list.slice(0, maxSuggestions);
  }, [areas, typed, maxSuggestions]);
  const exact = areas.some((a) => a.toLowerCase() === typed.toLowerCase());
  const rows: Array<{ kind: "area" | "typed"; value: string }> = [
    ...matches.map((a) => ({ kind: "area" as const, value: a })),
    ...(typed && !exact ? [{ kind: "typed" as const, value: typed }] : []),
  ];
  const show = open && rows.length > 0;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cx("relative w-full", className)}>
      <div className={cx("flex h-12 w-full items-center overflow-hidden px-3.5 lg:h-11", shellClasses({ invalid, changed }))}>
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-controls={listId}
          aria-expanded={show}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHi(0);
          }}
          onKeyDown={(e) => {
            if (!show) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((h) => Math.min(rows.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const r = rows[hi];
              if (r) pick(r.value);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className={innerInput}
        />
      </div>
      {show ? (
        <div id={listId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 animate-pop-in rounded-[14px] border border-line bg-white p-1.5 shadow-pop">
          {matches.length && city ? <div className="text-overline uppercase text-muted px-2.5 pb-1 pt-1.5">Areas in {city}</div> : null}
          {rows.map((r, i) =>
            r.kind === "area" ? (
              <button
                key={`a-${r.value}`}
                type="button"
                role="option"
                aria-selected={i === hi}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r.value)}
                className={cx(
                  "flex h-11 w-full items-center rounded-[10px] px-2.5 text-left text-[16px]/[24px] font-medium text-ink lg:h-10 lg:text-[15px]/[22px]",
                  i === hi && "bg-fill",
                )}
              >
                <span className="truncate">
                  <Highlight text={r.value} query={typed} />
                </span>
              </button>
            ) : (
              <button
                key="typed"
                type="button"
                role="option"
                aria-selected={i === hi}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r.value)}
                className={cx(
                  "flex h-11 w-full items-center gap-1.5 px-2.5 text-left text-[16px]/[24px] font-medium text-brand-700 lg:h-10 lg:text-[15px]/[22px]",
                  matches.length ? "border-t border-fill" : "rounded-[10px]",
                  i === hi && "bg-fill",
                )}
              >
                <Plus size={16} strokeWidth={1.75} className="flex-none" aria-hidden="true" />
                <span className="truncate">Use “{r.value}” as typed</span>
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
