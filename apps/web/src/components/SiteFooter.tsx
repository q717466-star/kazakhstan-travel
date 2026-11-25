'use client';

import type { Locale } from '@kt/core';
import { Globe, Mail, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { buildTelegramDeepLink, buildWhatsAppDeepLink } from '@/lib/deep-links';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
  tgUrl?: string;
  waUrl?: string;
}

export function SiteFooter({ locale, dict, tgUrl, waUrl }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const resolvedTg = tgUrl || buildTelegramDeepLink();
  const resolvedWa = waUrl || buildWhatsAppDeepLink(undefined, undefined, locale);

  function handleConciergeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim();
    if (cleaned) {
      setSubmitted(true);
      router.push(`/${locale}/contacts?email=${encodeURIComponent(cleaned)}`);
    } else {
      router.push(`/${locale}/plan-your-trip`);
    }
  }

  return (
    <footer className="border-t border-black/[0.06] bg-[#FAFAFA] text-[#111111]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-3.5 lg:col-span-4">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
              <img src="/brand/logo-mark.svg" alt="Kazakhstan Travel" className="h-7 w-7" />
              <span className="text-[15px] font-semibold tracking-tight text-[#111111]">
                Kazakhstan Travel
              </span>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-[#737373]">
              {dict.footer.brandNote}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold text-[#111111]">{dict.footer.exploreTitle}</h3>
            <ul className="mt-3.5 space-y-2 text-xs text-[#737373]">
              <li>
                <Link href={`/${locale}`} className="hover:text-[#111111] transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/destinations`} className="hover:text-[#111111] transition-colors">
                  {dict.nav.destinations}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tours`} className="hover:text-[#111111] transition-colors">
                  {dict.nav.tours}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-[#111111] transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/reviews`} className="hover:text-[#111111] transition-colors">
                  {dict.nav.reviews}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-[#111111] transition-colors">
                  {dict.nav.blog}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-[#111111]">{dict.footer.companyTitle}</h3>
            <ul className="mt-3.5 space-y-2 text-xs text-[#737373]">
              <li>{dict.footer.cityLabel}</li>
              <li>
                <a href="tel:+77775259885" className="hover:text-[#111111] transition-colors">
                  +7 (777) 525 98 85
                </a>
              </li>
              <li>
                <a href="mailto:kztravel@mail.ru" className="hover:text-[#111111] transition-colors">
                  kztravel@mail.ru
                </a>
              </li>
              <li>{dict.contactsPage.officeHoursValue}</li>
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <form
              onSubmit={handleConciergeSubmit}
              className="flex items-center rounded-full border border-black/[0.1] bg-white p-1 shadow-2xs"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.footer.conciergePlaceholder}
                aria-label={dict.footer.conciergePlaceholder}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs text-[#111111] placeholder:text-[#9A9AA0] focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#111111] px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#262626]"
              >
                {dict.footer.conciergeButton}
              </button>
            </form>

            {submitted && (
              <p className="px-1 text-[11px] text-[#737373]">{dict.footer.conciergeSuccess}</p>
            )}

            <div className="flex items-center gap-2">
              <a
                href={resolvedTg}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-[#525252] transition-colors hover:border-[#111111] hover:text-[#111111]"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
              <a
                href={resolvedWa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-[#525252] transition-colors hover:border-[#111111] hover:text-[#111111]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:kztravel@mail.ru"
                aria-label="Email"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-[#525252] transition-colors hover:border-[#111111] hover:text-[#111111]"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <Link
                href={`/${locale}/contacts`}
                aria-label={dict.nav.contacts}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-[#525252] transition-colors hover:border-[#111111] hover:text-[#111111]"
              >
                <Globe className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/[0.06] pt-7 text-xs text-[#737373] sm:flex-row">
          <p>{dict.footer.rights}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href={`/${locale}/legal/privacy`} className="hover:text-[#111111] transition-colors">
              {dict.footer.privacy}
            </Link>
            <Link href={`/${locale}/legal/offer`} className="hover:text-[#111111] transition-colors">
              {dict.footer.offer}
            </Link>
            <Link href="/admin/login" className="hover:text-[#111111] transition-colors">
              {dict.footer.staffPortal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
