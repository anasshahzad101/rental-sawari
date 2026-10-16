import type { InboxKind, InboxView } from "@/components/admin/shell";

/**
 * URL helpers shared by the three Inbox screens (requests, claims, reports).
 * `?view=new|done|rejected` picks the sub-filter, `?id=N` the open item.
 * Pure functions: safe in server and client components.
 */

export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a search param. */
export function one(sp: SearchParams | undefined, key: string): string | undefined {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v;
}

/** `?view=` → a view from `allowed` (first one when missing or unknown). */
export function parseInboxView(sp: SearchParams | undefined, allowed: InboxView[] = ["new", "done", "rejected"]): InboxView {
  const v = one(sp, "view");
  return (allowed as string[]).includes(v ?? "") ? (v as InboxView) : allowed[0];
}

/** `?id=` → a positive integer, or null. */
export function parseInboxId(sp: SearchParams | undefined): number | null {
  const n = Number(one(sp, "id"));
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** `/admin/inbox/{kind}?view=…&id=…` ("new" is the default view and is left out). */
export function inboxHref(kind: InboxKind, opts: { view?: InboxView; id?: number | null } = {}): string {
  const q = new URLSearchParams();
  if (opts.view && opts.view !== "new") q.set("view", opts.view);
  if (opts.id) q.set("id", String(opts.id));
  const s = q.toString();
  return `/admin/inbox/${kind}${s ? `?${s}` : ""}`;
}
