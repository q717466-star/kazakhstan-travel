'use client';

import type { ActivityType, DifficultyLevel, Locale, SeasonType, Tour, TourCategory } from '@kt/core';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { TourCard } from './TourCard';

interface Props {
  tours: Tour[];
  locale: Locale;
  dict: SiteDictionary;
}

export function TourCatalogClient({ tours, locale, dict }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [country, setCountry] = useState(searchParams.get('country') ?? 'all');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [duration, setDuration] = useState(searchParams.get('duration') ?? 'all');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '10000');
  const [season, setSeason] = useState(searchParams.get('season') ?? 'all');
  const [travelDate, setTravelDate] = useState(searchParams.get('date') ?? '');
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '1');
  const [activity, setActivity] = useState(searchParams.get('activity') ?? 'all');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') ?? 'all');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'recommended');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCountry(searchParams.get('country') ?? 'all');
    setCategory(searchParams.get('category') ?? 'all');
    setDuration(searchParams.get('duration') ?? 'all');
    setActivity(searchParams.get('activity') ?? 'all');
    setGuests(searchParams.get('guests') ?? '1');
    setTravelDate(searchParams.get('date') ?? '');
  }, [searchParams]);

  function deriveSeasonFromDate(dateStr: string): SeasonType | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const month = Number(dateStr.slice(5, 7));
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  function updateUrl(next: Record<string, string>) {
    const merged: Record<string, string> = {
      q: query,
      country,
      category,
      duration,
      maxPrice,
      season,
      date: travelDate,
      guests,
      activity,
      difficulty,
      sort,
      ...next,
    };
    const p = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'all' && !(k === 'maxPrice' && v === '10000') && !(k === 'guests' && v === '1') && !(k === 'sort' && v === 'recommended')) {
        p.set(k, v);
      }
    });
    const qs = p.toString();
    router.replace(`/${locale}/tours${qs ? `?${qs}` : ''}`, { scroll: false });
  }

  function resetAll() {
    setQuery('');
    setCountry('all');
    setCategory('all');
    setDuration('all');
    setMaxPrice('10000');
    setSeason('all');
    setTravelDate('');
    setGuests('1');
    setActivity('all');
    setDifficulty('all');
    setSort('recommended');
    router.replace(`/${locale}/tours`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const inferredSeason = season !== 'all' ? (season as SeasonType) : deriveSeasonFromDate(travelDate);
    const maxBudgetNum = Number(maxPrice) || 10000;
    const guestsNum = Number(guests) || 1;
    const q = query.trim().toLowerCase();

    const list = tours.filter((t) => {
      if (country !== 'all' && t.country.toLowerCase() !== country.toLowerCase()) return false;
      if (category !== 'all' && t.category !== (category as TourCategory)) return false;
      if (duration === '1' && t.durationDays !== 1) return false;
      if (duration === '2-3' && (t.durationDays < 2 || t.durationDays > 3)) return false;
      if (duration === '4+' && t.durationDays < 4) return false;
      if (t.priceFromUsd > maxBudgetNum) return false;
      if (inferredSeason && !t.seasons.includes(inferredSeason)) return false;
      if (guestsNum > t.maxGuests) return false;
      if (activity !== 'all' && !t.activities.includes(activity as ActivityType)) return false;
      if (difficulty !== 'all' && t.difficulty !== (difficulty as DifficultyLevel)) return false;
      if (q) {
        const hay = [
          t.code,
          t.title[locale],
          t.title.en,
          t.subtitle[locale],
          t.region[locale],
          ...t.highlights[locale],
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === 'popularity') sorted.sort((a, b) => b.popularityScore - a.popularityScore);
    else if (sort === 'price_asc') sorted.sort((a, b) => a.priceFromUsd - b.priceFromUsd);
    else if (sort === 'duration_asc') sorted.sort((a, b) => a.durationDays - b.durationDays);
    else sorted.sort((a, b) => a.recommendedOrder - b.recommendedOrder);

    return sorted;
  }, [tours, locale, query, country, category, duration, maxPrice, season, travelDate, guests, activity, difficulty, sort]);

  const inputClass =
    'w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-xs font-medium text-[#111111] focus:border-[#111111] focus:outline-none';

  const filterForm = (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between border-b border-black/[0.08] pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
          {dict.catalog.filtersTitle}
        </span>
        <button
          type="button"
          onClick={resetAll}
          className="text-xs font-medium text-[#737373] hover:text-[#111111] hover:underline"
        >
          {dict.catalog.resetFilters}
        </button>
      </div>

      {/* Country */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.country}
        </span>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            trackEvent({ name: 'use_filter', filter_name: 'country', filter_value: e.target.value, locale });
            updateUrl({ country: e.target.value });
          }}
          className={inputClass}
        >
          <option value="all">{dict.catalog.filters.all}</option>
          <option value="Kazakhstan">{dict.countries.kazakhstan}</option>
          <option value="Kyrgyzstan">{dict.countries.kyrgyzstan}</option>
          <option value="Central Asia">{dict.countries.centralAsia}</option>
        </select>
      </label>

      {/* Duration */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.duration}
        </span>
        <select
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
            trackEvent({ name: 'use_filter', filter_name: 'duration', filter_value: e.target.value, locale });
            updateUrl({ duration: e.target.value });
          }}
          className={inputClass}
        >
          <option value="all">{dict.catalog.filters.all}</option>
          <option value="1">{dict.catalog.durations.d1}</option>
          <option value="2-3">{dict.catalog.durations.d23}</option>
          <option value="4+">{dict.catalog.durations.d4p}</option>
        </select>
      </label>

      {/* Max Price */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#525252]">
          <span>{dict.catalog.filters.maxBudget}</span>
          <span className="font-mono-meta font-semibold text-[#111111]">
            {Number(maxPrice) >= 10000 ? dict.catalog.anyBudget : `$${Number(maxPrice).toLocaleString('en-US')}`}
          </span>
        </div>
        <input
          type="range"
          min={250}
          max={10000}
          step={150}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            updateUrl({ maxPrice: e.target.value });
          }}
          className="w-full accent-[#111111]"
        />
      </div>

      {/* Season */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.season}
        </span>
        <select
          value={season}
          onChange={(e) => {
            setSeason(e.target.value);
            updateUrl({ season: e.target.value });
          }}
          className={inputClass}
        >
          <option value="all">{dict.catalog.filters.all}</option>
          <option value="spring">{dict.catalog.seasons.spring}</option>
          <option value="summer">{dict.catalog.seasons.summer}</option>
          <option value="autumn">{dict.catalog.seasons.autumn}</option>
          <option value="winter">{dict.catalog.seasons.winter}</option>
        </select>
      </label>

      {/* Travel Date */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.travelDate}
        </span>
        <input
          type="date"
          min={new Date().toISOString().slice(0, 10)}
          value={travelDate}
          onChange={(e) => {
            setTravelDate(e.target.value);
            updateUrl({ date: e.target.value });
          }}
          className={inputClass}
        />
      </label>

      {/* Guests */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.guests}
        </span>
        <select
          value={guests}
          onChange={(e) => {
            setGuests(e.target.value);
            updateUrl({ guests: e.target.value });
          }}
          className={inputClass}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {/* Activity */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.activity}
        </span>
        <select
          value={activity}
          onChange={(e) => {
            setActivity(e.target.value);
            trackEvent({ name: 'use_filter', filter_name: 'activity', filter_value: e.target.value, locale });
            updateUrl({ activity: e.target.value });
          }}
          className={inputClass}
        >
          <option value="all">{dict.catalog.filters.all}</option>
          <option value="nature">{dict.catalog.activities.nature}</option>
          <option value="mountains">{dict.catalog.activities.mountains}</option>
          <option value="photography">{dict.catalog.activities.photography}</option>
          <option value="culture">{dict.catalog.activities.culture}</option>
          <option value="active">{dict.catalog.activities.active}</option>
          <option value="offroad">{dict.catalog.activities.offroad}</option>
        </select>
      </label>

      {/* Difficulty */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#525252]">
          {dict.catalog.filters.difficulty}
        </span>
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            updateUrl({ difficulty: e.target.value });
          }}
          className={inputClass}
        >
          <option value="all">{dict.catalog.filters.all}</option>
          <option value="easy">{dict.catalog.difficulties.easy}</option>
          <option value="moderate">{dict.catalog.difficulties.moderate}</option>
          <option value="expedition">{dict.catalog.difficulties.expedition}</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.08] bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.catalog.searchPlaceholder}
            className="w-full rounded-full border border-black/[0.08] bg-[#F5F5F6] py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#9A9AA0] focus:border-[#111111] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-[#F5F5F6] px-4 py-2 text-xs font-semibold text-[#111111] lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{dict.catalog.mobileFilterBtn}</span>
          </button>

          <label className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline font-medium text-[#737373]">
              {dict.catalog.sortLabel}
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateUrl({ sort: e.target.value });
              }}
              className="rounded-full border border-black/[0.08] bg-[#F5F5F6] px-3.5 py-2 text-xs font-medium text-[#111111] focus:border-[#111111] focus:outline-none"
            >
              <option value="recommended">{dict.catalog.sortOptions.recommended}</option>
              <option value="popularity">{dict.catalog.sortOptions.popularity}</option>
              <option value="price_asc">{dict.catalog.sortOptions.priceAsc}</option>
              <option value="duration_asc">{dict.catalog.sortOptions.durationAsc}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Desktop Sidebar */}
        <aside className="sticky top-24 hidden rounded-[22px] border border-black/[0.08] bg-[#F5F5F6] p-5 lg:col-span-3 lg:block">
          {filterForm}
        </aside>

        {/* Results Grid */}
        <div className="space-y-5 lg:col-span-9">
          <p className="font-mono-meta text-xs uppercase tracking-wider text-[#737373]">
            {filtered.length} {dict.catalog.resultsCount}
          </p>

          {filtered.length === 0 ? (
            <div className="space-y-3 rounded-[22px] border border-black/[0.08] bg-white p-10 text-center">
              <h3 className="font-display text-2xl font-semibold text-[#111111]">
                {dict.catalog.noResultsTitle}
              </h3>
              <p className="mx-auto max-w-md text-sm text-[#737373]">
                {dict.catalog.noResultsBody}
              </p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-2 inline-flex rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#262626]"
              >
                {dict.catalog.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} locale={locale} dict={dict} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-xl font-semibold">{dict.catalog.filtersTitle}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 hover:bg-[#F5F5F6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterForm}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full rounded-full bg-[#111111] py-3 text-xs font-semibold text-white"
            >
              {dict.catalog.applyFilters} ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
