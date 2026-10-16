import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  if (await isAdmin()) redirect("/admin");
  const next = typeof searchParams.next === "string" && searchParams.next.startsWith("/admin") ? searchParams.next : "/admin";
  return (
    <main className="min-h-screen bg-page lg:grid lg:place-items-center">
      <div className="px-5 pb-8 pt-[72px] lg:w-[400px] lg:rounded-dialog lg:border lg:border-line lg:bg-surface lg:p-8 lg:shadow-[0_1px_2px_rgba(28,25,23,0.04),0_24px_48px_-24px_rgba(28,25,23,0.2)]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/admin/logo-tile.png" alt="RentalSawari" width={44} height={44} className="h-11 w-11 rounded-[11px]" />
          <div className="flex flex-col gap-[3px]">
            <div className="text-[22px] font-extrabold leading-6 tracking-[-0.02em]">
              <span className="text-ink">Rental</span>
              <span className="text-brand-700">Sawari</span>
            </div>
            <div className="text-[10px] font-semibold leading-[10px] tracking-[0.38em] text-muted">PAKISTAN</div>
          </div>
        </div>
        <h1 className="mt-8 text-page-title-m lg:mt-7 lg:text-page-title">RentalSawari Admin</h1>
        <p className="mt-1.5 text-body-m text-muted lg:text-body">Enter your password to continue.</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
