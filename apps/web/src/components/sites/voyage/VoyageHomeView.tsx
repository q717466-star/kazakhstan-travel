'use client';

import type { Locale } from '@kt/core';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LivingMedia } from '@/components/LivingMedia';
import type { HomeViewProps } from '@/components/home/AlpineHomeView';
import { resolveImageSrc } from '@/lib/media-manifest';

const NOTE_THEMES = [
  'bg-[#F6C88B] text-[#111111] sm:-rotate-[3deg]',
  'bg-white border border-black/[0.07] text-[#111111] shadow-md sm:rotate-[3.5deg] sm:translate-y-2',
  'bg-[#F7F8FA] border border-black/[0.06] text-[#111111] shadow-sm sm:-rotate-[2deg]',
  'bg-[#A7EFE2] text-[#111111] sm:rotate-[2.5deg] sm:translate-y-1',
];

export function VoyageHomeView({
  locale,
  dict,
  allTours,
  bentoTours,
  destinations,
  reviews,
}: HomeViewProps) {
  const router = useRouter();

  const destList = destinations.slice(0, 6);
  const featuredList = (bentoTours.length >= 3 ? bentoTours : allTours).slice(0, 5);
  const expList = allTours.slice(0, 4);
  const stickyReviews = reviews.slice(0, 4);

  const [destIdx, setDestIdx] = useState(0);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [expIdx, setExpIdx] = useState(expList.length > 3 ? 3 : 0);
  const [ctaEmail, setCtaEmail] = useState('');

  const destCount = destList.length || 1;
  const activeDest = destList[destIdx % destCount];
  const prevDest = destList[(destIdx - 1 + destCount) % destCount];
  const nextDest = destList[(destIdx + 1) % destCount];

  const activeFeatured = featuredList[featuredIdx % (featuredList.length || 1)];
  const activeExp = expList[expIdx % (expList.length || 1)];

  function localizedCountry(country: string): string {
    if (country === 'Kyrgyzstan') return dict.countries.kyrgyzstan;
    if (country === 'Central Asia') return dict.countries.centralAsia;
    return dict.countries.kazakhstan;
  }

  function handleCtaSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = ctaEmail.trim();
    if (cleaned) {
      router.push(`/${locale}/contacts?email=${encodeURIComponent(cleaned)}`);
    } else {
      router.push(`/${locale}/plan-your-trip`);
    }
  }

  return (
    <div className="kt-custom-view bg-white text-[#111111]">
      {/* 1. Sunlit Sky Full-Bleed Hero with Seamless White Cloud Mist Fade */}
      <section className="relative min-h-[86svh] sm:min-h-[90svh] overflow-hidden bg-[#0E7490]">
        <div className="absolute inset-0">
          <LivingMedia
            src="/images/tours/kolsai-boats.webp"
            alt={dict.designSwitcher.voyageHeroTitle1}
            loading="eager"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#035388]/45 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-white via-white/85 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[86svh] sm:min-h-[90svh] max-w-[1180px] flex-col justify-between px-6 pt-28 pb-32 sm:px-8 sm:pt-36 sm:pb-40">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.03em] text-white drop-shadow-sm sm:text-6xl lg:text-[66px]">
            <span className="block">{dict.designSwitcher.voyageHeroTitle1}</span>
            <span className="block">{dict.designSwitcher.voyageHeroTitle2}</span>
          </h1>

          <div className="mt-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="inline-block w-fit rounded-2xl border border-white/25 bg-black/30 px-4 py-3 text-white backdrop-blur-md shadow-sm">
              <p className="text-xs font-semibold sm:text-sm">{dict.designSwitcher.voyageRatingTitle}</p>
              <div className="mt-1 flex items-center gap-0.5 text-[#F5A623]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-white/85">{dict.designSwitcher.voyageRatingSub}</p>
            </div>

            <div className="w-56 rounded-2xl border border-white/30 bg-black/30 p-4 text-white backdrop-blur-md shadow-lg">
              <div className="flex items-center -space-x-2">
                {[
                  '/images/tours/kolsai-horseback.webp',
                  '/images/tours/asy-yurt.webp',
                  '/images/tours/charyn-day-trip.webp',
                ].map((src) => (
                  <img
                    key={src}
                    src={resolveImageSrc(src)}
                    alt=""
                    className="h-7 w-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="mt-2.5 text-sm font-bold leading-tight">
                {dict.designSwitcher.voyageTravelersNum}
              </p>
              <p className="text-[11px] text-white/85">{dict.designSwitcher.voyageTravelersSub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Travel beyond the ordinary" Notched Editorial Split */}
      <section className="mx-auto max-w-[1040px] px-6 py-16 sm:py-24">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="relative aspect-[4/3.8] overflow-hidden rounded-[28px] bg-[#F3F4F6] shadow-sm">
              <LivingMedia
                src="/images/tours/kolsai-hotel.webp"
                alt={dict.designSwitcher.voyageBeyondTitle1}
              />
              {/* Signature stepped architectural top-right notch matching reference */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-14 w-24 rounded-bl-[24px] bg-white"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-24 top-0 h-7 w-8 rounded-bl-[14px] bg-white"
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-6 md:pl-4">
            <h2 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#111111] sm:text-[42px]">
              <span className="block">{dict.designSwitcher.voyageBeyondTitle1}</span>
              <span className="block">{dict.designSwitcher.voyageBeyondTitle2}</span>
            </h2>
            <p className="max-w-sm text-xs leading-relaxed text-[#525252] sm:text-sm">
              {dict.designSwitcher.voyageBeyondBody}
            </p>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:underline"
            >
              <span>{dict.nav.about}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. "Popular Destinations" Interactive 3-Card Tilted Fan */}
      {activeDest && (
        <section className="mx-auto max-w-[1040px] px-6 py-14 text-center sm:py-20">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#111111] sm:text-[40px]">
            {dict.designSwitcher.voyagePopularTitle}
          </h2>

          <div className="mt-12 flex items-center justify-center">
            {prevDest && (
              <button
                type="button"
                data-testid="voyage-dest-prev"
                aria-label={dict.home.momentsPrevLabel}
                onClick={() => setDestIdx((i) => (i - 1 + destCount) % destCount)}
                className="relative z-10 -mr-10 h-40 w-36 shrink-0 -rotate-[7deg] translate-y-2 overflow-hidden rounded-[22px] border-2 border-white bg-[#F3F4F6] shadow-md transition-transform hover:-rotate-[4deg] hover:scale-[1.03] sm:-mr-12 sm:h-52 sm:w-56"
              >
                <LivingMedia
                  src={prevDest.image}
                  alt={prevDest.title[locale] || prevDest.title.en}
                />
              </button>
            )}

            <Link
              href={`/${locale}/tours?country=${encodeURIComponent(activeDest.country)}`}
              className="relative z-20 h-48 w-48 shrink-0 overflow-hidden rounded-[26px] border-4 border-white bg-[#F3F4F6] shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:h-64 sm:w-64"
            >
              <LivingMedia
                src={activeDest.image}
                alt={activeDest.title[locale] || activeDest.title.en}
              />
            </Link>

            {nextDest && (
              <button
                type="button"
                data-testid="voyage-dest-next"
                aria-label={dict.home.momentsNextLabel}
                onClick={() => setDestIdx((i) => (i + 1) % destCount)}
                className="relative z-10 -ml-10 h-40 w-36 shrink-0 rotate-[7deg] translate-y-2 overflow-hidden rounded-[22px] border-2 border-white bg-[#F3F4F6] shadow-md transition-transform hover:rotate-[4deg] hover:scale-[1.03] sm:-ml-12 sm:h-52 sm:w-56"
              >
                <LivingMedia
                  src={nextDest.image}
                  alt={nextDest.title[locale] || nextDest.title.en}
                />
              </button>
            )}
          </div>

          <div className="mt-8 space-y-2">
            <h3
              data-testid="voyage-active-dest-title"
              className="font-display text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl"
            >
              {activeDest.title[locale] || activeDest.title.en}, {localizedCountry(activeDest.country)}
            </h3>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-[#525252] sm:text-sm">
              {activeDest.summary[locale] || activeDest.summary.en}
            </p>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {destList.map((d, idx) => (
                <button
                  key={d.id}
                  type="button"
                  aria-label={d.title[locale] || d.title.en}
                  onClick={() => setDestIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === destIdx ? 'w-6 bg-[#0284C7]' : 'w-1.5 bg-black/20 hover:bg-black/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. "Featured Experience" Wide Single-Frame Slider with Floating Arrow Circle */}
      {activeFeatured && (
        <section className="mx-auto max-w-[920px] px-6 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#111111] sm:text-[40px]">
              {dict.designSwitcher.voyageFeaturedTitle}
            </h2>
            <p className="mt-2 text-xs text-[#6B7280] sm:text-sm">
              {dict.designSwitcher.voyageFeaturedSub}
            </p>
          </div>

          <div className="relative mt-10">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-[#111827] shadow-[0_22px_50px_rgba(0,0,0,0.14)] sm:aspect-[16/9]">
              <LivingMedia
                src={activeFeatured.coverImage}
                alt={activeFeatured.title[locale] || activeFeatured.title.en}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-between gap-4 p-6 text-white sm:flex-row sm:items-end sm:p-8">
                <div className="max-w-md space-y-1.5">
                  <h3
                    data-testid="voyage-featured-title"
                    className="font-display text-xl font-bold leading-snug sm:text-2xl"
                  >
                    {activeFeatured.title[locale] || activeFeatured.title.en}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/85">
                    {activeFeatured.shortDescription[locale] || activeFeatured.shortDescription.en}
                  </p>
                </div>

                <Link
                  href={`/${locale}/tours/${activeFeatured.slug}`}
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white py-1.5 pl-4 pr-1.5 text-xs font-semibold text-[#111111] shadow-sm hover:bg-[#F3F4F6] sm:self-end"
                >
                  <span>{dict.home.bentoBookNow}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111111] text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>

            <button
              type="button"
              data-testid="voyage-featured-prev"
              aria-label={dict.home.momentsPrevLabel}
              onClick={() =>
                setFeaturedIdx((i) => (i - 1 + featuredList.length) % featuredList.length)
              }
              className="absolute -left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 sm:-left-5 sm:h-11 sm:w-11"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              data-testid="voyage-featured-next"
              aria-label={dict.home.momentsNextLabel}
              onClick={() => setFeaturedIdx((i) => (i + 1) % featuredList.length)}
              className="absolute -right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 sm:-right-5 sm:h-11 sm:w-11"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* 5. "Travel Experiences" Asymmetric 1-Big + 3-Stacked Bento Collage */}
      {activeExp && (
        <section className="mx-auto max-w-[1040px] px-6 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#111111] sm:text-[40px]">
              {dict.designSwitcher.voyageExpTitle}
            </h2>
            <p className="mt-2 text-xs text-[#6B7280] sm:text-sm">
              {dict.designSwitcher.voyageExpSub}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="relative h-[320px] overflow-hidden rounded-[24px] bg-[#F3F4F6] sm:h-[440px]">
                <LivingMedia
                  src={activeExp.coverImage}
                  alt={activeExp.title[locale] || activeExp.title.en}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                {/* Signature miniature floating inset photo in bottom-left */}
                <div className="absolute bottom-4 left-4 z-10 h-20 w-32 overflow-hidden rounded-xl border-2 border-white shadow-lg sm:h-24 sm:w-40">
                  <img
                    src={resolveImageSrc(activeExp.gallery[1] || '/images/tours/bao-reflection.webp')}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <Link
                  href={`/${locale}/tours/${activeExp.slug}`}
                  data-testid="voyage-exp-spotlight-link"
                  className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#111111] shadow-md hover:bg-[#0284C7] hover:text-white"
                >
                  <span className="max-w-[200px] truncate">
                    {activeExp.title[locale] || activeExp.title.en}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:col-span-4">
              {expList.slice(0, 3).map((tour, idx) => {
                const isSelected = idx === expIdx;
                return (
                  <button
                    key={tour.id}
                    type="button"
                    data-testid={`voyage-exp-thumb-${idx}`}
                    onClick={() => setExpIdx(idx)}
                    className={`group relative h-[136px] w-full overflow-hidden rounded-[20px] bg-[#F3F4F6] text-left transition-all ${
                      isSelected ? 'ring-2 ring-[#0284C7] ring-offset-2' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <LivingMedia
                      src={tour.coverImage}
                      alt={tour.title[locale] || tour.title.en}
                      mediaClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 right-3 line-clamp-1 text-xs font-semibold text-white">
                      {tour.title[locale] || tour.title.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center rounded-full bg-[#F2F3F5] px-6 py-2.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
            >
              {dict.hero.ctaExplore}
            </Link>
          </div>
        </section>
      )}

      {/* 6. "Loved by travelers around the world !" + 2x2 Tilted Pastel Sticky Notes */}
      <section className="mx-auto max-w-[1060px] px-6 py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <h2 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#111111] sm:text-[40px]">
              <span className="block">{dict.designSwitcher.voyageLovedTitle1}</span>
              <span className="block">{dict.designSwitcher.voyageLovedTitle2}</span>
            </h2>
            <Link
              href={`/${locale}/contacts`}
              className="inline-flex items-center rounded-full bg-[#111111] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0284C7]"
            >
              {dict.nav.contacts}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            {stickyReviews.map((rev, idx) => (
              <article
                key={rev.id}
                className={`rounded-2xl p-5 transition-transform duration-200 hover:rotate-0 hover:scale-[1.02] ${
                  NOTE_THEMES[idx % NOTE_THEMES.length]
                }`}
              >
                <Quote className="h-4 w-4 text-black/40" />
                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-[#1F2937]">
                  “{rev.body[locale] || rev.body.en}”
                </p>
                <div className="mt-3 flex items-center gap-0.5 text-[#F5A623]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold">{rev.authorName}</p>
                <p className="text-[11px] text-black/60">{rev.authorOrigin}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Soft Light-Gray Rounded CTA Card Overlapping Top Edge of Photographic Dark Footer */}
      <section className="relative z-20 mx-auto max-w-[1040px] px-4 -mb-16 sm:px-6">
        <div className="rounded-[28px] bg-[#F2F3F5] px-6 py-12 text-center shadow-[0_18px_48px_rgba(0,0,0,0.08)] sm:px-14 sm:py-16">
          <h2 className="font-display text-2xl font-bold leading-[1.15] tracking-[-0.025em] text-[#111111] sm:text-4xl">
            <span className="block">{dict.designSwitcher.voyageCtaTitle1}</span>
            <span className="block">{dict.designSwitcher.voyageCtaTitle2}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-[#6B7280] sm:text-sm">
            {dict.designSwitcher.voyageCtaSub}
          </p>

          <form
            onSubmit={handleCtaSubmit}
            className="mx-auto mt-7 flex max-w-md flex-col items-center gap-2.5 sm:flex-row"
          >
            <input
              type="email"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              placeholder={dict.footer.conciergePlaceholder}
              className="h-11 w-full flex-1 rounded-full border border-black/[0.08] bg-white px-5 text-xs text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#0284C7] focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 w-full shrink-0 rounded-full bg-[#111111] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#0284C7] sm:w-auto"
            >
              {dict.designSwitcher.voyageCtaBtn}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
