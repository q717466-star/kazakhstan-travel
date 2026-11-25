import { ensureSeeded, listDestinations, listTours } from '@kt/core';
import { ArrowRight, Mountain } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LivingMedia } from '@/components/LivingMedia';
import { getDictionary, isValidLocale } from '@/i18n';
import { getSiteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  const baseUrl = getSiteUrl();
  return {
    title: `${dict.nav.destinations} | ${dict.meta.siteName}`,
    description: dict.home.destSubheading,
    alternates: {
      canonical: `${baseUrl}/${locale}/destinations`,
      languages: {
        en: `${baseUrl}/en/destinations`,
        ru: `${baseUrl}/ru/destinations`,
        kk: `${baseUrl}/kk/destinations`,
      },
    },
  };
}

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  ensureSeeded();
  const dict = getDictionary(locale);
  const destinations = listDestinations(false);
  const tours = listTours();

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-eyebrow text-[#737373]">
          {dict.home.destEyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {dict.home.destHeading}
        </h1>
        <p className="mt-3 text-base text-[#737373]">{dict.home.destSubheading}</p>
      </div>

      <InteractiveMap
        mode="atlas"
        locale={locale}
        dict={dict}
        destinations={destinations}
        tours={tours}
      />

      <div className="grid gap-8 md:grid-cols-2">
        {destinations.map((dest) => (
          <article
            key={dest.id}
            className="overflow-hidden rounded-[24px] border border-black/[0.08] bg-white p-3"
          >
            <div className="aspect-[16/9] overflow-hidden rounded-[18px] bg-[#F5F5F6]">
              <LivingMedia
                src={dest.image}
                alt={dest.title[locale] || dest.title.en}
                mode="hover-or-dwell"
                dwellMs={1800}
              />
            </div>
            <div className="space-y-3 p-4 pt-5">
              <div className="flex items-center justify-between font-mono-meta text-xs text-[#737373]">
                <span>{dest.regionTag}</span>
                <span className="inline-flex items-center gap-1">
                  <Mountain className="h-3.5 w-3.5 text-[#111111]" />
                  {dest.elevationM} m
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#111111]">
                {dest.title[locale] || dest.title.en}
              </h2>
              <p className="text-sm leading-relaxed text-[#737373]">
                {dest.description[locale] || dest.description.en}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${locale}/tours?country=${encodeURIComponent(dest.country)}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#111111] hover:underline"
                >
                  <span>{dict.home.destViewTours}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
