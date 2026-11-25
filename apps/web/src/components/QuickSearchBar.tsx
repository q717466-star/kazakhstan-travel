'use client';

import type { Locale } from '@kt/core';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { useDesign } from './DesignProvider';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
  variant?: 'default' | 'nomad' | 'cinema' | 'horizon' | 'voyage' | 'aero';
}

export function QuickSearchBar({ locale, dict, variant }: Props) {
  const { design } = useDesign();
  const mode =
    variant ??
    (design === 'cinema'
      ? 'cinema'
      : design === 'nomad'
        ? 'nomad'
        : design === 'horizon'
          ? 'horizon'
          : design === 'voyage'
            ? 'voyage'
            : design === 'aero'
              ? 'aero'
              : 'default');

  const router = useRouter();
  const [country, setCountry] = useState('all');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('all');
  const [guests, setGuests] = useState('2');
  const [activity, setActivity] = useState('all');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (country !== 'all') params.set('country', country);
    if (date) params.set('date', date);
    if (duration !== 'all') params.set('duration', duration);
    if (guests) params.set('guests', guests);
    if (activity !== 'all') params.set('activity', activity);

    trackEvent({
      name: 'use_filter',
      filter_name: 'quick_search',
      filter_value: params.toString() || 'all',
      locale,
    });

    const qs = params.toString();
    router.push(`/${locale}/tours${qs ? `?${qs}` : ''}`);
  }

  const formClasses =
    mode === 'cinema'
      ? 'rounded-[24px] border border-white/12 bg-[#0D1016]/90 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-4'
      : mode === 'nomad'
        ? 'rounded-none border border-[#0E0E0E] bg-white p-3.5 sm:p-4'
        : mode === 'horizon'
          ? 'rounded-[24px] border border-black/[0.07] bg-white p-3.5 shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-4'
          : mode === 'voyage'
            ? 'rounded-[24px] border border-black/[0.07] bg-white p-3.5 shadow-[0_10px_30px_rgba(2,132,199,0.08)] sm:p-4'
            : mode === 'aero'
              ? 'rounded-2xl border border-[#0EA5C6]/25 bg-white p-3.5 shadow-[0_12px_34px_rgba(8,145,178,0.12)] sm:p-4'
              : 'rounded-[24px] border border-black/[0.07] bg-[#F5F5F6] p-3.5 shadow-[0_8px_28px_rgba(0,0,0,0.03)] sm:p-4';

  const labelClasses =
    mode === 'cinema'
      ? 'mb-1 block px-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]'
      : mode === 'nomad'
        ? 'mb-1 block px-1 font-mono-meta text-[10px] font-semibold uppercase tracking-[0.14em] text-[#57534E]'
        : 'mb-1 block px-1 text-[11px] font-medium text-[#737373]';

  const controlClasses =
    mode === 'cinema'
      ? 'w-full rounded-full border border-white/12 bg-[#141A20] px-3.5 py-2.5 text-xs font-medium text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none'
      : mode === 'nomad'
        ? 'w-full rounded-none border border-[#0E0E0E]/20 bg-[#EFECE6]/50 px-3 py-2.5 text-xs font-medium text-[#0E0E0E] focus:border-[#0E0E0E] focus:outline-none'
        : mode === 'horizon'
          ? 'w-full rounded-full border border-black/[0.08] bg-[#F4F5F7] px-3.5 py-2.5 text-xs font-medium text-[#111827] focus:border-[#F41D48] focus:outline-none'
          : mode === 'voyage'
            ? 'w-full rounded-full border border-black/[0.08] bg-[#F3F4F6] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:border-[#0284C7] focus:outline-none'
            : mode === 'aero'
              ? 'w-full rounded-xl border border-[#0EA5C6]/20 bg-[#F4FBFD] px-3.5 py-2.5 text-xs font-medium text-[#0F172A] focus:border-[#0EA5C6] focus:outline-none'
              : 'w-full rounded-full border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:border-[#111111] focus:outline-none';

  const dateControlClasses =
    mode === 'cinema'
      ? 'w-full rounded-full border border-white/12 bg-[#141A20] px-3.5 py-2 text-xs font-medium text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none'
      : mode === 'nomad'
        ? 'w-full rounded-none border border-[#0E0E0E]/20 bg-[#EFECE6]/50 px-3 py-2 text-xs font-medium text-[#0E0E0E] focus:border-[#0E0E0E] focus:outline-none'
        : mode === 'horizon'
          ? 'w-full rounded-full border border-black/[0.08] bg-[#F4F5F7] px-3.5 py-2 text-xs font-medium text-[#111827] focus:border-[#F41D48] focus:outline-none'
          : mode === 'voyage'
            ? 'w-full rounded-full border border-black/[0.08] bg-[#F3F4F6] px-3.5 py-2 text-xs font-medium text-[#111111] focus:border-[#0284C7] focus:outline-none'
            : mode === 'aero'
              ? 'w-full rounded-xl border border-[#0EA5C6]/20 bg-[#F4FBFD] px-3.5 py-2 text-xs font-medium text-[#0F172A] focus:border-[#0EA5C6] focus:outline-none'
              : 'w-full rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-xs font-medium text-[#111111] focus:border-[#111111] focus:outline-none';

  const btnClasses =
    mode === 'cinema'
      ? 'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#D6B36A] px-4 text-xs font-semibold text-[#050608] transition-colors hover:bg-[#E7C885]'
      : mode === 'nomad'
        ? 'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-none bg-[#D94626] px-4 font-mono-meta text-xs font-semibold uppercase tracking-wider text-[#EFECE6] transition-colors hover:bg-[#0E0E0E]'
        : mode === 'horizon'
          ? 'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#F41D48] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#D9143C]'
          : mode === 'voyage'
            ? 'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#0284C7] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0369A1]'
            : mode === 'aero'
              ? 'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0EA5C6] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0891B2]'
              : 'inline-flex h-[38px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#111111] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#262626]';

  return (
    <section aria-label={dict.quickSearch.title} className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit} className={formClasses}>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <label className="block lg:col-span-3">
            <span className={labelClasses}>{dict.quickSearch.countryLabel}</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={controlClasses}>
              <option value="all">{dict.quickSearch.allRegions}</option>
              <option value="Kazakhstan">{dict.countries.kazakhstan}</option>
              <option value="Kyrgyzstan">{dict.countries.kyrgyzstan}</option>
              <option value="Central Asia">{dict.countries.centralAsia}</option>
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className={labelClasses}>{dict.quickSearch.dateLabel}</span>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className={dateControlClasses}
            />
          </label>

          <label className="block lg:col-span-2">
            <span className={labelClasses}>{dict.quickSearch.durationLabel}</span>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className={controlClasses}>
              <option value="all">{dict.quickSearch.anyDuration}</option>
              <option value="1">{dict.catalog.durations.d1}</option>
              <option value="2-3">{dict.catalog.durations.d23}</option>
              <option value="4+">{dict.catalog.durations.d4p}</option>
            </select>
          </label>

          <label className="block lg:col-span-1">
            <span className={labelClasses}>{dict.quickSearch.guestsLabel}</span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className={`${controlClasses} px-3`}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className={labelClasses}>{dict.quickSearch.activityLabel}</span>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} className={controlClasses}>
              <option value="all">{dict.quickSearch.anyActivity}</option>
              <option value="nature">{dict.catalog.activities.nature}</option>
              <option value="mountains">{dict.catalog.activities.mountains}</option>
              <option value="offroad">{dict.catalog.activities.offroad}</option>
              <option value="photography">{dict.catalog.activities.photography}</option>
              <option value="culture">{dict.catalog.activities.culture}</option>
            </select>
          </label>

          <div className="lg:col-span-2">
            <button type="submit" className={btnClasses}>
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>{dict.quickSearch.submit}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
