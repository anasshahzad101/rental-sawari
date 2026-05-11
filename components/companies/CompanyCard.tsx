import Link from "next/link";
import { Star, BadgeCheck, MessageCircle, Clock } from "lucide-react";
import type { Company } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "./CompanyAvatar";
import {
  buildWhatsAppLink,
  DEFAULT_WHATSAPP_MESSAGE,
  formatPKR,
} from "@/lib/utils";

interface CompanyCardProps {
  company: Company;
  showFeaturedBadge?: boolean;
}

export function CompanyCard({
  company,
  showFeaturedBadge = true,
}: CompanyCardProps) {
  const waLink = buildWhatsAppLink(company.whatsapp, DEFAULT_WHATSAPP_MESSAGE, {
    companySlug: company.slug,
  });

  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {showFeaturedBadge && company.featured && (
        <Badge variant="featured" className="absolute right-4 top-4">
          Featured
        </Badge>
      )}

      <div className="flex items-start gap-3 pr-20">
        <CompanyAvatar name={company.name} logoUrl={company.logo} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-stone-900 truncate">
            {company.name}
          </h3>
          <p className="text-xs text-stone-500">
            {company.area} · {company.city}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-stone-900">
            {company.rating.toFixed(1)}
          </span>
          <span className="text-stone-500">
            ({company.reviewCount} reviews)
          </span>
        </div>
        {company.verified && (
          <Badge variant="verified">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      {company.topCars && company.topCars.length > 0 ? (
        <ul className="mt-4 divide-y divide-stone-100 rounded-xl border border-stone-100 bg-stone-50/60">
          {company.topCars.map((car) => (
            <li
              key={car.name}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="font-medium text-stone-900 truncate">
                {car.name}
              </span>
              <span className="font-bold text-brand whitespace-nowrap">
                {formatPKR(car.pricePerDay)}/day
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-3 text-sm">
          <p className="font-semibold text-stone-700">Services</p>
          <p className="mt-1 text-stone-600 line-clamp-2">
            {company.servicesOffered.join(" · ")}
          </p>
          <p className="mt-2 text-xs font-semibold text-brand">
            Contact for fleet &amp; pricing →
          </p>
        </div>
      )}

      {company.topCars && company.topCars.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {company.servicesOffered.slice(0, 3).map((service) => (
            <li key={service}>
              <Badge variant="muted">{service}</Badge>
            </li>
          ))}
        </ul>
      )}

      {company.responseTime && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-stone-500">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {company.responseTime}
        </p>
      )}

      <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
        <Button asChild variant="whatsapp" size="md">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contact ${company.name} via WhatsApp`}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href={`/companies/${company.slug}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
