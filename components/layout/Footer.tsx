import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { cities } from "@/data/cities";
import { popularCarTypes } from "@/data/carTypes";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <FooterCol title="Cities">
            {cities.slice(0, 8).map((c) => (
              <FooterLink key={c.slug} href={`/rent-a-car-${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Popular Cars">
            {popularCarTypes.slice(0, 6).map((c) => (
              <FooterLink key={c.slug} href={`/cars/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="For Businesses">
            <FooterLink href="/list-your-business">List Your Business</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/owner-login">Owner Login</FooterLink>
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} RentalSawari Pakistan ·{" "}
            <span className="text-stone-500">Made in Pakistan 🇵🇰</span>
          </p>
          <div className="flex items-center gap-3">
            <SocialLink href="#" label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="#" label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="#" label="YouTube">
              <Youtube className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-stone-400 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
    >
      {children}
    </a>
  );
}
