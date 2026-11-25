export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

const TOUR_REDIRECTS: Array<[string, string]> = [
  ['/tours/charyn-canyon', '/en/tours/charyn-canyon'],
  ['/tours/charyn-and-kolsai-lakes-national-parks', '/en/tours/charyn-and-kolsai-lakes-national-parks'],
  ['/tours/kolsai-lake-tour', '/en/tours/kolsai-lake-tour'],
  ['/tours/altyn-emel-2-day-tour', '/en/tours/altyn-emel-2-day-tour'],
  ['/tours/big-almaty-lake-tour', '/en/tours/big-almaty-lake-tour'],
  [
    '/tours/the-golden-ring-a-circular-tour-of-the-national-parks-of-the-almaty-region',
    '/en/tours/the-golden-ring-a-circular-tour-of-the-national-parks-of-the-almaty-region',
  ],
  [
    '/tours/the-golden-ring-a-circular-tour-of-almaty-region-national-parks',
    '/en/tours/the-golden-ring-a-circular-tour-of-the-national-parks-of-the-almaty-region',
  ],
  ['/tours/high-altitude-asy-plateau', '/en/tours/high-altitude-asy-plateau'],
  ['/tours/ushchele-turgen', '/en/tours/ushchele-turgen'],
  ['/tours/almaty-city-tour', '/en/tours/almaty-city-tour'],
  ['/tours/kolsai-lake-charyn-canyon-express-tour', '/en/tours/kolsai-lake-charyn-canyon-express-tour'],
  ['/tours/asian-ring-the-best-of-kazakhstan-kyrgyzstan', '/en/tours/asian-ring-the-best-of-kazakhstan-kyrgyzstan'],
  [
    '/tours/the-great-silk-road-the-main-ring-of-central-asia',
    '/en/tours/the-great-silk-road-the-main-ring-of-central-asia',
  ],
  ['/tours/altyn-emel-national-park', '/en/tours/altyn-emel-2-day-tour'],
  ['/tours/charyn-canyon-lake-kaindy-kolsai-3', '/en/tours/charyn-and-kolsai-lakes-national-parks'],
  [
    '/tours/express-tour-the-golden-ring-a-circular-tour-of-the-national-parks-of-the-almaty-region',
    '/en/tours/kolsai-lake-charyn-canyon-express-tour',
  ],
  ['/tours/the-golden-ring-from-the-kegen-border-crossing', '/en/tours/asian-ring-the-best-of-kazakhstan-kyrgyzstan'],
  ['/tours/central-asia-overland-day-kazakhstan-kyrgyzstan-adventure-tour', '/en/tours/asian-ring-the-best-of-kazakhstan-kyrgyzstan'],
  ['/tours/private-suv-tours-kazakhstan-kyrgyzstan', '/en/tours?category=kazakhstan'],
  ['/tours/kyrgyzstan-tours', '/en/tours?category=kyrgyzstan'],
  ['/tours/day-trips-from-almaty', '/en/tours?category=day-trips'],
  ['/tours/central-asia-tours', '/en/tours?category=central-asia'],
  ['/tours/almaty-tours', '/en/tours?region=almaty'],
  ['/tours/accommodation-and-yurts-at-kolsai-lake', '/en/tours/kolsai-lake-tour'],
  ['/tours/petroglify-naskalnye-risunki-na-r-ili', '/en/tours?activity=culture'],
  ['/tours/aero-tury-na-vertolete', '/en/plan-your-trip'],
  ['/tours/polet-na-samolete-za-shturvalom', '/en/plan-your-trip'],
  ['/tours/konnye-tury', '/en/tours?activity=active'],
  ['/tours/off-road-buggy-adventures-from-almaty', '/en/tours?activity=offroad'],
];

const STATIC_AND_SECTION_REDIRECTS: Array<[string, string]> = [
  ['/tours', '/en/tours'],
  ['/about', '/en/about'],
  ['/reviews', '/en/reviews'],
  ['/contacts', '/en/contacts'],
  ['/blog', '/en/blog'],
  ['/reports', '/en/destinations'],
  ['/reports/:slug', '/en/destinations'],
  ['/offer-agreement', '/en/legal/offer'],
  ['/privacy-policy', '/en/legal/privacy'],
  ['/cart', '/en/plan-your-trip'],
];

export const LEGACY_REDIRECTS: RedirectRule[] = [
  ...TOUR_REDIRECTS.map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })),
  ...STATIC_AND_SECTION_REDIRECTS.map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })),
  {
    source: '/blog/:slug',
    destination: '/en/blog',
    permanent: true,
  },
];
