import { ensureSeeded, listBlogArticles } from '@kt/core';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LivingMedia } from '@/components/LivingMedia';
import { getDictionary, isValidLocale } from '@/i18n';
import { getSiteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  const baseUrl = getSiteUrl();
  return {
    title: `${dict.nav.blog} | ${dict.meta.siteName}`,
    description: dict.blogPage.subtitle,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: {
        en: `${baseUrl}/en/blog`,
        ru: `${baseUrl}/ru/blog`,
        kk: `${baseUrl}/kk/blog`,
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  ensureSeeded();
  const dict = getDictionary(locale);
  const articles = listBlogArticles(true);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-eyebrow text-[#737373]">
          {dict.blogPage.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {dict.blogPage.title}
        </h1>
        <p className="mt-3 text-base text-[#737373]">{dict.blogPage.subtitle}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {articles.map((art) => (
          <article
            key={art.id}
            className="flex flex-col overflow-hidden rounded-[22px] border border-black/[0.08] bg-white p-3"
          >
            <Link
              href={`/${locale}/blog/${art.slug}`}
              className="group block aspect-[16/10] overflow-hidden rounded-[16px] bg-[#F5F5F6]"
            >
              <LivingMedia
                src={art.coverImage}
                alt={art.title[locale] || art.title.en}
                mode="hover-or-dwell"
                dwellMs={1800}
                mediaClassName="transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="flex flex-1 flex-col justify-between space-y-4 p-3 pt-4">
              <div>
                <div className="flex items-center justify-between font-mono-meta text-xs text-[#737373]">
                  <span className="font-sans font-medium text-[#111111]">
                    {art.category[locale] || art.category.en}
                  </span>
                  <span>
                    {art.publishedAt} · {art.readMinutes} {dict.blogPage.minRead}
                  </span>
                </div>
                <h2 className="font-display mt-2 text-xl font-semibold text-[#111111]">
                  <Link href={`/${locale}/blog/${art.slug}`} className="hover:text-[#525252] transition-colors">
                    {art.title[locale] || art.title.en}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-[#737373]">
                  {art.excerpt[locale] || art.excerpt.en}
                </p>
              </div>
              <Link
                href={`/${locale}/blog/${art.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:underline"
              >
                <span>{dict.blogPage.readArticle}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
