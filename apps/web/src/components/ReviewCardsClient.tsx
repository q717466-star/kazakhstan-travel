import type { Locale, Review } from '@kt/core';
import { ExternalLink, Star } from 'lucide-react';
import type { SiteDictionary } from '@/i18n';
import { LivingMedia } from './LivingMedia';

export function ReviewCardsClient({
  reviews,
  locale,
}: {
  reviews: Review[];
  locale: Locale;
  dict?: SiteDictionary;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((rev) => (
          <article
            key={rev.id}
            className="flex flex-col justify-between rounded-[22px] border border-black/[0.08] bg-white p-6 shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-[#737373]">
                <div className="flex items-center gap-0.5 text-[#F5A623]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-mono-meta">{rev.travelDate}</span>
              </div>

              <h3 className="font-display mt-3 text-lg font-semibold text-[#111111]">
                {rev.title[locale] || rev.title.en}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#737373]">
                “{rev.body[locale] || rev.body.en}”
              </p>

              {rev.photos.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {rev.photos.slice(0, 2).map((src) => (
                    <div key={src} className="h-16 w-24 overflow-hidden rounded-xl bg-[#F5F5F6]">
                      <LivingMedia
                        src={src}
                        alt={rev.authorName}
                        mode="hover-or-dwell"
                        dwellMs={2200}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4 text-xs">
              <div>
                <p className="font-semibold text-[#111111]">{rev.authorName}</p>
                <p className="text-[#737373]">{rev.authorOrigin}</p>
              </div>
              <div className="flex items-center gap-2">
                {rev.sourceUrl && (
                  <a
                    href={rev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={rev.sourceName}
                    className="inline-flex items-center gap-1 text-[#737373] hover:text-[#111111]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
  );
}
