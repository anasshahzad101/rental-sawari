"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackContactSubmit } from "@/lib/analytics";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = (data.get("subject") as string) || "(none)";
    // eslint-disable-next-line no-console
    console.log("[contact]", Object.fromEntries(data.entries()));
    trackContactSubmit(subject);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 text-lg font-bold text-stone-900">Message sent</h3>
        <p className="mt-1 text-sm text-stone-600">
          We&apos;ll reply within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-3"
    >
      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Subject" name="subject" required />
      <Field
        label="Message"
        name="message"
        textarea
        rows={5}
        required
      />
      <Button type="submit" variant="primary" size="lg" className="w-full">
        <Send className="h-4 w-4" />
        Send Message
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
}) {
  const base = cn(
    "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm",
    "focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
  );
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-stone-700">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={rows} required={required} className={base} />
      ) : (
        <input name={name} type={type} required={required} className={base} />
      )}
    </label>
  );
}
