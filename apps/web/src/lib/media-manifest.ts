export const MEDIA_VERSION = 'uhd4';

const VERIFIED_SLOTS = new Set([
  'almaty-evening',
  'almaty-medeu',
  'altyn-emel-aerial',
  'altyn-emel-aktau',
  'altyn-emel-dune',
  'altyn-emel-steppe',
  'asy-horizon',
  'asy-yurt',
  'bao-reflection',
  'bao-summer',
  'charyn-day-trip',
  'charyn-red-rocks',
  'charyn-sunset',
  'hero-charyn',
  'kolsai-aerial',
  'kolsai-boats',
  'kolsai-horseback',
  'kolsai-hotel',
  'kyrgyzstan-barskoon',
  'kyrgyzstan-kelsuu',
  'kyrgyzstan-skazka',
  'turgen-peaks',
  'turgen-yurt',
]);

function extractTourSlot(src: string): string | null {
  if (!src) return null;
  const clean = src.split('?')[0];
  const m = clean.match(/^\/images\/tours\/([a-z0-9-]+)\.(?:webp|jpg|jpeg|png)$/i);
  if (!m) return null;
  const slot = m[1];
  return VERIFIED_SLOTS.has(slot) ? slot : null;
}

export function resolveImageSrc(imageSrc: string): string {
  const slot = extractTourSlot(imageSrc);
  if (!slot) return imageSrc;
  return `/images/tours/${slot}.webp?v=${MEDIA_VERSION}`;
}
