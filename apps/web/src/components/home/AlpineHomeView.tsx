import type { Destination, Locale, Review, Tour } from '@kt/core';
import { ArrowRight, Compass, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { BentoToursSection } from '@/components/BentoToursSection';
import { CinematicHero } from '@/components/CinematicHero';
import { FannedReviewsSection } from '@/components/FannedReviewsSection';
import { HowToBookSection } from '@/components/HowToBookSection';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LivingMedia } from '@/components/LivingMedia';
import { MomentsWaveGallery } from '@/components/MomentsWaveGallery';
import { QuickSearchBar } from '@/components/QuickSearchBar';
import type { SiteDictionary } from '@/i18n';

export interface HomeViewProps {
  locale: Locale;
  dict: SiteDictionary;
  allTours: Tour[];
  bentoTours: Tour[];
  destinations: Destination[];
  reviews: Review[];
  tgUrl: string;
  waUrl: string;
}

export function AlpineHomeView({
  locale,
  dict,
  allTours,
  bentoTours,
  destinations,
  reviews,
  tgUrl,
  waUrl,
}: HomeViewProps) {
  return (
    <div className="kt-custom-view bg-white text-[#111111]">
      {/* 1. Full-Bleed Scenic Hero with Interactive Bottom-Right Thumbnail Strip */}
      <CinematicHero locale={locale} dict={dict} />

      {/* 2. Staggered 7-Slot Wave Photo Gallery (Destinations & Regions) */}
      <MomentsWaveGallery destinations={destinations} locale={locale} dict={dict} />

      {/* 3. Asymmetric 1 + 4 Bento Adventures Showcase */}
      <BentoToursSection tours={bentoTours} locale={locale} dict={dict} />

      {/* 4. Whisper-Light Quick Search Pill Strip */}
      <div className="pb-6">
        <QuickSearchBar locale={locale} dict={dict} variant="default" />
      </div>

      {/* 5. Fanned 5-Card Traveler Stories / Reviews Strip */}
      <FannedReviewsSection reviews={reviews} locale={locale} dict={dict} />

      {/* 6. Monumental "How to Book Your Tour" + Monochrome Capability Bar + 4-Step Split */}
      <HowToBookSection locale={locale} dict={dict} />

      {/* 7. Interactive Kazakhstan & Tien Shan Topographic Atlas */}
      <section className="border-t border-black/[0.06] bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373]">
              <Compass className="h-3.5 w-3.5 text-[#9A9AA0]" />
              <span>{dict.home.mapEyebrow}</span>
            </div>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-[-0.025em] text-[#111111] sm:text-5xl">
              {dict.home.mapHeading}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#737373] sm:text-sm">
              {dict.home.mapSubheading}
            </p>
          </div>

          <InteractiveMap
            mode="atlas"
            locale={locale}
            dict={dict}
            destinations={destinations}
            tours={allTours}
          />
        </div>
      </section>

      {/* 8. Rounded Full-Width Twilight CTA Banner */}
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative mx-auto flex min-h-[380px] max-w-6xl items-center justify-center overflow-hidden rounded-[28px] bg-[#141414] px-6 py-16 text-center text-white sm:min-h-[430px] sm:px-12">
          <div className="absolute inset-0">
            <LivingMedia
              src="/images/tours/charyn-sunset.webp"
              alt={dict.home.bannerTitleLine2}
              mode="ambient"
              dwellMs={1100}
              priority="high"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/65" />

          <div className="relative z-10 max-w-2xl space-y-5">
            <h2 className="font-display text-3xl font-normal leading-[1.12] tracking-[-0.028em] text-white sm:text-5xl">
              <span className="block">{dict.home.bannerTitleLine1}</span>
              <span className="block">{dict.home.bannerTitleLine2}</span>
            </h2>

            <p className="mx-auto max-w-lg text-xs leading-relaxed text-white/85 sm:text-sm">
              {dict.home.bannerSubtitle}
            </p>

            <div className="flex flex-col items-center gap-4 pt-2">
              <Link
                href={`/${locale}/plan-your-trip`}
                className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/15 py-1.5 pl-5 pr-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:text-sm"
              >
                <span>{dict.home.bannerCta}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#111111] transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-white/75">
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{dict.contactsPage.telegramBtn}</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{dict.contactsPage.whatsappBtn}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
