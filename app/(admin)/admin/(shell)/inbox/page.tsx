import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

/** /admin/inbox → the first tab, Listing requests. */
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  await requireAdmin();
  redirect("/admin/inbox/requests");
}
