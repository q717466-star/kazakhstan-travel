import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TripPlannerClient } from '@/components/TripPlannerClient';
import { getDictionary, isValidLocale } from '@/i18n';
import { getSiteUrl } from '@/lib/schema';

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
    title: `${dict.planner.title} | ${dict.meta.siteName}`,
    description: dict.planner.subtitle,
    alternates: {
      canonical: `${baseUrl}/${locale}/plan-your-trip`,
      languages: {
        en: `${baseUrl}/en/plan-your-trip`,
        ru: `${baseUrl}/ru/plan-your-trip`,
        kk: `${baseUrl}/kk/plan-your-trip`,
      },
    },
  };
}

export default async function PlanYourTripPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-eyebrow text-[#737373]">
          {dict.planner.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {dict.planner.title}
        </h1>
        <p className="mt-3 text-base text-[#737373]">{dict.planner.subtitle}</p>
      </div>

      <TripPlannerClient locale={locale} dict={dict} />
    </div>
  );
}
