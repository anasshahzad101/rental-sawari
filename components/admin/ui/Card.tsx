import * as React from "react";
import type { StatInfoKey } from "@/lib/admin/constants";
import { cx } from "./cx";
import { InfoTooltip, type InfoContent } from "./Tooltip";

export interface CardProps {
  title?: React.ReactNode;
  info?: StatInfoKey | InfoContent;
  subtitle?: React.ReactNode;
  /** Right side of the header (links, segmented control, legend…). */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  /** Padding 24 desktop / 16 mobile. Off for cards holding tables. */
  padded?: boolean;
  id?: string;
}

/** White card: 1 px #E7E5E4 border, radius 16, card shadow, padding 24 / 16. */
export function Card({ title, info, subtitle, actions, children, className, headerClassName, padded = true, id }: CardProps) {
  const hasHeader = title != null || actions != null;
  return (
    <section id={id} className={cx("min-w-0 rounded-card border border-line bg-white shadow-card", padded && "p-4 lg:p-6", className)}>
      {hasHeader ? (
        <div className={cx("mb-3 flex items-start justify-between gap-4 lg:mb-4", !padded && "px-4 pt-4 lg:px-6 lg:pt-5", headerClassName)}>
          <div className="min-w-0">
            {title != null ? (
              <h3 className="flex items-center gap-1.5 text-card-title-m text-ink lg:text-card-title">
                {title}
                {info ? <InfoTooltip info={info} /> : null}
              </h3>
            ) : null}
            {subtitle != null ? <p className="num text-label text-muted">{subtitle}</p> : null}
          </div>
          {actions != null ? <div className="flex flex-none items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export interface PageSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Section heading (700 17/24, 16/22 mobile) + muted sub line, then content. */
export function PageSection({ title, subtitle, actions, children, className }: PageSectionProps) {
  return (
    <section className={cx("flex flex-col gap-3 lg:gap-4", className)}>
      <SectionHeading title={title} subtitle={subtitle} actions={actions} />
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-card-title-m text-ink lg:text-card-title">{title}</h2>
        {subtitle != null ? <p className="text-label text-muted">{subtitle}</p> : null}
      </div>
      {actions != null ? <div className="flex flex-none items-center gap-2">{actions}</div> : null}
    </div>
  );
}
