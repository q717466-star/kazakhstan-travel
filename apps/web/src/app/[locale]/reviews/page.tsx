import { ensureSeeded, listReviews } from '@kt/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReviewCardsClient } from '@/components/ReviewCardsClient';
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
    title: `${dict.nav.reviews} | ${dict.meta.siteName}`,
    description: dict.reviewsPage.subtitle,
    alternates: {
      canonical: `${baseUrl}/${locale}/reviews`,
      languages: {
        en: `${baseUrl}/en/reviews`,
        ru: `${baseUrl}/ru/reviews`,
        kk: `${baseUrl}/kk/reviews`,
      },
    },
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  ensureSeeded();
  const dict = getDictionary(locale);
  const reviews = listReviews(false);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-eyebrow text-[#737373]">
          {dict.reviewsPage.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {dict.reviewsPage.title}
        </h1>
        <p className="mt-3 text-base text-[#737373]">{dict.reviewsPage.subtitle}</p>
      </div>

      <ReviewCardsClient reviews={reviews} locale={locale} dict={dict} />
    </div>
  );
}
