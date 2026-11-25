'use client';

import type { Locale } from '@kt/core';
import { Globe, Mail, MapPin, Menu, MessageCircle, Phone, Send, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

const FOOTER_GALLERY = [
  '/images/tours/hero-charyn.webp',
  '/images/tours/kolsai-aerial.webp',
  '/images/tours/altyn-emel-dune.webp',
  '/images/tours/bao-reflection.webp',
  '/images/tours/kolsai-hotel.webp',
  '/images/tours/almaty-evening.webp',
];

export function AeroShell({ locale, dict, tgUrl, waUrl, children }: ChromeProps) {
  const pathname = usePathname() || `/${locale}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [footerEmail, setFooterEmail] = useState('');

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
      return `/${parts.join('/')}?design=aero`;
    }
    return `/${targetLocale}?design=aero`;
  }

  function isNavActive(href: string): boolean {
    if (href === `/${locale}`) return isHome;
    return pathname.startsWith(href);
  }

  function handleFooterSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = footerEmail.trim();
    if (cleaned) {
      router.push(`/${locale}/contacts?email=${encodeURIComponent(cleaned)}`);
    } else {
      router.push(`/${locale}/plan-your-trip`);
    }
  }

  const navLinks = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.tours, href: `/${locale}/tours` },
    { label: dict.nav.destinations, href: `/${locale}/destinations` },
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.nav.blog, href: `/${locale}/blog` },
    { label: dict.nav.contacts, href: `/${locale}/contacts` },
  ];

  const overlayHeader = isHome && !scrolled;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0F172A]">
      {/* Cerulean Sky Header on Hero -> Solid Crisp White Bar on Scroll */}
      <header
        key={overlayHeader ? 'aero-header-overlay' : 'aero-header-solid'}
        data-testid="aero-header"
        className={
          overlayHeader
            ? 'fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-[#0B7A96]/90'
            : `${
                isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0'
              } z-40 border-b border-black/[0.08] bg-white shadow-2xs`
        }
      >
        <div className="mx-auto flex h-[68px] max-w-[1220px] items-center justify-between gap-4 px-4 sm:px-8">
          <Link href={`/${locale}`} className="group flex shrink-0 items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                overlayHeader ? 'border-white/30 bg-white/15' : 'border-[#0EA5C6]/25 bg-[#F4FBFD]'
              }`}
            >
              <img
                src="/brand/logo-mark.svg"
                alt={dict.meta.siteName}
                className={`h-4 w-4 ${overlayHeader ? 'brightness-0 invert' : ''}`}
              />
            </span>
            <span
              className={`font-display text-sm font-bold tracking-tight sm:text-base ${
                overlayHeader ? 'text-white' : 'text-[#0C4A5E]'
              }`}
            >
              {dict.meta.siteName}
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
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
                        ? 'text-[#0EA5C6] font-semibold'
                        : 'text-[#334155] hover:text-[#0EA5C6]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div
              aria-label={dict.nav.languageLabel}
              className={`hidden sm:inline-flex items-center rounded-full p-0.5 text-[10px] font-mono-meta font-semibold uppercase ${
                overlayHeader
                  ? 'border border-white/30 bg-white/15'
                  : 'border border-black/[0.08] bg-[#F4FBFD]'
              }`}
            >
              {(['en', 'ru', 'kk'] as const).map((loc) => (
                <Link
                  key={loc}
                  href={switchLocalePath(loc)}
                  className={`rounded-full px-2 py-1 ${
                    locale === loc
                      ? overlayHeader
                        ? 'bg-white text-[#0C4A5E]'
                        : 'bg-[#0EA5C6] text-white'
                      : overlayHeader
                        ? 'text-white/90 hover:text-white'
                        : 'text-[#334155] hover:text-[#0EA5C6]'
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
                  ? 'bg-white text-[#0C4A5E] hover:bg-[#E0F5FA]'
                  : 'bg-[#0EA5C6] text-white hover:bg-[#0891B2]'
              }`}
            >
              {dict.nav.planTrip}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={dict.nav.menuToggleLabel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border md:hidden ${
                overlayHeader
                  ? 'border-white/30 bg-white/15 text-white'
                  : 'border-black/10 bg-[#F4FBFD] text-[#0C4A5E]'
              }`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-t border-black/[0.08] bg-white p-4 text-[#0F172A] shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isNavActive(item.href)
                      ? 'bg-[#0EA5C6]/10 text-[#0EA5C6] font-semibold'
                      : 'text-[#0F172A] hover:bg-[#F4FBFD]'
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
                        ? 'bg-[#0EA5C6] text-white font-bold'
                        : 'bg-[#F4FBFD] text-[#334155]'
                    }`}
                  >
                    {loc}
                  </Link>
                ))}
              </div>
              <Link href="/admin/login" className="text-xs font-semibold text-[#0EA5C6]">
                {dict.footer.staffPortal}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Deep Ocean-Teal OTA Footer with Newsletter & 3x2 Mini Gallery */}
      <footer className="bg-[#0C4A5E] text-white">
        {/* Top Newsletter Bar */}
        <div className="border-b border-white/15">
          <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-5 px-6 py-7 md:flex-row md:items-center sm:px-8">
            <p className="font-display text-base font-semibold text-white sm:text-lg">
              {dict.designSwitcher.aeroFooterNewsTitle}
            </p>
            <form
              onSubmit={handleFooterSubscribe}
              className="flex w-full max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-sm"
            >
              <input
                type="email"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder={dict.footer.conciergePlaceholder}
                className="min-w-0 flex-1 bg-transparent px-4 py-1.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#0EA5C6] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0891B2]"
              >
                {dict.designSwitcher.horizonFooterSubscribe}
              </button>
            </form>
          </div>
        </div>

        {/* 4-Column Main Footer */}
        <div className="mx-auto max-w-[1180px] px-6 py-12 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-3">
              <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 bg-white/15">
                  <img
                    src="/brand/logo-mark.svg"
                    alt={dict.meta.siteName}
                    className="h-4 w-4 brightness-0 invert"
                  />
                </span>
                <span className="font-display text-base font-bold text-white">
                  {dict.meta.siteName}
                </span>
              </Link>
              <p className="text-xs leading-relaxed text-white/75">{dict.footer.brandNote}</p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/80 hover:border-[#0EA5C6] hover:bg-[#0EA5C6] hover:text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/80 hover:border-[#0EA5C6] hover:bg-[#0EA5C6] hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <a
                  href="mailto:kztravel@mail.ru"
                  aria-label="Email"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/80 hover:border-[#0EA5C6] hover:bg-[#0EA5C6] hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
                <Link
                  href={`/${locale}/contacts`}
                  aria-label={dict.nav.contacts}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/80 hover:border-[#0EA5C6] hover:bg-[#0EA5C6] hover:text-white"
                >
                  <Globe className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7DD3FC]">
                {dict.footer.exploreTitle}
              </p>
              <ul className="space-y-2 text-xs text-white/80">
                <li>
                  <Link href={`/${locale}/destinations`} className="hover:text-white">
                    {dict.nav.destinations}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/tours`} className="hover:text-white">
                    {dict.nav.tours}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/plan-your-trip`} className="hover:text-white">
                    {dict.nav.planTrip}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/blog`} className="hover:text-white">
                    {dict.nav.blog}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7DD3FC]">
                {dict.footer.companyTitle}
              </p>
              <ul className="space-y-2.5 text-xs text-white/80">
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#7DD3FC]" />
                  <a href="tel:+77775259885" className="hover:text-white">
                    +7 (777) 525 98 85
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#7DD3FC]" />
                  <a href="mailto:kztravel@mail.ru" className="hover:text-white">
                    kztravel@mail.ru
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#7DD3FC]" />
                  <span>{dict.footer.cityLabel}</span>
                </li>
                <li>
                  <Link href="/admin/login" className="text-[#7DD3FC] hover:text-white">
                    {dict.footer.staffPortal} →
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7DD3FC]">
                {dict.designSwitcher.aeroGalleryTitle}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FOOTER_GALLERY.map((src) => (
                  <Link
                    key={src}
                    href={`/${locale}/tours`}
                    className="aspect-[4/3] overflow-hidden rounded-lg border border-white/15 bg-[#083847]"
                  >
                    <img
                      src={resolveImageSrc(src)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/65">
            <p>{dict.footer.rights}</p>
            <div className="flex items-center gap-5">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-white">
                {dict.footer.privacy}
              </Link>
              <Link href={`/${locale}/legal/offer`} className="hover:text-white">
                {dict.footer.offer}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
