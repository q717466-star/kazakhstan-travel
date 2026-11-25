import { ensureSeeded, getTourBySlug } from '@kt/core';
import { ChevronRight, Clock, Compass, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingModule } from '@/components/BookingModule';
import { InteractiveMap } from '@/components/InteractiveMap';
import { TourGallery } from '@/components/TourGallery';
import { TourServiceDetails } from '@/components/TourServiceTabs';
import { TourTimeline } from '@/components/TourTimeline';
import { TourViewBeacon } from '@/components/TourViewBeacon';
import { getDictionary, isValidLocale } from '@/i18n';
import { buildBreadcrumbJsonLd, buildTourJsonLd, getSiteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  ensureSeeded();
  const tour = getTourBySlug(slug);
  if (!tour) return {};
  const baseUrl = getSiteUrl();

  return {
    title: tour.seoTitle[locale] || tour.title[locale] || tour.title.en,
    description: tour.seoDescription[locale] || tour.shortDescription[locale],
    alternates: {
      canonical: `${baseUrl}/${locale}/tours/${tour.slug}`,
      languages: {
        en: `${baseUrl}/en/tours/${tour.slug}`,
        ru: `${baseUrl}/ru/tours/${tour.slug}`,
        kk: `${baseUrl}/kk/tours/${tour.slug}`,
      },
    },
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  ensureSeeded();
  const tour = getTourBySlug(slug);
  if (!tour || !tour.isActive) notFound();

  const dict = getDictionary(locale);
  const title = tour.title[locale] || tour.title.en;
  const subtitle = tour.subtitle[locale] || tour.subtitle.en;
  const shortDesc = tour.shortDescription[locale] || tour.shortDescription.en;
  const region = tour.region[locale] || tour.region.en;
  const duration = tour.durationLabel[locale] || tour.durationLabel.en;
  const format = tour.format[locale] || tour.format.en;
  const highlights = tour.highlights[locale] || tour.highlights.en;
  const baseUrl = getSiteUrl();

  const tourLd = buildTourJsonLd(tour, locale);
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: dict.nav.home, url: `${baseUrl}/${locale}` },
    { name: dict.tourDetail.breadcrumbTours, url: `${baseUrl}/${locale}/tours` },
    { name: title, url: `${baseUrl}/${locale}/tours/${tour.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <TourViewBeacon tourCode={tour.code} tourTitle={title} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[#737373]">
        <Link href={`/${locale}`} className="hover:text-[#111111]">
          {dict.nav.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${locale}/tours`} className="hover:text-[#111111]">
          {dict.tourDetail.breadcrumbTours}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate font-medium text-[#111111]">{title}</span>
      </nav>

      {/* Top Overview + Gallery */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3 font-mono-meta text-xs text-[#737373]">
          <span className="rounded-full bg-[#111111] px-3 py-1 font-semibold text-white">
            {dict.tourDetail.codeLabel}: {tour.code}
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans">
            <MapPin className="h-3.5 w-3.5 text-[#111111]" />
            {region}
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans">
            <Clock className="h-3.5 w-3.5 text-[#111111]" />
            {duration}
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans">
            <Compass className="h-3.5 w-3.5 text-[#111111]" />
            {format}
          </span>
        </div>

        <h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.025em] text-[#111111] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-[#737373]">{subtitle}</p>
      </div>

      <TourGallery images={tour.gallery} title={title} />

      {/* Main Content Grid: Left Details + Right Sticky Booking */}
      <div className="mt-12 grid items-start gap-10 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-8">
          {/* Overview & Highlights */}
          <section className="space-y-4">
            <p className="text-base leading-relaxed text-[#111111]">{shortDesc}</p>
            <div className="rounded-[22px] border border-black/[0.06] bg-[#F5F5F6] p-6">
              <h2 className="font-mono-meta mb-3 text-xs uppercase tracking-[0.18em] text-[#737373]">
                {dict.tourDetail.highlightsTitle}
              </h2>
              <ul className="grid gap-2.5 text-sm font-medium text-[#111111] sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Interactive Timeline */}
          <section className="space-y-6">
            <div>
              <p className="font-eyebrow text-[#737373]">
                {dict.tourDetail.itineraryEyebrow}
              </p>
              <h2 className="font-display mt-1 text-3xl font-semibold text-[#111111] sm:text-4xl">
                {dict.tourDetail.itineraryTitle}
              </h2>
            </div>
            <TourTimeline days={tour.itineraryDays} locale={locale} dict={dict} />
          </section>

          {/* Interactive Route Map */}
          {tour.routePoints.length > 0 && (
            <section className="space-y-5">
              <h2 className="font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
                {dict.tourDetail.mapTitle}
              </h2>
              <InteractiveMap
                mode="route"
                locale={locale}
                dict={dict}
                points={tour.routePoints}
              />
            </section>
          )}

          {/* Logistics & Terms */}
          <section className="space-y-5">
            <h2 className="font-display text-3xl font-semibold text-[#111111] sm:text-4xl">
              {dict.tourDetail.logisticsTitle}
            </h2>
            <TourServiceDetails tour={tour} locale={locale} dict={dict} />
          </section>
        </div>

        <div className="lg:col-span-4">
          <BookingModule tour={tour} locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
