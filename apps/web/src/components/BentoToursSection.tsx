import type { Locale, Tour } from '@kt/core';
import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';
import Link from 'next/link';
import type { SiteDictionary } from '@/i18n';
import { LivingMedia } from './LivingMedia';

interface Props {
  tours: Tour[];
  locale: Locale;
  dict: SiteDictionary;
}

export function BentoToursSection({ tours, locale, dict }: Props) {
  const showcaseTours = tours.slice(0, 4);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373]">
            <Compass className="h-3.5 w-3.5 text-[#9A9AA0]" />
            <span>{dict.home.bentoEyebrow}</span>
          </div>

          <h2 className="font-display mt-3 text-3xl leading-[1.15] tracking-[-0.028em] sm:text-5xl">
            <span className="font-medium text-[#111111]">{dict.home.bentoTitleDark1}</span>{' '}
            <span className="font-normal text-[#9A9AA0]">{dict.home.bentoTitleMuted}</span>
            <span className="block font-medium text-[#111111]">{dict.home.bentoTitleDark2}</span>
          </h2>

          <p className="mx-auto mt-3.5 max-w-lg text-xs leading-relaxed text-[#737373] sm:text-sm">
            {dict.home.bentoSubtitle}
          </p>
        </div>

        {/* Asymmetric 1 + 4 Bento Grid */}
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-12">
          <Link
            href={`/${locale}/tours`}
            className="group relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#141414] p-7 text-white lg:col-span-5 lg:min-h-[540px]"
          >
            <div className="absolute inset-0">
              <LivingMedia
                src="/images/tours/bao-reflection.webp"
                alt={dict.home.bentoFeatureLine3}
                mode="ambient"
                dwellMs={1200}
                priority="high"
                mediaClassName="transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />

            <div className="relative z-10 flex items-center justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                <span>{dict.home.bentoCatalogBadge}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="relative z-10">
              <p className="font-display text-3xl font-normal leading-[1.14] tracking-[-0.025em] text-white sm:text-[34px]">
                <span className="block">{dict.home.bentoFeatureLine1}</span>
                <span className="block">{dict.home.bentoFeatureLine2}</span>
                <span className="block">{dict.home.bentoFeatureLine3}</span>
              </p>
            </div>
          </Link>

          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:col-span-7">
            {showcaseTours.map((tour) => {
              const title = tour.title[locale] || tour.title.en;
              const shortDesc = tour.shortDescription[locale] || tour.shortDescription.en;
              const rawPriceUnit = tour.priceUnit[locale] || tour.priceUnit.en;
              const compactPriceUnit = rawPriceUnit.split(' (')[0];

              return (
                <article key={tour.id} className="group flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/${locale}/tours/${tour.slug}`}
                      className="block aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-[#F5F5F6]"
                    >
                      <LivingMedia
                        src={tour.coverImage}
                        alt={title}
                        mode="hover-or-dwell"
                        hoverMs={450}
                        dwellMs={1700}
                        mediaClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </Link>

                    <h3 className="mt-3.5 text-[17px] font-semibold leading-snug tracking-[-0.015em] text-[#111111]">
                      <Link href={`/${locale}/tours/${tour.slug}`} className="transition-colors hover:text-[#525252]">
                        {title}
                      </Link>
                    </h3>

                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#737373]">
                      {shortDesc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-1">
                    <div className="min-w-0 truncate">
                      <span className="text-base font-bold text-[#111111]">
                        ${tour.priceFromUsd.toLocaleString('en-US')}
                      </span>
                      <span className="ml-1 text-xs text-[#737373]">/ {compactPriceUnit}</span>
                    </div>

                    <Link
                      href={`/${locale}/tours/${tour.slug}`}
                      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#111111] transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <span>{dict.home.bentoBookNow}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/tours`}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-[#F5F5F6] px-6 py-2.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            <span>{dict.home.toursViewAll}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
