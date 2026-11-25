'use client';

import type { Destination, Locale } from '@kt/core';
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { LivingMedia } from './LivingMedia';

interface Props {
  destinations: Destination[];
  locale: Locale;
  dict: SiteDictionary;
}

const WAVE_OFFSETS_7 = [
  'lg:mt-4',
  'lg:mt-10',
  'lg:mt-14',
  'lg:mt-0',
  'lg:mt-6',
  'lg:mt-12',
  'lg:mt-4',
];

export function MomentsWaveGallery({ destinations, locale, dict }: Props) {
  const safeDests = destinations.length > 0 ? destinations : [];
  const [centerIdx, setCenterIdx] = useState(Math.min(2, Math.max(0, safeDests.length - 1)));

  if (safeDests.length === 0) return null;

  const visibleSlots7 = [-3, -2, -1, 0, 1, 2, 3].map((rel, slotIdx) => {
    const idx = (centerIdx + rel + safeDests.length * 7) % safeDests.length;
    return { dest: safeDests[idx], dataIdx: idx, slot: slotIdx };
  });

  const progressPct = ((centerIdx + 1) / safeDests.length) * 100;

  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373]">
          <Sparkles className="h-3.5 w-3.5 text-[#9A9AA0]" />
          <span>{dict.home.momentsEyebrow}</span>
        </div>

        <h2 className="font-display mt-3 text-3xl leading-[1.15] tracking-[-0.028em] sm:text-5xl">
          <span className="font-medium text-[#111111]">{dict.home.momentsTitleDark1}</span>{' '}
          <span className="font-normal text-[#9A9AA0]">{dict.home.momentsTitleMuted}</span>
          <span className="block font-medium text-[#111111]">{dict.home.momentsTitleDark2}</span>
        </h2>

        <p className="mx-auto mt-3.5 max-w-md text-xs leading-relaxed text-[#737373] sm:text-sm">
          {dict.home.momentsSubtitle}
        </p>
      </div>

      {/* Desktop Full-Bleed 7-Slot Wave Gallery */}
      <div className="mx-auto mt-12 hidden max-w-[1640px] lg:block">
        <div className="-mx-12 grid grid-cols-7 items-start gap-4 xl:-mx-20">
          {visibleSlots7.map(({ dest, dataIdx, slot }) => {
            const isCenter = slot === 3;
            const title = dest.title[locale] || dest.title.en;
            const bestMonths = dest.bestMonths[locale] || dest.bestMonths.en;
            const href = `/${locale}/tours?country=${encodeURIComponent(dest.country)}`;

            if (isCenter) {
              return (
                <div
                  key={`${dest.id}-center-${slot}`}
                  className={`${WAVE_OFFSETS_7[slot]} transition-all duration-500`}
                >
                  <div className="group rounded-[22px] border border-black/[0.06] bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                    <Link
                      href={href}
                      className="block aspect-[3/3.45] w-full overflow-hidden rounded-[16px] bg-[#F5F5F6]"
                    >
                      <LivingMedia
                        src={dest.image}
                        alt={title}
                        mode="ambient"
                        dwellMs={1100}
                        priority="high"
                        mediaClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </Link>

                    <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-3">
                      <div className="min-w-0">
                        <Link
                          href={href}
                          className="block truncate text-sm font-semibold text-[#111111] hover:underline"
                        >
                          {title}
                        </Link>
                        <p className="line-clamp-2 text-[11px] leading-snug text-[#737373]">
                          {dest.elevationM} m · {bestMonths}
                        </p>
                      </div>
                      <Link
                        href={href}
                        aria-label={title}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/[0.1] bg-[#F5F5F6] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${dest.id}-slot-${slot}`}
                className={`${WAVE_OFFSETS_7[slot]} transition-all duration-500`}
              >
                <button
                  type="button"
                  onClick={() => setCenterIdx(dataIdx)}
                  aria-label={title}
                  className="group block w-full text-left focus:outline-none"
                >
                  <div className="aspect-[3/3.65] w-full overflow-hidden rounded-[18px] bg-[#F5F5F6] opacity-92 transition-all duration-300 group-hover:opacity-100">
                    <LivingMedia
                      src={dest.image}
                      alt={title}
                      mode="hover-or-dwell"
                      hoverMs={400}
                      dwellMs={2200}
                      mediaClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Horizontal Snap Row */}
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:hidden">
        {safeDests.map((dest) => {
          const title = dest.title[locale] || dest.title.en;
          const bestMonths = dest.bestMonths[locale] || dest.bestMonths.en;
          return (
            <Link
              key={dest.id}
              href={`/${locale}/tours?country=${encodeURIComponent(dest.country)}`}
              className="group w-[240px] shrink-0 snap-center"
            >
              <div className="aspect-[3/3.6] overflow-hidden rounded-[20px] bg-[#F5F5F6]">
                <LivingMedia
                  src={dest.image}
                  alt={title}
                  mode="hover-or-dwell"
                  dwellMs={1600}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111111]">{title}</p>
                  <p className="line-clamp-2 text-[11px] leading-snug text-[#737373]">
                    {dest.elevationM} m · {bestMonths}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#111111]" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Minimalist Progress Bar + Prev/Next Arrows */}
      <div className="mx-auto mt-10 hidden max-w-md items-center justify-center gap-5 px-4 lg:flex">
        <button
          type="button"
          onClick={() => setCenterIdx((i) => (i - 1 + safeDests.length) % safeDests.length)}
          aria-label={dict.home.momentsPrevLabel}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-[#F5F5F6] hover:text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="h-[2px] w-48 overflow-hidden rounded-full bg-[#E5E5E7]">
          <div
            className="h-full bg-[#111111] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => setCenterIdx((i) => (i + 1) % safeDests.length)}
          aria-label={dict.home.momentsNextLabel}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-[#F5F5F6] hover:text-[#111111]"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
