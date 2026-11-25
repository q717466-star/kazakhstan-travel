'use client';

import type { Locale } from '@kt/core';
import { ArrowRight, Globe, Mail, Menu, MessageCircle, Send, X } from 'lucide-react';
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

export function NomadShell({ locale, dict, tgUrl, waUrl, children }: ChromeProps) {
  const pathname = usePathname() || `/${locale}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function switchLocalePath(targetLocale: Locale): string {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && ['en', 'ru', 'kk'].includes(parts[0])) {
      parts[0] = targetLocale;
      return `/${parts.join('/')}?design=nomad`;
    }
    return `/${targetLocale}?design=nomad`;
  }

  function handleEstimateJump() {
    setMenuOpen(false);
    if (isHome) {
      document.getElementById('nomad-estimator')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/${locale}/plan-your-trip?design=nomad`);
    }
  }

  function handleFooterEmail(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim();
    if (cleaned) {
      router.push(`/${locale}/contacts?email=${encodeURIComponent(cleaned)}`);
    } else {
      router.push(`/${locale}/plan-your-trip`);
    }
  }

  const navItems = [
    { idx: '01', label: dict.nav.home, href: `/${locale}` },
    { idx: '02', label: dict.nav.destinations, href: `/${locale}/destinations` },
    { idx: '03', label: dict.nav.tours, href: `/${locale}/tours` },
    { idx: '04', label: dict.nav.about, href: `/${locale}/about` },
    { idx: '05', label: dict.nav.reviews, href: `/${locale}/reviews` },
    { idx: '06', label: dict.nav.blog, href: `/${locale}/blog` },
    { idx: '07', label: dict.nav.contacts, href: `/${locale}/contacts` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#EFECE6] text-[#0E0E0E]">
      {/* Persistent Desktop Left Architectural Spine (w-14) */}
      <aside
        aria-label="Nomad studio vertical navigation rail"
        className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col items-center justify-between border-r border-[#0E0E0E]/15 bg-[#EFECE6] py-4 lg:flex"
      >
        <Link
          href={`/${locale}`}
          title="Kazakhstan Travel · Nomad Studio"
          className="flex h-9 w-9 items-center justify-center border border-[#0E0E0E]/20 bg-white/70 transition-colors hover:border-[#D94626]"
        >
          <img src="/brand/logo-mark.svg" alt="Kazakhstan Travel" className="h-5 w-5" />
        </Link>

        <div className="pointer-events-none select-none py-6">
          <span
            style={{ writingMode: 'vertical-rl' }}
            className="rotate-180 font-mono-meta text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0E0E0E]/65"
          >
            KAZAKHSTAN TRAVEL · EST 2011 · ALMATY
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            data-testid="nomad-rail-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label={dict.designSwitcher.nomadMenuOpen}
            className="flex h-10 w-10 items-center justify-center bg-[#D94626] text-[#EFECE6] transition-colors hover:bg-[#0E0E0E]"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center gap-0.5 border border-[#0E0E0E]/15 bg-white/50 p-0.5 text-[9px] font-mono-meta font-semibold uppercase">
            {(['en', 'ru', 'kk'] as const).map((loc) => (
              <Link
                key={loc}
                href={switchLocalePath(loc)}
                className={`px-1.5 py-0.5 transition-colors ${
                  locale === loc
                    ? 'bg-[#0E0E0E] text-[#EFECE6]'
                    : 'text-[#0E0E0E]/60 hover:text-[#0E0E0E]'
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Slim Top Hairline Telemetry Bar (No pill bar!) */}
      <header className="sticky top-0 z-30 border-b border-[#0E0E0E]/15 bg-[#EFECE6]/95 backdrop-blur-md lg:pl-14">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="flex items-center gap-2 lg:hidden">
              <img src="/brand/logo-mark.svg" alt="Kazakhstan Travel" className="h-5 w-5" />
              <span className="font-mono-meta text-xs font-semibold uppercase tracking-[0.14em]">
                KT // NOMAD
              </span>
            </Link>
            <span className="hidden lg:inline-flex items-center gap-2 font-mono-meta text-[11px] uppercase tracking-[0.16em] text-[#57534E]">
              <span className="h-2 w-2 bg-[#D94626]" />
              <span>43.2220° N · 76.8512° E — ALMATY STUDIO</span>
            </span>
          </div>

          <nav aria-label="Primary sections" className="hidden md:flex items-center gap-6">
            {navItems.slice(1, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono-meta text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'font-bold text-[#D94626]'
                    : 'text-[#0E0E0E]/75 hover:text-[#D94626]'
                }`}
              >
                <span className="mr-1 text-[#57534E]">{item.idx}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-[#0E0E0E]/15 px-1.5 py-1 text-[10px] font-mono-meta uppercase lg:hidden">
              {(['en', 'ru', 'kk'] as const).map((loc) => (
                <Link
                  key={loc}
                  href={switchLocalePath(loc)}
                  className={locale === loc ? 'font-bold text-[#D94626]' : 'text-[#57534E]'}
                >
                  {loc}
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={handleEstimateJump}
              className="hidden sm:inline-flex items-center gap-2 bg-[#0E0E0E] px-4 py-2 font-mono-meta text-[11px] font-semibold uppercase tracking-[0.14em] text-[#EFECE6] transition-colors hover:bg-[#D94626]"
            >
              <span>{dict.nav.planTrip}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={dict.designSwitcher.nomadMenuOpen}
              className="inline-flex h-9 items-center gap-1.5 border border-[#0E0E0E]/20 px-3 font-mono-meta text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-[#0E0E0E] lg:hidden"
            >
              <Menu className="h-3.5 w-3.5" />
              <span>{dict.designSwitcher.nomadMenuOpen}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:pl-14">{children}</main>

      {/* Brutalist Edge-to-Edge Dark Footer */}
      <footer className="border-t border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6] lg:pl-14">
        <div className="grid divide-y divide-white/12 border-b border-white/12 md:grid-cols-4 md:divide-x md:divide-y-0">
          <div className="p-6 sm:p-8 space-y-3">
            <span className="font-mono-meta block text-[10px] uppercase tracking-[0.22em] text-[#D94626]">
              01 // STUDIO
            </span>
            <p className="text-xs leading-relaxed text-[#A8A39B]">{dict.footer.brandNote}</p>
            <p className="font-mono-meta text-[11px] text-white/75">{dict.footer.cityLabel}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-3">
            <span className="font-mono-meta block text-[10px] uppercase tracking-[0.22em] text-[#D94626]">
              02 // {dict.footer.exploreTitle}
            </span>
            <ul className="space-y-1.5 font-mono-meta text-xs uppercase tracking-[0.1em] text-[#D4CFC5]">
              {navItems.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[#D94626] transition-colors">
                    {item.idx} · {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-8 space-y-3">
            <span className="font-mono-meta block text-[10px] uppercase tracking-[0.22em] text-[#D94626]">
              03 // {dict.footer.companyTitle}
            </span>
            <ul className="space-y-2 font-mono-meta text-xs text-[#D4CFC5]">
              <li>
                <a href="tel:+77775259885" className="hover:text-[#D94626]">
                  +7 (777) 525 98 85
                </a>
              </li>
              <li>
                <a href="mailto:kztravel@mail.ru" className="hover:text-[#D94626]">
                  kztravel@mail.ru
                </a>
              </li>
              <li className="text-[#A8A39B]">{dict.contactsPage.officeHoursValue}</li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center border border-white/20 text-[#EFECE6] hover:border-[#D94626] hover:bg-[#D94626]"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center border border-white/20 text-[#EFECE6] hover:border-[#D94626] hover:bg-[#D94626]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:kztravel@mail.ru"
                aria-label="Email"
                className="flex h-8 w-8 items-center justify-center border border-white/20 text-[#EFECE6] hover:border-[#D94626] hover:bg-[#D94626]"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <Link
                href={`/${locale}/contacts`}
                aria-label={dict.nav.contacts}
                className="flex h-8 w-8 items-center justify-center border border-white/20 text-[#EFECE6] hover:border-[#D94626] hover:bg-[#D94626]"
              >
                <Globe className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-3">
            <span className="font-mono-meta block text-[10px] uppercase tracking-[0.22em] text-[#D94626]">
              04 // DISPATCH
            </span>
            <form onSubmit={handleFooterEmail} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.footer.conciergePlaceholder}
                className="w-full border border-white/20 bg-white/[0.04] px-3 py-2.5 font-mono-meta text-xs text-[#EFECE6] placeholder:text-white/40 focus:border-[#D94626] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#D94626] px-4 py-2.5 font-mono-meta text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EFECE6] transition-colors hover:bg-white hover:text-[#0E0E0E]"
              >
                {dict.footer.conciergeButton} →
              </button>
            </form>
            <div className="flex flex-wrap gap-4 pt-3 font-mono-meta text-[11px] text-[#A8A39B]">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-white">
                {dict.footer.privacy}
              </Link>
              <Link href={`/${locale}/legal/offer`} className="hover:text-white">
                {dict.footer.offer}
              </Link>
              <Link href="/admin/login" className="hover:text-[#D94626]">
                {dict.footer.staffPortal}
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden px-4 py-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="font-display text-4xl font-bold uppercase tracking-[-0.04em] text-[#EFECE6] sm:text-6xl lg:text-[84px] leading-none">
              KAZAKHSTAN TRAVEL
            </p>
            <p className="font-mono-meta text-[11px] text-[#A8A39B]">{dict.footer.rights}</p>
          </div>
        </div>
      </footer>

      {/* Fullscreen Swiss Directory Overlay */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="nomad-directory-overlay"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0E0E0E] p-6 text-[#EFECE6] sm:p-10"
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-5">
            <span className="font-mono-meta text-xs uppercase tracking-[0.22em] text-[#D94626]">
              KAZAKHSTAN TRAVEL // {dict.designSwitcher.nomadName}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 border border-white/25 px-4 py-2 font-mono-meta text-xs uppercase tracking-[0.14em] hover:border-[#D94626] hover:bg-[#D94626]"
            >
              <span>{dict.designSwitcher.cinemaCloseBtn}</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="my-auto grid gap-2 sm:grid-cols-2 lg:gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-baseline justify-between border-b border-white/12 py-3.5 transition-colors hover:border-[#D94626]"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono-meta text-xs text-[#D94626]">{item.idx}</span>
                  <span className="font-display text-2xl font-semibold uppercase tracking-tight group-hover:translate-x-2 transition-transform sm:text-4xl">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-[#D94626]" />
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 font-mono-meta text-xs text-[#A8A39B]">
            <span>{dict.contactsPage.officeHoursValue}</span>
            <div className="flex items-center gap-5">
              <a href="tel:+77775259885" className="hover:text-white">
                +7 (777) 525 98 85
              </a>
              <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D94626]">
                Telegram
              </a>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#D94626]">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
