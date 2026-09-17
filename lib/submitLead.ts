import type { LeadFormType } from "@/lib/leads";

/**
 * Client-side helper the three form components share. Posts to /api/lead and
 * normalises every failure mode into one `{ ok, error }` shape so each form
 * can render the same fallback message.
 */
export async function submitLead(input: {
  formType: LeadFormType;
  fields: Record<string, string>;
  /** Hidden honeypot value — pass the input's value straight through. */
  website?: string;
  /** Milliseconds between form mount and submit. */
  elapsedMs?: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        page: typeof window === "undefined" ? undefined : window.location.pathname,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };

    if (res.ok && data.ok) return { ok: true };
    return {
      ok: false,
      error:
        data.error ||
        "We could not send your message. Please WhatsApp us instead.",
    };
  } catch {
    return {
      ok: false,
      error: "Network problem. Check your connection, or WhatsApp us instead.",
    };
  }
}
