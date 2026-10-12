import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/shell";
import { KitDemo } from "./KitDemo";

/**
 * /admin/kit — the admin UI kit with every component and state, for checking
 * against design/Page 01. Development only: 404 in production.
 */

export const metadata: Metadata = { title: "Design system" };

export default function KitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <AdminFrame inboxCount={9}>
      <KitDemo />
    </AdminFrame>
  );
}
