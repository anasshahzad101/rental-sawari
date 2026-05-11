"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Menu, MessageCircle, X, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { cities } from "@/data/cities";
import { popularCarTypes } from "@/data/carTypes";
import { cn } from "@/lib/utils";

const topCities = cities.slice(0, 6);
const topCars = popularCarTypes.slice(0, 6);

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [lang, setLang] = React.useState<"EN" | "UR">("EN");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile: hamburger */}
        <button
          type="button"
          className="md:hidden -ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <div className="flex md:flex-none flex-1 justify-center md:justify-start">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
                Cities <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[14rem]">
              <DropdownMenuLabel>Top cities</DropdownMenuLabel>
              {topCities.map((c) => (
                <DropdownMenuItem key={c.slug} asChild>
                  <Link href={`/rent-a-car-${c.slug}`} className="w-full">
                    {c.name}
                    <span className="ml-auto text-xs text-stone-500">
                      {c.listingCount}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/cities" className="w-full font-semibold text-brand">
                  Browse all cities →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
                Car Types <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[14rem]">
              <DropdownMenuLabel>Popular cars</DropdownMenuLabel>
              {topCars.map((c) => (
                <DropdownMenuItem key={c.slug} asChild>
                  <Link href={`/cars/${c.slug}`} className="w-full">
                    {c.name}
                    <span className="ml-auto text-xs text-stone-500">
                      PKR {c.startingPrice.toLocaleString()}/d
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/cars" className="w-full font-semibold text-brand">
                  Browse all car types →
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink href="/wedding-car-rental">Wedding</NavLink>
          <NavLink href="/tourist-car-rental">Tourist</NavLink>
          <NavLink href="/guides">Guides</NavLink>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang((l) => (l === "EN" ? "UR" : "EN"))}
            className="hidden md:inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang}
          </button>

          {/* Mobile WhatsApp icon */}
          <a
            href="#"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-whatsapp hover:bg-stone-100"
            aria-label="Contact via WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>

          <Button asChild variant="accent" size="sm" className="hidden md:inline-flex">
            <Link href="/list-your-business">List Your Business</Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            <MobileLink href="/cities">Cities</MobileLink>
            <MobileLink href="/cars">Car Types</MobileLink>
            <MobileLink href="/wedding-car-rental">Wedding</MobileLink>
            <MobileLink href="/tourist-car-rental">Tourist</MobileLink>
            <MobileLink href="/guides">Guides</MobileLink>
            <div className="my-2 h-px bg-stone-200" />
            <Button asChild variant="accent" size="md" className="w-full">
              <Link href="/list-your-business">List Your Business</Link>
            </Button>
            <button
              type="button"
              onClick={() => setLang((l) => (l === "EN" ? "UR" : "EN"))}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm font-semibold"
            >
              <Globe className="h-4 w-4" />
              Language: {lang}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl px-4 py-3 text-base font-semibold text-stone-900",
        "hover:bg-stone-100"
      )}
    >
      {children}
    </Link>
  );
}
