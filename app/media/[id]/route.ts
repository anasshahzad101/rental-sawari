import { getMedia } from "@/lib/admin/repo/media";

/** Serves stored logos: /media/{id}. Ids never change content, so cache hard. */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });
  const m = await getMedia(id).catch(() => null);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(m.data), {
    headers: {
      "Content-Type": m.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
