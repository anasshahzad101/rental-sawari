"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { removeDemoData } from "@/lib/admin/repo/demo";
import type { ActionResult } from "./listings";

/** The Overview's kill switch: deletes all demo data for good. */
export async function removeDemoAction(): Promise<ActionResult> {
  await requireAdmin();
  try {
    await removeDemoData();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Try again." };
  }
}
