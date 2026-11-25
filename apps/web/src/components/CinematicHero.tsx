'use client';

import type { Locale } from '@kt/core';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { resolveImageSrc } from '@/lib/media-manifest';
import { LivingMedia } from './LivingMedia';
import { useHydratedReducedMotion } from './MotionPrimitives';

interface HeroScene {
  id: string;
  src: string;
  label: Record<Locale, string>;
  subtitle: Record<Locale, string>;
}

const SCENES: HeroScene[] = [
  {
    id: 'charyn',
    src: '/images/tours/hero-charyn.webp',
    label: {
      en: 'Charyn Canyon',
      ru: 'Чарынский каньон',
      kk: 'Шарын шатқалы',
    },
    subtitle: {
      en: '1-day private 4×4 escape',
      ru: 'Однодневный джип-тур 4×4',
      kk: 'Бір күндік жеке 4×4 сапар',
    },
  },
  {
    id: 'kolsai',
    src: '/images/tours/kolsai-aerial.webp',
    label: {
      en: 'Kolsai & Kaindy',
      ru: 'Кольсай и Каинды',
      kk: 'Көлсай мен Қайыңды',
    },
    subtitle: {
      en: '2-day alpine lakes journey',
      ru: '2 дня к горным озёрам',
      kk: 'Тау көлдеріне 2 күн',
    },
  },
  {
    id: 'altyn-emel',
    src: '/images/tours/altyn-emel-dune.webp',
    label: {
      en: 'Singing Dune',
      ru: 'Поющий бархан',
      kk: 'Айғайқұм',
    },
    subtitle: {
      en: 'Altyn-Emel 4×4 safari',
      ru: 'Джип-сафари Алтын-Эмель',
      kk: 'Алтын-Емел 4×4 сафари',
    },
  },
  {
    id: 'bao',
    src: '/images/tours/bao-reflection.webp',
    label: {
      en: 'Big Almaty Lake',
      ru: 'Большое Алматинское',
      kk: 'Үлкен Алматы көлі',
    },
    subtitle: {
      en: 'High-mountain 2,511 m pass',
      ru: 'Высокогорье 2 511 м',
      kk: '2 511 м тау асуы',
    },
  },
];

const AVATARS = [
  resolveImageSrc('/images/tours/kolsai-horseback.webp'),
  resolveImageSrc('/images/tours/asy-yurt.webp'),
  resolveImageSrc('/images/tours/charyn-day-trip.webp'),
  resolveImageSrc('/images/tours/almaty-medeu.webp'),
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function CinematicHero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: SiteDictionary;
}) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const { mounted, reduced } = useHydratedReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  useEffect(() => {
    if (!mounted || reduced) return;
    const timer = setInterval(() => {
      setSceneIdx((prev) => (prev + 1) % SCENES.length);
    }, 9500);
    return () => clearInterval(timer);
  }, [mounted, reduced]);

  const activeScene = SCENES[sceneIdx];

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92svh] sm:min-h-[95svh] max-h-[960px] flex-col justify-between overflow-hidden bg-[#141414] text-white"
    >
      {/* Full-bleed Parallax UHD Photo */}
      <motion.div
        style={mounted && !reduced ? { y: parallaxY } : undefined}
        className="absolute inset-0 overflow-hidden will-change-transform"
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={activeScene.id}
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: EASE }}
            className="absolute inset-0"
          >
            <LivingMedia
              src={activeScene.src}
              alt={activeScene.label[locale]}
              mode="ambient"
              dwellMs={900}
              priority="high"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Luminous Photographic Scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/42 via-black/15 to-black/55" />

      {/* Centered Display Headline Block */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-32 text-center sm:pt-40">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-[11px] font-medium tracking-[0.06em] text-white/85 sm:text-xs"
        >
          {dict.hero.eyebrow}
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: EASE }}
          className="font-display mt-3 text-4xl font-normal leading-[1.07] tracking-[-0.03em] text-white sm:text-6xl lg:text-[64px]"
        >
          <span className="block">{dict.hero.headlineLine1}</span>
          <span className="block">{dict.hero.headlineLine2}</span>
        </motion.h1>
      </div>

      {/* Bottom Row: Left Glass Proof Card + Right Interactive Living Thumbnail Strip */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 pb-8 pt-12 sm:px-6 sm:pb-11 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: EASE }}
          className="w-full max-w-[310px] space-y-3.5 rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {AVATARS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`Traveler ${i + 1}`}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/85 first:ml-0 -ml-2"
                />
              ))}
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-semibold text-white">
                {dict.hero.ratingLabel}
              </span>
              <span className="block text-[11px] text-white/75">
                {dict.hero.travelersCount}
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-white/85">
            {dict.hero.socialProofCopy}
          </p>

          <Link
            href={`/${locale}/tours`}
            className="group inline-flex items-center gap-2.5 text-xs font-medium text-white hover:text-white/90"
          >
            <span>{dict.hero.ctaExplore}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#111111] transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="no-scrollbar flex items-start gap-2.5 overflow-x-auto pb-1 sm:gap-3 lg:overflow-visible"
        >
          {SCENES.map((sc, idx) => {
            const active = idx === sceneIdx;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSceneIdx(idx)}
                aria-label={sc.label[locale]}
                aria-pressed={active}
                className={`group shrink-0 text-left transition-all duration-300 focus:outline-none ${
                  active ? 'w-[200px] sm:w-[230px]' : 'w-[78px] sm:w-[96px]'
                }`}
              >
                <div
                  className={`w-full overflow-hidden rounded-[16px] transition-all duration-300 ${
                    active
                      ? 'h-[124px] sm:h-[136px] ring-2 ring-white shadow-xl'
                      : 'h-[164px] sm:h-[180px] opacity-88 ring-1 ring-white/25 hover:opacity-100'
                  }`}
                >
                  <LivingMedia
                    src={sc.src}
                    alt={sc.label[locale]}
                    mode="hover-or-dwell"
                    hoverMs={350}
                    dwellMs={active ? 1050 : 2800}
                    mediaClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {active && (
                  <div className="mt-2 px-0.5">
                    <p className="truncate text-xs font-semibold text-white">
                      {sc.label[locale]}
                    </p>
                    <p className="truncate text-[11px] text-white/75">
                      {sc.subtitle[locale]}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
