import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { DesignProvider } from '@/components/DesignProvider';
import { DesignSwitcher } from '@/components/DesignSwitcher';
import { SiteChromeShell } from '@/components/SiteChromeShell';
import { getDictionary, isValidLocale } from '@/i18n';
import { buildTelegramDeepLink, buildWhatsAppDeepLink } from '@/lib/deep-links';
import { DESIGN_COOKIE, DESIGN_HEADER, parseDesign } from '@/lib/design-theme';
import { buildOrganizationJsonLd, getSiteUrl } from '@/lib/schema';

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
    title: dict.meta.defaultTitle,
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        kk: `${baseUrl}/kk`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: dict.meta.defaultTitle,
      description: dict.meta.defaultDescription,
      type: 'website',
      locale,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  const dict = getDictionary(locale);
  const orgJsonLd = buildOrganizationJsonLd(locale);
  const tgUrl = buildTelegramDeepLink();
  const waUrl = buildWhatsAppDeepLink(undefined, undefined, locale);

  const reqHeaders = await headers();
  const cookieStore = await cookies();
  const initialDesign = parseDesign(
    reqHeaders.get(DESIGN_HEADER) ?? cookieStore.get(DESIGN_COOKIE)?.value
  );

  return (
    <DesignProvider locale={locale} initialDesign={initialDesign}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <SiteChromeShell locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl}>
        {children}
      </SiteChromeShell>
      <DesignSwitcher locale={locale} dict={dict} />
    </DesignProvider>
  );
}
