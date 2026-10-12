import * as React from "react";
import { ToastProvider } from "../ui/Toast";
import { MobileTabBar } from "./MobileTabBar";
import { Sidebar } from "./Sidebar";

export interface AdminFrameProps {
  /** Everything waiting in the Inbox (sidebar and tab-bar badge). */
  inboxCount: number;
  children: React.ReactNode;
}

/**
 * The signed-in layout: 248 px sticky sidebar + content column on desktop;
 * a fixed bottom tab bar on mobile (content is padded to clear it). Wraps
 * everything in the ToastProvider.
 */
export function AdminFrame({ inboxCount, children }: AdminFrameProps) {
  return (
    <ToastProvider inShell>
      <div className="min-h-screen bg-page lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <Sidebar inboxCount={inboxCount} />
        <div className="flex min-w-0 flex-col pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
      </div>
      <MobileTabBar inboxCount={inboxCount} />
    </ToastProvider>
  );
}

/** Standard page padding: 32 desktop, 16 mobile (12 on top under the date trigger). */
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={["flex min-w-0 flex-col gap-3 px-4 py-3 lg:gap-6 lg:p-8", className].filter(Boolean).join(" ")}>{children}</main>;
}
