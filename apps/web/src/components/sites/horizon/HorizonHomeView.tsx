'use client';

import type { Locale } from '@kt/core';
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  ChevronDown,
  Compass,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { LivingMedia } from '@/components/LivingMedia';
import type { HomeViewProps } from '@/components/home/AlpineHomeView';
import { resolveImageSrc } from '@/lib/media-manifest';

const WHY_ICONS = [Zap, BadgeDollarSign, Compass, ShieldCheck];

export function HorizonHomeView({
  locale,
  dict,
  allTours,
  tgUrl,
  waUrl,
}: HomeViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [country, setCountry] = useState('all');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [activeCardIdx, setActiveCardIdx] = useState(0);

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (country !== 'all') params.set('country', country);
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    const qs = params.toString();
    router.push(`/${locale}/tours${qs ? `?${qs}` : ''}`);
  }

  function scrollCarousel(direction: -1 | 1) {
    scrollRef.current?.scrollBy({ left: direction * 330, behavior: 'smooth' });
  }

  return (
    <div className="kt-custom-view bg-white text-[#111827]">
      {/* 1. Framed Full-Bleed Scenic Hero Card */}
      <section className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-4">
        <div className="relative flex min-h-[84svh] sm:min-h-[88svh] flex-col justify-between overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#0B1525]">
          <div className="absolute inset-0">
            <LivingMedia
              src="/images/tours/bao-reflection.webp"
              alt={dict.designSwitcher.horizonHeroTitle1}
              loading="eager"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#071426]/50 via-[#071426]/22 to-[#060E1A]/80" />

          {/* Upper-Left Headline Stack */}
          <div className="relative z-10 max-w-2xl px-6 pt-28 sm:px-12 sm:pt-36 lg:px-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[11px] font-semibold text-[#111827] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F41D48]" />
              <span>{dict.designSwitcher.horizonHeroEyebrow}</span>
            </span>

            <h1 className="font-display mt-5 text-4xl font-normal leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl lg:text-[62px]">
              <span className="block">{dict.designSwitcher.horizonHeroTitle1}</span>
              <span className="block">{dict.designSwitcher.horizonHeroTitle2}</span>
            </h1>

            <p className="mt-4 max-w-md text-xs leading-relaxed text-white/85 sm:text-sm">
              {dict.designSwitcher.horizonHeroSub}
            </p>
          </div>

          {/* Bottom Frosted Search Bar + Explore Anchor */}
          <div className="relative z-10 mt-auto flex flex-col justify-between gap-6 px-6 pb-6 pt-12 sm:px-12 sm:pb-8 lg:flex-row lg:items-end lg:px-14">
            <form
              data-testid="horizon-hero-search"
              onSubmit={handleHeroSearch}
              className="w-full max-w-xl rounded-[22px] border border-white/25 bg-[#08121E]/50 p-3 backdrop-blur-xl sm:p-3.5"
            >
              <div className="grid gap-2.5 sm:grid-cols-[1.1fr_1fr_0.85fr_auto] sm:items-end">
                <label className="block">
                  <span className="mb-1 block px-1 text-[10px] font-medium text-white/75">
                    {dict.quickSearch.countryLabel}
                  </span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-9 w-full rounded-full border border-white/20 bg-white/10 px-3 text-xs font-medium text-white focus:border-white focus:outline-none"
                  >
                    <option value="all" className="bg-white text-[#111827]">
                      {dict.quickSearch.allRegions}
                    </option>
                    <option value="Kazakhstan" className="bg-white text-[#111827]">
                      {dict.countries.kazakhstan}
                    </option>
                    <option value="Kyrgyzstan" className="bg-white text-[#111827]">
                      {dict.countries.kyrgyzstan}
                    </option>
                    <option value="Central Asia" className="bg-white text-[#111827]">
                      {dict.countries.centralAsia}
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block px-1 text-[10px] font-medium text-white/75">
                    {dict.quickSearch.dateLabel}
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 w-full rounded-full border border-white/20 bg-white/10 px-3 text-xs font-medium text-white [color-scheme:dark] focus:border-white focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block px-1 text-[10px] font-medium text-white/75">
                    {dict.quickSearch.guestsLabel}
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="h-9 w-full rounded-full border border-white/20 bg-white/10 px-3 text-xs font-medium text-white focus:border-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)} className="bg-white text-[#111827]">
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  aria-label={dict.quickSearch.submit}
                  className="flex h-9 w-full items-center justify-center rounded-full bg-[#F41D48] text-white shadow-lg transition-colors hover:bg-[#D9143C] sm:w-9"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            <a
              href="#horizon-trips"
              className="group inline-flex items-center gap-2.5 self-start text-xs font-medium text-white/90 transition-colors hover:text-white lg:self-end"
            >
              <span>{dict.designSwitcher.horizonExploreMore}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-md transition-transform group-hover:translate-y-0.5">
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. "Popular Trips You'll Love" Edge-Bleeding Horizontal Carousel */}
      <section id="horizon-trips" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-[#F9FAFB] px-3 py-1 text-[11px] font-semibold text-[#111827]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F41D48]" />
            <span>{dict.designSwitcher.horizonTripsEyebrow}</span>
          </span>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.028em] text-[#111827] sm:text-[42px]">
            {dict.designSwitcher.horizonTripsTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-[#6B7280] sm:text-sm">
            {dict.designSwitcher.horizonTripsSub}
          </p>
        </div>

        <div
          ref={scrollRef}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 sm:px-10 lg:px-14"
        >
          {allTours.map((tour, idx) => {
            const title = tour.title[locale] || tour.title.en;
            const region = tour.region[locale] || tour.region.en;
            const duration = tour.durationLabel[locale] || tour.durationLabel.en;
            const summary = tour.shortDescription[locale] || tour.shortDescription.en;
            const unit = (tour.priceUnit[locale] || tour.priceUnit.en).split(' (')[0];
            const isHighlighted = idx === activeCardIdx;

            return (
              <article
                key={tour.id}
                onMouseEnter={() => setActiveCardIdx(idx)}
                className="group flex w-[270px] shrink-0 snap-start flex-col justify-between sm:w-[295px] lg:w-[305px]"
              >
                <div>
                  <Link
                    href={`/${locale}/tours/${tour.slug}`}
                    className="relative block aspect-[4/3.6] overflow-hidden rounded-[22px] bg-[#F3F4F6]"
                  >
                    <LivingMedia
                      src={tour.coverImage}
                      alt={title}
                      mediaClassName="transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                      {duration}
                    </span>
                  </Link>

                  <div className="space-y-1.5 px-1 pt-4">
                    <p className="text-[11px] font-medium text-[#6B7280]">{region}</p>
                    <h3 className="line-clamp-1 font-display text-base font-semibold tracking-tight text-[#111827]">
                      <Link
                        href={`/${locale}/tours/${tour.slug}`}
                        className="hover:text-[#F41D48] transition-colors"
                      >
                        {title}
                      </Link>
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#6B7280]">{summary}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 px-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono-meta text-base font-bold text-[#111827]">
                      ${tour.priceFromUsd.toLocaleString('en-US')}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">/ {unit}</span>
                  </div>

                  <Link
                    href={`/${locale}/tours/${tour.slug}`}
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      isHighlighted
                        ? 'border-[#F41D48] bg-[#F41D48] text-white hover:bg-[#D9143C]'
                        : 'border-black/12 bg-white text-[#111827] hover:border-[#F41D48] hover:bg-[#F41D48] hover:text-white'
                    }`}
                  >
                    {dict.home.bentoBookNow}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            data-testid="horizon-carousel-prev"
            onClick={() => scrollCarousel(-1)}
            aria-label={dict.home.momentsPrevLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/12 bg-white text-[#111827] transition-colors hover:border-[#F41D48] hover:text-[#F41D48]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            data-testid="horizon-carousel-next"
            onClick={() => scrollCarousel(1)}
            aria-label={dict.home.momentsNextLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/12 bg-white text-[#111827] transition-colors hover:border-[#F41D48] hover:text-[#F41D48]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 3. Framed Dark Atmospheric "Why Travel with Us" Banner */}
      <section className="mx-auto max-w-[1440px] px-3 sm:px-4 lg:px-5">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#0B1220] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-14">
          <div className="absolute inset-0">
            <LivingMedia
              src="/images/tours/hero-charyn.webp"
              alt={dict.designSwitcher.horizonWhyTitle}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07111F]/80 via-[#07111F]/65 to-[#050811]/92" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[11px] font-semibold text-[#111827]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F41D48]" />
                <span>{dict.designSwitcher.horizonWhyEyebrow}</span>
              </span>
              <h2 className="font-display mt-4 text-3xl font-normal tracking-[-0.025em] text-white sm:text-4xl lg:text-[44px]">
                {dict.designSwitcher.horizonWhyTitle}
              </h2>
            </div>

            <div className="max-w-sm space-y-4">
              <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                {dict.designSwitcher.horizonWhySub}
              </p>
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center rounded-full bg-[#F41D48] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D9143C]"
              >
                {dict.designSwitcher.horizonWhyCta}
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.home.advantagesItems.slice(0, 4).map((adv, idx) => {
              const Icon = WHY_ICONS[idx % WHY_ICONS.length];
              return (
                <div
                  key={adv.title}
                  className="flex flex-col justify-between gap-10 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-md"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-white">{adv.title}</h3>
                    <p className="text-xs leading-relaxed text-white/75">{adv.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Monumental Inline-Photo-Pill Statement over Misty Alpine Silhouette */}
      <section className="relative overflow-hidden bg-white px-4 py-24 text-center sm:py-32">
        <img
          src={resolveImageSrc('/images/tours/turgen-peaks.webp')}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full object-cover object-bottom opacity-[0.14] grayscale"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/30 to-white"
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/90 px-3.5 py-1 text-[11px] font-semibold text-[#111827] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F41D48]" />
            <span>{dict.designSwitcher.horizonPartnerEyebrow}</span>
          </span>

          <h2 className="font-display mt-7 text-3xl font-medium leading-[1.35] tracking-[-0.03em] text-[#111827] sm:text-5xl lg:text-[54px]">
            <span className="block">
              <span>{dict.designSwitcher.horizonPartnerLine1A}</span>
              <span className="mx-2.5 inline-block h-8 w-16 align-middle overflow-hidden rounded-full ring-2 ring-white shadow-sm sm:h-11 sm:w-24">
                <img
                  src={resolveImageSrc('/images/tours/bao-reflection.webp')}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <span>{dict.designSwitcher.horizonPartnerLine1B}</span>
            </span>

            <span className="block mt-1">
              <span>{dict.designSwitcher.horizonPartnerLine2A}</span>
              <span className="mx-2.5 inline-block h-8 w-16 align-middle overflow-hidden rounded-full ring-2 ring-white shadow-sm sm:h-11 sm:w-24">
                <img
                  src={resolveImageSrc('/images/tours/kolsai-aerial.webp')}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <span>{dict.designSwitcher.horizonPartnerLine2B}</span>
            </span>

            <span className="block mt-1">
              <span>{dict.designSwitcher.horizonPartnerLine3A}</span>
              <span className="mx-2.5 inline-block h-8 w-16 align-middle overflow-hidden rounded-full ring-2 ring-white shadow-sm sm:h-11 sm:w-24">
                <img
                  src={resolveImageSrc('/images/tours/hero-charyn.webp')}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <span>{dict.designSwitcher.horizonPartnerLine3B}</span>
            </span>
          </h2>

          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex items-center -space-x-2.5">
              {[
                '/images/tours/kolsai-horseback.webp',
                '/images/tours/asy-yurt.webp',
                '/images/tours/charyn-day-trip.webp',
              ].map((src) => (
                <img
                  key={src}
                  src={resolveImageSrc(src)}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-xs"
                />
              ))}
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-[#6B7280]">
              {dict.designSwitcher.horizonPartnerTrust}
            </p>
            <Link
              href={`/${locale}/reviews`}
              className="text-xs font-semibold text-[#F41D48] hover:underline"
            >
              {dict.home.reviewsViewAll} →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Framed Twilight Final CTA Card */}
      <section className="mx-auto max-w-[1440px] px-3 pb-10 sm:px-4 lg:px-5">
        <div className="relative flex min-h-[340px] sm:min-h-[400px] items-center justify-center overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#0B1220] px-6 py-16 text-center text-white">
          <div className="absolute inset-0">
            <LivingMedia
              src="/images/tours/almaty-evening.webp"
              alt={dict.designSwitcher.horizonCtaTitle2}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08101D]/62 via-[#08101D]/55 to-[#060B14]/82" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="font-display text-3xl font-normal leading-[1.15] tracking-[-0.025em] text-white sm:text-5xl">
              <span className="block">{dict.designSwitcher.horizonCtaTitle1}</span>
              <span className="block">{dict.designSwitcher.horizonCtaTitle2}</span>
            </h2>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-white/85 sm:text-sm">
              {dict.designSwitcher.horizonCtaSub}
            </p>
            <div className="flex flex-col items-center gap-4 pt-2">
              <Link
                href={`/${locale}/plan-your-trip`}
                className="inline-flex items-center justify-center rounded-full bg-[#F41D48] px-6 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-[#D9143C] sm:text-sm"
              >
                {dict.designSwitcher.horizonCtaBtn}
              </Link>
              <div className="flex items-center gap-4 text-[11px] font-medium text-white/75">
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{dict.contactsPage.telegramBtn}</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white"
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
