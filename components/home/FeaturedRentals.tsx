import { featuredCompanies } from "@/data/companies";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { SectionHeading } from "./SectionHeading";

export function FeaturedRentals() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <SectionHeading
        title="Featured Rental Companies"
        subtitle="These rental companies have premium listings · Sponsored placement"
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {featuredCompanies.map((company) => (
          <li key={company.slug}>
            <CompanyCard company={company} />
          </li>
        ))}
      </ul>
    </section>
  );
}
