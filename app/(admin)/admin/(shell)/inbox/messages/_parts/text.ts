/** WhatsApp copy for the Messages screen (client-safe). */

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** To the customer who sent an inquiry from a listing page. */
export function inquiryReplyMessage(name: string, listingName: string): string {
  const hi = firstName(name) ? `Assalam o Alaikum ${firstName(name)}` : "Assalam o Alaikum";
  return `${hi}, this is RentalSawari. Thank you for your inquiry${
    listingName ? ` for ${listingName}` : ""
  }. We've passed your details to them and they'll contact you shortly. If you need anything else, reply here. — RentalSawari`;
}

/** To someone who used the contact form and left a number. */
export function contactReplyMessage(name: string): string {
  const hi = firstName(name) ? `Assalam o Alaikum ${firstName(name)}` : "Assalam o Alaikum";
  return `${hi}, this is RentalSawari. Thank you for your message. `;
}

/** To the rental company: the customer's inquiry, ready to forward. */
export function forwardToBusinessMessage(o: { listingName: string; name: string; phone: string | null; details: Array<{ label: string; value: string }>; body: string | null }): string {
  const lines = [
    `Assalam o Alaikum, this is RentalSawari. A customer sent an inquiry for ${o.listingName || "your company"} on RentalSawari.com:`,
    "",
    `Name: ${o.name || "not given"}`,
    ...(o.phone ? [`Phone: ${o.phone}`] : []),
    ...o.details.map((d) => `${d.label}: ${d.value}`),
    ...(o.body ? [`Message: ${o.body}`] : []),
    "",
    "Please contact them directly. Thank you! — RentalSawari",
  ];
  return lines.join("\n");
}
