'use client';

import type { Locale, SeasonType } from '@kt/core';
import { ArrowRight, ArrowUpRight, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LivingMedia } from '@/components/LivingMedia';
import type { HomeViewProps } from '@/components/home/AlpineHomeView';
import { NomadQuoteCalculator } from './NomadQuoteCalculator';

const SEASON_TABS: Array<{ id: SeasonType; num: string; months: Record<Locale, string> }> = [
  { id: 'spring', num: '01', months: { en: 'APR – MAY', ru: 'АПР – МАЙ', kk: 'СӘУ – МАМ' } },
  { id: 'summer', num: '02', months: { en: 'JUN – AUG', ru: 'ИЮН – АВГ', kk: 'МАУ – ТАМ' } },
  { id: 'autumn', num: '03', months: { en: 'SEP – OCT', ru: 'СЕН – ОКТ', kk: 'ҚЫР – ҚАЗ' } },
  { id: 'winter', num: '04', months: { en: 'NOV – MAR', ru: 'НОЯ – МАР', kk: 'ҚАР – НАУ' } },
];

export function NomadHomeView({
  locale,
  dict,
  allTours,
  destinations,
  reviews,
}: HomeViewProps) {
  const heroRoutes = destinations.slice(0, 5);
  const ledgerTours = allTours.slice(0, 8);
  const [heroIdx, setHeroIdx] = useState(0);
  const [ledgerIdx, setLedgerIdx] = useState(0);
  const [season, setSeason] = useState<SeasonType>('summer');

  const activeHeroDest = heroRoutes[heroIdx] ?? heroRoutes[0];
  const activeLedgerTour = ledgerTours[ledgerIdx] ?? ledgerTours[0];

  const seasonMatches = allTours.filter((t) => t.seasons.includes(season));
  const displayedSeasonTours = (seasonMatches.length >= 3 ? seasonMatches : allTours).slice(0, 3);
  const dispatchReviews = reviews.slice(0, 3);

  return (
    <div className="kt-custom-view bg-[#EFECE6] text-[#0E0E0E]">
      {/* 1. 50/50 Asymmetric Split-Screen Hero */}
      <section className="grid min-h-[88svh] border-b border-[#0E0E0E]/15 lg:grid-cols-12">
        {/* Left Swiss Typography + Interactive Route Hover Index */}
        <div className="flex flex-col justify-between border-b border-[#0E0E0E]/15 p-6 sm:p-10 lg:col-span-6 lg:border-b-0 lg:border-r lg:p-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0E0E0E]/15 pb-3 font-mono-meta text-[11px] uppercase tracking-[0.16em]">
              <span className="font-semibold text-[#D94626]">{dict.designSwitcher.nomadEyebrow}</span>
              <span className="text-[#57534E]">KZ · KG · UZ</span>
            </div>

            <h1 className="font-display text-4xl font-bold uppercase leading-[0.98] tracking-[-0.04em] text-[#0E0E0E] sm:text-5xl xl:text-6xl">
              {dict.designSwitcher.nomadHeroTitle}
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-[#57534E]">
              {dict.designSwitcher.nomadHeroSub}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/${locale}/tours`}
                className="inline-flex items-center gap-2 bg-[#0E0E0E] px-6 py-3 font-mono-meta text-xs font-semibold uppercase tracking-[0.14em] text-[#EFECE6] transition-colors hover:bg-[#D94626]"
              >
                <span>{dict.hero.ctaExplore}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#nomad-estimator"
                className="inline-flex items-center gap-2 border border-[#0E0E0E] px-6 py-3 font-mono-meta text-xs font-semibold uppercase tracking-[0.14em] text-[#0E0E0E] transition-colors hover:bg-[#0E0E0E] hover:text-[#EFECE6]"
              >
                <span>{dict.hero.ctaPlan}</span>
              </a>
            </div>
          </div>

          {/* Interactive 5-Row Corridor Hover Selector */}
          <div className="mt-10 divide-y divide-[#0E0E0E]/15 border-t border-[#0E0E0E]/15">
            {heroRoutes.map((dest, idx) => {
              const active = idx === heroIdx;
              const title = dest.title[locale] || dest.title.en;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onMouseEnter={() => setHeroIdx(idx)}
                  onClick={() => setHeroIdx(idx)}
                  className={`flex w-full items-center justify-between py-3 px-2 text-left transition-colors focus:outline-none ${
                    active ? 'bg-[#0E0E0E] text-[#EFECE6]' : 'hover:bg-black/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono-meta text-[11px] font-semibold ${
                        active ? 'text-[#D94626]' : 'text-[#57534E]'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono-meta text-[11px]">
                    <span className={active ? 'text-white/75' : 'text-[#57534E]'}>
                      {dest.elevationM} m
                    </span>
                    <ArrowUpRight className={`h-3.5 w-3.5 ${active ? 'text-[#D94626]' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Edge-to-Edge Live 1080p Viewport */}
        <div className="relative min-h-[420px] bg-[#0E0E0E] lg:col-span-6 lg:min-h-full">
          {activeHeroDest && (
            <>
              <LivingMedia
                key={`nomad-hero-${activeHeroDest.id}`}
                src={activeHeroDest.image}
                alt={activeHeroDest.title[locale] || activeHeroDest.title.en}
                mode="ambient"
                dwellMs={800}
                priority="high"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

              {/* HUD Telemetry Plate */}
              <div className="absolute left-4 top-4 z-10 border border-white/25 bg-[#0E0E0E]/80 px-3 py-1.5 font-mono-meta text-[10px] uppercase tracking-[0.16em] text-[#EFECE6] backdrop-blur-md">
                {dict.designSwitcher.liveTag} // {activeHeroDest.elevationM} M ASL
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 border-t border-white/20 bg-[#0E0E0E]/75 p-5 text-[#EFECE6] backdrop-blur-md">
                <div>
                  <p className="font-mono-meta text-[10px] uppercase tracking-[0.18em] text-[#D94626]">
                    {activeHeroDest.lat.toFixed(4)}° N · {activeHeroDest.lng.toFixed(4)}° E
                  </p>
                  <p className="font-display mt-0.5 text-xl font-semibold">
                    {activeHeroDest.title[locale] || activeHeroDest.title.en}
                  </p>
                </div>
                <Link
                  href={`/${locale}/tours?country=${encodeURIComponent(activeHeroDest.country)}`}
                  className="inline-flex shrink-0 items-center gap-1.5 bg-[#D94626] px-4 py-2 font-mono-meta text-[11px] font-semibold uppercase tracking-[0.14em] text-[#EFECE6] hover:bg-white hover:text-[#0E0E0E]"
                >
                  <span>{dict.home.destViewTours}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 2. Interactive Hover-Reveal Expedition Ledger */}
      <section className="border-b border-[#0E0E0E]/15 bg-[#EFECE6] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#0E0E0E]/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono-meta text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D94626]">
                {dict.designSwitcher.nomadLedgerEyebrow}
              </span>
              <h2 className="font-display mt-1.5 text-3xl font-bold uppercase tracking-[-0.03em] sm:text-5xl">
                {dict.designSwitcher.nomadLedgerTitle}
              </h2>
            </div>

            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center gap-2 font-mono-meta text-xs font-semibold uppercase tracking-[0.16em] text-[#0E0E0E] hover:text-[#D94626]"
            >
              <span>{dict.home.toursViewAll}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
            {/* Hairline Directory Table */}
            <div className="divide-y divide-[#0E0E0E]/15 border-b border-[#0E0E0E]/15 lg:col-span-7">
              {ledgerTours.map((tour, idx) => {
                const isSelected = idx === ledgerIdx;
                const title = tour.title[locale] || tour.title.en;
                return (
                  <div
                    key={tour.id}
                    data-testid={`nomad-ledger-row-${idx}`}
                    onMouseEnter={() => setLedgerIdx(idx)}
                    onClick={() => setLedgerIdx(idx)}
                    className={`grid cursor-pointer grid-cols-12 items-center gap-2 px-3 py-4 ${
                      isSelected ? 'bg-[#0E0E0E] text-[#EFECE6]' : 'text-[#0E0E0E] hover:bg-white/75'
                    }`}
                  >
                    <span
                      className={`col-span-3 font-mono-meta text-[11px] font-semibold sm:col-span-2 ${
                        isSelected ? 'text-[#D94626]' : 'text-[#57534E]'
                      }`}
                    >
                      {tour.code}
                    </span>
                    <span
                      className={`col-span-6 truncate text-sm font-semibold sm:col-span-6 ${
                        isSelected ? 'text-[#EFECE6]' : 'text-[#0E0E0E]'
                      }`}
                    >
                      {title}
                    </span>
                    <span
                      className={`hidden font-mono-meta text-xs sm:col-span-2 sm:block ${
                        isSelected ? 'text-white/75' : 'text-[#57534E]'
                      }`}
                    >
                      {tour.durationDays}D
                    </span>
                    <div
                      className={`col-span-3 flex items-center justify-end gap-2 font-mono-meta text-xs font-bold sm:col-span-2 ${
                        isSelected ? 'text-[#EFECE6]' : 'text-[#0E0E0E]'
                      }`}
                    >
                      <span>${tour.priceFromUsd}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Preview Plate */}
            {activeLedgerTour && (
              <div className="lg:sticky lg:top-20 lg:col-span-5">
                <div className="border border-[#0E0E0E] bg-white p-5">
                  <Link
                    href={`/${locale}/tours/${activeLedgerTour.slug}`}
                    className="block aspect-[16/10] overflow-hidden bg-[#0E0E0E]"
                  >
                    <LivingMedia
                      key={`nomad-ledger-${activeLedgerTour.id}`}
                      src={activeLedgerTour.coverImage}
                      alt={activeLedgerTour.title[locale] || activeLedgerTour.title.en}
                      mode="ambient"
                      dwellMs={900}
                      priority="high"
                    />
                  </Link>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between font-mono-meta text-[11px] uppercase text-[#57534E]">
                      <span className="text-[#D94626] font-semibold">{activeLedgerTour.code}</span>
                      <span>
                        {activeLedgerTour.durationLabel[locale] || activeLedgerTour.durationLabel.en}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold leading-snug text-[#0E0E0E]">
                      {activeLedgerTour.title[locale] || activeLedgerTour.title.en}
                    </h3>

                    <p className="text-xs leading-relaxed text-[#57534E]">
                      {activeLedgerTour.shortDescription[locale] ||
                        activeLedgerTour.shortDescription.en}
                    </p>

                    <div className="flex items-center justify-between border-t border-[#0E0E0E]/15 pt-4">
                      <div>
                        <span className="font-mono-meta text-xl font-bold text-[#0E0E0E]">
                          ${activeLedgerTour.priceFromUsd.toLocaleString('en-US')}
                        </span>
                        <span className="ml-1.5 text-[11px] text-[#57534E]">
                          / {(activeLedgerTour.priceUnit[locale] || activeLedgerTour.priceUnit.en).split(' (')[0]}
                        </span>
                      </div>

                      <Link
                        href={`/${locale}/tours/${activeLedgerTour.slug}`}
                        className="inline-flex items-center gap-2 bg-[#0E0E0E] px-4 py-2.5 font-mono-meta text-[11px] font-semibold uppercase tracking-[0.14em] text-[#EFECE6] hover:bg-[#D94626]"
                      >
                        <span>{dict.catalog.cardViewDetails}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Four Seasons Interactive Matrix */}
      <section className="border-b border-[#0E0E0E]/15 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono-meta text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D94626]">
                {dict.designSwitcher.nomadSeasonEyebrow}
              </span>
              <h2 className="font-display mt-1.5 text-3xl font-bold uppercase tracking-[-0.03em] sm:text-5xl">
                {dict.designSwitcher.nomadSeasonTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:flex">
              {SEASON_TABS.map((tab) => {
                const active = season === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`nomad-season-${tab.id}`}
                    onClick={() => setSeason(tab.id)}
                    className={`border px-4 py-2.5 text-left focus:outline-none ${
                      active
                        ? 'border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6]'
                        : 'border-[#0E0E0E]/20 bg-[#EFECE6]/50 text-[#0E0E0E] hover:border-[#0E0E0E]'
                    }`}
                  >
                    <span className={`font-mono-meta block text-[9px] ${active ? 'text-[#D94626]' : 'text-[#57534E]'}`}>
                      {tab.num} · {tab.months[locale]}
                    </span>
                    <span
                      className={`block text-xs font-bold uppercase tracking-[0.08em] ${
                        active ? 'text-[#EFECE6]' : 'text-[#0E0E0E]'
                      }`}
                    >
                      {dict.catalog.seasons[tab.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {displayedSeasonTours.map((tour) => {
              const title = tour.title[locale] || tour.title.en;
              return (
                <article
                  key={tour.id}
                  className="group flex flex-col justify-between border border-[#0E0E0E]/15 bg-[#EFECE6]/45 p-4 transition-colors hover:border-[#0E0E0E]"
                >
                  <div>
                    <Link
                      href={`/${locale}/tours/${tour.slug}`}
                      className="block aspect-[16/10] overflow-hidden bg-[#0E0E0E]"
                    >
                      <LivingMedia
                        src={tour.coverImage}
                        alt={title}
                        mode="hover-or-dwell"
                        hoverMs={380}
                        dwellMs={1600}
                        mediaClassName="transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <div className="mt-4 flex items-center justify-between font-mono-meta text-[10px] uppercase text-[#57534E]">
                      <span className="text-[#D94626] font-semibold">{tour.code}</span>
                      <span>{tour.durationLabel[locale] || tour.durationLabel.en}</span>
                    </div>

                    <h3 className="font-display mt-1.5 text-xl font-bold leading-snug text-[#0E0E0E]">
                      <Link href={`/${locale}/tours/${tour.slug}`} className="hover:text-[#D94626]">
                        {title}
                      </Link>
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#57534E]">
                      {tour.shortDescription[locale] || tour.shortDescription.en}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#0E0E0E]/15 pt-3">
                    <span className="font-mono-meta text-base font-bold">
                      ${tour.priceFromUsd.toLocaleString('en-US')}
                    </span>
                    <Link
                      href={`/${locale}/tours/${tour.slug}`}
                      className="font-mono-meta inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0E0E0E] group-hover:text-[#D94626]"
                    >
                      <span>{dict.catalog.cardViewDetails}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive Live Fleet & Cost Quote Configurator */}
      <NomadQuoteCalculator locale={locale} dict={dict} />

      {/* 5. Newspaper Column Field Dispatches + Sharp-Framed Topographic Atlas */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#0E0E0E]/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono-meta text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D94626]">
                {dict.home.storiesEyebrow}
              </span>
              <h2 className="font-display mt-1.5 text-3xl font-bold uppercase tracking-[-0.03em] sm:text-4xl">
                {dict.home.storiesTitleDark1} {dict.home.storiesTitleDark2}
              </h2>
            </div>
            <Link
              href={`/${locale}/reviews`}
              className="font-mono-meta text-xs font-semibold uppercase tracking-[0.14em] text-[#0E0E0E] hover:text-[#D94626]"
            >
              {dict.home.reviewsViewAll} →
            </Link>
          </div>

          <div className="mt-8 grid divide-y divide-[#0E0E0E]/15 border border-[#0E0E0E]/15 md:grid-cols-3 md:divide-x md:divide-y-0">
            {dispatchReviews.map((rev) => (
              <article key={rev.id} className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#EFECE6]">
                    <LivingMedia
                      src={rev.photos[0] || '/images/tours/hero-charyn.webp'}
                      alt={rev.authorName}
                      mode="hover-or-dwell"
                      hoverMs={400}
                      dwellMs={1800}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[#D94626]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-mono-meta text-[10px] text-[#57534E]">
                      {rev.sourceName}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-[#0E0E0E]">
                    “{rev.body[locale] || rev.body.en}”
                  </p>
                </div>

                <div className="mt-5 border-t border-[#0E0E0E]/10 pt-3 font-mono-meta text-xs">
                  <span className="font-bold">{rev.authorName}</span>
                  <span className="ml-2 text-[#57534E]">// {rev.authorOrigin}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Sharp-Framed Atlas */}
          <div className="mt-20">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="font-mono-meta inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D94626]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{dict.home.mapEyebrow}</span>
                </span>
                <h2 className="font-display mt-1.5 text-3xl font-bold uppercase tracking-[-0.03em] sm:text-4xl">
                  {dict.home.mapHeading}
                </h2>
              </div>
              <p className="max-w-md text-xs text-[#57534E]">{dict.home.mapSubheading}</p>
            </div>

            <InteractiveMap
              mode="atlas"
              locale={locale}
              dict={dict}
              destinations={destinations}
              tours={allTours}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
