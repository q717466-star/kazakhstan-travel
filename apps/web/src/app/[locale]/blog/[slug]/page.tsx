import { ensureSeeded, getBlogArticleBySlug } from '@kt/core';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LivingMedia } from '@/components/LivingMedia';
import { getDictionary, isValidLocale } from '@/i18n';
import { buildArticleJsonLd, getSiteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};
  ensureSeeded();
  const art = getBlogArticleBySlug(slug);
  if (!art) return {};
  const baseUrl = getSiteUrl();
  return {
    title: art.seoTitle[locale] || art.title[locale],
    description: art.seoDescription[locale] || art.excerpt[locale],
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${art.slug}`,
      languages: {
        en: `${baseUrl}/en/blog/${art.slug}`,
        ru: `${baseUrl}/ru/blog/${art.slug}`,
        kk: `${baseUrl}/kk/blog/${art.slug}`,
      },
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();
  ensureSeeded();
  const article = getBlogArticleBySlug(slug);
  if (!article || !article.isPublished) notFound();

  const dict = getDictionary(locale);
  const articleLd = buildArticleJsonLd(article, locale);
  const paragraphs = article.content[locale] || article.content.en;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <Link
        href={`/${locale}/blog`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#111111] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{dict.blogPage.backToBlog}</span>
      </Link>

      <header className="mt-8 space-y-4">
        <div className="flex items-center gap-3 font-mono-meta text-xs text-[#737373]">
          <span className="font-sans font-medium text-[#111111]">
            {article.category[locale] || article.category.en}
          </span>
          <span>·</span>
          <span>{article.publishedAt}</span>
          <span>·</span>
          <span>
            {article.readMinutes} {dict.blogPage.minRead}
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {article.title[locale] || article.title.en}
        </h1>
        <p className="text-lg text-[#737373]">{article.excerpt[locale] || article.excerpt.en}</p>
      </header>

      <div className="my-8 aspect-[16/9] overflow-hidden rounded-[22px] bg-[#F5F5F6]">
        <LivingMedia
          src={article.coverImage}
          alt={article.title[locale] || article.title.en}
          mode="ambient"
          dwellMs={1000}
          priority="high"
        />
      </div>

      <div className="space-y-5 text-base leading-relaxed text-[#111111]">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </article>
  );
}
