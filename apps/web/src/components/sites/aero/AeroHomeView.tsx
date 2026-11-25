'use client';

import type { Locale } from '@kt/core';
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Compass,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LivingMedia } from '@/components/LivingMedia';
import type { HomeViewProps } from '@/components/home/AlpineHomeView';
import { resolveImageSrc } from '@/lib/media-manifest';

const ADV_ICONS = [Zap, BadgeDollarSign, Compass, ShieldCheck];

const TEAM_GUIDE_ROLES: Record<Locale, Array<{ name: string; role: string; photo: string }>> = {
  en: [
    { name: 'Arman S.', role: 'Senior 4×4 Expedition Guide', photo: '/images/tours/kolsai-horseback.webp' },
    { name: 'Dina K.', role: 'Almaty Route Coordinator', photo: '/images/tours/asy-yurt.webp' },
    { name: 'Timur R.', role: 'Tien Shan Trail Specialist', photo: '/images/tours/charyn-day-trip.webp' },
  ],
  ru: [
    { name: 'Арман С.', role: 'Старший гид-водитель 4×4', photo: '/images/tours/kolsai-horseback.webp' },
    { name: 'Дина К.', role: 'Координатор маршрутов', photo: '/images/tours/asy-yurt.webp' },
    { name: 'Тимур Р.', role: 'Эксперт по горным перевалам', photo: '/images/tours/charyn-day-trip.webp' },
  ],
  kk: [
    { name: 'Арман С.', role: 'Аға 4×4 гид-жүргізуші', photo: '/images/tours/kolsai-horseback.webp' },
    { name: 'Дина К.', role: 'Бағыттар үйлестірушісі', photo: '/images/tours/asy-yurt.webp' },
    { name: 'Тимур Р.', role: 'Тау асулары жөніндегі маман', photo: '/images/tours/charyn-day-trip.webp' },
  ],
};

export function AeroHomeView({
  locale,
  dict,
  allTours,
  destinations,
  reviews,
  tgUrl,
  waUrl,
}: HomeViewProps) {
  const router = useRouter();

  // Booking widget state
  const [serviceTab, setServiceTab] = useState<'all' | '1' | '2-3' | 'silk'>('all');
  const [country, setCountry] = useState('all');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');

  // Interactive sections state
  const [offerFilter, setOfferFilter] = useState<'all' | '1' | '2-3' | '4+'>('all');
  const [popularCountry, setPopularCountry] = useState<'all' | 'Kazakhstan' | 'Kyrgyzstan' | 'Central Asia'>('all');
  const [medallionIdx, setMedallionIdx] = useState(0);
  const [reviewOffset, setReviewOffset] = useState(0);

  // Live CRM Inquiry Form state (POST /api/leads)
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadGuests, setLeadGuests] = useState('2');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadConsent, setLeadConsent] = useState(true);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadTicket, setLeadTicket] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `aero-${Date.now()}`);

  const offerPool = allTours.filter((t) => {
    if (offerFilter === 'all') return true;
    if (offerFilter === '1') return t.durationDays === 1;
    if (offerFilter === '2-3') return t.durationDays >= 2 && t.durationDays <= 3;
    return t.durationDays >= 4;
  });
  const displayedOffers = (offerPool.length > 0 ? offerPool : allTours).slice(0, 4);

  const popularPool = allTours.filter((t) =>
    popularCountry === 'all' ? true : t.country === popularCountry
  );
  const displayedPopular = (popularPool.length > 0 ? popularPool : allTours).slice(0, 4);

  const medallionDests = destinations.slice(0, 5);
  const activeMedallion = medallionDests[medallionIdx] ?? medallionDests[0];

  const reviewTotal = reviews.length || 1;
  const visibleReviews = [
    reviews[reviewOffset % reviewTotal],
    reviews[(reviewOffset + 1) % reviewTotal],
  ].filter(Boolean);

  const blogTours = allTours.slice(0, 3);
  const guides = TEAM_GUIDE_ROLES[locale] ?? TEAM_GUIDE_ROLES.en;

  function handleBookingSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (serviceTab === '1') params.set('duration', '1');
    else if (serviceTab === '2-3') params.set('duration', '2-3');
    else if (serviceTab === 'silk' && country === 'all') params.set('country', 'Central Asia');

    if (country !== 'all') params.set('country', country);
    if (date) params.set('date', date);
    if (guests) params.set('guests', guests);
    const qs = params.toString();
    router.push(`/${locale}/tours${qs ? `?${qs}` : ''}`);
  }

  async function handleDirectInquiry(e: React.FormEvent) {
    e.preventDefault();
    setLeadError(null);
    if (leadName.trim().length < 2 || leadEmail.trim().length < 4) {
      setLeadError(dict.tourDetail.validationContact);
      return;
    }
    if (!leadConsent) {
      setLeadError(dict.tourDetail.validationConsent);
      return;
    }

    setLeadSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'website',
          locale,
          requestType: 'plan_trip',
          tourTitleSnapshot: `Aero Custom Route Dispatch (${leadGuests} guests)`,
          customParams: {
            destination: `${dict.designSwitcher.aeroHeroTitle1} · Kazakhstan`,
            durationLabel: dict.planner.durationChoices[1] || '2-3 days',
            interests: [dict.catalog.activities.nature, dict.catalog.activities.offroad],
          },
          preferredDate: null,
          isFlexibleDates: true,
          participants: Number(leadGuests) || 2,
          customerName: leadName.trim(),
          contactMethod: 'email',
          contactValue: leadEmail.trim(),
          notes: leadNotes.trim() || null,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          idempotencyKey,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; requestNumber?: string; error?: string };
      if (!res.ok || !data.ok) {
        setLeadError(data.error || dict.tourDetail.submitError);
        return;
      }
      setLeadTicket(data.requestNumber || '#KT-NEW');
    } catch {
      setLeadError(dict.tourDetail.networkError);
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <div className="kt-custom-view bg-white text-[#0F172A]">
      {/* 1. Sky-Horizon Hero + Overlapping White Multi-Tab Booking Engine */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0E8AA8] via-[#BAE6FD]/65 to-[#F4FBFD] pt-28 pb-28 sm:pt-36 sm:pb-36">
        <img
          src={resolveImageSrc('/images/tours/bao-reflection.webp')}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0C7C98]/55 via-[#E0F5FA]/70 to-white"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.03] tracking-[-0.025em] text-[#087F9B] sm:text-6xl lg:text-[68px]">
            <span className="block">{dict.designSwitcher.aeroHeroTitle1}</span>
            <span className="block">{dict.designSwitcher.aeroHeroTitle2}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xs font-medium leading-relaxed text-[#0F172A]/80 sm:text-sm">
            {dict.designSwitcher.aeroHeroSub}
          </p>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-20 max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[#0EA5C6]/25 bg-white p-4 shadow-[0_20px_50px_rgba(8,145,178,0.16)] sm:p-5">
          {/* Booking Service Tabs */}
          <div
            data-testid="aero-booking-tabs"
            className="mb-4 flex flex-wrap items-center justify-center gap-2 border-b border-black/[0.06] pb-3.5"
          >
            {(
              [
                { id: 'all', label: dict.designSwitcher.aeroTabTours },
                { id: '1', label: dict.designSwitcher.aeroTabDay },
                { id: '2-3', label: dict.designSwitcher.aeroTabMulti },
                { id: 'silk', label: dict.designSwitcher.aeroTabSilk },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setServiceTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  serviceTab === tab.id
                    ? 'bg-[#0EA5C6] text-white'
                    : 'bg-[#F1F5F9] text-[#334155] hover:bg-[#E0F5FA] hover:text-[#0C4A5E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            data-testid="aero-hero-search"
            onSubmit={handleBookingSearch}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[0.9fr_1.15fr_1fr_0.7fr_auto] lg:items-end"
          >
            <div className="block">
              <span className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {dict.tourDetail.locationsLabel}
              </span>
              <div className="flex h-10 items-center gap-1.5 rounded-xl border border-black/[0.08] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0C4A5E]">
                <MapPin className="h-3.5 w-3.5 text-[#0EA5C6]" />
                <span>{dict.footer.cityLabel}</span>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {dict.quickSearch.countryLabel}
              </span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#0F172A] focus:border-[#0EA5C6] focus:outline-none"
              >
                <option value="all">{dict.quickSearch.allRegions}</option>
                <option value="Kazakhstan">{dict.countries.kazakhstan}</option>
                <option value="Kyrgyzstan">{dict.countries.kyrgyzstan}</option>
                <option value="Central Asia">{dict.countries.centralAsia}</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {dict.quickSearch.dateLabel}
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#0F172A] focus:border-[#0EA5C6] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {dict.quickSearch.guestsLabel}
              </span>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-xs font-medium text-[#0F172A] focus:border-[#0EA5C6] focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="h-10 rounded-xl bg-[#0EA5C6] px-6 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0891B2]"
            >
              {dict.quickSearch.submit}
            </button>
          </form>
        </div>
      </section>

      {/* 2. "Best Offers" 4-Card Promotional Deals Strip */}
      <section className="mx-auto max-w-[1160px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0C4A5E] sm:text-3xl">
            {dict.designSwitcher.aeroOffersTitle}
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {(
              [
                { id: 'all', label: dict.nav.categories.allTours },
                { id: '1', label: dict.catalog.durations.d1 },
                { id: '2-3', label: dict.catalog.durations.d23 },
                { id: '4+', label: dict.catalog.durations.d4p },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                data-testid={`aero-offer-tab-${chip.id}`}
                onClick={() => setOfferFilter(chip.id)}
                className={`rounded-full border px-4 py-1 text-xs font-semibold transition-colors ${
                  offerFilter === chip.id
                    ? 'border-[#0EA5C6] bg-[#0EA5C6] text-white'
                    : 'border-[#0EA5C6]/25 bg-white text-[#0C4A5E] hover:bg-[#F4FBFD]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayedOffers.map((tour) => {
            const title = tour.title[locale] || tour.title.en;
            const duration = tour.durationLabel[locale] || tour.durationLabel.en;
            return (
              <article
                key={tour.id}
                className="group relative h-[320px] overflow-hidden rounded-2xl bg-[#0C4A5E] shadow-sm"
              >
                <LivingMedia
                  src={tour.coverImage}
                  alt={title}
                  mediaClassName="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                {/* Top-Left Cerulean Promo Tag */}
                <div className="absolute left-0 top-0 z-10 rounded-br-2xl bg-[#0EA5C6] px-3.5 py-2 text-white shadow-sm">
                  <p className="font-mono-meta text-xs font-bold">
                    {dict.catalog.cardFrom} ${tour.priceFromUsd}
                  </p>
                  <p className="text-[10px] text-white/90">{duration}</p>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-4 text-white">
                  <h3 className="line-clamp-2 font-display text-base font-bold leading-snug">
                    {title}
                  </h3>
                  <Link
                    href={`/${locale}/tours/${tour.slug}`}
                    className="inline-flex items-center rounded-full bg-[#0EA5C6] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#0C4A5E]"
                  >
                    {dict.home.bentoBookNow}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. "Why Choose Kazakhstan Travel?" 3-Photo Stack + Cyan Icon Features */}
      <section className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="flex items-center justify-center lg:col-span-5">
            <div className="relative flex items-center justify-center">
              <div className="-mr-8 h-48 w-36 -rotate-3 overflow-hidden rounded-2xl border-2 border-white shadow-md sm:h-56 sm:w-44">
                <LivingMedia src="/images/tours/kolsai-aerial.webp" alt="" />
              </div>
              <div className="relative z-10 h-60 w-44 overflow-hidden rounded-2xl border-4 border-white shadow-[0_18px_40px_rgba(8,145,178,0.22)] sm:h-72 sm:w-52">
                <LivingMedia src="/images/tours/hero-charyn.webp" alt="" />
              </div>
              <div className="-ml-8 h-48 w-36 rotate-3 overflow-hidden rounded-2xl border-2 border-white shadow-md sm:h-56 sm:w-44">
                <LivingMedia src="/images/tours/altyn-emel-dune.webp" alt="" />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                {dict.designSwitcher.aeroWhyPrefix}{' '}
                <span className="text-[#0EA5C6]">{dict.meta.siteName}?</span>
              </h2>
              <p className="mt-2 max-w-lg text-xs leading-relaxed text-[#64748B] sm:text-sm">
                {dict.home.advantagesHeading}
              </p>
            </div>

            <div className="space-y-4">
              {dict.home.advantagesItems.slice(0, 4).map((adv, idx) => {
                const Icon = ADV_ICONS[idx % ADV_ICONS.length];
                return (
                  <div key={adv.title} className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E0F5FA] text-[#0EA5C6]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{adv.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">{adv.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center rounded-full bg-[#0EA5C6] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0891B2]"
            >
              {dict.hero.ctaExplore}
            </Link>
          </div>
        </div>
      </section>

      {/* 4. "Most Popular Destinations" Ice-Cyan Band */}
      <section className="bg-[#F4FBFD] py-16 sm:py-20">
        <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0C4A5E] sm:text-3xl">
              {dict.designSwitcher.aeroPopularTitle}
            </h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {(
                [
                  { id: 'all', label: dict.quickSearch.allRegions },
                  { id: 'Kazakhstan', label: dict.countries.kazakhstan },
                  { id: 'Kyrgyzstan', label: dict.countries.kyrgyzstan },
                  { id: 'Central Asia', label: dict.countries.centralAsia },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`aero-pop-filter-${tab.id}`}
                  onClick={() => setPopularCountry(tab.id)}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
                    popularCountry === tab.id
                      ? 'bg-[#0EA5C6] text-white'
                      : 'bg-white text-[#334155] border border-[#0EA5C6]/20 hover:border-[#0EA5C6]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayedPopular.map((tour) => {
              const title = tour.title[locale] || tour.title.en;
              const duration = tour.durationLabel[locale] || tour.durationLabel.en;
              return (
                <article
                  key={tour.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#0EA5C6]/15 bg-white shadow-xs transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="aspect-[16/11] overflow-hidden bg-[#E0F5FA]">
                      <LivingMedia src={tour.coverImage} alt={title} />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-medium text-[#0EA5C6]">{duration}</p>
                      <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold text-[#0F172A]">
                        {title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/[0.06] px-4 py-3">
                    <span className="font-mono-meta text-sm font-bold text-[#0C4A5E]">
                      ${tour.priceFromUsd}
                    </span>
                    <Link
                      href={`/${locale}/tours/${tour.slug}`}
                      className="rounded-full border border-[#0EA5C6]/35 px-3.5 py-1 text-[11px] font-semibold text-[#0EA5C6] transition-colors hover:bg-[#0EA5C6] hover:text-white"
                    >
                      {dict.catalog.cardViewDetails}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`/${locale}/tours`}
              className="inline-flex items-center rounded-full bg-[#0EA5C6] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0891B2]"
            >
              {dict.nav.categories.allTours}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. "Certified Guides & 4x4 Fleet" Staggered Collage + Guide Portraits */}
      <section className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="mt-6 h-56 overflow-hidden rounded-2xl shadow-md">
                <LivingMedia src="/images/tours/kolsai-horseback.webp" alt="Expedition guide" />
              </div>
              <div className="h-56 overflow-hidden rounded-2xl shadow-md">
                <LivingMedia src="/images/tours/asy-yurt.webp" alt="Nomad camp" />
              </div>
            </div>
            <div className="absolute right-4 top-2 rounded-2xl bg-[#0EA5C6] px-4 py-2 text-xs font-bold text-white shadow-lg">
              15+ Years · Private 4×4
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#0EA5C6]/20 bg-[#F4FBFD] px-3.5 py-2 text-xs font-semibold text-[#0C4A5E]">
              <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
              <span>4.9 / 5 · 1,200+ Travelers</span>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-7">
            <span className="font-mono-meta text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0EA5C6]">
              {dict.designSwitcher.aeroGuidesEyebrow}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              {dict.designSwitcher.aeroGuidesTitle}
            </h2>
            <p className="max-w-lg text-xs leading-relaxed text-[#64748B] sm:text-sm">
              {dict.designSwitcher.aeroGuidesSub}
            </p>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {guides.map((g) => (
                <div
                  key={g.name}
                  className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[#F8FAFC] p-2.5"
                >
                  <img
                    src={resolveImageSrc(g.photo)}
                    alt={g.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#0F172A]">{g.name}</p>
                    <p className="line-clamp-1 text-[10px] text-[#64748B]">{g.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0EA5C6] hover:underline"
            >
              <span>{dict.nav.about}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. "Explore Kazakhstan" 5-Slice Panoramic Strip + Raised Circular Center Medallion */}
      {activeMedallion && (
        <section className="mx-auto max-w-[1140px] px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-[#0C4A5E] sm:text-3xl">
            {dict.designSwitcher.aeroExploreTitle}
          </h2>

          <div className="relative mx-auto mt-12 max-w-5xl py-6">
            <div className="grid h-44 grid-cols-5 gap-1 overflow-hidden rounded-2xl bg-[#0C4A5E] sm:h-52">
              {medallionDests.map((dest, idx) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setMedallionIdx(idx)}
                  aria-label={dest.title[locale] || dest.title.en}
                  className={`relative h-full overflow-hidden transition-opacity focus:outline-none ${
                    idx === medallionIdx ? 'opacity-100' : 'opacity-70 hover:opacity-95'
                  }`}
                >
                  <LivingMedia
                    src={dest.image}
                    alt={dest.title[locale] || dest.title.en}
                  />
                </button>
              ))}
            </div>

            {/* Raised Circular Center Medallion */}
            <Link
              href={`/${locale}/tours?country=${encodeURIComponent(activeMedallion.country)}`}
              className="group absolute left-1/2 top-1/2 z-20 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 flex-col justify-end overflow-hidden rounded-full border-4 border-white bg-[#0C4A5E] p-5 pb-7 text-center text-white shadow-[0_20px_50px_rgba(8,145,178,0.35)] sm:h-60 sm:w-60 sm:pb-8"
            >
              <div className="absolute inset-0">
                <LivingMedia
                  src={activeMedallion.image}
                  alt={activeMedallion.title[locale] || activeMedallion.title.en}
                  mediaClassName="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#083847]/92 via-black/25 to-transparent" />
              <div className="relative z-10">
                <p
                  data-testid="aero-medallion-title"
                  className="font-display text-base font-bold leading-tight sm:text-lg"
                >
                  {activeMedallion.title[locale] || activeMedallion.title.en}
                </p>
                <p className="mt-1 font-mono-meta text-[10px] text-[#7DD3FC]">
                  {activeMedallion.elevationM} m · {dict.home.destViewTours} →
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {medallionDests.map((dest, idx) => (
              <button
                key={dest.id}
                type="button"
                data-testid={`aero-medallion-slice-${idx}`}
                onClick={() => setMedallionIdx(idx)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  idx === medallionIdx
                    ? 'bg-[#0EA5C6] text-white shadow-xs'
                    : 'border border-[#0EA5C6]/25 bg-white text-[#0C4A5E] hover:bg-[#F4FBFD]'
                }`}
              >
                {dest.title[locale] || dest.title.en}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 7. "What Travelers Say About Us" Split */}
      <section className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div className="aspect-[4/4.2] overflow-hidden rounded-2xl bg-[#E0F5FA] shadow-md">
              <LivingMedia src="/images/tours/charyn-red-rocks.webp" alt="Charyn Canyon" />
            </div>
            <div className="absolute right-4 top-4 rounded-2xl bg-[#0EA5C6] px-4 py-2 text-xs font-bold text-white shadow-lg">
              4.9 ★ · 1,200+ Reviews
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                {dict.designSwitcher.aeroReviewsTitle}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewOffset((i) => (i - 1 + reviewTotal) % reviewTotal)}
                  aria-label={dict.home.momentsPrevLabel}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-[#0F172A] hover:border-[#0EA5C6] hover:text-[#0EA5C6]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReviewOffset((i) => (i + 1) % reviewTotal)}
                  aria-label={dict.home.momentsNextLabel}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-[#0F172A] hover:border-[#0EA5C6] hover:text-[#0EA5C6]"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {visibleReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#0EA5C6]/15 bg-white p-5 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-0.5 text-[#F5A623]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-[#475569]">
                      “{rev.body[locale] || rev.body.en}”
                    </p>
                  </div>
                  <div className="mt-4 border-t border-black/[0.06] pt-3">
                    <p className="text-xs font-bold text-[#0F172A]">{rev.authorName}</p>
                    <p className="text-[11px] text-[#64748B]">{rev.authorOrigin}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. "Photo Gallery" Asymmetric Mosaic */}
      <section className="mx-auto max-w-[1140px] px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-[#0C4A5E] sm:text-3xl">
          {dict.designSwitcher.aeroGalleryTitle}
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-12 md:auto-rows-[140px]">
          <Link
            href={`/${locale}/tours`}
            className="col-span-2 h-56 overflow-hidden rounded-2xl md:col-span-4 md:row-span-2 md:h-auto"
          >
            <LivingMedia src="/images/tours/kolsai-hotel.webp" alt="Kolsai Eco Lodge" />
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="h-36 overflow-hidden rounded-2xl md:col-span-3 md:h-auto"
          >
            <LivingMedia src="/images/tours/charyn-sunset.webp" alt="Charyn Sunset" />
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="h-36 overflow-hidden rounded-2xl md:col-span-5 md:h-auto"
          >
            <LivingMedia src="/images/tours/bao-summer.webp" alt="Big Almaty Peak" />
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="h-36 overflow-hidden rounded-2xl md:col-span-3 md:h-auto"
          >
            <LivingMedia src="/images/tours/asy-horizon.webp" alt="Assy Plateau" />
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="h-36 overflow-hidden rounded-2xl md:col-span-3 md:h-auto"
          >
            <LivingMedia src="/images/tours/kyrgyzstan-kelsuu.webp" alt="Lake Kel-Suu" />
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="col-span-2 h-36 overflow-hidden rounded-2xl md:col-span-2 md:h-auto"
          >
            <LivingMedia src="/images/tours/turgen-peaks.webp" alt="Turgen Gorge" />
          </Link>
        </div>
      </section>

      {/* 9. "Blog & Field Guides" Editorial Strip */}
      <section className="bg-[#F4FBFD] py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0C4A5E] sm:text-3xl">
              {dict.designSwitcher.aeroBlogTitle}
            </h2>
            <Link
              href={`/${locale}/blog`}
              className="rounded-full border border-[#0EA5C6]/35 bg-white px-4 py-1.5 text-xs font-semibold text-[#0EA5C6] hover:bg-[#0EA5C6] hover:text-white"
            >
              {dict.nav.blog} →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-12">
            {blogTours[0] && (
              <Link
                href={`/${locale}/tours/${blogTours[0].slug}`}
                className="group overflow-hidden rounded-2xl border border-[#0EA5C6]/15 bg-white shadow-xs lg:col-span-5"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#E0F5FA]">
                  <LivingMedia
                    src={blogTours[0].coverImage}
                    alt={blogTours[0].title[locale] || blogTours[0].title.en}
                    mediaClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="font-mono-meta text-[10px] font-semibold uppercase text-[#0EA5C6]">
                    {blogTours[0].durationLabel[locale] || blogTours[0].durationLabel.en}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#0F172A] group-hover:text-[#0EA5C6]">
                    {blogTours[0].title[locale] || blogTours[0].title.en}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-[#64748B]">
                    {blogTours[0].shortDescription[locale] || blogTours[0].shortDescription.en}
                  </p>
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-5 lg:col-span-7">
              {blogTours.slice(1, 3).map((tour) => (
                <Link
                  key={tour.id}
                  href={`/${locale}/tours/${tour.slug}`}
                  className="group grid items-center gap-4 overflow-hidden rounded-2xl border border-[#0EA5C6]/15 bg-white p-3.5 shadow-xs sm:grid-cols-12"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[#E0F5FA] sm:col-span-5 sm:h-36 sm:aspect-auto">
                    <LivingMedia
                      src={tour.coverImage}
                      alt={tour.title[locale] || tour.title.en}
                      mediaClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1.5 px-1 sm:col-span-7">
                    <span className="font-mono-meta text-[10px] font-semibold uppercase text-[#0EA5C6]">
                      {tour.region[locale] || tour.region.en}
                    </span>
                    <h3 className="font-display text-base font-bold text-[#0F172A] group-hover:text-[#0EA5C6]">
                      {tour.title[locale] || tour.title.en}
                    </h3>
                    <p className="line-clamp-2 text-xs text-[#64748B]">
                      {tour.shortDescription[locale] || tour.shortDescription.en}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Cerulean-Teal Direct Inquiry Banner with Live CRM Lead Form */}
      <section className="bg-gradient-to-r from-[#0B6E87] via-[#0E8AA8] to-[#1FA5C2] py-14 sm:py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 lg:grid-cols-12">
          <div className="space-y-4 text-white lg:col-span-6">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              {dict.designSwitcher.aeroInquiryTitle}
            </h2>
            <p className="max-w-md text-xs leading-relaxed text-white/90 sm:text-sm">
              {dict.designSwitcher.aeroInquirySub}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white hover:text-[#0C4A5E]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{dict.contactsPage.telegramBtn}</span>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white hover:text-[#0C4A5E]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{dict.contactsPage.whatsappBtn}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            {leadTicket ? (
              <div
                data-testid="aero-lead-success"
                className="rounded-2xl bg-white p-6 text-center text-[#0F172A] shadow-2xl"
              >
                <CheckCircle2 className="mx-auto h-10 w-10 text-[#0EA5C6]" />
                <p className="mt-3 font-mono-meta text-xl font-bold text-[#0C4A5E]">
                  {leadTicket}
                </p>
                <p className="mt-2 text-xs text-[#64748B]">
                  {dict.tourDetail.successTitle} — {dict.tourDetail.successDisclaimer}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLeadTicket(null);
                    setIdempotencyKey(`aero-${Date.now()}`);
                  }}
                  className="mt-4 rounded-full bg-[#0EA5C6] px-5 py-2 text-xs font-semibold text-white"
                >
                  {dict.tourDetail.bookAnother}
                </button>
              </div>
            ) : (
              <form
                data-testid="aero-lead-form"
                onSubmit={handleDirectInquiry}
                className="space-y-3 rounded-2xl bg-white p-6 text-[#0F172A] shadow-2xl"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder={dict.tourDetail.nameLabel}
                    className="h-10 rounded-xl border border-black/[0.1] px-3.5 text-xs focus:border-[#0EA5C6] focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder={dict.footer.conciergePlaceholder}
                    className="h-10 rounded-xl border border-black/[0.1] px-3.5 text-xs focus:border-[#0EA5C6] focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={leadGuests}
                    onChange={(e) => setLeadGuests(e.target.value)}
                    className="h-10 rounded-xl border border-black/[0.1] px-3 text-xs focus:border-[#0EA5C6] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)}>
                        {n} {dict.quickSearch.guestsLabel}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    placeholder={dict.tourDetail.notesLabel}
                    className="h-10 rounded-xl border border-black/[0.1] px-3.5 text-xs focus:border-[#0EA5C6] focus:outline-none"
                  />
                </div>

                <label className="flex items-start gap-2 text-[11px] text-[#64748B]">
                  <input
                    type="checkbox"
                    checked={leadConsent}
                    onChange={(e) => setLeadConsent(e.target.checked)}
                    className="mt-0.5 accent-[#0EA5C6]"
                  />
                  <span>{dict.tourDetail.consentLabel}</span>
                </label>

                {leadError && <p className="text-xs font-medium text-red-600">{leadError}</p>}

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="h-10 w-full rounded-xl bg-[#0EA5C6] text-xs font-semibold text-white transition-colors hover:bg-[#0891B2] disabled:opacity-60"
                >
                  {leadSubmitting ? dict.tourDetail.submitting : dict.designSwitcher.nomadCalcSubmit}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. Compact Route Directory Matrix */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <h3 className="text-center font-display text-lg font-bold text-[#0C4A5E]">
            {dict.designSwitcher.aeroRoutesTitle}
          </h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {allTours.map((tour) => (
              <Link
                key={tour.id}
                href={`/${locale}/tours/${tour.slug}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.06] bg-[#F8FAFC] px-3.5 py-2.5 text-xs hover:border-[#0EA5C6] hover:bg-[#F4FBFD]"
              >
                <span className="truncate font-medium text-[#0F172A]">
                  {tour.title[locale] || tour.title.en}
                </span>
                <span className="shrink-0 font-mono-meta font-semibold text-[#0EA5C6]">
                  ${tour.priceFromUsd}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
