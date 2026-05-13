"use client";

import * as React from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackInquirySubmit } from "@/lib/analytics";

interface InquiryFormProps {
  companyName: string;
  companySlug?: string;
  city?: string;
  className?: string;
}

export function InquiryForm({
  companyName,
  companySlug,
  city,
  className,
}: InquiryFormProps) {
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const pickupDate = data.get("pickupDate");
    // eslint-disable-next-line no-console
    console.log("[inquiry]", {
      company: companyName,
      name: data.get("name"),
      phone: data.get("phone"),
      pickupDate,
      days: data.get("days"),
      message: data.get("message"),
    });
    if (companySlug && city) {
      trackInquirySubmit(companySlug, city, Boolean(pickupDate));
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-green-200 bg-green-50 p-6 text-center",
          className
        )}
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 text-lg font-bold text-stone-900">Inquiry sent</h3>
        <p className="mt-1 text-sm text-stone-600">
          {companyName} typically responds within a few minutes. For the fastest
          reply, message them on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm",
        className
      )}
    >
      <h3 className="text-lg font-bold text-stone-900">
        Send inquiry to {companyName}
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        Reply within hours. No booking fees.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Your name" name="name" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Pickup date" name="pickupDate" type="date" />
        <Field label="Days" name="days" type="number" min="1" />
      </div>
      <Field
        label="Message"
        name="message"
        textarea
        rows={3}
        placeholder="Which car, pickup location, anything special..."
        className="mt-3"
      />

      <Button type="submit" variant="primary" size="lg" className="mt-4 w-full">
        <Send className="h-4 w-4" />
        Send Inquiry
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
  placeholder,
  min,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  min?: string;
  className?: string;
}) {
  const baseInput = cn(
    "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm",
    "focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
  );
  return (
    <label className={cn("flex flex-col gap-1", className)}>
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
          className={baseInput}
        />
      ) : (
        <input
          name={name}
          type={type}
          min={min}
          placeholder={placeholder}
          required={required}
          className={baseInput}
        />
      )}
    </label>
  );
}
