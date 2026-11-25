'use client';

import type { Locale } from '@kt/core';
import { ArrowRight, Globe, Mail, Menu, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { SiteDictionary } from '@/i18n';
import { CinemaConciergeDrawer } from './CinemaConciergeDrawer';

interface ChromeProps {
  locale: Locale;
  dict: SiteDictionary;
  tgUrl: string;
  waUrl: string;
  children: ReactNode;
}

export function CinemaShell({ locale, dict, tgUrl, waUrl, children }: ChromeProps) {
  const pathname = usePathname() || `/${locale}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const [menuOpen, setMenuOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onOpenDrawer = () => setConciergeOpen(true);
    window.addEventListener('kt-cinema-concierge-open', onOpenDrawer);
    return () => window.removeEventListener('kt-cinema-concierge-open', onOpenDrawer);
  }, []);

  function switchLocalePath(targetLocale: Locale): string {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && ['en', 'ru', 'kk'].includes(parts[0])) {
      parts[0] = targetLocale;
      return `/${parts.join('/')}?design=cinema`;
    }
    return `/${targetLocale}?design=cinema`;
  }

  const chapters = [
    { roman: 'I', label: dict.nav.home, href: `/${locale}` },
    { roman: 'II', label: dict.nav.destinations, href: `/${locale}/destinations` },
    { roman: 'III', label: dict.nav.tours, href: `/${locale}/tours` },
    { roman: 'IV', label: dict.nav.about, href: `/${locale}/about` },
    { roman: 'V', label: dict.nav.reviews, href: `/${locale}/reviews` },
    { roman: 'VI', label: dict.nav.blog, href: `/${locale}/blog` },
    { roman: 'VII', label: dict.nav.contacts, href: `/${locale}/contacts` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#050608] text-[#F5F1E8]">
      {/* Minimalist Floating Corner Header (Zero horizontal center navbar) */}
      <header
        className={`${
          isHome && !scrolled
            ? 'fixed inset-x-0 top-0 bg-gradient-to-b from-[#050608]/80 via-[#050608]/35 to-transparent'
            : isHome
              ? 'fixed inset-x-0 top-0 border-b border-white/[0.08] bg-[#050608]/90 backdrop-blur-xl'
              : 'sticky top-0 border-b border-white/[0.08] bg-[#050608]/92 backdrop-blur-xl'
        } z-40 transition-colors duration-300`}
      >
        <div className="mx-auto flex h-20 max-w-[1520px] items-center justify-between px-4 sm:px-8">
          <Link href={`/${locale}`} className="group flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D6B36A]/55 bg-[#050608]/75 backdrop-blur-md">
              <img
                src="/brand/logo-mark.svg"
                alt="Kazakhstan Travel"
                className="h-4 w-4 brightness-0 invert"
              />
            </span>
            <span className="font-editorial text-xl italic tracking-wide text-[#F5F1E8] transition-colors group-hover:text-[#D6B36A]">
              Kazakhstan Travel
            </span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              aria-label="Language switcher"
              className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-[#0A0C10]/70 p-0.5 text-[10px] font-mono-meta backdrop-blur-md"
            >
              {(['en', 'ru', 'kk'] as const).map((loc) => (
                <Link
                  key={loc}
                  href={switchLocalePath(loc)}
                  className={`rounded-full px-2 py-1 uppercase transition-colors ${
                    locale === loc
                      ? 'bg-[#D6B36A] text-[#050608] font-bold'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {loc}
                </Link>
              ))}
            </div>

            <button
              type="button"
              data-testid="cinema-concierge-trigger"
              onClick={() => setConciergeOpen(true)}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#D6B36A]/60 bg-[#0A0C10]/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D6B36A] backdrop-blur-md transition-colors hover:bg-[#D6B36A] hover:text-[#050608]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{dict.designSwitcher.cinemaConciergeBtn}</span>
            </button>

            <button
              type="button"
              data-testid="cinema-chapters-trigger"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0A0C10]/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F5F1E8] backdrop-blur-md transition-colors hover:border-[#D6B36A] hover:text-[#D6B36A]"
            >
              <span>{dict.designSwitcher.cinemaMenuOpen}</span>
              <Menu className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Atmospheric Quiet Horizon Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050608] py-16 text-[#F5F1E8]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 border-b border-white/[0.08] pb-12 md:flex-row md:items-end">
            <div className="max-w-lg space-y-3">
              <p className="font-mono-meta text-[11px] uppercase tracking-[0.22em] text-[#D6B36A]">
                {dict.footer.cityLabel} · EST. 2011
              </p>
              <h2 className="font-editorial text-4xl font-light italic text-[#F5F1E8] sm:text-5xl">
                {dict.home.bannerTitleLine1} {dict.home.bannerTitleLine2}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setConciergeOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#D6B36A] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#050608] transition-colors hover:bg-[#E7C885]"
            >
              <span>{dict.designSwitcher.cinemaConciergeBtn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-6 text-xs text-[#9CA3AF] sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-5">
              {chapters.map((c) => (
                <Link key={c.href} href={c.href} className="hover:text-[#D6B36A] transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 hover:border-[#D6B36A] hover:text-[#D6B36A]"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 hover:border-[#D6B36A] hover:text-[#D6B36A]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:kztravel@mail.ru"
                aria-label="Email"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 hover:border-[#D6B36A] hover:text-[#D6B36A]"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <Link
                href={`/${locale}/contacts`}
                aria-label={dict.nav.contacts}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 hover:border-[#D6B36A] hover:text-[#D6B36A]"
              >
                <Globe className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-[11px] text-[#737882]">
            <p>{dict.footer.rights}</p>
            <div className="flex items-center gap-5">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-[#F5F1E8]">
                {dict.footer.privacy}
              </Link>
              <Link href={`/${locale}/legal/offer`} className="hover:text-[#F5F1E8]">
                {dict.footer.offer}
              </Link>
              <Link href="/admin/login" className="hover:text-[#D6B36A]">
                {dict.footer.staffPortal}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Serene Dark Chapter Menu Modal */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="cinema-chapters-overlay"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#050608]/96 p-6 text-[#F5F1E8] backdrop-blur-2xl sm:p-10"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <span className="font-editorial text-xl italic text-[#D6B36A]">
              Kazakhstan Travel · {dict.designSwitcher.cinemaName}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.14em] hover:border-[#D6B36A] hover:text-[#D6B36A]"
            >
              <span>{dict.designSwitcher.cinemaCloseBtn}</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="mx-auto my-auto w-full max-w-4xl divide-y divide-white/10">
            {chapters.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between py-3.5 transition-colors hover:text-[#D6B36A]"
              >
                <div className="flex items-baseline gap-6">
                  <span className="w-8 font-editorial text-xl italic text-[#D6B36A]">
                    {item.roman}.
                  </span>
                  <span className="font-editorial text-3xl font-light sm:text-5xl">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 opacity-40 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[#9CA3AF]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConciergeOpen(true);
              }}
              className="text-[#D6B36A] underline underline-offset-4 hover:text-white"
            >
              {dict.designSwitcher.cinemaConciergeBtn} →
            </button>
            <div className="flex items-center gap-3 font-mono-meta">
              {(['en', 'ru', 'kk'] as const).map((loc) => (
                <Link
                  key={loc}
                  href={switchLocalePath(loc)}
                  className={locale === loc ? 'text-[#D6B36A] font-bold uppercase' : 'uppercase hover:text-white'}
                >
                  {loc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <CinemaConciergeDrawer
        open={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
