'use client';

import type { Tour, TourCategory } from '@kt/core';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

export function ToursCmsClient({ initialTours }: { initialTours: Tour[] }) {
  const [tours, setTours] = useState(initialTours);
  const [selected, setSelected] = useState<Tour | null>(initialTours[0] ?? null);
  const [editLang, setEditLang] = useState<'en' | 'ru' | 'kk'>('en');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function createBlankTour(): Tour {
    return {
      id: '',
      code: `NEW-${Math.floor(100 + Math.random() * 899)}`,
      slug: `new-expedition-${Date.now()}`,
      category: 'day-trips',
      country: 'Kazakhstan',
      region: { en: 'Almaty Region', ru: 'Алматинская область', kk: 'Алматы облысы' },
      durationDays: 1,
      durationLabel: { en: '1 Day', ru: '1 день', kk: '1 күн' },
      priceFromUsd: 350,
      priceUnit: {
        en: 'per private 4x4 (1–3 guests)',
        ru: 'за приватный 4x4 (1–3 гостя)',
        kk: 'жеке 4x4 көлігі үшін (1–3 қонақ)',
      },
      format: {
        en: 'Private 4x4 SUV',
        ru: 'Приватный внедорожник 4x4',
        kk: 'Жеке 4x4 жол талғамайтын көлік',
      },
      seasons: ['spring', 'summer', 'autumn'],
      activities: ['nature', 'offroad'],
      difficulty: 'easy',
      maxGuests: 6,
      popularityScore: 80,
      recommendedOrder: tours.length + 1,
      isFeatured: false,
      isActive: true,
      title: { en: 'New Expedition', ru: 'Новая экспедиция', kk: 'Жаңа экспедиция' },
      subtitle: { en: 'Custom summary', ru: 'Краткое описание', kk: 'Қысқаша сипаттама' },
      shortDescription: {
        en: 'Full tour overview...',
        ru: 'Подробное описание маршрута...',
        kk: 'Толық сипаттама...',
      },
      highlights: {
        en: ['Scenic overlook', 'Private guide-driver'],
        ru: ['Живописная панорама', 'Личный гид-водитель'],
        kk: ['Көрініс алаңы', 'Жеке гид-жүргізуші'],
      },
      coverImage: '/images/tours/hero-charyn.webp',
      gallery: ['/images/tours/hero-charyn.webp'],
      routePoints: [
        {
          name: { en: 'Start Point', ru: 'Точка старта', kk: 'Бастау нүктесі' },
          description: { en: 'Almaty departure', ru: 'Выезд из Алматы', kk: 'Алматыдан шығу' },
          lat: 43.2389,
          lng: 76.8897,
          elevationM: 780,
          day: 1,
        },
      ],
      itineraryDays: [
        {
          day: 1,
          title: { en: 'Day 1 Route', ru: 'День 1: Маршрут', kk: '1-күн: Бағыт' },
          summary: {
            en: 'Full day exploration by private 4x4.',
            ru: 'Полнодневная поездка на приватном внедорожнике.',
            kk: 'Жеке 4x4 көлігімен толық күндік сапар.',
          },
          locations: { en: 'Almaty Region', ru: 'Алматинская область', kk: 'Алматы облысы' },
          transferInfo: { en: '~250 km', ru: '~250 км', kk: '~250 км' },
          meals: { en: 'Lunch included', ru: 'Обед включён', kk: 'Түскі ас кіреді' },
          accommodation: { en: 'Return to Almaty', ru: 'Возвращение в Алматы', kk: 'Алматыға оралу' },
        },
      ],
      included: {
        en: ['Private 4x4 SUV', 'Guide-driver', 'Park fees'],
        ru: ['Приватный внедорожник 4x4', 'Гид-водитель', 'Экосборы'],
        kk: ['Жеке 4x4 көлігі', 'Гид-жүргізуші', 'Парк билеттері'],
      },
      excluded: {
        en: ['Personal travel insurance'],
        ru: ['Личная страховка'],
        kk: ['Жеке сақтандыру'],
      },
      vehicleInfo: { en: 'Toyota Land Cruiser 4x4', ru: 'Toyota Land Cruiser 4x4', kk: 'Toyota Land Cruiser 4x4' },
      guideInfo: { en: 'Senior field guide-driver', ru: 'Опытный гид-водитель', kk: 'Тәжірибелі гид-жүргізуші' },
      requirements: { en: 'Suitable for most travelers', ru: 'Подходит большинству гостей', kk: 'Көпшілікке қолайлы' },
      clothingAdvice: { en: 'Walking shoes & light windbreaker', ru: 'Удобная обувь и ветровка', kk: 'Ыңғайлы аяқ киім және күрте' },
      cancellationPolicy: { en: 'Free reschedule 48h prior', ru: 'Бесплатный перенос за 48 часов', kk: '48 сағат бұрын тегін ауыстыру' },
      seoTitle: { en: 'New Tour | Kazakhstan Travel', ru: 'Новый тур | Kazakhstan Travel', kk: 'Жаңа тур | Kazakhstan Travel' },
      seoDescription: { en: 'Private expedition', ru: 'Приватный тур', kk: 'Жеке тур' },
      updatedAt: new Date().toISOString(),
    };
  }

  async function saveTour(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected),
      });
      const data = (await res.json()) as { tour?: Tour; error?: string };
      if (!res.ok || !data.tour) {
        setStatusMsg(data.error || 'Failed to save tour');
        return;
      }
      setSelected(data.tour);
      setTours((prev) => {
        const exists = prev.some((t) => t.id === data.tour!.id);
        return exists
          ? prev.map((t) => (t.id === data.tour!.id ? data.tour! : t))
          : [...prev, data.tour!];
      });
      setStatusMsg('Tour published to live database.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTour(id: string) {
    if (!id) return;
    const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const remaining = tours.filter((t) => t.id !== id);
      setTours(remaining);
      setSelected(remaining[0] ?? null);
      setStatusMsg('Tour deleted.');
    }
  }

  async function handleImageUpload(file: File) {
    if (!selected) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    if (res.ok && data.url) {
      setSelected({
        ...selected,
        coverImage: data.url,
        gallery: Array.from(new Set([data.url, ...selected.gallery])),
      });
      setStatusMsg(`Uploaded ${data.url} — remember to Save Tour.`);
    } else {
      setStatusMsg(data.error || 'Upload failed');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Left tour list */}
      <div className="lg:col-span-4 space-y-3">
        <button
          type="button"
          onClick={() => setSelected(createBlankTour())}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B85A3A] py-2.5 text-sm font-semibold text-white hover:bg-[#9B482C]"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Tour</span>
        </button>

        <div className="max-h-[650px] overflow-y-auto space-y-2 pr-1">
          {tours.map((t) => (
            <button
              key={t.id || t.code}
              type="button"
              onClick={() => {
                setSelected(t);
                setStatusMsg(null);
              }}
              className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                selected?.id === t.id && selected?.code === t.code
                  ? 'border-[#163024] bg-[#163024] text-white'
                  : 'border-[rgba(27,30,29,0.1)] bg-white hover:bg-[#FAF8F4]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono-meta opacity-80">
                <span>{t.code}</span>
                <span>
                  ${t.priceFromUsd} · {t.isActive ? 'Live' : 'Hidden'}
                </span>
              </div>
              <p className="mt-1 font-semibold text-sm line-clamp-1">{t.title.en}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right editor */}
      {selected && (
        <form
          onSubmit={saveTour}
          className="lg:col-span-8 rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(27,30,29,0.1)] pb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1B1E1D]">
                {selected.id ? `Edit ${selected.code}` : 'Create Tour'}
              </h2>
            </div>

            <div className="inline-flex rounded-full bg-[#F2ECE1] p-1 text-xs font-semibold">
              {(['en', 'ru', 'kk'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setEditLang(l)}
                  className={`rounded-full px-3 py-1 uppercase ${
                    editLang === l ? 'bg-[#163024] text-white' : 'text-[#1B1E1D]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Tour Code</span>
              <input
                type="text"
                required
                value={selected.code}
                onChange={(e) => setSelected({ ...selected, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 font-mono-meta"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">URL Slug</span>
              <input
                type="text"
                required
                value={selected.slug}
                onChange={(e) => setSelected({ ...selected, slug: e.target.value.toLowerCase() })}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 font-mono-meta"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Category</span>
              <select
                value={selected.category}
                onChange={(e) => setSelected({ ...selected, category: e.target.value as TourCategory })}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
              >
                <option value="day-trips">Day Trips</option>
                <option value="two-three-day">2–3 Day Tours</option>
                <option value="multi-day">Multi-Day</option>
                <option value="kazakhstan">Kazakhstan</option>
                <option value="kyrgyzstan">Kyrgyzstan</option>
                <option value="central-asia">Central Asia</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Price From (USD)</span>
              <input
                type="number"
                min={50}
                required
                value={selected.priceFromUsd}
                onChange={(e) => setSelected({ ...selected, priceFromUsd: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Duration (Days)</span>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={selected.durationDays}
                onChange={(e) => setSelected({ ...selected, durationDays: Number(e.target.value) || 1 })}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
              />
            </label>
            <div className="flex items-end gap-4 pb-2 text-xs font-semibold">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.isFeatured}
                  onChange={(e) => setSelected({ ...selected, isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-[#163024]"
                />
                <span>Featured</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.isActive}
                  onChange={(e) => setSelected({ ...selected, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#163024]"
                />
                <span>Published</span>
              </label>
            </div>
          </div>

          {/* Localized Fields for editLang */}
          <div className="space-y-4 rounded-2xl bg-[#FAF8F4] p-4 text-sm">
            <p className="font-mono-meta text-xs uppercase text-[#B85A3A]">
              Localized Fields ({editLang.toUpperCase()})
            </p>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Title</span>
              <input
                type="text"
                required
                value={selected.title[editLang]}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    title: { ...selected.title, [editLang]: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-white px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Subtitle</span>
              <input
                type="text"
                value={selected.subtitle[editLang]}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    subtitle: { ...selected.subtitle, [editLang]: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-white px-3 py-2"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">Price Unit Label</span>
                <input
                  type="text"
                  value={selected.priceUnit[editLang]}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      priceUnit: { ...selected.priceUnit, [editLang]: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-white px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">SEO Title</span>
                <input
                  type="text"
                  value={selected.seoTitle[editLang]}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      seoTitle: { ...selected.seoTitle, [editLang]: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-white px-3 py-2"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold">SEO Meta Description</span>
              <input
                type="text"
                value={selected.seoDescription[editLang]}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    seoDescription: { ...selected.seoDescription, [editLang]: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-white px-3 py-2"
              />
            </label>
          </div>

          {/* Day-by-Day Itinerary Summary Editor */}
          <div className="space-y-3 text-sm">
            <span className="block font-mono-meta text-xs uppercase text-[#555C58]">
              Itinerary Days ({editLang.toUpperCase()})
            </span>
            {selected.itineraryDays.map((day, idx) => (
              <div key={day.day} className="rounded-xl border border-[rgba(27,30,29,0.1)] p-3.5 space-y-2">
                <input
                  type="text"
                  value={day.title[editLang]}
                  onChange={(e) => {
                    const nextDays = [...selected.itineraryDays];
                    nextDays[idx] = {
                      ...day,
                      title: { ...day.title, [editLang]: e.target.value },
                    };
                    setSelected({ ...selected, itineraryDays: nextDays });
                  }}
                  className="w-full rounded-lg border border-[rgba(27,30,29,0.12)] px-3 py-1.5 text-xs font-semibold"
                />
                <textarea
                  rows={2}
                  value={day.summary[editLang]}
                  onChange={(e) => {
                    const nextDays = [...selected.itineraryDays];
                    nextDays[idx] = {
                      ...day,
                      summary: { ...day.summary, [editLang]: e.target.value },
                    };
                    setSelected({ ...selected, itineraryDays: nextDays });
                  }}
                  className="w-full rounded-lg border border-[rgba(27,30,29,0.12)] px-3 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>

          {/* Media Upload */}
          <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(27,30,29,0.1)] pt-4">
            <img
              src={selected.coverImage}
              alt={selected.title.en}
              className="h-14 w-20 rounded-lg object-cover bg-[#E5DCCB]"
            />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[rgba(27,30,29,0.18)] px-4 py-2 text-xs font-semibold hover:bg-[#FAF8F4]">
              <Upload className="h-4 w-4" />
              <span>Upload Cover Photo</span>
              <input
                type="file"
                accept="image/webp,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file);
                }}
              />
            </label>
            <span className="font-mono-meta text-[11px] text-[#555C58] truncate max-w-[220px]">
              {selected.coverImage}
            </span>
          </div>

          {statusMsg && (
            <p className="rounded-xl bg-[#F2ECE1] px-4 py-2.5 text-xs font-semibold text-[#163024]">
              {statusMsg}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {selected.id ? (
              <button
                type="button"
                onClick={() => void deleteTour(selected.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Tour</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#163024] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[#1F4232] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
