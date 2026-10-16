"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";
import { removeDemoAction } from "../../_actions/demo";

/**
 * Shown on the Overview while demo data exists. The kill switch deletes
 * all of it for good (lib/admin/repo/demo.ts).
 */
export function DemoKillSwitch({ listings, inbox }: { listings: number; inbox: number }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const kill = async () => {
    setError(null);
    const r = await removeDemoAction();
    if (!r.ok) {
      setError(r.error);
      throw new Error(r.error);
    }
    toast({ message: "Demo data deleted. Only real numbers from now on.", icon: Trash2 });
    router.refresh();
  };

  return (
    <section
      aria-label="Demo data"
      className="flex flex-col gap-4 rounded-card border-2 border-bad-border bg-white p-4 shadow-card lg:flex-row lg:items-center lg:gap-6 lg:p-6"
    >
      <div className="flex min-w-0 flex-1 gap-3 lg:gap-4">
        <span className="grid size-11 flex-none place-items-center rounded-full bg-wait-fill text-wait-text lg:size-12">
          <FlaskConical size={22} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-card-title-m text-ink lg:text-card-title">You&apos;re looking at demo data</div>
          <p className="mt-1 text-body-m text-ink-2 [text-wrap:pretty] lg:text-body">
            The stats, the {listings} listings marked <b className="font-semibold text-ink">(Demo)</b> and {inbox} inbox items are made up so you can
            learn the dashboard. Demo listings never show on the public site. Real visits are already being counted and stay when you delete the demo.
          </p>
        </div>
      </div>
      <Button variant="destructive" size="lg" icon={Power} onClick={() => setOpen(true)} className="lg:flex-none">
        Kill switch: delete demo data
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        tone="danger"
        icon={Trash2}
        title="Delete all demo data?"
        body="This removes the demo listings, the made-up stats and the sample inbox items for good. Your real listings, real visits and real requests are not touched. This can't be undone."
        actionLabel="Delete demo data"
        loadingLabel="Deleting…"
        onConfirm={kill}
        size="md"
      >
        {error ? <p className="text-label text-bad-text">{error}</p> : null}
      </ConfirmDialog>
    </section>
  );
}
