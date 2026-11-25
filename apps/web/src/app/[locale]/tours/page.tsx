import { ensureSeeded, listTours } from '@kt/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TourCatalogClient } from '@/components/TourCatalogClient';
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
    title: `${dict.catalog.title} | ${dict.meta.siteName}`,
    description: dict.catalog.subtitle,
    alternates: {
      canonical: `${baseUrl}/${locale}/tours`,
      languages: {
        en: `${baseUrl}/en/tours`,
        ru: `${baseUrl}/ru/tours`,
        kk: `${baseUrl}/kk/tours`,
      },
    },
  };
}

export default async function ToursCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  ensureSeeded();
  const dict = getDictionary(locale);
  const tours = listTours({ sort: 'recommended' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <p className="font-eyebrow text-[#737373]">
          {dict.catalog.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {dict.catalog.title}
        </h1>
        <p className="mt-3 text-base text-[#737373]">{dict.catalog.subtitle}</p>
      </div>

      <Suspense fallback={<div className="py-12 text-sm text-[#737373]">{dict.catalog.loadingCatalog}</div>}>
        <TourCatalogClient tours={tours} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}
