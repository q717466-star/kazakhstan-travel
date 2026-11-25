'use client';

import type { Locale, Tour } from '@kt/core';
import { ArrowRight, Clock, Compass } from 'lucide-react';
import Link from 'next/link';
import type { SiteDictionary } from '@/i18n';
import { useDesign } from './DesignProvider';
import { LivingMedia } from './LivingMedia';

interface Props {
  tour: Tour;
  locale: Locale;
  dict: SiteDictionary;
}

export function TourCard({ tour, locale, dict }: Props) {
  const { design } = useDesign();
  const title = tour.title[locale] || tour.title.en;
  const region = tour.region[locale] || tour.region.en;
  const duration = tour.durationLabel[locale] || tour.durationLabel.en;
  const format = tour.format[locale] || tour.format.en;
  const priceUnit = tour.priceUnit[locale] || tour.priceUnit.en;
  const highlights = (tour.highlights[locale] || tour.highlights.en).slice(0, 3);

  const isCinema = design === 'cinema';
  const isNomad = design === 'nomad';
  const isHorizon = design === 'horizon';
  const isVoyage = design === 'voyage';
  const isAero = design === 'aero';

  return (
    <article
      className={`group flex flex-col justify-between border p-3 transition-all duration-300 hover:-translate-y-1 ${
        isCinema
          ? 'rounded-[22px] border-white/[0.1] bg-[#0D1016] text-[#F5F1E8] hover:border-[#D6B36A]/45 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
          : isNomad
            ? 'rounded-none border-[#0E0E0E]/20 bg-white text-[#0E0E0E] hover:border-[#0E0E0E] hover:shadow-[6px_6px_0px_#0E0E0E]'
            : 'rounded-[22px] border-black/[0.08] bg-white text-[#111111] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div>
        <Link
          href={`/${locale}/tours/${tour.slug}`}
          className={`relative block aspect-[16/10] overflow-hidden ${
            isCinema
              ? 'rounded-[16px] bg-[#14181F]'
              : isNomad
                ? 'rounded-none bg-[#EFECE6]'
                : 'rounded-[16px] bg-[#F5F5F6]'
          }`}
        >
          <LivingMedia
            src={tour.coverImage}
            alt={title}
            mode="hover-or-dwell"
            hoverMs={450}
            dwellMs={1800}
            mediaClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span
            className={`font-mono-meta absolute left-3 top-3 z-10 px-2.5 py-1 text-[10px] font-medium tracking-wider backdrop-blur-md ${
              isCinema
                ? 'rounded-full border border-[#D6B36A]/45 bg-[#050608]/80 text-[#D6B36A]'
                : isNomad
                  ? 'rounded-none bg-[#0E0E0E] text-[#EFECE6]'
                  : isHorizon
                    ? 'rounded-full bg-[#F41D48] text-white'
                    : isVoyage
                      ? 'rounded-full bg-[#0284C7] text-white'
                      : isAero
                        ? 'rounded-full bg-[#0EA5C6] text-white'
                        : 'rounded-full bg-black/55 text-white'
            }`}
          >
            {tour.code}
          </span>
          <span
            className={`kt-overlay-chip absolute bottom-2.5 left-3 z-10 border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md ${
              isNomad ? 'rounded-none' : 'rounded-full'
            }`}
          >
            {region}
          </span>
        </Link>

        <div className="space-y-2.5 px-2 pt-4">
          <div
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] ${
              isCinema ? 'text-[#9CA3AF]' : isNomad ? 'font-mono-meta text-[#57534E]' : 'text-[#737373]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Clock className={`h-3.5 w-3.5 ${isCinema ? 'text-[#D6B36A]' : isNomad ? 'text-[#D94626]' : isHorizon ? 'text-[#F41D48]' : isVoyage ? 'text-[#0284C7]' : isAero ? 'text-[#0EA5C6]' : 'text-[#111111]'}`} />
              {duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass className={`h-3.5 w-3.5 ${isCinema ? 'text-[#D6B36A]' : isNomad ? 'text-[#D94626]' : isHorizon ? 'text-[#F41D48]' : isVoyage ? 'text-[#0284C7]' : isAero ? 'text-[#0EA5C6]' : 'text-[#111111]'}`} />
              {format}
            </span>
          </div>

          <h3
            className={`leading-snug ${
              isCinema
                ? 'font-editorial text-2xl font-normal text-[#F5F1E8]'
                : isNomad
                  ? 'font-display text-lg font-bold uppercase tracking-tight text-[#0E0E0E]'
                  : 'text-lg font-semibold tracking-[-0.015em]'
            }`}
          >
            <Link
              href={`/${locale}/tours/${tour.slug}`}
              className={`transition-colors ${
                isCinema
                  ? 'text-[#F5F1E8] hover:text-[#D6B36A]'
                  : isNomad
                    ? 'text-[#0E0E0E] hover:text-[#D94626]'
                    : isHorizon
                      ? 'text-[#111827] hover:text-[#F41D48]'
                      : isVoyage
                        ? 'text-[#111111] hover:text-[#0284C7]'
                        : isAero
                          ? 'text-[#0F172A] hover:text-[#0EA5C6]'
                          : 'text-[#111111] hover:text-[#525252]'
              }`}
            >
              {title}
            </Link>
          </h3>

          <ul
            className={`space-y-1 pt-0.5 text-xs ${
              isCinema ? 'text-[#9CA3AF]' : isNomad ? 'text-[#57534E]' : 'text-[#737373]'
            }`}
          >
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                    isCinema ? 'bg-[#D6B36A]/65' : isNomad ? 'bg-[#D94626]' : isHorizon ? 'bg-[#F41D48]' : isVoyage ? 'bg-[#0284C7]' : isAero ? 'bg-[#0EA5C6]' : 'bg-[#111111]/40'
                  }`}
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={`mt-5 flex items-end justify-between border-t px-2 pt-3.5 pb-1 ${
          isCinema ? 'border-white/[0.08]' : isNomad ? 'border-[#0E0E0E]/15' : 'border-black/[0.06]'
        }`}
      >
        <div>
          <span
            className={`block text-[10px] font-medium uppercase tracking-wider ${
              isCinema ? 'text-[#8C9099]' : isNomad ? 'font-mono-meta text-[#57534E]' : 'text-[#9A9AA0]'
            }`}
          >
            {dict.catalog.cardFrom}
          </span>
          <span
            className={`text-xl font-bold tracking-tight ${
              isCinema ? 'text-[#D6B36A]' : isNomad ? 'font-mono-meta text-[#0E0E0E]' : 'text-[#111111]'
            }`}
          >
            ${tour.priceFromUsd.toLocaleString('en-US')}
          </span>
          <span className={`block text-[11px] ${isCinema ? 'text-[#9CA3AF]' : isNomad ? 'text-[#57534E]' : 'text-[#737373]'}`}>
            {priceUnit}
          </span>
        </div>

        <Link
          href={`/${locale}/tours/${tour.slug}`}
          className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
            isCinema
              ? 'rounded-full border border-white/15 bg-white/[0.07] text-[#F5F1E8] group-hover:border-[#D6B36A] group-hover:bg-[#D6B36A] group-hover:text-[#050608]'
              : isNomad
                ? 'rounded-none border border-[#0E0E0E] bg-[#EFECE6] font-mono-meta text-[11px] uppercase tracking-wider text-[#0E0E0E] group-hover:bg-[#D94626] group-hover:border-[#D94626] group-hover:text-[#EFECE6]'
                : isHorizon
                  ? 'rounded-full border border-black/10 bg-[#F4F5F7] text-[#111827] group-hover:border-[#F41D48] group-hover:bg-[#F41D48] group-hover:text-white'
                  : isVoyage
                    ? 'rounded-full border border-black/10 bg-[#F3F4F6] text-[#111111] group-hover:border-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white'
                    : isAero
                      ? 'rounded-full border border-[#0EA5C6]/25 bg-[#F4FBFD] text-[#0C4A5E] group-hover:border-[#0EA5C6] group-hover:bg-[#0EA5C6] group-hover:text-white'
                      : 'rounded-full bg-[#F5F5F6] text-[#111111] group-hover:bg-[#111111] group-hover:text-white'
          }`}
        >
          <span>{dict.catalog.cardViewDetails}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
