import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-stone-200 bg-gradient-to-b from-stone-50 to-white",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {crumbs && crumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-3xl text-base sm:text-lg text-stone-600">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
