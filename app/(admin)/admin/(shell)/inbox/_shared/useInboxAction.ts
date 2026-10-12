"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useToast, type ToastOptions } from "@/components/admin/ui/Toast";

/**
 * Runs an Inbox server action from a client component:
 *   const { run, pending } = useInboxAction();
 *   await run("approve", () => approveRequestAction(id), {
 *     toast: (r) => ({ message: "Ravi Rent A Car is live" }),
 *     go: (r) => inboxHref("requests", { view: "done", id }),
 *   });
 * Shows the success toast, navigates (`go`) or refreshes, and shows the error
 * as a toast when the action fails. Returns the result, or null on failure.
 */

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export interface RunOptions<R> {
  /** Toast after success (string = message only; null = none). */
  toast?: (r: R) => ToastOptions | string | null;
  /** Navigate here after success (replace, no scroll); otherwise router.refresh(). */
  go?: (r: R) => string | null | undefined;
  /** Don't toast the error (the caller shows it inline). */
  quietError?: boolean;
}

export function useInboxAction() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const run = useCallback(
    async <R extends Result>(key: string, fn: () => Promise<R>, opts: RunOptions<Extract<R, { ok: true }>> = {}): Promise<R | null> => {
      setPending(key);
      try {
        const r = await fn();
        if (!r.ok) {
          if (!opts.quietError) toast({ message: r.error, icon: CircleAlert });
          return r;
        }
        const ok = r as Extract<R, { ok: true }>;
        const t = opts.toast?.(ok);
        if (t) toast(typeof t === "string" ? { message: t } : t);
        const href = opts.go?.(ok);
        if (href) router.replace(href, { scroll: false });
        router.refresh();
        return r;
      } catch {
        toast({ message: "Something went wrong. Try again.", icon: CircleAlert });
        return null;
      } finally {
        setPending(null);
      }
    },
    [router, toast],
  );

  return { run, pending, busy: pending !== null };
}
