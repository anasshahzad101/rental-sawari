import { requireAdmin } from "@/lib/admin/auth";
import { dbInfo } from "@/lib/admin/db";
import { demoIsOn } from "@/lib/admin/repo/demo";
import { inboxCounts } from "@/lib/admin/repo/inbox";
import { AdminFrame } from "@/components/admin/shell";
import { Banner } from "@/components/admin/ui/Banner";
import { DemoNotice } from "./DemoNotice";

/**
 * Every signed-in admin page: sidebar / tab bar around the page. Pages also
 * call requireAdmin() themselves, because a layout isn't re-run on every
 * client-side navigation.
 */
export const dynamic = "force-dynamic";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [counts, demo] = await Promise.all([inboxCounts(), demoIsOn()]);
  const db = dbInfo();
  return (
    <AdminFrame inboxCount={counts.total}>
      {db.productionFile && (
        <div className="px-4 pt-4 lg:px-8 lg:pt-6">
          <Banner tone="error" title="No database is connected.">
            Changes are being saved to a temporary file that the next deploy will erase. Add DB_HOST, DB_USER, DB_PASSWORD and
            DB_NAME in Hostinger&apos;s environment variables, then redeploy.
          </Banner>
        </div>
      )}
      {demo ? <DemoNotice /> : null}
      {children}
    </AdminFrame>
  );
}
