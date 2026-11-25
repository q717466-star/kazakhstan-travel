import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, isValidLocale } from '@/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: `${dict.legal.offerTitle} | ${dict.meta.siteName}` };
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:px-6">
      <div>
        <p className="font-mono-meta text-xs uppercase tracking-wider text-[#737373]">
          {dict.legal.offerUpdated}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111]">
          {dict.legal.offerTitle}
        </h1>
      </div>
      <div className="space-y-6">
        {dict.legal.offerSections.map((sec) => (
          <section key={sec.heading} className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[#111111]">{sec.heading}</h2>
            <p className="text-base leading-relaxed text-[#737373]">{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
