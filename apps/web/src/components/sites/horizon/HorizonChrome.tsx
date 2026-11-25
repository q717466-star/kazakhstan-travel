'use client';

import type { Locale } from '@kt/core';
import { Globe, Mail, Menu, MessageCircle, Send, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { SiteDictionary } from '@/i18n';

interface ChromeProps {
  locale: Locale;
  dict: SiteDictionary;
  tgUrl: string;
  waUrl: string;
  children: ReactNode;
}

export function HorizonShell({ locale, dict, tgUrl, waUrl, children }: ChromeProps) {
  const pathname = usePathname() || `/${locale}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');

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
      return `/${parts.join('/')}?design=horizon`;
    }
    return `/${targetLocale}?design=horizon`;
  }

  function isNavActive(href: string): boolean {
    if (href === `/${locale}`) return isHome;
    return pathname.startsWith(href);
  }

  function handleFooterSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim();
    if (cleaned) {
      router.push(`/${locale}/contacts?email=${encodeURIComponent(cleaned)}`);
    } else {
      router.push(`/${locale}/plan-your-trip`);
    }
  }

  const navLinks = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.destinations, href: `/${locale}/destinations` },
    { label: dict.nav.tours, href: `/${locale}/tours` },
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.nav.reviews, href: `/${locale}/reviews` },
    { label: dict.nav.blog, href: `/${locale}/blog` },
  ];

  const overlayHeader = isHome && !scrolled;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111827]">
      {/* Translucent Floating Hero Pill Header -> Fixed Solid White Header on Scroll */}
      <header
        key={overlayHeader ? 'horizon-header-overlay' : 'horizon-header-solid'}
        data-testid="horizon-header"
        className={
          overlayHeader
            ? 'fixed inset-x-0 top-5 z-40 px-6 sm:px-10 lg:px-14'
            : `${
                isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0'
              } z-40 border-b border-black/[0.08] bg-white shadow-2xs`
        }
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 ${
            overlayHeader ? 'h-14 max-w-[1380px] px-2 sm:px-4' : 'h-[70px] max-w-[1440px] px-4 sm:px-8'
          }`}
        >
          <Link href={`/${locale}`} className="group flex shrink-0 items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                overlayHeader
                  ? 'border-white/30 bg-white/15 backdrop-blur-md'
                  : 'border-black/10 bg-[#F4F5F7]'
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
                overlayHeader ? 'text-white' : 'text-[#111827]'
              }`}
            >
              {dict.meta.siteName}
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className={`hidden md:flex items-center gap-0.5 rounded-full p-1 ${
              overlayHeader
                ? 'border border-white/25 bg-white/15 backdrop-blur-md'
                : 'border border-black/[0.06] bg-[#F4F5F7]'
            }`}
          >
            {navLinks.map((item) => {
              const active = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium ${
                    active
                      ? 'bg-white text-[#111827] font-semibold shadow-xs'
                      : overlayHeader
                        ? 'text-white/90 hover:text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
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
                  ? 'border border-white/25 bg-white/15 text-white backdrop-blur-md'
                  : 'border border-black/[0.08] bg-[#F4F5F7] text-[#4B5563]'
              }`}
            >
              {(['en', 'ru', 'kk'] as const).map((loc) => (
                <Link
                  key={loc}
                  href={switchLocalePath(loc)}
                  className={`rounded-full px-2 py-1 ${
                    locale === loc
                      ? overlayHeader
                        ? 'bg-white text-[#111827]'
                        : 'bg-[#111827] text-white'
                      : overlayHeader
                        ? 'text-white/85 hover:text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {loc}
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}/plan-your-trip`}
              className="inline-flex items-center whitespace-nowrap rounded-full bg-[#F41D48] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#D9143C] sm:px-5"
            >
              {dict.nav.planTrip}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={dict.nav.menuToggleLabel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden ${
                overlayHeader
                  ? 'border-white/30 bg-white/15 text-white backdrop-blur-md'
                  : 'border-black/10 bg-[#F4F5F7] text-[#111827]'
              }`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="mx-auto mt-2 max-w-[1380px] rounded-2xl border border-black/[0.08] bg-white p-4 text-[#111827] shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isNavActive(item.href)
                      ? 'bg-[#F41D48]/10 text-[#F41D48] font-semibold'
                      : 'text-[#111827] hover:bg-[#F4F5F7]'
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
                      locale === loc ? 'bg-[#111827] text-white font-bold' : 'bg-[#F4F5F7] text-[#4B5563]'
                    }`}
                  >
                    {loc}
                  </Link>
                ))}
              </div>
              <Link
                href={`/${locale}/contacts`}
                className="text-xs font-semibold text-[#F41D48]"
              >
                {dict.nav.contacts}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Light 4-Column Portal Footer with Newsletter Pill & Watermark Wordmark */}
      <footer className="relative overflow-hidden border-t border-black/[0.06] bg-white pt-16 text-[#111827]">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-8">
          <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-4">
              <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-[#F4F5F7]">
                  <img src="/brand/logo-mark.svg" alt={dict.meta.siteName} className="h-4 w-4" />
                </span>
                <span className="font-display text-base font-bold tracking-tight text-[#111827]">
                  {dict.meta.siteName}
                </span>
              </Link>
              <p className="max-w-xs text-xs leading-relaxed text-[#6B7280]">{dict.footer.brandNote}</p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[#4B5563] transition-colors hover:border-[#F41D48] hover:text-[#F41D48]"
                >
                  <Send className="h-3.5 w-3.5" />
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[#4B5563] transition-colors hover:border-[#F41D48] hover:text-[#F41D48]"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <a
                  href="mailto:kztravel@mail.ru"
                  aria-label="Email"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[#4B5563] transition-colors hover:border-[#F41D48] hover:text-[#F41D48]"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
                <Link
                  href={`/${locale}/contacts`}
                  aria-label={dict.nav.contacts}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[#4B5563] transition-colors hover:border-[#F41D48] hover:text-[#F41D48]"
                >
                  <Globe className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold text-[#111827]">{dict.footer.exploreTitle}</p>
              <ul className="space-y-2 text-xs text-[#6B7280]">
                <li>
                  <Link href={`/${locale}/destinations`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.destinations}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/tours`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.tours}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/plan-your-trip`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.planTrip}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/blog`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.blog}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold text-[#111827]">{dict.footer.companyTitle}</p>
              <ul className="space-y-2 text-xs text-[#6B7280]">
                <li>
                  <Link href={`/${locale}/about`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.about}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/reviews`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.reviews}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/contacts`} className="hover:text-[#F41D48] transition-colors">
                    {dict.nav.contacts}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-[#F41D48] transition-colors">
                    {dict.footer.staffPortal}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 lg:col-span-4">
              <p className="text-xs font-semibold text-[#111827]">
                {dict.designSwitcher.horizonFooterStayTitle}
              </p>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                {dict.designSwitcher.horizonFooterStaySub}
              </p>
              <form
                onSubmit={handleFooterSubscribe}
                className="flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-[#F4F5F7] p-1.5"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.footer.conciergePlaceholder}
                  className="min-w-0 flex-1 bg-transparent px-3.5 py-1.5 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-[#F41D48] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D9143C]"
                >
                  {dict.designSwitcher.horizonFooterSubscribe}
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] py-5 text-xs text-[#6B7280]">
            <p>{dict.footer.rights}</p>
            <div className="flex items-center gap-6">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-[#111827]">
                {dict.footer.privacy}
              </Link>
              <Link href={`/${locale}/legal/offer`} className="hover:text-[#111827]">
                {dict.footer.offer}
              </Link>
            </div>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="pointer-events-none select-none overflow-hidden whitespace-nowrap text-center font-display text-[13vw] font-bold uppercase leading-[0.8] tracking-[-0.04em] text-[#111827]/[0.04] pb-2"
        >
          KAZAKHSTAN
        </p>
      </footer>
    </div>
  );
}
