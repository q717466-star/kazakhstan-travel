import type { Locale, Review } from '@kt/core';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import type { SiteDictionary } from '@/i18n';
import { LivingMedia } from './LivingMedia';

interface Props {
  reviews: Review[];
  locale: Locale;
  dict: SiteDictionary;
}

const ARCH_TILTS = [
  'lg:-rotate-[3.5deg] lg:translate-y-5',
  'lg:-rotate-[1.7deg] lg:translate-y-1.5',
  'lg:rotate-0 lg:translate-y-0',
  'lg:rotate-[1.7deg] lg:translate-y-1.5',
  'lg:rotate-[3.5deg] lg:translate-y-5',
];

export function FannedReviewsSection({ reviews, locale, dict }: Props) {
  const items = reviews.slice(0, 5);

  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373]">
          <Sparkles className="h-3.5 w-3.5 text-[#9A9AA0]" />
          <span>{dict.home.storiesEyebrow}</span>
        </div>

        <h2 className="font-display mt-3 text-3xl leading-[1.15] tracking-[-0.028em] sm:text-5xl">
          <span className="font-medium text-[#111111]">{dict.home.storiesTitleDark1}</span>{' '}
          <span className="font-normal text-[#9A9AA0]">{dict.home.storiesTitleMuted}</span>
          <span className="block font-medium text-[#111111]">{dict.home.storiesTitleDark2}</span>
        </h2>

        <p className="mx-auto mt-3.5 max-w-md text-xs leading-relaxed text-[#737373] sm:text-sm">
          {dict.home.storiesSubtitle}
        </p>
      </div>

      {/* Wide Fanned 5-Card Strip on Desktop / Snap-Scroll on Mobile */}
      <div className="no-scrollbar mx-auto mt-14 flex max-w-[1520px] snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-2 sm:px-6 lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pb-12">
        {items.map((rev, idx) => {
          const photo = rev.photos[0] || '/images/tours/hero-charyn.webp';
          const tilt = ARCH_TILTS[idx % ARCH_TILTS.length];
          const quote = rev.body[locale] || rev.body.en;

          return (
            <article
              key={rev.id}
              className={`group w-[260px] shrink-0 snap-center rounded-[20px] border border-black/[0.06] bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 lg:w-auto ${tilt} hover:lg:rotate-0 hover:lg:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[#F5F5F6]">
                <LivingMedia
                  src={photo}
                  alt={rev.authorName}
                  mode="hover-or-dwell"
                  hoverMs={450}
                  dwellMs={2000}
                  mediaClassName="transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="space-y-1.5 px-2 pb-2 pt-3">
                <div className="flex items-center gap-0.5 text-[#F5A623]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>

                <h3 className="truncate text-xs font-semibold text-[#111111]">
                  {rev.authorName}
                </h3>

                <p className="line-clamp-3 text-[11px] leading-relaxed text-[#737373]">
                  “{quote}”
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/${locale}/reviews`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] transition-colors hover:text-[#737373]"
        >
          <span>{dict.home.reviewsViewAll}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
