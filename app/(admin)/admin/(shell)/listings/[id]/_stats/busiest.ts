/**
 * "Busiest: Friday to Sunday, 6–10 PM" from the 168 heatmap values
 * (Monday-first weekday × PKT hour). Pure and client-safe.
 *
 * Days: the busiest day plus its neighbours (wrapping Sunday → Monday) that
 * reach 80% of it. Hours: over those days, the busiest hour plus its
 * neighbours that reach 60% of it, trimmed to at most 6 hours.
 */

const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function argmax(vals: number[]): number {
  let best = 0;
  vals.forEach((v, i) => {
    if (v > vals[best]) best = i;
  });
  return best;
}

/** The contiguous run around the peak whose values reach `thr`. */
function runAround(vals: number[], thr: number, circular: boolean): number[] {
  const n = vals.length;
  const peak = argmax(vals);
  const out = [peak];
  for (let k = 1; k < n; k++) {
    const j = circular ? (peak + k) % n : peak + k;
    if (!circular && j >= n) break;
    if (out.includes(j) || vals[j] < thr) break;
    out.push(j);
  }
  for (let k = 1; k < n; k++) {
    const j = circular ? (peak - k + n) % n : peak - k;
    if (!circular && j < 0) break;
    if (out.includes(j) || vals[j] < thr) break;
    out.unshift(j);
  }
  return out;
}

function dayText(run: number[]): string {
  if (run.length >= 7) return "Every day";
  const first = DAY_FULL[run[0]];
  const last = DAY_FULL[run[run.length - 1]];
  if (run.length === 1) return `${first}s`;
  if (run.length === 2) return `${first} and ${last}`;
  return `${first} to ${last}`;
}

/** "6–10 PM" · "11 AM–2 PM" · "11 PM–12 AM" for hours [start, endExclusive). */
function hourSpan(start: number, endExcl: number): string {
  const a = start % 12 || 12;
  const b = endExcl % 12 || 12;
  const sa = start < 12 ? "AM" : "PM";
  const sb = endExcl % 24 < 12 ? "AM" : "PM";
  return sa === sb ? `${a}–${b} ${sa}` : `${a} ${sa}–${b} ${sb}`;
}

export function busiestSummary(heat: number[]): string | null {
  const total = heat.reduce((s, v) => s + v, 0);
  if (!total) return null;

  const days = DAY_FULL.map((_, d) => heat.slice(d * 24, d * 24 + 24).reduce((s, v) => s + v, 0));
  const dayRun = runAround(days, Math.max(...days) * 0.8, true);

  const hours = new Array<number>(24).fill(0);
  for (const d of dayRun) for (let h = 0; h < 24; h++) hours[h] += heat[d * 24 + h] ?? 0;
  const hourRun = runAround(hours, Math.max(...hours) * 0.6, false);
  while (hourRun.length > 6) {
    const first = hourRun[0];
    const last = hourRun[hourRun.length - 1];
    if (hours[first] <= hours[last]) hourRun.shift();
    else hourRun.pop();
  }
  const hoursText = hourRun.length >= 24 ? "all day" : hourSpan(hourRun[0], hourRun[hourRun.length - 1] + 1);
  return `${dayText(dayRun)}, ${hoursText}`;
}
