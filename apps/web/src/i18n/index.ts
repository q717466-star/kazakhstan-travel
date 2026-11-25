import type { Locale } from '@kt/core';
import { EN_DICT } from './en';
import { KK_DICT } from './kk';
import { RU_DICT } from './ru';
import type { SiteDictionary } from './types';

export * from './types';

const DICTS: Record<Locale, SiteDictionary> = {
  en: EN_DICT,
  ru: RU_DICT,
  kk: KK_DICT,
};

export function getDictionary(locale: Locale): SiteDictionary {
  return DICTS[locale] ?? EN_DICT;
}
