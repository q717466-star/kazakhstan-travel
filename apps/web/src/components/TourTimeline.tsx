'use client';

import type { ItineraryDay, Locale } from '@kt/core';
import { BedDouble, Car, ChevronDown, MapPin, Utensils } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { useHydratedReducedMotion } from './MotionPrimitives';

export function TourTimeline({
  days,
  locale,
  dict,
}: {
  days: ItineraryDay[];
  locale: Locale;
  dict: SiteDictionary;
}) {
  const [openDays, setOpenDays] = useState<number[]>(() => days.map((d) => d.day));
  const { mounted, reduced } = useHydratedReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 65%'],
  });

  function toggleDay(dayNum: number) {
    setOpenDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-4 pl-6 sm:pl-8">
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-0 top-2 w-[2px] bg-[#ECECEE]"
      />
      {mounted && !reduced && (
        <motion.div
          aria-hidden="true"
          style={{ scaleY: scrollYProgress }}
          className="absolute bottom-4 left-0 top-2 w-[2px] origin-top bg-[#111111]"
        />
      )}

      {days.map((d) => {
        const isOpen = openDays.includes(d.day);
        return (
          <div key={d.day} className="relative">
            <span className="font-mono-meta absolute -left-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#111111] text-[11px] font-bold text-white shadow-xs sm:-left-[43px]">
              {d.day}
            </span>

            <div className="overflow-hidden rounded-[20px] border border-black/[0.08] bg-white transition-shadow hover:shadow-sm">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleDay(d.day)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
              >
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                    {dict.tourDetail.dayPrefix} {d.day}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[#111111] sm:text-xl">
                    {d.title[locale] || d.title.en}
                  </h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#737373] transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t border-black/[0.06] px-5 pb-5 pt-4">
                      <p className="text-sm leading-relaxed text-[#525252] sm:text-base">
                        {d.summary[locale] || d.summary.en}
                      </p>

                      <div className="grid gap-3 rounded-xl bg-[#F5F5F6] p-4 text-sm sm:grid-cols-2">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
                          <div>
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                              {dict.tourDetail.locationsLabel}
                            </span>
                            <span className="text-[#111111]">
                              {d.locations[locale] || d.locations.en}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Car className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
                          <div>
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                              {dict.tourDetail.transferLabel}
                            </span>
                            <span className="text-[#111111]">
                              {d.transferInfo[locale] || d.transferInfo.en}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
                          <div>
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                              {dict.tourDetail.mealsLabel}
                            </span>
                            <span className="text-[#111111]">{d.meals[locale] || d.meals.en}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
                          <div>
                            <span className="block text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                              {dict.tourDetail.stayLabel}
                            </span>
                            <span className="text-[#111111]">
                              {d.accommodation[locale] || d.accommodation.en}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
