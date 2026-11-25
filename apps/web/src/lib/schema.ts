import type { BlogArticle, Locale, Tour } from '@kt/core';

export function getSiteUrl(): string {
  const vercelUrl = process.env.VERCEL_URL?.trim();
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    (vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//i, '')}` : '') ||
    'https://www.kazakhstan-travel.com'
  ).replace(/\/$/, '');
}

export function buildOrganizationJsonLd(locale: Locale) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Kazakhstan Travel',
    url: `${siteUrl}/${locale}`,
    logo: `${siteUrl}/brand/logo-mark.svg`,
    telephone: '+7-777-525-98-85',
    email: 'kztravel@mail.ru',
    foundingDate: '2011',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Almaty',
      addressCountry: 'KZ',
    },
    sameAs: [
      'https://www.instagram.com/kazakhstan_travel/',
      'https://www.facebook.com/almatytravel/',
    ],
  };
}

export function buildTourJsonLd(tour: Tour, locale: Locale) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title[locale] || tour.title.en,
    description: tour.shortDescription[locale] || tour.shortDescription.en,
    image: tour.gallery.map((img) => `${siteUrl}${img}`),
    touristType: 'Private 4x4 Overland Travelers',
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: tour.itineraryDays.length,
      itemListElement: tour.itineraryDays.map((d, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: d.title[locale] || d.title.en,
        description: d.summary[locale] || d.summary.en,
      })),
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: tour.priceFromUsd,
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/${locale}/tours/${tour.slug}`,
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Kazakhstan Travel',
      url: siteUrl,
    },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleJsonLd(article: BlogArticle, locale: Locale) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title[locale] || article.title.en,
    description: article.excerpt[locale] || article.excerpt.en,
    image: [`${siteUrl}${article.coverImage}`],
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Kazakhstan Travel Field Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kazakhstan Travel',
    },
    mainEntityOfPage: `${siteUrl}/${locale}/blog/${article.slug}`,
  };
}
