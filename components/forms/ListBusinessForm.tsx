"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackListBusinessSubmit } from "@/lib/analytics";

export function ListBusinessForm() {
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const city = (data.get("city") as string) || "(unknown)";
    const fleet = (data.get("fleet") as string) || "";
    // eslint-disable-next-line no-console
    console.log("[list-business]", Object.fromEntries(data.entries()));
    trackListBusinessSubmit(city, fleet);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-4 text-xl font-bold text-stone-900">
          Application received
        </h3>
        <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">
          We&apos;ll verify your details within 24 hours and message you on
          WhatsApp to set up your listing. Free basic listings go live the
          same day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-4"
    >
      <h2 className="text-2xl font-extrabold text-stone-900">
        List your business
      </h2>
      <p className="text-sm text-stone-600">
        Tell us about your rental company. Free basic listing, no setup fee.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Company name" name="company" required />
        <Field label="Owner name" name="owner" required />
        <Field label="WhatsApp number" name="whatsapp" type="tel" required />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="City" name="city" required />
        <Field label="Area" name="area" required />
      </div>
      <Field
        label="Fleet size (approx)"
        name="fleet"
        type="number"
        placeholder="How many cars?"
      />
      <Field
        label="Services you offer"
        name="services"
        placeholder="With Driver, Self-Drive, Wedding, Airport, Tourist Tours..."
      />
      <Field
        label="Anything else?"
        name="message"
        textarea
        rows={3}
        placeholder="Languages spoken, special cars, anything that makes you stand out..."
      />

      <Button type="submit" variant="accent" size="lg" className="w-full mt-2">
        <Send className="h-4 w-4" />
        Submit Application
      </Button>

      <p className="text-xs text-stone-500 text-center">
        By submitting you agree to RentalSawari&apos;s terms. We&apos;ll only use
        your number to contact you about your listing.
      </p>
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
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
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
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      )}
    </label>
  );
}
