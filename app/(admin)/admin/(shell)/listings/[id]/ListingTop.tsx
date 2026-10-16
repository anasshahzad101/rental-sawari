"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Link2 } from "lucide-react";
import type { Listing } from "@/lib/admin/types";
import { ListingHeader } from "@/components/admin/shell";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { MenuList } from "@/components/admin/ui/Popover";
import { useToast } from "@/components/admin/ui/Toast";
import { setListingStatusAction, undoVersionAction } from "../../../_actions/listings";

/**
 * The listing header shared by the Stats, Edit and History tabs, with its ⋯
 * menu: Hide listing… (confirm, then a toast with Undo), Show on the site
 * again, and Copy page link.
 */
export function ListingTop({ listing, tab, query }: { listing: Listing; tab: "stats" | "edit" | "history"; query: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmHide, setConfirmHide] = useState(false);

  async function setStatus(status: "live" | "hidden") {
    const r = await setListingStatusAction(listing.id, status);
    if (!r.ok) {
      toast({ message: r.error, icon: null });
      return;
    }
    router.refresh();
    const vid = r.versionId;
    toast({
      message: status === "hidden" ? `${listing.name} hidden from the site` : `${listing.name} is live again`,
      undo: vid
        ? async () => {
            const u = await undoVersionAction(vid);
            if (!u.ok) toast({ message: u.error, icon: null });
            router.refresh();
          }
        : undefined,
    });
  }

  const pageUrl = `https://rentalsawari.com/companies/${listing.slug}`;
  const menu = (
    <MenuList
      items={[
        listing.status === "live"
          ? { key: "hide", label: "Hide listing…", icon: EyeOff, tone: "danger", onSelect: () => setConfirmHide(true) }
          : { key: "show", label: "Show on the site again", icon: Eye, onSelect: () => void setStatus("live") },
        {
          key: "copy",
          label: "Copy page link",
          icon: Link2,
          onSelect: () => {
            void navigator.clipboard?.writeText(pageUrl);
            toast({ message: "Page link copied" });
          },
        },
      ]}
    />
  );

  return (
    <>
      <ListingHeader listing={listing} tab={tab} menu={menu} query={query} />
      <ConfirmDialog
        open={confirmHide}
        onClose={() => setConfirmHide(false)}
        tone="danger"
        icon={EyeOff}
        title={`Hide ${listing.name}?`}
        body="It will disappear from the site but stay in the admin. You can show it again any time."
        actionLabel="Hide listing"
        loadingLabel="Hiding…"
        onConfirm={() => setStatus("hidden")}
      />
    </>
  );
}
