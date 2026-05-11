import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomCTAProps {
  title: string;
  subtitle?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

export function BottomCTA({
  title,
  subtitle,
  primary,
  secondary,
}: BottomCTAProps) {
  return (
    <section className="bg-brand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-white/85 max-w-xl">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
            <Button asChild variant="accent" size="lg">
              <Link href={primary.href}>
                {primary.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {secondary && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-white/40 text-white hover:bg-white/10"
              >
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
