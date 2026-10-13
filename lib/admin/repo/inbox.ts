import "server-only";
import { dayDiff, pktDay } from "../format";
import { listClaims } from "./claims";
import { listAll } from "./listings";
import { listMessages } from "./messages";
import { isUrgent, listReports } from "./reports";
import { listRequests } from "./requests";

/** Counts for the sidebar badge, the Inbox tabs and Overview's "Needs you". */
export interface InboxCounts {
  requests: number;
  claims: number;
  claimsReady: number;
  reports: number;
  urgent: number;
  /** New contact messages + inquiries. */
  messages: number;
  inquiries: number;
  total: number;
  newestRequestAt: string | null;
  plansEnding: number; // within 7 days, not ended
  plansEnded: number; // ended, still on a Featured plan
}

export async function inboxCounts(): Promise<InboxCounts> {
  const [reqs, claims, reports, listings, messages] = await Promise.all([listRequests(), listClaims(), listReports(), listAll(), listMessages()]);
  const newReqs = reqs.filter((r) => r.status === "new");
  const openClaims = claims.filter((c) => c.status === "waiting" || c.status === "verified");
  const newReports = reports.filter((r) => r.status === "new");
  const newMessages = messages.filter((m) => m.status === "new");
  const today = pktDay();
  let ending = 0;
  let ended = 0;
  for (const l of listings) {
    if (l.plan === "free" || l.status !== "live" || !l.planEnd) continue;
    const left = dayDiff(today, l.planEnd);
    if (left < 0) ended++;
    else if (left <= 7) ending++;
  }
  return {
    requests: newReqs.length,
    claims: openClaims.length,
    claimsReady: openClaims.filter((c) => c.status === "verified").length,
    reports: newReports.length,
    urgent: newReports.filter(isUrgent).length,
    messages: newMessages.length,
    inquiries: newMessages.filter((m) => m.kind === "inquiry").length,
    total: newReqs.length + openClaims.length + newReports.length + newMessages.length,
    newestRequestAt: newReqs[0]?.createdAt ?? null,
    plansEnding: ending,
    plansEnded: ended,
  };
}
