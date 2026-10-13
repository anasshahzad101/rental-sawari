import "server-only";
import { getDb } from "../db";
import type { Row } from "../db/driver";
import type { MessageKind, MessageStatus, SiteMessage } from "../types";

/**
 * Messages: the contact form and the "Send inquiry" form on listing pages
 * (app/api/lead). Each one is saved here first and then emailed, so the
 * Inbox has it even when the email fails.
 */

export interface NewMessage {
  kind: MessageKind;
  listingId: number | null;
  listingName: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  body: string | null;
  details: Record<string, string>;
  page: string;
}

export async function createMessage(m: NewMessage): Promise<number> {
  const d = await getDb();
  const now = new Date().toISOString();
  return d.insert("messages", { ...m, createdAt: now, updatedAt: now, emailed: false, status: "new", doneAt: null } as Row);
}

export async function markEmailed(id: number) {
  const d = await getDb();
  await d.update("messages", { id }, { emailed: true });
}

/** Newest first. */
export async function listMessages(): Promise<SiteMessage[]> {
  const d = await getDb();
  return d.select<SiteMessage>("messages", undefined, { orderBy: "id", desc: true });
}

export async function getMessage(id: number): Promise<SiteMessage | null> {
  const d = await getDb();
  return d.get<SiteMessage>("messages", id);
}

export async function setMessageStatus(id: number, status: MessageStatus) {
  const d = await getDb();
  const now = new Date().toISOString();
  const n = await d.update("messages", { id }, { status, doneAt: status === "done" ? now : null, updatedAt: now });
  if (!n) throw new Error("Message not found");
}

/** For spam: removes the message for good. */
export async function deleteMessage(id: number) {
  const d = await getDb();
  const n = await d.remove("messages", { id });
  if (!n) throw new Error("Message not found");
}
