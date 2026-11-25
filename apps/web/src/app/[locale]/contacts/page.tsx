import { Clock, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContactFormClient } from '@/components/ContactFormClient';
import { getDictionary, isValidLocale } from '@/i18n';
import { buildTelegramDeepLink, buildWhatsAppDeepLink } from '@/lib/deep-links';
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
    title: `${dict.nav.contacts} | ${dict.meta.siteName}`,
    description: dict.contactsPage.subtitle,
    alternates: {
      canonical: `${baseUrl}/${locale}/contacts`,
      languages: {
        en: `${baseUrl}/en/contacts`,
        ru: `${baseUrl}/ru/contacts`,
        kk: `${baseUrl}/kk/contacts`,
      },
    },
  };
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const tgUrl = buildTelegramDeepLink();
  const waUrl = buildWhatsAppDeepLink(undefined, undefined, locale);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-eyebrow text-[#737373]">
          {dict.contactsPage.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.025em] text-[#111111] sm:text-5xl">
          {dict.contactsPage.title}
        </h1>
        <p className="mt-3 text-base text-[#737373]">{dict.contactsPage.subtitle}</p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-6 rounded-[24px] border border-black/[0.08] bg-[#111111] p-7 text-white">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              {dict.contactsPage.directChannels}
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-white/75" />
                <div>
                  <span className="block text-xs text-white/60">{dict.contactsPage.phoneLabel}</span>
                  <a href="tel:+77775259885" className="font-semibold hover:underline">
                    +7 (777) 525 98 85
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-white/75" />
                <div>
                  <span className="block text-xs text-white/60">{dict.contactsPage.emailLabel}</span>
                  <a href="mailto:kztravel@mail.ru" className="font-semibold hover:underline">
                    kztravel@mail.ru
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-white/75" />
                <div>
                  <span className="block text-xs text-white/60">{dict.contactsPage.officeLabel}</span>
                  <span>{dict.contactsPage.officeHoursValue}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F5F5F6]"
              >
                <Send className="h-4 w-4" />
                <span>{dict.contactsPage.telegramBtn}</span>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{dict.contactsPage.whatsappBtn}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactFormClient locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
