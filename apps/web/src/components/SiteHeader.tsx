'use client';

import type { Locale } from '@kt/core';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { ScrollProgressBar } from './MotionPrimitives';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
}

export function SiteHeader({ locale, dict }: Props) {
  const pathname = usePathname() || `/${locale}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const [toursOpen, setToursOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setToursOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToursOpen(false);
        setMobileOpen(false);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToursOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  function switchLocalePath(targetLocale: Locale): string {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && ['en', 'ru', 'kk'].includes(parts[0])) {
      parts[0] = targetLocale;
      return `/${parts.join('/')}`;
    }
    return `/${targetLocale}`;
  }

  function isActiveRoute(href: string, exact = false): boolean {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const isOverlay = isHome && !scrolled && !mobileOpen;

  const tourCategories = [
    { label: dict.nav.categories.dayTrips, href: `/${locale}/tours?category=day-trips` },
    { label: dict.nav.categories.twoThreeDay, href: `/${locale}/tours?category=two-three-day` },
    { label: dict.nav.categories.multiDay, href: `/${locale}/tours?category=multi-day` },
    { label: dict.nav.categories.kazakhstan, href: `/${locale}/tours?country=Kazakhstan` },
    { label: dict.nav.categories.kyrgyzstan, href: `/${locale}/tours?country=Kyrgyzstan` },
    { label: dict.nav.categories.centralAsia, href: `/${locale}/tours?country=Central+Asia` },
  ];

  const pillLinkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium ${
      active
        ? 'bg-white text-[#111111] shadow-xs'
        : isOverlay
          ? 'text-white/95 hover:text-white hover:bg-white/10'
          : 'text-[#525252] hover:text-[#111111] hover:bg-white/70'
    }`;

  return (
    <>
      <ScrollProgressBar />
      <header
        className={`${isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0'} z-40 ${
          isOverlay
            ? 'bg-gradient-to-b from-black/45 via-black/15 to-transparent text-white'
            : 'bg-white/95 backdrop-blur-md text-[#111111] border-b border-black/[0.08] shadow-2xs'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className={`flex shrink-0 items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 ${
              isOverlay ? 'text-white' : 'text-[#111111]'
            }`}
          >
            <img
              src="/brand/logo-mark.svg"
              alt="Kazakhstan Travel"
              className={`h-7 w-7 ${isOverlay ? 'brightness-0 invert' : ''}`}
            />
            <span
              className={`text-[15px] font-semibold tracking-tight whitespace-nowrap ${
                isOverlay ? 'text-white' : 'text-[#111111]'
              }`}
            >
              Kazakhstan Travel
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className={`hidden lg:flex items-center gap-0.5 rounded-full p-1 ${
              isOverlay
                ? 'bg-white/15 backdrop-blur-md border border-white/25'
                : 'bg-[#F5F5F6] border border-black/[0.06]'
            }`}
          >
            <Link href={`/${locale}`} className={pillLinkClass(isActiveRoute(`/${locale}`, true))}>
              {dict.nav.home}
            </Link>

            <Link
              href={`/${locale}/destinations`}
              className={pillLinkClass(isActiveRoute(`/${locale}/destinations`))}
            >
              {dict.nav.destinations}
            </Link>

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                aria-expanded={toursOpen}
                aria-haspopup="true"
                onClick={() => setToursOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setToursOpen(true);
                  }
                }}
                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium focus:outline-none ${
                  isActiveRoute(`/${locale}/tours`)
                    ? 'bg-white text-[#111111] shadow-xs'
                    : isOverlay
                      ? 'text-white/95 hover:text-white hover:bg-white/10'
                      : 'text-[#525252] hover:text-[#111111] hover:bg-white/70'
                }`}
              >
                <span>{dict.nav.tours}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${toursOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {toursOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-full mt-2.5 w-64 origin-top-left rounded-2xl border border-black/[0.08] bg-white p-2 text-[#111111] shadow-2xl"
                  >
                    <Link
                      role="menuitem"
                      href={`/${locale}/tours`}
                      className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#F5F5F6]"
                    >
                      {dict.nav.categories.allTours}
                    </Link>
                    <div className="my-1 border-t border-black/[0.06]" />
                    {tourCategories.map((cat) => (
                      <Link
                        key={cat.href}
                        role="menuitem"
                        href={cat.href}
                        className="block rounded-xl px-3.5 py-2 text-sm text-[#525252] hover:bg-[#F5F5F6] hover:text-[#111111] transition-colors"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href={`/${locale}/about`} className={pillLinkClass(isActiveRoute(`/${locale}/about`))}>
              {dict.nav.about}
            </Link>
            <Link href={`/${locale}/reviews`} className={pillLinkClass(isActiveRoute(`/${locale}/reviews`))}>
              {dict.nav.reviews}
            </Link>
            <Link href={`/${locale}/blog`} className={pillLinkClass(isActiveRoute(`/${locale}/blog`))}>
              {dict.nav.blog}
            </Link>
            <Link href={`/${locale}/contacts`} className={pillLinkClass(isActiveRoute(`/${locale}/contacts`))}>
              {dict.nav.contacts}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            <div
              aria-label="Language switcher"
              className={`hidden sm:inline-flex items-center rounded-full border p-0.5 text-[11px] font-medium ${
                isOverlay
                  ? 'border-white/20 bg-white/15 text-white backdrop-blur-md'
                  : 'border-black/[0.08] bg-[#F5F5F6] text-[#111111]'
              }`}
            >
              {(['en', 'ru', 'kk'] as const).map((loc) => {
                const active = locale === loc;
                return (
                  <Link
                    key={loc}
                    href={switchLocalePath(loc)}
                    className={`rounded-full px-2 py-1 uppercase ${
                      active
                        ? isOverlay
                          ? 'bg-white text-[#111111] font-semibold'
                          : 'bg-[#111111] text-white font-semibold'
                        : isOverlay
                          ? 'text-white/85 hover:text-white'
                          : 'text-[#525252] hover:text-[#111111]'
                    }`}
                  >
                    {loc}
                  </Link>
                );
              })}
            </div>

            <Link
              href={`/${locale}/plan-your-trip`}
              className={`group hidden md:inline-flex items-center gap-2.5 rounded-full pl-4 pr-1.5 py-1.5 text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                isOverlay
                  ? 'bg-white/18 backdrop-blur-md border border-white/25 text-white hover:bg-white/28'
                  : 'bg-[#111111] text-white hover:bg-[#262626]'
              }`}
            >
              <span>{dict.nav.planTrip}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#111111] transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <button
              type="button"
              aria-label={dict.nav.menuToggleLabel}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((p) => !p)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${
                isOverlay
                  ? 'border-white/25 bg-white/15 text-white backdrop-blur-md'
                  : 'border-black/[0.1] bg-[#F5F5F6] text-[#111111]'
              }`}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-black/[0.08] bg-white text-[#111111] lg:hidden"
            >
              <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
                <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
                  <span className="text-xs font-medium text-[#737373]">{dict.nav.languageLabel}</span>
                  <div className="inline-flex gap-1 rounded-full bg-[#F5F5F6] p-1">
                    {(['en', 'ru', 'kk'] as const).map((loc) => (
                      <Link
                        key={loc}
                        href={switchLocalePath(loc)}
                        className={`rounded-full px-3 py-1 text-xs uppercase font-semibold ${
                          locale === loc ? 'bg-[#111111] text-white' : 'text-[#111111]'
                        }`}
                      >
                        {loc}
                      </Link>
                    ))}
                  </div>
                </div>

                <nav className="grid gap-1 text-base font-medium">
                  <Link href={`/${locale}`} className="rounded-xl px-3 py-2.5 hover:bg-[#F5F5F6]">
                    {dict.nav.home}
                  </Link>
                  <Link
                    href={`/${locale}/destinations`}
                    className="rounded-xl px-3 py-2.5 hover:bg-[#F5F5F6]"
                  >
                    {dict.nav.destinations}
                  </Link>
                  <Link
                    href={`/${locale}/tours`}
                    className="rounded-xl px-3 py-2.5 font-semibold text-[#111111] hover:bg-[#F5F5F6]"
                  >
                    {dict.nav.tours} — {dict.nav.categories.allTours}
                  </Link>
                  <div className="grid grid-cols-2 gap-1 pl-3 pb-2">
                    {tourCategories.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="rounded-lg px-2.5 py-2 text-sm text-[#737373] hover:bg-[#F5F5F6] hover:text-[#111111]"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                  <Link href={`/${locale}/about`} className="rounded-xl px-3 py-2.5 hover:bg-[#F5F5F6]">
                    {dict.nav.about}
                  </Link>
                  <Link href={`/${locale}/reviews`} className="rounded-xl px-3 py-2.5 hover:bg-[#F5F5F6]">
                    {dict.nav.reviews}
                  </Link>
                  <Link href={`/${locale}/blog`} className="rounded-xl px-3 py-2.5 hover:bg-[#F5F5F6]">
                    {dict.nav.blog}
                  </Link>
                  <Link href={`/${locale}/contacts`} className="rounded-xl px-3 py-2.5 hover:bg-[#F5F5F6]">
                    {dict.nav.contacts}
                  </Link>
                </nav>

                <div className="pt-2">
                  <Link
                    href={`/${locale}/plan-your-trip`}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#262626]"
                  >
                    <span>{dict.nav.planTrip}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
