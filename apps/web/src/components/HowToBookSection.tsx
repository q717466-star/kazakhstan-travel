'use client';

import type { Locale } from '@kt/core';
import {
  ArrowRight,
  Calendar,
  Globe,
  MessageCircle,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { LivingMedia } from './LivingMedia';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
}

const STEP_PHOTOS = [
  '/images/tours/kolsai-boats.webp',
  '/images/tours/altyn-emel-aktau.webp',
  '/images/tours/asy-horizon.webp',
  '/images/tours/turgen-peaks.webp',
];

const TRUST_ICONS = [Calendar, Truck, Globe, Send, MessageCircle, ShieldCheck];

export function HowToBookSection({ locale, dict }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-center text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-[#111111] sm:text-6xl lg:text-[68px]">
          {dict.home.howToBookTitle}
        </h2>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-[#8E8E93] sm:gap-x-10">
          {dict.home.trustStrip.map((label, idx) => {
            const Icon = TRUST_ICONS[idx % TRUST_ICONS.length];
            return (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-[#A1A1AA]" />
                <span>{label}</span>
              </span>
            );
          })}
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="group relative aspect-[4/4.2] overflow-hidden rounded-[26px] bg-[#F5F5F6]">
              <LivingMedia
                key={`step-${activeStep}`}
                src={STEP_PHOTOS[activeStep] ?? STEP_PHOTOS[0]}
                alt={dict.home.howToBookSteps[activeStep]?.title || dict.home.howToBookHeading}
                mode="ambient"
                dwellMs={1100}
                priority="high"
                mediaClassName="transition-transform duration-700 group-hover:scale-103"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-6 text-white">
                <p className="max-w-xs text-xs leading-relaxed text-white/90 sm:text-sm">
                  {dict.home.howToBookPhotoCaption}
                </p>
                <Link
                  href={`/${locale}/plan-your-trip`}
                  aria-label={dict.nav.planTrip}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#111111] shadow-md transition-transform duration-200 hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div>
              <p className="text-xs font-medium text-[#737373]">
                {dict.home.howToBookEyebrow}
              </p>
              <h3 className="font-display mt-1.5 text-2xl font-medium tracking-[-0.02em] text-[#111111] sm:text-3xl">
                {dict.home.howToBookHeading}
              </h3>
            </div>

            <div className="space-y-2.5">
              {dict.home.howToBookSteps.map((step, idx) => {
                const isActive = idx === activeStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all duration-200 focus:outline-none ${
                      isActive
                        ? 'bg-[#F5F5F6] text-[#111111]'
                        : 'bg-transparent text-[#737373] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-white text-[#111111] shadow-xs'
                          : 'bg-[#F5F5F6] text-[#737373]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? 'text-[#111111]' : 'text-[#525252]'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#737373]">
                        {step.detail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
