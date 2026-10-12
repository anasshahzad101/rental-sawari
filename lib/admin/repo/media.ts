import "server-only";
import { getDb } from "../db";

/**
 * Logos, stored in the database (Hostinger's app folder is replaced on every
 * deploy, so files on disk would vanish). Forms shrink a logo to at most
 * 512 px in the browser before sending it, so rows stay small.
 * Served by app/media/[id]/route.ts as /media/{id}.
 */

const MAX_BYTES = 600 * 1024;
const OK_MIME = new Set(["image/webp", "image/png", "image/jpeg"]);

export class MediaError extends Error {}

/** Store a data: URL; returns its public path ("/media/12"). */
export async function storeDataUrl(dataUrl: string, ref: string): Promise<string> {
  const m = /^data:([a-z/+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!m) throw new MediaError("That file isn't an image we can use.");
  const mime = m[1];
  if (!OK_MIME.has(mime)) throw new MediaError("Use a PNG, JPG or WebP image.");
  const data = Buffer.from(m[2], "base64");
  if (data.length > MAX_BYTES) throw new MediaError("That logo is too big. Use one under 2 MB.");
  const d = await getDb();
  const id = await d.insert("media", { createdAt: new Date().toISOString(), mime, size: data.length, data, ref });
  return `/media/${id}`;
}

/** A logo value from a form: keep existing /media paths, store new data URLs. */
export async function resolveLogo(value: string | null | undefined, ref: string): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("data:")) return storeDataUrl(value, ref);
  if (value.startsWith("/media/") || /^https?:\/\//.test(value)) return value;
  return null;
}

export async function getMedia(id: number): Promise<{ mime: string; data: Buffer } | null> {
  const d = await getDb();
  const row = await d.get<{ mime: string; data: Buffer }>("media", id);
  return row ? { mime: row.mime, data: row.data } : null;
}
