import type { Listing } from "@/lib/admin/types";
import type { ListingFormInput } from "@/app/(admin)/admin/_actions/listings";
import { areasByCity, editable } from "@/lib/admin/repo/listings";
import { ListingForm } from "./_edit/ListingForm";

/** The listing as the form's starting values (same shape as listingFormValues). */
function formValues(l: Listing): ListingFormInput {
  const e = editable(l);
  return {
    name: e.name,
    slug: e.slug,
    city: e.city,
    area: e.area,
    whatsapp: e.whatsapp,
    phone: e.phone,
    phone2: e.phone2 ?? "",
    website: e.website ?? "",
    mapsUrl: e.mapsUrl ?? "",
    about: e.about,
    services: e.services,
    cars: e.cars,
    logo: e.logoUrl,
    googleRating: e.googleRating,
    googleReviews: e.googleReviews,
    verified: e.verified,
    plan: e.plan,
    planStart: e.planStart,
    planEnd: e.planEnd,
    status: e.status,
  };
}

/** Listing › Edit: one form in groups; nothing changes until Update listing. */
export default async function EditTab({ listing }: { listing: Listing }) {
  const areas = await areasByCity();
  return <ListingForm key={listing.id} mode="edit" listingId={listing.id} initial={formValues(listing)} stamp={listing.updatedAt} areas={areas} />;
}
