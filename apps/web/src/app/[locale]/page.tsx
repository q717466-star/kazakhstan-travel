import { ensureSeeded, listDestinations, listReviews, listTours } from '@kt/core';
import { notFound } from 'next/navigation';
import { HomeDesignShell } from '@/components/home/HomeDesignShell';
import { getDictionary, isValidLocale } from '@/i18n';
import { buildTelegramDeepLink, buildWhatsAppDeepLink } from '@/lib/deep-links';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  ensureSeeded();
  const dict = getDictionary(locale);
  const allTours = listTours({ sort: 'popularity' });
  const popularTours = allTours.filter((t) => t.isFeatured);
  const bentoTours = popularTours.length >= 4 ? popularTours : allTours;
  const destinations = listDestinations(false);
  const reviews = listReviews(true).slice(0, 5);
  const tgUrl = buildTelegramDeepLink();
  const waUrl = buildWhatsAppDeepLink(undefined, undefined, locale);

  return (
    <HomeDesignShell
      locale={locale}
      dict={dict}
      allTours={allTours}
      bentoTours={bentoTours}
      destinations={destinations}
      reviews={reviews}
      tgUrl={tgUrl}
      waUrl={waUrl}
    />
  );
}
