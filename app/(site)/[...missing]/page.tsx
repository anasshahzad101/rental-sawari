import { notFound } from "next/navigation";

/**
 * The site and the admin each have their own root layout (route groups), so
 * there is no app/layout.tsx and Next would show its bare default 404 for an
 * unknown URL. Catching every unmatched path here and calling notFound()
 * sends it to app/(site)/not-found.tsx instead — the branded 404.
 * Every real route is more specific than this one, so it never shadows them.
 */
export default function Missing() {
  notFound();
}
