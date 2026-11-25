import type { MetadataRoute } from 'next';
import { ensureSeeded, listBlogArticles, listTours } from '@kt/core';
import { getSiteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  ensureSeeded();
  const baseUrl = getSiteUrl();
  const locales = ['en', 'ru', 'kk'] as const;
  const tours = listTours();
  const articles = listBlogArticles(true);

  const entries: MetadataRoute.Sitemap = [];

  const staticPaths = [
    '',
    '/tours',
    '/destinations',
    '/plan-your-trip',
    '/about',
    '/reviews',
    '/blog',
    '/contacts',
    '/legal/privacy',
    '/legal/offer',
  ];

  for (const p of staticPaths) {
    for (const loc of locales) {
      entries.push({
        url: `${baseUrl}/${loc}${p}`,
        lastModified: new Date(),
        changeFrequency: p === '/tours' || p === '' ? 'weekly' : 'monthly',
        priority: p === '' ? 1.0 : p === '/tours' ? 0.9 : 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en${p}`,
            ru: `${baseUrl}/ru${p}`,
            kk: `${baseUrl}/kk${p}`,
          },
        },
      });
    }
  }

  for (const tour of tours) {
    for (const loc of locales) {
      entries.push({
        url: `${baseUrl}/${loc}/tours/${tour.slug}`,
        lastModified: new Date(tour.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.85,
        alternates: {
          languages: {
            en: `${baseUrl}/en/tours/${tour.slug}`,
            ru: `${baseUrl}/ru/tours/${tour.slug}`,
            kk: `${baseUrl}/kk/tours/${tour.slug}`,
          },
        },
      });
    }
  }

  for (const art of articles) {
    for (const loc of locales) {
      entries.push({
        url: `${baseUrl}/${loc}/blog/${art.slug}`,
        lastModified: new Date(art.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.65,
        alternates: {
          languages: {
            en: `${baseUrl}/en/blog/${art.slug}`,
            ru: `${baseUrl}/ru/blog/${art.slug}`,
            kk: `${baseUrl}/kk/blog/${art.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
