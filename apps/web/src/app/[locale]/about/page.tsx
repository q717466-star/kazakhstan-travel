import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LivingMedia } from '@/components/LivingMedia';
import { getDictionary, isValidLocale } from '@/i18n';
import { getSiteUrl } from '@/lib/schema';

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
    title: `${dict.nav.about} | ${dict.meta.siteName}`,
    description: dict.about.lead,
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        en: `${baseUrl}/en/about`,
        ru: `${baseUrl}/ru/about`,
        kk: `${baseUrl}/kk/about`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-6">
          <p className="font-eyebrow text-[#737373]">
            {dict.about.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
            {dict.about.title}
          </h1>
          <p className="text-base leading-relaxed text-[#737373]">{dict.about.lead}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/${locale}/tours`}
              className="rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#262626]"
            >
              {dict.hero.ctaExplore}
            </Link>
            <Link
              href={`/${locale}/contacts`}
              className="rounded-full border border-black/[0.15] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F5F5F6]"
            >
              {dict.nav.contacts}
            </Link>
          </div>
        </div>
        <div className="aspect-[16/10] overflow-hidden rounded-[26px] bg-[#F5F5F6] lg:col-span-6">
          <LivingMedia
            src="/images/tours/asy-yurt.webp"
            alt="Kazakhstan Travel expedition camp"
            mode="ambient"
            dwellMs={1000}
            priority="high"
          />
        </div>
      </div>

      <section className="rounded-[26px] bg-[#111111] p-8 text-white sm:p-12">
        <h2 className="font-display mb-8 text-3xl font-semibold">{dict.about.factsTitle}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {dict.about.facts.map((f) => (
            <div key={f.label} className="border-l border-white/20 pl-5">
              <p className="font-display text-4xl font-semibold text-white">{f.num}</p>
              <p className="mt-1 text-sm text-[#9A9AA0]">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {dict.about.pillars.map((p) => (
          <div
            key={p.title}
            className="space-y-3 rounded-[22px] border border-black/[0.08] bg-white p-6"
          >
            <h3 className="font-display text-xl font-semibold text-[#111111]">{p.title}</h3>
            <p className="text-sm leading-relaxed text-[#737373]">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
