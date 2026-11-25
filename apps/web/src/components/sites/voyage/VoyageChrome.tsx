'use client';

import type { Locale } from '@kt/core';
import { Globe, Mail, Menu, MessageCircle, Send, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { SiteDictionary } from '@/i18n';
import { resolveImageSrc } from '@/lib/media-manifest';

interface ChromeProps {
  locale: Locale;
  dict: SiteDictionary;
  tgUrl: string;
  waUrl: string;
  children: ReactNode;
}

export function VoyageShell({ locale, dict, tgUrl, waUrl, children }: ChromeProps) {
  const pathname = usePathname() || `/${locale}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function switchLocalePath(targetLocale: Locale): string {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && ['en', 'ru', 'kk'].includes(parts[0])) {
      parts[0] = targetLocale;
      return `/${parts.join('/')}?design=voyage`;
    }
    return `/${targetLocale}?design=voyage`;
  }

  function isNavActive(href: string): boolean {
    if (href === `/${locale}`) return isHome;
    return pathname.startsWith(href);
  }

  const navLinks = [
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.nav.destinations, href: `/${locale}/destinations` },
    { label: dict.nav.tours, href: `/${locale}/tours` },
    { label: dict.nav.reviews, href: `/${locale}/reviews` },
    { label: dict.nav.contacts, href: `/${locale}/contacts` },
  ];

  const overlayHeader = isHome && !scrolled;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111111]">
      {/* Clean Sky Overlay Header on Hero -> Solid White Fixed Bar on Scroll */}
      <header
        key={overlayHeader ? 'voyage-header-overlay' : 'voyage-header-solid'}
        data-testid="voyage-header"
        className={
          overlayHeader
            ? 'fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-[#035388]/55 via-[#035388]/20 to-transparent'
            : `${
                isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0'
              } z-40 border-b border-black/[0.08] bg-white shadow-2xs`
        }
      >
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-8">
          <Link href={`/${locale}`} className="group flex shrink-0 items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                overlayHeader
                  ? 'border-white/35 bg-white/15'
                  : 'border-black/10 bg-[#F3F4F6]'
              }`}
            >
              <img
                src="/brand/logo-mark.svg"
                alt={dict.meta.siteName}
                className={`h-4 w-4 ${overlayHeader ? 'brightness-0 invert' : ''}`}
              />
            </span>
            <span
              className={`font-display text-sm font-semibold tracking-tight sm:text-base ${
                overlayHeader ? 'text-white' : 'text-[#111111]'
              }`}
            >
              {dict.meta.siteName}
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => {
              const active = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap text-xs font-medium ${
                    overlayHeader
                      ? active
                        ? 'text-white font-semibold underline underline-offset-4'
                        : 'text-white/90 hover:text-white'
                      : active
                        ? 'text-[#0284C7] font-semibold'
                        : 'text-[#525252] hover:text-[#111111]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            <div
              aria-label={dict.nav.languageLabel}
              className={`hidden sm:inline-flex items-center rounded-full p-0.5 text-[10px] font-mono-meta font-semibold uppercase ${
                overlayHeader
                  ? 'border border-white/30 bg-white/15'
                  : 'border border-black/[0.08] bg-[#F3F4F6]'
              }`}
            >
              {(['en', 'ru', 'kk'] as const).map((loc) => (
                <Link
                  key={loc}
                  href={switchLocalePath(loc)}
                  className={`rounded-full px-2 py-1 ${
                    locale === loc
                      ? overlayHeader
                        ? 'bg-white text-[#111111]'
                        : 'bg-[#111111] text-white'
                      : overlayHeader
                        ? 'text-white/90 hover:text-white'
                        : 'text-[#525252] hover:text-[#111111]'
                  }`}
                >
                  {loc}
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}/plan-your-trip`}
              className={`inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shadow-sm sm:px-5 ${
                overlayHeader
                  ? 'bg-white text-[#111111] hover:bg-[#F3F4F6]'
                  : 'bg-[#111111] text-white hover:bg-[#0284C7]'
              }`}
            >
              {dict.nav.planTrip}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={dict.nav.menuToggleLabel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden ${
                overlayHeader
                  ? 'border-white/35 bg-white/15 text-white'
                  : 'border-black/10 bg-[#F3F4F6] text-[#111111]'
              }`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-t border-black/[0.08] bg-white p-4 text-[#111111] shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href={`/${locale}`}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isHome ? 'bg-[#0284C7]/10 text-[#0284C7] font-semibold' : 'hover:bg-[#F3F4F6]'
                }`}
              >
                {dict.nav.home}
              </Link>
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isNavActive(item.href)
                      ? 'bg-[#0284C7]/10 text-[#0284C7] font-semibold'
                      : 'text-[#111111] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-black/[0.06] pt-3">
              <div className="flex items-center gap-1.5 font-mono-meta text-xs uppercase">
                {(['en', 'ru', 'kk'] as const).map((loc) => (
                  <Link
                    key={loc}
                    href={switchLocalePath(loc)}
                    className={`rounded-full px-2.5 py-1 ${
                      locale === loc
                        ? 'bg-[#111111] text-white font-bold'
                        : 'bg-[#F3F4F6] text-[#525252]'
                    }`}
                  >
                    {loc}
                  </Link>
                ))}
              </div>
              <Link
                href={`/${locale}/blog`}
                className="text-xs font-semibold text-[#0284C7]"
              >
                {dict.nav.blog}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Full-Bleed Photographic Dark Footer */}
      <footer
        className={`relative overflow-hidden bg-[#080F1D] text-white ${
          isHome ? 'pt-28 sm:pt-32' : 'pt-16'
        }`}
      >
        <img
          src={resolveImageSrc('/images/tours/almaty-evening.webp')}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-55"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08101D]/72 via-[#070D19]/84 to-[#050810]/96"
        />

        <div className="relative z-10 mx-auto max-w-[1140px] px-6 sm:px-8">
          <div className="grid gap-10 pb-12 md:grid-cols-12">
            <div className="space-y-3 md:col-span-5">
              <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
                  <img
                    src="/brand/logo-mark.svg"
                    alt={dict.meta.siteName}
                    className="h-4 w-4 brightness-0 invert"
                  />
                </span>
                <span className="font-display text-base font-bold tracking-tight text-white">
                  {dict.meta.siteName}
                </span>
              </Link>
              <p className="max-w-xs text-xs leading-relaxed text-white/75">{dict.footer.brandNote}</p>
            </div>

            <div className="space-y-3 md:col-span-3">
              <p className="text-xs font-semibold text-white">{dict.footer.exploreTitle}</p>
              <ul className="space-y-2 text-xs text-white/75">
                <li>
                  <Link href={`/${locale}/destinations`} className="hover:text-white transition-colors">
                    {dict.nav.destinations}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/tours`} className="hover:text-white transition-colors">
                    {dict.nav.tours}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/plan-your-trip`} className="hover:text-white transition-colors">
                    {dict.nav.planTrip}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/blog`} className="hover:text-white transition-colors">
                    {dict.nav.blog}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 md:col-span-4">
              <p className="text-xs font-semibold text-white">{dict.footer.companyTitle}</p>
              <ul className="space-y-2 text-xs text-white/75">
                <li>
                  <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                    {dict.nav.about}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/reviews`} className="hover:text-white transition-colors">
                    {dict.nav.reviews}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/contacts`} className="hover:text-white transition-colors">
                    {dict.nav.contacts}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-[#7DD3FC] transition-colors">
                    {dict.footer.staffPortal}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-6 text-xs text-white/65">
            <div className="flex flex-wrap items-center gap-5">
              <span>{dict.footer.rights}</span>
              <Link href={`/${locale}/legal/privacy`} className="hover:text-white">
                {dict.footer.privacy}
              </Link>
              <Link href={`/${locale}/legal/offer`} className="hover:text-white">
                {dict.footer.offer}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:kztravel@mail.ru"
                aria-label="Email"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <Link
                href={`/${locale}/contacts`}
                aria-label={dict.nav.contacts}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
