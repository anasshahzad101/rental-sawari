import "server-only";
import { getDb, getMeta, setMeta } from "../db";
import { DEMO_KEY, REAL_START_KEY } from "../db/demo";
import { forgetStats } from "./analytics";
import { invalidateListings, undoVersion } from "./listings";

/**
 * The demo data's kill switch (Overview). See lib/admin/db/demo.ts for what
 * the demo data is.
 */

export async function demoIsOn(): Promise<boolean> {
  try {
    return (await getMeta(DEMO_KEY)) === "on";
  } catch {
    return false;
  }
}

export interface DemoCounts {
  listings: number;
  inbox: number;
}

export async function demoCounts(): Promise<DemoCounts> {
  const d = await getDb();
  const [listings, requests, claims, reports] = await Promise.all([
    d.count("listings", { demo: true }),
    d.count("listingRequests", { demo: true }),
    d.count("claims", { demo: true }),
    d.count("reports", { demo: true }),
  ]);
  return { listings, inbox: requests + claims + reports };
}

/**
 * Delete every demo row for good: the demo listings with their history,
 * stats and inbox items, the demo stats on real listings, and the demo
 * requests, claims and reports. Real listings, real visits and real inbox
 * items are not touched. Demo data is never added again afterwards.
 */
export async function removeDemoData(): Promise<void> {
  const d = await getDb();
  const ids = (await d.select<{ id: number }>("listings", { demo: true }, { columns: ["id"] })).map((r) => r.id);

  // A demo claim applied to a real listing (only possible after editing a demo
  // request's number): put that listing back if nothing was changed since.
  const claimIds = (await d.select<{ id: number }>("claims", { demo: true }, { columns: ["id"] })).map((r) => r.id);
  if (claimIds.length) {
    const applied = await d.select<{ id: number; listingId: number }>(
      "listingVersions",
      { kind: "claim", refId: { in: claimIds } },
      { columns: ["id", "listingId"], orderBy: "id", desc: true },
    );
    for (const v of applied) {
      if (ids.includes(v.listingId)) continue;
      try {
        await undoVersion(v.id);
      } catch {
        // A later edit exists; the listing stays as it is.
      }
    }
  }

  await d.remove("statEvents", { demo: true });
  await d.remove("statShown", { demo: true });
  await d.remove("claims", { demo: true });
  await d.remove("reports", { demo: true });
  await d.remove("listingRequests", { demo: true });
  if (ids.length) {
    const own = { listingId: { in: ids } };
    await d.remove("claims", own);
    await d.remove("reports", own);
    await d.remove("statEvents", own);
    await d.remove("statShown", own);
    await d.remove("listingVersions", own);
    await d.remove("listingRedirects", own);
    await d.update("listingRequests", { duplicateOf: { in: ids } }, { duplicateOf: null });
    await d.remove("listings", { id: { in: ids } });
  }

  const realStart = await getMeta(REAL_START_KEY);
  if (realStart) await setMeta("tracking_start", realStart);
  await setMeta(DEMO_KEY, "removed");
  forgetStats();
  invalidateListings();
}
