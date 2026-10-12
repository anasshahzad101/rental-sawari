"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleX, Search, X } from "lucide-react";
import type { ListingStatus, Plan } from "@/lib/admin/types";
import { fmtNum, fmtPhone } from "@/lib/admin/format";
import { Avatar } from "../ui/Avatar";
import { cx } from "../ui/cx";
import { useBodyScrollLock, useEscape, useOutsidePointer } from "../ui/hooks";
import { Portal } from "../ui/Portal";
import { Skeleton } from "../ui/Skeleton";
import { PlanBadge, StatusPill } from "../ui/StatusPill";

export interface SearchResult {
  id: number;
  slug: string;
  name: string;
  city: string;
  area: string;
  plan: Plan;
  status?: ListingStatus;
  logoUrl: string | null;
  whatsapp: string;
  /** Last 30 days. */
  opened: number;
  contacted: number;
}

export type SearchFn = (q: string, signal: AbortSignal) => Promise<{ results: SearchResult[]; total?: number }>;

const PLACEHOLDER = "Search listings by name, phone or city…";

async function fetchSearch(q: string, signal: AbortSignal) {
  const r = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { signal, headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`Search failed (${r.status})`);
  const j = (await r.json()) as { results?: SearchResult[]; total?: number };
  return { results: j.results ?? [], total: j.total };
}

/** Phone-style query ("0300 123", "+92 300") → national digits ("300123"), else null. */
function phoneQuery(q: string): string | null {
  const t = q.trim();
  if (!/^[\d\s+()-]+$/.test(t)) return null;
  let d = t.replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92") && (t.startsWith("+") || d.length > 10)) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return d.length >= 3 ? d : null;
}

/** Debounced search against /api/admin/search (or a custom `search` function). */
export function useListingSearch(q: string, search: SearchFn = fetchSearch, delay = 200) {
  const [state, setState] = useState<{ results: SearchResult[]; total: number; loading: boolean; error: boolean; q: string }>({
    results: [],
    total: 0,
    loading: false,
    error: false,
    q: "",
  });
  const fnRef = useRef(search);
  fnRef.current = search;
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setState({ results: [], total: 0, loading: false, error: false, q: "" });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: false }));
    const ctl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const r = await fnRef.current(term, ctl.signal);
        const results = [...r.results].sort((a, b) => b.contacted - a.contacted || b.opened - a.opened);
        setState({ results, total: r.total ?? results.length, loading: false, error: false, q: term });
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") return;
        setState({ results: [], total: 0, loading: false, error: true, q: term });
      }
    }, delay);
    return () => {
      window.clearTimeout(t);
      ctl.abort();
    };
  }, [q, delay]);
  return state;
}

/** Name with the match in 700 #0F766E. */
function NameHit({ name, q }: { name: string; q: string }) {
  const s = q.trim();
  const i = s ? name.toLowerCase().indexOf(s.toLowerCase()) : -1;
  if (i < 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, i)}
      <span className="font-bold text-brand-700">{name.slice(i, i + s.length)}</span>
      {name.slice(i + s.length)}
    </>
  );
}

/** "+92 <b>300 123</b>4567" when the query is a phone number. */
function PhoneHit({ phone, digits }: { phone: string; digits: string }) {
  const f = fmtPhone(phone);
  const pos: number[] = [];
  for (let i = 4; i < f.length; i++) if (/\d/.test(f[i])) pos.push(i);
  const nat = pos.map((i) => f[i]).join("");
  const k = nat.indexOf(digits);
  if (k < 0) return <>{f}</>;
  const a = pos[k];
  const b = pos[k + digits.length - 1] + 1;
  return (
    <>
      {f.slice(0, a)}
      <span className="font-bold text-brand-700">{f.slice(a, b)}</span>
      {f.slice(b)}
    </>
  );
}

const plural = (n: number) => `${fmtNum(n)} ${n === 1 ? "listing" : "listings"}`;

export interface GlobalSearchProps {
  className?: string;
  /** Override the fetch (tests and the kit page). */
  search?: SearchFn;
}

/** Desktop search: 480 × 44 field with a 580 px results dropdown, keyboard ↑ ↓ Enter. */
export function GlobalSearch({ className, search }: GlobalSearchProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, total, loading, error } = useListingSearch(q, search);
  const term = q.trim();
  const show = open && !!term;

  useEffect(() => setHi(0), [results]);
  useOutsidePointer([wrapRef], () => setOpen(false), open);

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };
  const seeAll = `/admin/listings?q=${encodeURIComponent(term)}`;

  return (
    <div ref={wrapRef} className={cx("relative w-full max-w-[480px]", className)}>
      <div
        className={cx(
          "flex h-11 items-center gap-2.5 rounded-control border bg-white pl-3.5 pr-2 transition-shadow",
          open ? "border-[1.5px] border-brand-700 shadow-input-focus" : "border-line",
        )}
      >
        <Search size={20} strokeWidth={1.75} className={cx("flex-none", open ? "text-brand-700" : "text-muted")} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={q}
          placeholder={PLACEHOLDER}
          aria-label="Search listings"
          role="combobox"
          aria-controls={listId}
          aria-expanded={show}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi((h) => Math.min(results.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter" && term) {
              e.preventDefault();
              const r = results[hi];
              go(r ? `/admin/listings/${r.id}` : seeAll);
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px]/[20px] text-ink outline-none placeholder:text-muted focus-visible:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {q ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className="grid size-8 flex-none place-items-center rounded-lg text-muted hover:bg-fill hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {show ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 top-[54px] z-40 w-[580px] max-w-[calc(100vw-280px)] animate-pop-in rounded-card border border-line bg-white p-2 shadow-pop"
        >
          <div className="text-overline uppercase text-muted flex justify-between px-3 py-2">
            <span>{loading && !results.length ? "Searching…" : plural(total)}</span>
            <span>Last 30 days</span>
          </div>
          {loading && !results.length ? (
            <div className="flex flex-col gap-1">
              {[0, 1].map((i) => (
                <div key={i} className="flex min-h-16 items-center gap-3 px-3 py-2">
                  <Skeleton className="size-10 rounded-control" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-44 rounded-md" />
                    <Skeleton className="h-2.5 w-28 rounded-md" shimmer={false} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-3 py-4 text-[15px]/[22px] font-medium text-bad-text">Couldn&apos;t search right now. Try again.</div>
          ) : !results.length ? (
            <div className="px-3 py-4 text-[15px]/[22px] text-muted">No listing matches “{term}”.</div>
          ) : (
            results.map((r, i) => (
              <Link
                key={r.id}
                href={`/admin/listings/${r.id}`}
                role="option"
                aria-selected={i === hi}
                onMouseEnter={() => setHi(i)}
                onClick={() => setOpen(false)}
                className={cx("flex min-h-16 items-center gap-3 rounded-control px-3 py-2", i === hi && "bg-fill")}
              >
                <Avatar name={r.name} logoUrl={r.logoUrl} size={40} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[15px]/[22px] font-medium text-ink">
                      <NameHit name={r.name} q={term} />
                    </span>
                    <PlanBadge plan={r.plan} size="sm" />
                    {r.status === "hidden" ? <StatusPill kind="hidden" size="sm" /> : null}
                  </div>
                  <div className="truncate text-[13px]/[18px] font-medium text-muted">
                    {r.city} · {r.area}
                    {phoneQuery(term) ? (
                      <>
                        {" · "}
                        <span className="num text-ink-2">
                          <PhoneHit phone={r.whatsapp} digits={phoneQuery(term)!} />
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="num flex flex-none gap-5 text-right text-[13px]/[18px] font-medium text-muted">
                  <div className="flex min-w-14 flex-col">
                    <span className="text-[15px]/[22px] font-bold text-ink">{fmtNum(r.opened)}</span>
                    Opened
                  </div>
                  <div className="flex min-w-16 flex-col">
                    <span className="text-[15px]/[22px] font-bold text-ink">{fmtNum(r.contacted)}</span>
                    Contacted
                  </div>
                </div>
              </Link>
            ))
          )}
          <div className="mt-1.5 flex items-center justify-between border-t border-line px-3 pb-1.5 pt-3 text-[13px]/[18px] font-medium text-muted">
            <span>↑ ↓ to move · Enter to open</span>
            <Link href={seeAll} onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline">
              See all in Listings
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export interface MobileSearchProps {
  open: boolean;
  onClose: () => void;
  search?: SearchFn;
}

/** Full-screen search on mobile: back arrow, focused 48 px field, result cards. */
export function MobileSearch({ open, onClose, search }: MobileSearchProps) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, total, loading, error } = useListingSearch(open ? q : "", search);
  const term = q.trim();
  const digits = useMemo(() => phoneQuery(term), [term]);
  useBodyScrollLock(open);
  useEscape(open, onClose);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);
  if (!open) return null;
  return (
    <Portal>
      <div role="dialog" aria-modal="true" aria-label="Search listings" className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden">
        <div className="flex flex-none items-center gap-1 border-b border-line pb-3 pl-1 pr-4 pt-[max(4px,env(safe-area-inset-top))]">
          <button type="button" aria-label="Close search" onClick={onClose} className="grid size-11 flex-none place-items-center rounded-control text-ink active:bg-fill">
            <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-control border-[1.5px] border-brand-700 pl-3.5 pr-1 shadow-input-focus">
            <Search size={20} strokeWidth={1.75} className="flex-none text-brand-700" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, phone or city"
              aria-label="Search listings"
              className="num h-full min-w-0 flex-1 bg-transparent text-[16px]/[24px] text-ink outline-none placeholder:text-[#A8A29E] focus-visible:!shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {q ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQ("");
                  inputRef.current?.focus();
                }}
                className="grid size-10 flex-none place-items-center text-muted"
              >
                <CircleX size={20} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {term ? (
            <div className="text-overline uppercase text-muted flex justify-between px-1 pb-2.5">
              <span>{loading && !results.length ? "Searching…" : plural(total)}</span>
              <span>Last 30 days</span>
            </div>
          ) : null}
          {term && error ? <div className="px-1 py-2 text-[15px]/[22px] font-medium text-bad-text">Couldn&apos;t search right now. Try again.</div> : null}
          {term && !loading && !error && !results.length ? (
            <div className="px-1 py-2 text-[16px]/[24px] text-muted">No listing matches “{term}”.</div>
          ) : null}
          <div className="flex flex-col gap-3">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/admin/listings/${r.id}`}
                onClick={onClose}
                className="flex flex-col gap-3 rounded-card border border-line bg-white p-4 shadow-card active:bg-page"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={r.name} logoUrl={r.logoUrl} size={44} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="text-[16px]/[24px] font-semibold text-ink">
                      <NameHit name={r.name} q={digits ? "" : term} />
                    </div>
                    <div className="text-[13px]/[18px] font-medium text-muted">
                      {r.city} · {r.area}
                    </div>
                    {digits ? (
                      <div className="num text-[13px]/[18px] font-medium text-ink-2">
                        <PhoneHit phone={r.whatsapp} digits={digits} />
                      </div>
                    ) : null}
                  </div>
                  <PlanBadge plan={r.plan} size="sm" />
                </div>
                <div className="num flex gap-6 border-t border-fill pt-3 text-[13px]/[18px] font-medium text-muted">
                  <div>
                    <span className="text-[16px]/[22px] font-bold text-ink">{fmtNum(r.opened)}</span> opened
                  </div>
                  <div>
                    <span className="text-[16px]/[22px] font-bold text-ink">{fmtNum(r.contacted)}</span> contacted
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 px-1 text-[13px]/[18px] font-medium text-muted">Search by listing name, phone number or city.</div>
        </div>
      </div>
    </Portal>
  );
}
