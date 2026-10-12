import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { ClaimFlow, type ClaimListing } from "@/components/public-forms/ClaimFlow";
import { areasByCity } from "@/components/public-forms/areas";
import { getCompanies, getCompanyBySlug, getRenamedSlug } from "@/lib/admin/repo/public";
import type { CarRow } from "@/lib/admin/types";

// Same refresh rule as the profile page: rebuilt on every listing change and
// at most every 5 minutes otherwise.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getCompanyBySlug(params.slug);
  if (!c) return { title: "Listing not found", robots: { index: false, follow: false } };
  return {
    title: `Claim ${c.name}`,
    description: `Own or work at ${c.name}? Claim the listing to update your phone, prices, cars and photos.`,
    alternates: { canonical: `/companies/${c.slug}/claim` },
    robots: { index: false, follow: true },
  };
}

export default async function ClaimListingPage({ params }: { params: { slug: string } }) {
  const companies = await getCompanies();
  const company = companies.find((c) => c.slug === params.slug);
  if (!company) {
    // A renamed listing keeps its old claim address working.
    const moved = await getRenamedSlug(params.slug);
    if (moved) permanentRedirect(`/companies/${moved}/claim`);
    notFound();
  }

  const listing: ClaimListing = {
    slug: company.slug,
    name: company.name,
    city: company.city,
    area: company.area,
    whatsapp: company.whatsapp,
    phone: company.phone,
    website: company.website ?? "",
    about: company.about ?? "",
    services: company.servicesOffered ?? [],
    cars: (company.topCars ?? []).map((c): CarRow => ({
      name: c.name,
      pricePerDay: c.pricePerDay,
      mode: c.withDriver ? "driver" : "self",
    })),
    // Placeholder stubs aren't real logos; treat them as "no logo".
    logo: company.logo && !company.logo.includes("placehold.co") ? company.logo : null,
  };

  return (
    <PageShell>
      <ClaimFlow listing={listing} areasByCity={areasByCity(companies)} />
    </PageShell>
  );
}
