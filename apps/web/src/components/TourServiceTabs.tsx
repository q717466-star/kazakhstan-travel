import type { Locale, Tour } from '@kt/core';
import { Check, Info, MinusCircle, ShieldCheck, Truck, UserCheck } from 'lucide-react';
import type { SiteDictionary } from '@/i18n';

export function TourServiceDetails({
  tour,
  locale,
  dict,
}: {
  tour: Tour;
  locale: Locale;
  dict: SiteDictionary;
}) {
  const included = tour.included[locale] || tour.included.en;
  const excluded = tour.excluded[locale] || tour.excluded.en;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[22px] border border-black/[0.08] bg-white p-6">
          <h3 className="font-display mb-4 text-xl font-semibold text-[#111111]">
            {dict.tourDetail.includedTab}
          </h3>
          <ul className="space-y-2.5 text-sm text-[#111111]">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border border-black/[0.08] bg-white p-6">
          <h3 className="font-display mb-4 text-xl font-semibold text-[#111111]">
            {dict.tourDetail.excludedTab}
          </h3>
          <ul className="space-y-2.5 text-sm text-[#737373]">
            {excluded.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9A9AA0]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] border border-black/[0.06] bg-[#F5F5F6] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
            <Truck className="h-4 w-4 text-[#111111]" />
            <span>{dict.tourDetail.vehicleLabel}</span>
          </div>
          <p className="mt-2 text-sm text-[#525252]">
            {tour.vehicleInfo[locale] || tour.vehicleInfo.en}
          </p>
        </div>

        <div className="rounded-[20px] border border-black/[0.06] bg-[#F5F5F6] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
            <UserCheck className="h-4 w-4 text-[#111111]" />
            <span>{dict.tourDetail.guideLabel}</span>
          </div>
          <p className="mt-2 text-sm text-[#525252]">
            {tour.guideInfo[locale] || tour.guideInfo.en}
          </p>
        </div>

        <div className="rounded-[20px] border border-black/[0.06] bg-[#F5F5F6] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
            <Info className="h-4 w-4 text-[#111111]" />
            <span>{dict.tourDetail.requirementsLabel}</span>
          </div>
          <p className="mt-2 text-sm text-[#525252]">
            {tour.requirements[locale] || tour.requirements.en}
          </p>
          <p className="mt-2 text-xs text-[#737373]">
            <strong className="text-[#111111]">{dict.tourDetail.clothingLabel}:</strong>{' '}
            {tour.clothingAdvice[locale] || tour.clothingAdvice.en}
          </p>
        </div>

        <div className="rounded-[20px] border border-black/[0.06] bg-[#F5F5F6] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
            <ShieldCheck className="h-4 w-4 text-[#111111]" />
            <span>{dict.tourDetail.cancellationLabel}</span>
          </div>
          <p className="mt-2 text-sm text-[#525252]">
            {tour.cancellationPolicy[locale] || tour.cancellationPolicy.en}
          </p>
        </div>
      </div>
    </div>
  );
}
