import * as React from "react";
import { Inbox } from "lucide-react";
import { cx } from "./cx";
import type { IconComponent } from "./icons";

export interface EmptyStateProps {
  icon?: IconComponent;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Usually a secondary Button. */
  action?: React.ReactNode;
  className?: string;
}

/** 56 px round teal icon, title 700 17, body 15 muted, optional action. */
export function EmptyState({ icon: Icon = Inbox, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-1 px-4 py-6 text-center lg:p-6", className)}>
      <div className="mb-3 grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="text-[17px]/[24px] font-bold text-ink">{title}</div>
      {body ? <div className="max-w-[420px] text-body-m text-muted lg:text-body">{body}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
