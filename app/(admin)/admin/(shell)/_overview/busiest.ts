/**
 * "Busiest: Friday to Sunday, 6–10 PM" — a plain-words summary of the
 * 7 × 24 opens heatmap (Monday first, PKT hours).
 */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "6–10 PM" · "11 AM–3 PM" · "8 PM–12 AM" (end hour is exclusive). */
function hourSpan(a: number, b: number): string {
  const a12 = a % 12 || 12;
  const b12 = b % 12 || 12;
  const sa = a < 12 ? "AM" : "PM";
  const sb = b % 24 < 12 ? "AM" : "PM";
  return sa === sb ? `${a12}–${b12} ${sa}` : `${a12} ${sa}–${b12} ${sb}`;
}

function joinDays(idx: number[]): string {
  const names = idx.map((i) => DAYS[i]);
  if (names.length === 1) return names[0];
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (contiguous && names.length > 2) return `${names[0]} to ${names[names.length - 1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function busiestText(values: number[]): string | null {
  const total = values.reduce((s, v) => s + v, 0);
  if (!total) return null;
  const byDay = DAYS.map((_, d) => values.slice(d * 24, d * 24 + 24).reduce((s, v) => s + v, 0));
  const max = Math.max(...byDay);
  const days = byDay
    .map((t, i) => ({ t, i }))
    .filter((x) => x.t >= max * 0.85)
    .sort((a, b) => b.t - a.t)
    .slice(0, 3)
    .map((x) => x.i)
    .sort((a, b) => a - b);

  const byHour = Array.from({ length: 24 }, (_, h) => DAYS.reduce((s, _d, d) => s + (values[d * 24 + h] ?? 0), 0));
  const W = 4;
  let best = 0;
  let bestSum = -1;
  for (let h = 0; h <= 24 - W; h++) {
    let s = 0;
    for (let k = h; k < h + W; k++) s += byHour[k];
    if (s > bestSum) {
      bestSum = s;
      best = h;
    }
  }
  return `${joinDays(days)}, ${hourSpan(best, best + W)}`;
}
