import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact RentalSawari Pakistan",
  description:
    "Get in touch with the RentalSawari team. WhatsApp, email, or use the contact form below. Replies within 1 business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="Contact"
        title="Get in touch"
        subtitle="Questions, feedback, partnership ideas, or just want to say hi — we read every message."
      />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: channels */}
          <div className="space-y-4">
            <ContactCard
              Icon={MessageCircle}
              label="WhatsApp"
              value="+92 300 1234567"
              href="https://wa.me/923001234567"
              accent="whatsapp"
            />
            <ContactCard
              Icon={Mail}
              label="Email"
              value="hello@rentalsawari.com"
              href="mailto:hello@rentalsawari.com"
            />
            <ContactCard
              Icon={MapPin}
              label="Office"
              value="Lahore, Pakistan"
            />
            <ContactCard
              Icon={Clock}
              label="Hours"
              value="Mon–Sat, 9 AM – 7 PM PKT"
            />

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Looking for…
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="/list-your-business"
                    className="font-semibold text-brand hover:underline"
                  >
                    To list your rental company? →
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="font-semibold text-brand hover:underline"
                  >
                    Featured listing pricing? →
                  </a>
                </li>
                <li>
                  <a
                    href="/owner-login"
                    className="font-semibold text-brand hover:underline"
                  >
                    Already listed and need to update? →
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-4">
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ContactCard({
  Icon,
  label,
  value,
  href,
  accent,
}: {
  Icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  accent?: "whatsapp";
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
          accent === "whatsapp"
            ? "bg-whatsapp/10 text-whatsapp"
            : "bg-brand/10 text-brand"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {label}
        </p>
        <p className="text-base font-bold text-stone-900 truncate">{value}</p>
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="block hover:-translate-y-0.5 transition-transform"
    >
      {inner}
    </a>
  );
}
