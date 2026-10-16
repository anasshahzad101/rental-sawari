import type { CarRow, FieldChange, ListingEditable, ListingField, Plan } from "@/lib/admin/types";
import { PLAN_LABEL } from "@/lib/admin/constants";
import { fmtDay, fmtNum, fmtPhone, fmtPKRDay, fmtRange, plural } from "@/lib/admin/format";

/**
 * History diff rows: every FieldChange turned into words people read
 * ("PKR 15,000/day → PKR 16,000/day", "4.7 · 198 reviews", "Yes"). Pure and
 * client-safe; the server also uses createdSummary().
 */

export type HistoryRow =
  | { key: string; field: string; kind: "change"; old: string | null; new: string | null }
  | { key: string; field: string; kind: "items"; added: string[]; removed: string[] }
  | { key: string; field: string; kind: "text"; old: string; new: string }
  | { key: string; field: string; kind: "logo"; old: string | null; new: string | null }
  | { key: string; field: string; kind: "plain"; text: string };

export type FieldLabels = Record<ListingField, string>;

const str = (v: unknown): string | null => (v == null || v === "" ? null : String(v));

function shortUrl(v: unknown): string | null {
  const s = str(v);
  return s ? s.replace(/^https?:\/\//i, "").replace(/\/$/, "") : null;
}

function rating(r: unknown, n: unknown): string | null {
  const parts: string[] = [];
  if (r != null && r !== "") parts.push(String(r));
  if (n != null && n !== "") parts.push(`${fmtNum(Number(n))} reviews`);
  return parts.length ? parts.join(" · ") : null;
}

function planDates(a: unknown, b: unknown): string | null {
  const s = str(a);
  const e = str(b);
  if (s && e) return fmtRange(s, e);
  if (s) return `From ${fmtDay(s)}`;
  if (e) return `Until ${fmtDay(e)}`;
  return null;
}

const modeText = (c: CarRow) => (c.mode === "self" ? "self-drive" : "with driver");
const priceText = (c: CarRow) => (c.pricePerDay > 0 ? fmtPKRDay(c.pricePerDay) : "No price");
const carLine = (c: CarRow) => (c.pricePerDay > 0 ? `${c.name} ${fmtPKRDay(c.pricePerDay)}` : c.name);

/** Only what changed between two car lists. */
export function carRows(oldCars: CarRow[] | null, newCars: CarRow[] | null): HistoryRow[] {
  const a = oldCars ?? [];
  const b = newCars ?? [];
  const key = (s: string) => s.trim().toLowerCase();
  const before = new Map(a.map((c) => [key(c.name), c]));
  const after = new Map(b.map((c) => [key(c.name), c]));
  const rows: HistoryRow[] = [];
  for (const c of b) {
    const was = before.get(key(c.name));
    if (!was) continue;
    const priceMoved = was.pricePerDay !== c.pricePerDay;
    const modeMoved = was.mode !== c.mode;
    if (!priceMoved && !modeMoved) continue;
    rows.push({
      key: `car:${key(c.name)}`,
      field: c.name,
      kind: "change",
      old: modeMoved ? `${priceText(was)} · ${modeText(was)}` : priceText(was),
      new: modeMoved ? `${priceText(c)} · ${modeText(c)}` : priceText(c),
    });
  }
  const added = b.filter((c) => !before.has(key(c.name))).map(carLine);
  const removed = a.filter((c) => !after.has(key(c.name))).map(carLine);
  if (added.length || removed.length) rows.push({ key: "cars:list", field: "Cars", kind: "items", added, removed });
  if (!rows.length) rows.push({ key: "cars:order", field: "Cars", kind: "plain", text: "Order changed" });
  return rows;
}

/** Turn a version's changes into display rows, in form order. */
export function changeRows(changes: FieldChange[], labels: FieldLabels): HistoryRow[] {
  const by = new Map(changes.map((c) => [c.field, c]));
  const rows: HistoryRow[] = [];
  const done = new Set<ListingField>();
  for (const c of changes) {
    if (done.has(c.field)) continue;
    done.add(c.field);
    const label = labels[c.field] ?? c.field;
    switch (c.field) {
      case "whatsapp":
      case "phone":
      case "phone2":
        rows.push({ key: c.field, field: label, kind: "change", old: c.old ? fmtPhone(String(c.old)) : null, new: c.new ? fmtPhone(String(c.new)) : null });
        break;
      case "website":
      case "mapsUrl":
        rows.push({ key: c.field, field: label, kind: "change", old: shortUrl(c.old), new: shortUrl(c.new) });
        break;
      case "about":
        rows.push({ key: c.field, field: label, kind: "text", old: str(c.old) ?? "", new: str(c.new) ?? "" });
        break;
      case "services": {
        const o = Array.isArray(c.old) ? (c.old as string[]) : [];
        const n = Array.isArray(c.new) ? (c.new as string[]) : [];
        rows.push({ key: c.field, field: label, kind: "change", old: o.length ? o.join(", ") : null, new: n.length ? n.join(", ") : "None" });
        break;
      }
      case "cars":
        rows.push(...carRows(c.old as CarRow[] | null, c.new as CarRow[] | null));
        break;
      case "logoUrl":
        rows.push({ key: c.field, field: label, kind: "logo", old: str(c.old), new: str(c.new) });
        break;
      case "googleRating":
      case "googleReviews": {
        const r = by.get("googleRating");
        const n = by.get("googleReviews");
        if (r && n) {
          done.add("googleRating");
          done.add("googleReviews");
          rows.push({ key: "rating", field: labels.googleRating, kind: "change", old: rating(r.old, n.old), new: rating(r.new, n.new) });
        } else if (c.field === "googleRating") {
          rows.push({ key: c.field, field: label, kind: "change", old: str(c.old), new: str(c.new) });
        } else {
          rows.push({ key: c.field, field: label, kind: "change", old: c.old == null ? null : fmtNum(Number(c.old)), new: c.new == null ? null : fmtNum(Number(c.new)) });
        }
        break;
      }
      case "planStart":
      case "planEnd": {
        const s = by.get("planStart");
        const e = by.get("planEnd");
        if (s && e) {
          done.add("planStart");
          done.add("planEnd");
          rows.push({ key: "planDates", field: "Plan dates", kind: "change", old: planDates(s.old, e.old), new: planDates(s.new, e.new) });
        } else {
          rows.push({ key: c.field, field: label, kind: "change", old: c.old ? fmtDay(String(c.old)) : null, new: c.new ? fmtDay(String(c.new)) : null });
        }
        break;
      }
      case "plan":
        rows.push({ key: c.field, field: label, kind: "change", old: c.old ? PLAN_LABEL[c.old as Plan] : null, new: c.new ? PLAN_LABEL[c.new as Plan] : null });
        break;
      case "verified":
        rows.push({ key: c.field, field: label, kind: "change", old: c.old ? "Yes" : "No", new: c.new ? "Yes" : "No" });
        break;
      case "status":
        rows.push({ key: c.field, field: label, kind: "change", old: c.old === "hidden" ? "Hidden" : "Live", new: c.new === "hidden" ? "Hidden" : "Live" });
        break;
      default:
        rows.push({ key: c.field, field: label, kind: "change", old: str(c.old), new: str(c.new) });
    }
  }
  return rows;
}

/** "Name, city, area, WhatsApp, phone, services, 4 cars, about" for a created/imported entry. */
export function createdSummary(s: ListingEditable): { text: string; count: number } {
  const parts: string[] = [];
  if (s.name) parts.push("Name");
  if (s.city) parts.push("city");
  if (s.area) parts.push("area");
  if (s.whatsapp) parts.push("WhatsApp");
  if (s.phone) parts.push("phone");
  if (s.phone2) parts.push("second phone");
  if (s.website) parts.push("website");
  if (s.mapsUrl) parts.push("map link");
  if (s.services.length) parts.push("services");
  if (s.cars.length) parts.push(plural(s.cars.length, "car"));
  if (s.about) parts.push("about");
  if (s.logoUrl) parts.push("logo");
  if (s.googleRating != null) parts.push("Google rating");
  return { text: parts.join(", "), count: parts.length };
}

// ── Word diff (one line, with removed and added words in place) ─────────

export type WordPart = { text: string; kind: "same" | "removed" | "added" };

function tokens(s: string): string[] {
  return s.match(/\s+|[^\s]+/g) ?? [];
}

/** Weighted LCS over words: long words anchor, spaces barely count. */
export function unifiedWords(oldText: string, newText: string): WordPart[] {
  const a = tokens(oldText);
  const b = tokens(newText);
  const n = a.length;
  const m = b.length;
  const out: WordPart[] = [];
  const push = (text: string, kind: WordPart["kind"]) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ text, kind });
  };
  if (n * m > 360_000) {
    if (oldText) push(oldText, "removed");
    if (newText) push(newText, "added");
    return out;
  }
  const w = (t: string) => (/^\s+$/.test(t) ? 1 : t.length * 10);
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + w(a[i]) : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j] && dp[i][j] === dp[i + 1][j + 1] + w(a[i])) {
      push(a[i], "same");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(a[i++], "removed");
    } else {
      push(b[j++], "added");
    }
  }
  while (i < n) push(a[i++], "removed");
  while (j < m) push(b[j++], "added");
  // Each changed stretch reads as one removed run, then one added run
  // ("open ~~24 hours a day.~~ day and night."), not word by word. Spaces
  // between changes belong to both sides.
  const grouped: WordPart[] = [];
  let k = 0;
  while (k < out.length) {
    if (out[k].kind === "same") {
      grouped.push(out[k++]);
      continue;
    }
    let rem = "";
    let add = "";
    while (k < out.length) {
      const p = out[k];
      if (p.kind === "removed") rem += p.text;
      else if (p.kind === "added") add += p.text;
      else if (/^\s+$/.test(p.text) && k + 1 < out.length && out[k + 1].kind !== "same") {
        rem += p.text;
        add += p.text;
      } else break;
      k++;
    }
    if (rem.trim()) grouped.push({ text: rem, kind: "removed" });
    if (add.trim()) grouped.push({ text: add, kind: "added" });
  }
  return grouped;
}

/** Keep a few words of context around each change; long unchanged runs become "…". */
export function trimContext(parts: WordPart[], ctx = 6): WordPart[] {
  if (!parts.some((p) => p.kind !== "same")) return parts;
  return parts.map((p, idx) => {
    if (p.kind !== "same") return p;
    const words = p.text.split(/(\s+)/);
    const wordCount = words.filter((x) => x && !/^\s+$/.test(x)).length;
    const first = idx === 0;
    const last = idx === parts.length - 1;
    const keep = first || last ? ctx : ctx * 2;
    if (wordCount <= keep) return p;
    const take = (from: "start" | "end", k: number) => {
      const out: string[] = [];
      let seen = 0;
      const list = from === "start" ? words : [...words].reverse();
      for (const x of list) {
        if (x && !/^\s+$/.test(x)) {
          if (seen === k) break;
          seen++;
        }
        out.push(x);
      }
      return from === "start" ? out.join("") : out.reverse().join("");
    };
    if (first) return { kind: "same" as const, text: `…${take("end", ctx).replace(/^\S/, (c) => ` ${c}`)}` };
    if (last) return { kind: "same" as const, text: `${take("start", ctx).replace(/\S$/, (c) => `${c} `)}…` };
    return { kind: "same" as const, text: `${take("start", ctx)} … ${take("end", ctx).trimStart()}` };
  });
}
