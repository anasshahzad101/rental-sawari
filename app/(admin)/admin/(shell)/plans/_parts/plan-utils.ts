import type { Plan } from "@/lib/admin/types";
import { PLAN_LABEL, PLAN_PRICE } from "@/lib/admin/constants";
import { addDays, addMonths, fmtDay, fmtDayShort, fmtNum, fmtRange } from "@/lib/admin/format";

/** One Featured listing as the client sees it (plain data, no server types). */
export interface PlanItem {
  id: number;
  name: string;
  city: string;
  logoUrl: string | null;
  whatsapp: string;
  plan: Plan;
  planStart: string | null;
  planEnd: string | null;
  /** Negative = ended that many days ago; null = no end date. */
  daysLeft: number | null;
  /** Since the plan's start date. */
  opened: number;
  contacted: number;
  /** Last 30 days (for the renewal reminder). */
  opened30: number;
  contacted30: number;
}

export interface MonthOption {
  value: string; // YYYY-MM-01
  label: string; // "September 2026"
}

/** How many rows show before "Show all". */
export const FIRST_ROWS = 8;

export type DaysTone = "red" | "amber" | "grey";

/** Days-left pill: red once ended, amber at 7 or fewer, grey otherwise. */
export function daysInfo(d: number | null): { tone: DaysTone; long: string; short: string } {
  if (d == null) return { tone: "grey", long: "No end date", short: "No end" };
  if (d < 0) {
    const n = -d;
    return { tone: "red", long: `Ended ${n} ${n === 1 ? "day" : "days"} ago`, short: "Ended" };
  }
  if (d === 0) return { tone: "amber", long: "Ends today", short: "Today" };
  const txt = `${d} ${d === 1 ? "day" : "days"}`;
  return { tone: d <= 7 ? "amber" : "grey", long: `${txt} left`, short: txt };
}

export const ended = (p: PlanItem) => p.daysLeft != null && p.daysLeft < 0;

/** "6 Sep – 5 Oct" · "1–31 Oct" · "Until 5 Oct" · "—". */
export function planRange(p: PlanItem): string {
  if (p.planStart && p.planEnd) return fmtRange(p.planStart, p.planEnd, { year: false, compressMonth: true });
  if (p.planEnd) return `Until ${fmtDayShort(p.planEnd)}`;
  return "—";
}

/** "ends 15 Oct" / "ended 5 Oct" / "no end date" (year optional). */
export function endPhrase(p: PlanItem, year = false): string {
  if (!p.planEnd) return "no end date";
  const d = year ? fmtDay(p.planEnd) : fmtDayShort(p.planEnd);
  return ended(p) ? `ended ${d}` : `ends ${d}`;
}

/** The renewal reminder WhatsApp text. */
export function reminderText(p: PlanItem): string {
  const when = p.planEnd ? `${ended(p) ? "ended" : "ends"} on ${fmtDayShort(p.planEnd)}` : "is due for renewal";
  return (
    `Assalam o Alaikum! Your ${PLAN_LABEL[p.plan]} plan for ${p.name} ${when}. ` +
    `In the last 30 days, ${fmtNum(p.opened30)} people opened your listing and ${fmtNum(p.contacted30)} contacted you. ` +
    `To stay at the top of ${p.city}, renew for PKR ${fmtNum(PLAN_PRICE[p.plan])}/month. Just reply here. — RentalSawari`
  );
}

/** Same maths as extendPlanAction: continue from the day after the old end. */
export function extensionStart(p: PlanItem, today: string): string {
  return p.planEnd ? addDays(p.planEnd, 1) : today;
}

export function extensionEnd(start: string, months: number): string {
  return addDays(addMonths(start, months), -1);
}
