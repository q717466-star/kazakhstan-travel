'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function TourViewBeacon({
  tourCode,
  tourTitle,
  locale,
}: {
  tourCode: string;
  tourTitle: string;
  locale: string;
}) {
  useEffect(() => {
    trackEvent({ name: 'view_tour', tour_code: tourCode, tour_title: tourTitle, locale });
  }, [tourCode, tourTitle, locale]);

  return null;
}
