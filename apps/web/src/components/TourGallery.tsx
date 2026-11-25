'use client';

import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { resolveImageSrc } from '@/lib/media-manifest';
import { LivingMedia } from './LivingMedia';

export function TourGallery({ images, title }: { images: string[]; title: string }) {
  const safeImages = images.length > 0 ? images : ['/images/tours/hero-charyn.webp'];
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveIdx((i) => (i + 1) % safeImages.length);
      if (e.key === 'ArrowLeft') setActiveIdx((i) => (i - 1 + safeImages.length) % safeImages.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, safeImages.length]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-12">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#F5F5F6] md:col-span-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          <LivingMedia
            key={safeImages[activeIdx]}
            src={safeImages[activeIdx]}
            alt={`${title} — photo ${activeIdx + 1}`}
            mode="ambient"
            dwellMs={1000}
            priority="high"
            mediaClassName="transition-transform duration-700 group-hover:scale-103"
          />
          <span className="absolute bottom-3.5 right-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Expand className="h-3.5 w-3.5" />
            <span>
              {activeIdx + 1} / {safeImages.length}
            </span>
          </span>
        </button>

        <div className="grid grid-cols-3 gap-3 md:col-span-4 md:grid-cols-1 md:grid-rows-3">
          {safeImages.slice(0, 3).map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-[16/10] md:aspect-auto overflow-hidden rounded-[16px] border-2 transition-all ${
                idx === activeIdx
                  ? 'border-[#111111] opacity-100'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <LivingMedia
                src={src}
                alt={`${title} preview ${idx + 1}`}
                mode="hover-or-dwell"
                hoverMs={400}
                dwellMs={2600}
              />
            </button>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => setActiveIdx((i) => (i - 1 + safeImages.length) % safeImages.length)}
            className="absolute left-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={resolveImageSrc(safeImages[activeIdx])}
            alt={title}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
          />

          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setActiveIdx((i) => (i + 1) % safeImages.length)}
            className="absolute right-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
