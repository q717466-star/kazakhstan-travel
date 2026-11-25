'use client';

import type { Locale } from '@kt/core';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export function useHydratedReducedMotion() {
  const [mounted, setMounted] = useState(false);
  const sysReduced = useReducedMotion();
  useEffect(() => {
    setMounted(true);
  }, []);
  return { mounted, reduced: mounted ? Boolean(sysReduced) : true };
}

export function ScrollProgressBar() {
  const { mounted, reduced } = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  // Render nothing during SSR & initial hydration pass so server/client markup matches 100%
  if (!mounted || reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-[#111111]"
    />
  );
}

export function RevealBlock({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { reduced } = useHydratedReducedMotion();

  return (
    <motion.div
      initial={false}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.6, delay, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const EditorialReveal = RevealBlock;

export function ScrollParallaxCard({
  src,
  alt,
  className = '',
  imgClassName = '',
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, reduced } = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={mounted && !reduced ? { y, scale } : undefined}
        className={`h-[110%] w-full object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-105 ${imgClassName}`}
      />
    </div>
  );
}

export function MagneticButton({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { mounted, reduced } = useHydratedReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 20 });
  const springY = useSpring(y, { stiffness: 280, damping: 20 });

  return (
    <motion.div
      style={mounted && !reduced ? { x: springX, y: springY } : undefined}
      onMouseMove={(e) => {
        if (!mounted || reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        x.set(dx);
        y.set(dy);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SpotlightCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { mounted, reduced } = useHydratedReducedMotion();
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const background = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(17, 17, 17, 0.05), transparent 72%)`;

  return (
    <div
      onMouseMove={(e) => {
        if (!mounted || reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      onMouseLeave={() => {
        mouseX.set(-300);
        mouseY.set(-300);
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      {mounted && !reduced && (
        <motion.div
          aria-hidden="true"
          style={{ background }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function HeroParallaxImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, reduced } = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={mounted && !reduced ? { y } : undefined}
        className="h-[116%] w-full object-cover object-center will-change-transform"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

const MARQUEE_ITEMS: Record<Locale, string[]> = {
  en: [
    'CHARYN CANYON · 940 M',
    'KOLSAI LAKES · 1,818 M',
    'LAKE KAINDY · 1,667 M',
    'ALTYN-EMEL SINGING DUNE',
    'ASY PLATEAU · 2,750 M',
    'BIG ALMATY LAKE · 2,511 M',
    'KEL-SUU FJORD · 3,514 M',
    'PRIVATE 4X4 EXPEDITIONS SINCE 2011',
  ],
  ru: [
    'ЧАРЫНСКИЙ КАНЬОН · 940 М',
    'КОЛЬСАЙСКИЕ ОЗЁРА · 1 818 М',
    'ОЗЕРО КАИНДЫ · 1 667 М',
    'ПОЮЩИЙ БАРХАН АЛТЫН-ЭМЕЛЬ',
    'ПЛАТО АССЫ · 2 750 М',
    'БОЛЬШОЕ АЛМАТИНСКОЕ ОЗЕРО · 2 511 М',
    'ОЗЕРО КЕЛЬ-СУУ · 3 514 М',
    'ПРИВАТНЫЕ 4X4 ЭКСПЕДИЦИИ С 2011 ГОДА',
  ],
  kk: [
    'ШАРЫН ШАТҚАЛЫ · 940 М',
    'КӨЛСАЙ КӨЛДЕРІ · 1 818 М',
    'ҚАЙЫҢДЫ КӨЛІ · 1 667 М',
    'АЛТЫН-ЕМЕЛ АЙҒАЙҚҰМЫ',
    'АСЫ ҮСТІРТІ · 2 750 М',
    'ҮЛКЕН АЛМАТЫ КӨЛІ · 2 511 М',
    'КӨЛ-СУУ ШАТҚАЛЫ · 3 514 М',
    '2011 ЖЫЛДАН БЕРІ ЖЕКЕ 4X4 ЭКСПЕДИЦИЯЛАР',
  ],
};

export function SteppeMarquee({ locale }: { locale: Locale }) {
  const items = MARQUEE_ITEMS[locale] ?? MARQUEE_ITEMS.en;
  const doubled = [...items, ...items];

  return (
    <div
      aria-hidden="true"
      className="kt-marquee-wrap overflow-hidden border-y border-black/[0.06] bg-[#F5F5F6] py-3 text-[#111111]"
    >
      <div className="kt-marquee-track items-center gap-8 text-xs font-medium tracking-[0.14em] uppercase">
        {doubled.map((item, idx) => (
          <span key={idx} className="inline-flex shrink-0 items-center gap-8">
            <span>{item}</span>
            <span className="h-1 w-1 rounded-full bg-[#9A9AA0]" />
          </span>
        ))}
      </div>
    </div>
  );
}
