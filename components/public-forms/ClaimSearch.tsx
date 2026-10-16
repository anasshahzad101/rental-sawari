"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Store } from "lucide-react";
import { Highlight } from "@/components/admin/ui/AreaInput";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Spinner } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { SearchInput } from "@/components/admin/ui/Field";
import { useEscape, useOutsidePointer } from "@/components/admin/ui/hooks";

interface LookupResult {
  slug: string;
  name: string;
  city: string;
  area: string;
  last4: string;
  logoUrl: string | null;
}

/**
 * "Already on RentalSawari? Find and claim your listing instead." — a quiet
 * strip on List your business. Tapping the search opens the finder: name or
 * phone, results with avatar, "City · Area · WhatsApp ending 4567" and Claim.
 */
export function ClaimSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = q.trim();
  const isPhone = query.replace(/\D/g, "").length >= 4 && /^[\d\s+()-]+$/.test(query);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setLoading(false);
      setFailed(false);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/listing-lookup?q=${encodeURIComponent(query)}`, { signal: ctl.signal });
        const j = (await res.json()) as { results?: LookupResult[] };
        setResults(Array.isArray(j.results) ? j.results : []);
        setFailed(!res.ok);
        setHi(0);
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") {
          setFailed(true);
          setResults([]);
        }
      } finally {
        if (!ctl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(t);
      ctl.abort();
    };
  }, [query]);

  const collapse = () => {
    setOpen(false);
    setQ("");
  };
  useOutsidePointer([wrapRef], () => !q.trim() && collapse(), open);
  useEscape(open, () => (q ? setQ("") : collapse()));

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <div
        className={cx(
          "flex flex-col gap-3 rounded-card border border-line bg-page px-4 py-3.5 lg:flex-row lg:items-center lg:gap-3.5 lg:px-[18px]",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3 lg:items-center lg:gap-3.5">
          <Store size={20} strokeWidth={1.75} className="mt-px flex-none text-brand-700 lg:mt-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-[15px]/[22px] font-medium text-ink">
            Already on RentalSawari? <b className="font-bold">Find and claim your listing</b> instead.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Find your listing by name or phone"
          className="flex h-12 w-full flex-none items-center gap-2 rounded-control border border-line bg-white px-3 text-left text-[16px]/[24px] text-[#A8A29E] hover:border-[#A8A29E] lg:h-11 lg:w-[260px] lg:text-[15px]/[20px]"
        >
          <Search size={18} strokeWidth={1.75} className="flex-none text-muted" aria-hidden="true" />
          Name or phone
        </button>
      </div>
    );
  }

  const list = results ?? [];
  const onKey = (e: React.KeyboardEvent) => {
    if (!list.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(list.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = list[hi];
      if (r) router.push(`/companies/${r.slug}/claim`);
    }
  };

  return (
    <div ref={wrapRef} className={cx("rounded-card border border-line bg-white p-4 shadow-card lg:p-6", className)}>
      <h2 className="text-[18px]/[24px] font-extrabold text-ink lg:text-[20px]/[26px]">Already on RentalSawari? Find and claim your listing</h2>
      <div className="mt-3.5">
        <SearchInput
          ref={inputRef}
          value={q}
          onChange={setQ}
          onKeyDown={onKey}
          placeholder="Name or phone"
          aria-label="Search by name or phone"
          autoComplete="off"
          className="lg:h-12"
        />
        {query.length >= 2 ? (
          <div className="mt-1.5 rounded-[14px] border border-line bg-white p-1.5 shadow-pop" role="listbox" aria-label="Listings">
            {list.map((r, i) => (
              <Link
                key={r.slug}
                href={`/companies/${r.slug}/claim`}
                role="option"
                aria-selected={i === hi}
                onMouseEnter={() => setHi(i)}
                className={cx("flex items-center gap-3 rounded-[10px] p-2.5 text-ink hover:no-underline", i === hi && "bg-fill")}
              >
                <Avatar name={r.name} logoUrl={r.logoUrl} size={40} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[16px]/[22px] font-semibold">
                    {isPhone ? r.name : <Highlight text={r.name} query={query} className="text-brand-700" />}
                  </span>
                  <span className="num truncate text-[13px]/[18px] font-medium text-muted">
                    {[r.city, r.area, r.last4 ? `WhatsApp ending ${r.last4}` : ""].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="inline-flex h-10 flex-none items-center rounded-control border-[1.5px] border-brand-700 px-3.5 text-[15px]/[20px] font-bold text-brand-700">
                  Claim
                </span>
              </Link>
            ))}
            {!list.length ? (
              <div className="flex items-center gap-2.5 px-2.5 py-2.5 text-[15px]/[22px] font-medium text-muted">
                {loading ? (
                  <>
                    <Spinner />
                    Searching…
                  </>
                ) : failed ? (
                  "Couldn't search right now. Try again."
                ) : (
                  <>No listing matches “{query}”.</>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="mt-2.5 text-[13px]/[18px] font-medium text-muted">Search by name or phone. Only the last 4 digits of numbers are shown.</p>
    </div>
  );
}
