'use client';

import type { Locale, Tour } from '@kt/core';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Compass,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LivingMedia } from '@/components/LivingMedia';
import type { HomeViewProps } from '@/components/home/AlpineHomeView';

const OPENING_SCENES = [
  {
    id: 'charyn',
    roman: 'I',
    coords: '43.3506° N · 79.0785° E',
    src: '/images/tours/hero-charyn.webp',
    label: { en: 'Charyn Valley', ru: 'Чарынский каньон', kk: 'Шарын шатқалы' },
  },
  {
    id: 'kolsai',
    roman: 'II',
    coords: '42.9896° N · 78.3239° E',
    src: '/images/tours/kolsai-aerial.webp',
    label: { en: 'Kolsai Sanctuary', ru: 'Озёра Кольсай', kk: 'Көлсай көлдері' },
  },
  {
    id: 'altyn',
    roman: 'III',
    coords: '43.8764° N · 78.5675° E',
    src: '/images/tours/altyn-emel-dune.webp',
    label: { en: 'Singing Dune', ru: 'Поющий бархан', kk: 'Айғайқұм' },
  },
  {
    id: 'asy',
    roman: 'IV',
    coords: '43.2528° N · 77.9631° E',
    src: '/images/tours/asy-horizon.webp',
    label: { en: 'Assy Plateau', ru: 'Плато Асы', kk: 'Асы үстірті' },
  },
] as const;

const ELEMENTS = [
  {
    id: 'red-stone',
    roman: 'I',
    element: { en: 'Red Stone', ru: 'Красный камень', kk: 'Қызыл тас' },
    place: { en: 'Charyn Canyon · Valley of Castles', ru: 'Чарын · Долина замков', kk: 'Шарын · Қорғандар аңғары' },
    elevation: '1,120 m',
    season: { en: 'Apr – Nov', ru: 'Апр – Ноя', kk: 'Сәу – Қар' },
    src: '/images/tours/charyn-red-rocks.webp',
    countryQuery: 'Kazakhstan',
  },
  {
    id: 'alpine-water',
    roman: 'II',
    element: { en: 'Alpine Water', ru: 'Горная вода', kk: 'Тау суы' },
    place: { en: 'Kolsai & Lake Kaindy', ru: 'Кольсай и Каинды', kk: 'Көлсай мен Қайыңды' },
    elevation: '1,818 m',
    season: { en: 'May – Oct', ru: 'Май – Окт', kk: 'Мам – Қаз' },
    src: '/images/tours/kolsai-boats.webp',
    countryQuery: 'Kazakhstan',
  },
  {
    id: 'singing-sand',
    roman: 'III',
    element: { en: 'Singing Sand', ru: 'Поющие пески', kk: 'Әнші құм' },
    place: { en: 'Altyn-Emel & Aktau Ridges', ru: 'Алтын-Эмель и Актау', kk: 'Алтын-Емел мен Ақтау' },
    elevation: '980 m',
    season: { en: 'Apr – Oct', ru: 'Апр – Окт', kk: 'Сәу – Қаз' },
    src: '/images/tours/altyn-emel-aktau.webp',
    countryQuery: 'Kazakhstan',
  },
  {
    id: 'high-passes',
    roman: 'IV',
    element: { en: 'High Passes', ru: 'Высокие перевалы', kk: 'Биік асулар' },
    place: { en: 'Tien Shan · Almaty & Kel-Suu', ru: 'Тянь-Шань · Кель-Суу', kk: 'Тянь-Шань · Көл-Суу' },
    elevation: '3,514 m',
    season: { en: 'Jun – Sep', ru: 'Июн – Сен', kk: 'Мау – Қыр' },
    src: '/images/tours/kyrgyzstan-kelsuu.webp',
    countryQuery: 'Kyrgyzstan',
  },
] as const;

const PROTOCOL_PHOTOS = [
  '/images/tours/kolsai-hotel.webp',
  '/images/tours/turgen-yurt.webp',
  '/images/tours/asy-yurt.webp',
  '/images/tours/almaty-medeu.webp',
];

export function CinemaHomeView({
  locale,
  dict,
  allTours,
  bentoTours,
  destinations,
  reviews,
}: HomeViewProps) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [elementIdx, setElementIdx] = useState(0);
  const [inspectTour, setInspectTour] = useState<Tour | null>(null);
  const [openProtocol, setOpenProtocol] = useState(0);
  const [voiceIdx, setVoiceIdx] = useState(0);

  const activeScene = OPENING_SCENES[sceneIdx] ?? OPENING_SCENES[0];
  const activeElement = ELEMENTS[elementIdx] ?? ELEMENTS[0];
  const posterTours = bentoTours.slice(0, 4);
  const voiceList = reviews.slice(0, 5);
  const activeVoice = voiceList[voiceIdx] ?? voiceList[0];

  function openConcierge() {
    window.dispatchEvent(new CustomEvent('kt-cinema-concierge-open'));
  }

  return (
    <div className="kt-custom-view bg-[#050608] text-[#F5F1E8]">
      {/* 1. Pure Unobstructed 100svh Cinema Opening */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#050608]">
        <div className="absolute inset-0">
          <LivingMedia
            key={`cinema-open-${activeScene.id}`}
            src={activeScene.src}
            alt={activeScene.label[locale]}
            mode="ambient"
            dwellMs={750}
            priority="high"
            loading="eager"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050608]/65 via-[#050608]/20 to-[#050608]" />

        {/* Centered Monumental Sculptural Serif Opening (Zero bottom clutter) */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="font-mono-meta inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#D6B36A]">
            <span>{activeScene.roman}.</span>
            <span>{activeScene.label[locale]}</span>
            <span className="hidden sm:inline opacity-70">· {activeScene.coords}</span>
          </p>

          <h1 className="font-editorial mt-5 text-5xl font-light leading-[0.98] tracking-[-0.015em] text-[#F5F1E8] sm:text-7xl lg:text-[86px]">
            <span className="block">{dict.hero.headlineLine1}</span>
            <span className="block italic text-[#D6B36A]">{dict.hero.headlineLine2}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-xs leading-relaxed text-white/75 sm:text-sm">
            {dict.hero.socialProofCopy}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#cinema-archive"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#D6B36A] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#050608] transition-colors hover:bg-[#E7C885]"
            >
              <span>{dict.hero.ctaExplore}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={openConcierge}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#050608]/45 px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F5F1E8] backdrop-blur-md transition-colors hover:border-[#D6B36A] hover:text-[#D6B36A]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D6B36A]" />
              <span>{dict.designSwitcher.cinemaConciergeBtn}</span>
            </button>
          </div>
        </div>

        {/* Right-Edge Vertical Roman Numeral Scene Rail */}
        <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2.5 sm:flex lg:right-8">
          {OPENING_SCENES.map((sc, idx) => {
            const active = idx === sceneIdx;
            return (
              <button
                key={sc.id}
                type="button"
                aria-label={sc.label[locale]}
                onClick={() => setSceneIdx(idx)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border font-editorial text-sm italic transition-all ${
                  active
                    ? 'border-[#D6B36A] bg-[#D6B36A] text-[#050608] font-bold scale-110'
                    : 'border-white/20 bg-[#050608]/60 text-white/70 backdrop-blur-md hover:border-[#D6B36A]/60 hover:text-white'
                }`}
              >
                {sc.roman}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. "The Four Elements" Widescreen 21:9 Interactive Chapter Stage */}
      <section className="border-t border-white/[0.08] bg-[#050608] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-[#D6B36A]">
                {dict.home.momentsEyebrow}
              </p>
              <h2 className="font-editorial mt-2 text-4xl font-light text-[#F5F1E8] sm:text-5xl">
                {dict.designSwitcher.cinemaElementsTitle}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {ELEMENTS.map((el, idx) => {
                const active = idx === elementIdx;
                return (
                  <button
                    key={el.id}
                    type="button"
                    data-testid={`cinema-element-${el.id}`}
                    onClick={() => setElementIdx(idx)}
                    className={`rounded-full border px-4 py-1.5 text-xs transition-colors focus:outline-none ${
                      active
                        ? 'border-[#D6B36A] bg-[#D6B36A] text-[#050608] font-semibold'
                        : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-white/40'
                    }`}
                  >
                    <span className="font-editorial mr-1.5 italic">{el.roman}.</span>
                    <span>{el.element[locale]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative mt-8 aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-[24px] border border-white/12 bg-[#0D1016]">
            <LivingMedia
              key={`element-${activeElement.id}`}
              src={activeElement.src}
              alt={activeElement.place[locale]}
              mode="ambient"
              dwellMs={850}
              priority="high"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050608]/88 via-transparent to-black/25" />

            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-end sm:p-8">
              <div>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[#D6B36A]">
                  {activeElement.roman}. {activeElement.element[locale]} · {activeElement.elevation} ·{' '}
                  {activeElement.season[locale]}
                </span>
                <h3 className="font-editorial mt-1 text-3xl font-normal text-white sm:text-4xl">
                  {activeElement.place[locale]}
                </h3>
              </div>

              <Link
                href={`/${locale}/tours?country=${encodeURIComponent(activeElement.countryQuery)}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D6B36A]/65 bg-[#050608]/75 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#D6B36A] backdrop-blur-md transition-colors hover:bg-[#D6B36A] hover:text-[#050608]"
              >
                <span>{dict.home.destViewTours}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tall 3:4 Portrait Cinema Posters Archive + Quick Dossier Modal */}
      <section
        id="cinema-archive"
        className="border-t border-white/[0.08] bg-[#080A0E] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-[#D6B36A]">
                {dict.designSwitcher.cinemaArchiveEyebrow}
              </p>
              <h2 className="font-editorial mt-2 text-4xl font-light text-[#F5F1E8] sm:text-5xl">
                {dict.designSwitcher.cinemaArchiveTitle}
              </h2>
            </div>

            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#D6B36A] hover:text-white"
            >
              <span>{dict.home.toursViewAll}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {posterTours.map((tour, idx) => {
              const title = tour.title[locale] || tour.title.en;
              return (
                <article
                  key={tour.id}
                  className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[22px] border border-white/12 bg-[#0D1016] p-5"
                >
                  <div className="absolute inset-0">
                    <LivingMedia
                      src={tour.coverImage}
                      alt={title}
                      mode="hover-or-dwell"
                      hoverMs={350}
                      dwellMs={1500}
                      mediaClassName="transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/25 to-[#050608]/45" />

                  <div className="relative z-10 flex items-center justify-between font-mono-meta text-[10px]">
                    <span className="rounded-full border border-[#D6B36A]/45 bg-[#050608]/75 px-2.5 py-1 text-[#D6B36A] backdrop-blur-md">
                      0{idx + 1} · {tour.code}
                    </span>
                    <span className="text-white/80">
                      ${tour.priceFromUsd.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <p className="font-mono-meta text-[10px] uppercase tracking-[0.16em] text-[#D6B36A]">
                      {tour.durationLabel[locale] || tour.durationLabel.en}
                    </p>
                    <h3 className="font-editorial text-2xl font-normal leading-tight text-white">
                      {title}
                    </h3>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        data-testid={`cinema-inspect-${idx}`}
                        onClick={() => setInspectTour(tour)}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-[#D6B36A]/65 bg-[#050608]/75 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D6B36A] backdrop-blur-md transition-colors hover:bg-[#D6B36A] hover:text-[#050608]"
                      >
                        {dict.designSwitcher.cinemaInspectBtn}
                      </button>
                      <Link
                        href={`/${locale}/tours/${tour.slug}`}
                        aria-label={title}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:border-[#D6B36A] hover:text-[#D6B36A]"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Non-Overlapping Split Manifesto & Live Alpine Portal + Protocol Accordion */}
      <section className="border-t border-white/[0.08] bg-[#050608] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 lg:pr-4">
              <p className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-[#D6B36A]">
                {dict.about.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold uppercase leading-[1.05] tracking-[-0.025em] text-[#F5F1E8] xl:text-4xl">
                {dict.home.momentsTitleDark1}
              </h2>
            </div>

            <div className="lg:col-span-4 px-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 bg-[#0D1016] shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
                <LivingMedia
                  src="/images/tours/bao-reflection.webp"
                  alt={dict.home.momentsTitleDark2}
                  mode="ambient"
                  dwellMs={900}
                  priority="high"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050608]/65 via-transparent to-black/20" />
                <span className="font-mono-meta absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#D6B36A]/50 bg-[#050608]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D6B36A] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D6B36A]" />
                  {dict.designSwitcher.liveTag}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 lg:pl-4 lg:text-right">
              <h2 className="font-display text-3xl font-light uppercase leading-[1.05] text-white/45 xl:text-4xl">
                {dict.home.momentsTitleMuted}
              </h2>
              <p className="font-editorial mt-2 text-3xl italic text-[#D6B36A] xl:text-4xl">
                {dict.home.momentsTitleDark2}
              </p>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-10 border-t border-white/[0.08] pt-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3.6] overflow-hidden rounded-[22px] border border-white/12 bg-[#0D1016]">
                <LivingMedia
                  key={`cin-prot-${openProtocol}`}
                  src={PROTOCOL_PHOTOS[openProtocol] ?? PROTOCOL_PHOTOS[0]}
                  alt={dict.home.howToBookSteps[openProtocol]?.title || dict.home.howToBookTitle}
                  mode="ambient"
                  dwellMs={900}
                  priority="high"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050608]/80 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 right-5 z-10 text-xs leading-relaxed text-white/85">
                  {dict.home.howToBookPhotoCaption}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[#D6B36A]">
                {dict.designSwitcher.cinemaProtocolTitle}
              </p>
              <h3 className="font-editorial mt-2 text-3xl font-normal text-[#F5F1E8] sm:text-4xl">
                {dict.home.howToBookTitle}
              </h3>

              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {dict.home.howToBookSteps.map((step, idx) => {
                  const isOpen = idx === openProtocol;
                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setOpenProtocol(idx)}
                      className="block w-full py-4 text-left focus:outline-none"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <span className={`font-mono-meta text-xs ${isOpen ? 'text-[#D6B36A]' : 'text-[#9CA3AF]'}`}>
                            0{idx + 1}
                          </span>
                          <span className={`text-sm font-semibold ${isOpen ? 'text-[#F5F1E8]' : 'text-white/75'}`}>
                            {step.title}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#D6B36A]' : 'text-[#9CA3AF]'
                          }`}
                        />
                      </div>
                      {isOpen && (
                        <p className="mt-2 pl-8 text-xs leading-relaxed text-[#9CA3AF]">
                          {step.detail}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dark Topographic Atlas + Minimalist Cinema Voice Spotlight */}
      <section className="border-t border-white/[0.08] bg-[#080A0E] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {activeVoice && (
            <div className="mb-20 grid items-center gap-10 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-6">
                <p className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[#D6B36A]">
                  {dict.home.storiesEyebrow}
                </p>

                <div className="flex items-center gap-1 text-[#D6B36A]">
                  {Array.from({ length: activeVoice.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <blockquote className="font-editorial text-3xl font-light italic leading-snug text-[#F5F1E8]">
                  “{activeVoice.body[locale] || activeVoice.body.en}”
                </blockquote>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{activeVoice.authorName}</p>
                    <p className="font-mono-meta text-[11px] text-[#9CA3AF]">
                      {activeVoice.authorOrigin} · {activeVoice.sourceName}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {voiceList.map((rev, idx) => (
                      <button
                        key={rev.id}
                        type="button"
                        onClick={() => setVoiceIdx(idx)}
                        className={`font-mono-meta h-7 w-7 rounded-full border text-[10px] transition-colors ${
                          idx === voiceIdx
                            ? 'border-[#D6B36A] bg-[#D6B36A] text-[#050608] font-bold'
                            : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/40'
                        }`}
                      >
                        0{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/12 bg-[#0D1016]">
                  <LivingMedia
                    key={activeVoice.id}
                    src={activeVoice.photos[0] || '/images/tours/hero-charyn.webp'}
                    alt={activeVoice.authorName}
                    mode="ambient"
                    dwellMs={950}
                    priority="high"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-1.5 font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[#D6B36A]">
                <Compass className="h-3.5 w-3.5" />
                <span>{dict.home.mapEyebrow}</span>
              </p>
              <h2 className="font-editorial mt-2 text-3xl font-normal text-[#F5F1E8] sm:text-4xl">
                {dict.home.mapHeading}
              </h2>
            </div>
            <p className="max-w-md text-xs text-[#9CA3AF]">{dict.home.mapSubheading}</p>
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

      {/* Quick Dossier Modal for Portrait Cinema Posters */}
      {inspectTour && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="cinema-dossier-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#D6B36A]/35 bg-[#0A0C10] p-6 text-[#F5F1E8] shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono-meta text-[11px] uppercase tracking-[0.2em] text-[#D6B36A]">
                  {inspectTour.code} · {inspectTour.durationLabel[locale] || inspectTour.durationLabel.en}
                </span>
                <h3 className="font-editorial mt-1 text-3xl font-normal text-white">
                  {inspectTour.title[locale] || inspectTour.title.en}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectTour(null)}
                aria-label={dict.designSwitcher.cinemaCloseBtn}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 hover:border-[#D6B36A] hover:text-[#D6B36A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-[#12161E]">
              <LivingMedia
                src={inspectTour.coverImage}
                alt={inspectTour.title[locale] || inspectTour.title.en}
                mode="ambient"
                dwellMs={750}
                priority="high"
              />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#C9C6BE]">
              {inspectTour.shortDescription[locale] || inspectTour.shortDescription.en}
            </p>

            {inspectTour.itineraryDays.length > 0 && (
              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                <p className="font-mono-meta text-[11px] uppercase tracking-[0.18em] text-[#D6B36A]">
                  {dict.tourDetail.itineraryTitle}
                </p>
                {inspectTour.itineraryDays.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs"
                  >
                    <p className="font-semibold text-white">
                      {dict.tourDetail.dayPrefix} {day.day}: {day.title[locale] || day.title.en}
                    </p>
                    <p className="mt-1 leading-relaxed text-[#9CA3AF]">
                      {day.summary[locale] || day.summary.en}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <span className="font-mono-meta text-xl font-bold text-[#D6B36A]">
                  ${inspectTour.priceFromUsd.toLocaleString('en-US')}
                </span>
                <span className="ml-1.5 text-xs text-[#9CA3AF]">
                  / {(inspectTour.priceUnit[locale] || inspectTour.priceUnit.en).split(' (')[0]}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setInspectTour(null);
                    openConcierge();
                  }}
                  className="rounded-full border border-[#D6B36A]/60 px-4 py-2 text-xs font-semibold text-[#D6B36A] hover:bg-[#D6B36A] hover:text-[#050608]"
                >
                  {dict.designSwitcher.cinemaConciergeBtn}
                </button>
                <Link
                  href={`/${locale}/tours/${inspectTour.slug}`}
                  onClick={() => setInspectTour(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#D6B36A] px-5 py-2 text-xs font-semibold text-[#050608] hover:bg-[#E7C885]"
                >
                  <span>{dict.catalog.cardViewDetails}</span>
                  <Clock className="hidden" />
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
