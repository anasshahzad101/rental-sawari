import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { guides } from "@/data/guides";
import { guideContent } from "@/data/guideContent";
import { authors, authorPersonJsonLd } from "@/lib/authors";
import { absoluteImage, SITE_URL } from "@/lib/seo";
import { AdSlot } from "@/components/ads/AdSlot";
import { ADSENSE_SLOTS } from "@/lib/adsense";
import { PageShell } from "@/components/shared/PageShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { BottomCTA } from "@/components/shared/BottomCTA";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const g = guides.find((x) => x.slug === params.slug);
  if (!g) return { title: "Guide not found" };
  const image = absoluteImage(g.image);
  return {
    title: g.title,
    description: g.excerpt,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      title: g.title,
      description: g.excerpt,
      url: `${SITE_URL}/guides/${g.slug}`,
      siteName: "RentalSawari",
      type: "article",
      publishedTime: g.publishedDate,
      authors: ["RentalSawari"],
      images: [{ url: image, alt: g.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: g.title,
      description: g.excerpt,
      images: [image],
    },
  };
}

const dateFmt = new Intl.DateTimeFormat("en-PK", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guides.find((g) => g.slug === params.slug);
  const body = guideContent[params.slug];
  if (!guide || !body) notFound();

  const related = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const author = authors.hassan;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    image: absoluteImage(guide.image),
    datePublished: guide.publishedDate,
    dateModified: guide.publishedDate,
    author: { "@id": `https://rentalsawari.com/about#${author.slug}` },
    publisher: { "@id": "https://rentalsawari.com/#organization" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rentalsawari.com/guides/${guide.slug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block", "h2", ".faq-question", ".faq-answer"],
    },
  };
  const authorJsonLd = authorPersonJsonLd(author);

  return (
    <PageShell
      bottomCTA={
        <BottomCTA
          title="Ready to rent?"
          subtitle="Compare 1,000+ verified rental companies across 8 Pakistani cities."
          primary={{ label: "Browse Cities", href: "/cities" }}
          secondary={{ label: "See All Guides", href: "/guides" }}
        />
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />

      {/* Article header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/guides" },
            { label: guide.title },
          ]}
        />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand">
          {guide.category}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
          {guide.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-stone-500">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
              {author.name.charAt(0)}
            </span>
            <span className="text-stone-700">
              By <Link href="/about" className="font-semibold hover:text-brand">{author.name}</Link>
              <span className="text-stone-400"> · {author.jobTitle}</span>
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {guide.readTime} min read
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={guide.publishedDate}>
            Updated {dateFmt.format(new Date(guide.publishedDate))}
          </time>
        </div>
      </div>

      {/* Hero image */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-200">
          <Image
            src={guide.image}
            alt={guide.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Body */}
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="prose prose-stone max-w-none">
          {body}
        </div>
      </article>

      <AdSlot slot={ADSENSE_SLOTS.guideBody} />

      {/* Back link */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all guides
        </Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-stone-50 border-t border-stone-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-xl font-bold text-stone-900">
              Related guides
            </h2>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="group block rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                      <Image
                        src={g.image}
                        alt={g.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                        {g.category}
                      </span>
                      <h3 className="mt-1.5 text-base font-bold text-stone-900 line-clamp-2">
                        {g.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageShell>
  );
}
