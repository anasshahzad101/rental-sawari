"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";

/** "Try again" on the error banner: re-runs the page's server reads. */
export function RetryButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button variant="secondary" icon={RotateCw} loading={pending} loadingText="Loading…" onClick={() => start(() => router.refresh())}>
      Try again
    </Button>
  );
}
