'use client';

import type { Locale } from '@kt/core';
import { ArrowRight, CheckCircle2, Compass, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SiteDictionary } from '@/i18n';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
}

const CORRIDORS = [
  {
    id: 'charyn-kolsai',
    rateDayUsd: 260,
    labels: {
      en: 'Charyn Canyon & Kolsai Lakes',
      ru: 'Чарын и озёра Кольсай',
      kk: 'Шарын және Көлсай көлдері',
    },
  },
  {
    id: 'altyn-emel',
    rateDayUsd: 295,
    labels: {
      en: 'Altyn-Emel Singing Dune & Aktau',
      ru: 'Алтын-Эмель: Бархан и Актау',
      kk: 'Алтын-Емел: Айғайқұм және Ақтау',
    },
  },
  {
    id: 'tien-shan-ring',
    rateDayUsd: 340,
    labels: {
      en: 'Tien Shan Ring (KZ · KG)',
      ru: 'Кольцо Тянь-Шаня (РК · КР)',
      kk: 'Тянь-Шань сақинасы (ҚР · ҚР)',
    },
  },
  {
    id: 'grand-silk-road',
    rateDayUsd: 380,
    labels: {
      en: 'Grand Central Asia Corridor',
      ru: 'Большой маршрут Средней Азии',
      kk: 'Орталық Азия үлкен бағыты',
    },
  },
] as const;

const VEHICLES = [
  {
    id: 'prado',
    mult: 1.0,
    labels: {
      en: 'Toyota Prado 4×4',
      ru: 'Toyota Prado 4×4',
      kk: 'Toyota Prado 4×4',
    },
  },
  {
    id: 'lc200',
    mult: 1.28,
    labels: {
      en: 'Land Cruiser 200 VIP',
      ru: 'Land Cruiser 200 VIP',
      kk: 'Land Cruiser 200 VIP',
    },
  },
  {
    id: 'sprinter4x4',
    mult: 1.45,
    labels: {
      en: '4×4 Overland Van',
      ru: 'Экспедиционный 4×4 минивэн',
      kk: '4×4 экспедициялық шағын автобус',
    },
  },
] as const;

const STAYS = [
  {
    id: 'ecolodge',
    perNightUsd: 85,
    labels: { en: 'Alpine Eco-Lodge', ru: 'Горный эко-лодж', kk: 'Тау эко-лоджы' },
  },
  {
    id: 'glamping',
    perNightUsd: 165,
    labels: { en: 'Nomadic Glamping', ru: 'Кочевой глэмпинг', kk: 'Көшпелі глэмпинг' },
  },
  {
    id: 'boutique',
    perNightUsd: 260,
    labels: { en: 'Boutique 5★ Retreat', ru: 'Бутик-отель 5★', kk: 'Бутик-отель 5★' },
  },
] as const;

const DAY_CHOICES = [1, 2, 4, 7, 12];

export function NomadQuoteCalculator({ locale, dict }: Props) {
  const [corridorId, setCorridorId] = useState<string>(CORRIDORS[0].id);
  const [days, setDays] = useState<number>(4);
  const [guests, setGuests] = useState<number>(2);
  const [vehicleId, setVehicleId] = useState<string>('prado');
  const [stayId, setStayId] = useState<string>('ecolodge');

  const [customerName, setCustomerName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `nomad-calc-${Date.now()}`);

  const corridor = CORRIDORS.find((c) => c.id === corridorId) ?? CORRIDORS[0];
  const vehicle = VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[0];
  const stay = STAYS.find((s) => s.id === stayId) ?? STAYS[0];

  const estimate = useMemo(() => {
    const nights = Math.max(0, days - 1);
    const transportBase = corridor.rateDayUsd * days * vehicle.mult;
    const rooms = Math.ceil(guests / 2);
    const stayTotal = nights * stay.perNightUsd * rooms;
    const parkAndMeals = guests * days * 32;
    const mid = Math.round((transportBase + stayTotal + parkAndMeals) / 10) * 10;
    const min = Math.round((mid * 0.92) / 10) * 10;
    const max = Math.round((mid * 1.1) / 10) * 10;
    const perPerson = Math.round(mid / guests / 10) * 10;
    return { min, max, perPerson };
  }, [corridor, days, guests, vehicle, stay]);

  async function handleLockEstimate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (customerName.trim().length < 2 || contactValue.trim().length < 4) {
      setErrorMsg(dict.tourDetail.validationContact);
      return;
    }
    if (!consentGiven) {
      setErrorMsg(dict.tourDetail.validationConsent);
      return;
    }

    setSubmitting(true);
    try {
      const notes = [
        `Corridor: ${corridor.labels[locale]}`,
        `Duration: ${days}d`,
        `Fleet: ${vehicle.labels[locale]}`,
        `Stay: ${stay.labels[locale]}`,
        `Estimate: $${estimate.min}-$${estimate.max} USD`,
      ].join(' | ');

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'website',
          locale,
          requestType: 'plan_trip',
          tourTitleSnapshot: `${corridor.labels[locale]} (${days}d · ${vehicle.labels[locale]})`,
          customParams: {
            destination: corridor.labels[locale],
            durationLabel: `${days}d`,
            interests: [vehicle.labels[locale], stay.labels[locale]],
          },
          preferredDate: null,
          isFlexibleDates: true,
          participants: guests,
          customerName: customerName.trim(),
          contactMethod,
          contactValue: contactValue.trim(),
          notes,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          idempotencyKey,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        requestNumber?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || dict.tourDetail.submitError);
        return;
      }
      setTicketNumber(data.requestNumber || '#KT-NEW');
    } catch {
      setErrorMsg(dict.tourDetail.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="nomad-estimator"
      className="border-y border-[#0E0E0E]/15 bg-[#EFECE6] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left Configuration Matrix */}
          <div className="space-y-8 lg:col-span-7">
            <div>
              <span className="font-mono-meta inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D94626]">
                <Compass className="h-3.5 w-3.5" />
                <span>{dict.designSwitcher.nomadCalcEyebrow}</span>
              </span>
              <h2 className="font-display mt-2 text-3xl font-bold uppercase tracking-[-0.03em] text-[#0E0E0E] sm:text-5xl">
                {dict.designSwitcher.nomadCalcTitle}
              </h2>
              <p className="mt-2.5 max-w-xl text-sm text-[#57534E]">
                {dict.designSwitcher.nomadCalcSubtitle}
              </p>
            </div>

            {/* 01 Corridor */}
            <div className="space-y-2.5">
              <span className="font-mono-meta block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                01 // {dict.planner.steps[0]}
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {CORRIDORS.map((c) => {
                  const active = c.id === corridorId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCorridorId(c.id)}
                      className={`border p-3.5 text-left transition-colors ${
                        active
                          ? 'border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6]'
                          : 'border-[#0E0E0E]/15 bg-white/60 text-[#0E0E0E] hover:border-[#0E0E0E]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{c.labels[locale]}</span>
                      <span
                        className={`font-mono-meta mt-1 block text-[10px] ${
                          active ? 'text-[#D94626]' : 'text-[#57534E]'
                        }`}
                      >
                        From ${c.rateDayUsd} / day SUV base
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 02 Duration & Guests */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2.5">
                <span className="font-mono-meta block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                  02 // {dict.planner.steps[1]}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_CHOICES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`border px-3.5 py-2 font-mono-meta text-xs font-semibold transition-colors ${
                        days === d
                          ? 'border-[#D94626] bg-[#D94626] text-[#EFECE6]'
                          : 'border-[#0E0E0E]/15 bg-white/60 text-[#0E0E0E] hover:border-[#0E0E0E]'
                      }`}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="font-mono-meta block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                  03 // {dict.planner.steps[4]} ({guests} {dict.planner.paxUnit})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGuests(n)}
                      className={`border px-3 py-2 font-mono-meta text-xs font-semibold transition-colors ${
                        guests === n
                          ? 'border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6]'
                          : 'border-[#0E0E0E]/15 bg-white/60 text-[#0E0E0E] hover:border-[#0E0E0E]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 04 SUV Fleet + 05 Stay Tier */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="font-mono-meta block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                  04 // 4×4 FLEET
                </span>
                <div className="space-y-1.5">
                  {VEHICLES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleId(v.id)}
                      className={`flex w-full items-center justify-between border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                        vehicleId === v.id
                          ? 'border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6]'
                          : 'border-[#0E0E0E]/15 bg-white/60 text-[#0E0E0E] hover:border-[#0E0E0E]'
                      }`}
                    >
                      <span>{v.labels[locale]}</span>
                      <span className="font-mono-meta text-[10px] opacity-75">×{v.mult}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono-meta block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                  05 // {dict.tourDetail.stayLabel}
                </span>
                <div className="space-y-1.5">
                  {STAYS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStayId(s.id)}
                      className={`flex w-full items-center justify-between border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                        stayId === s.id
                          ? 'border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6]'
                          : 'border-[#0E0E0E]/15 bg-white/60 text-[#0E0E0E] hover:border-[#0E0E0E]'
                      }`}
                    >
                      <span>{s.labels[locale]}</span>
                      <span className="font-mono-meta text-[10px] opacity-75">
                        +${s.perNightUsd}/nt
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Output Sheet & CRM Direct Submit */}
          <div className="lg:col-span-5">
            <div className="border border-[#0E0E0E] bg-white p-6 shadow-[8px_8px_0px_#0E0E0E] sm:p-8">
              <div className="border-b border-[#0E0E0E]/15 pb-5">
                <span className="font-mono-meta text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D94626]">
                  {dict.designSwitcher.nomadCalcEstimateLabel}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    data-testid="nomad-estimate-range"
                    className="font-display text-3xl font-bold tracking-tight text-[#0E0E0E] sm:text-4xl"
                  >
                    ${estimate.min.toLocaleString('en-US')} – ${estimate.max.toLocaleString('en-US')}
                  </span>
                  <span className="font-mono-meta text-xs text-[#57534E]">USD</span>
                </div>
                <p className="font-mono-meta mt-1.5 text-xs text-[#57534E]">
                  ≈ ${estimate.perPerson.toLocaleString('en-US')} / guest · {days}D ·{' '}
                  {vehicle.labels[locale]}
                </p>
              </div>

              {ticketNumber ? (
                <div className="mt-6 space-y-4 border border-[#0E0E0E]/15 bg-[#EFECE6] p-5">
                  <div className="flex items-center gap-2 text-[#D94626]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-mono-meta text-sm font-bold">{ticketNumber}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#0E0E0E]">
                    {dict.tourDetail.successTitle} — {dict.tourDetail.successDisclaimer}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketNumber(null);
                      setIdempotencyKey(`nomad-calc-${Date.now()}`);
                    }}
                    className="border border-[#0E0E0E] px-4 py-2 font-mono-meta text-xs font-semibold uppercase hover:bg-[#0E0E0E] hover:text-[#EFECE6]"
                  >
                    {dict.tourDetail.bookAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLockEstimate} className="mt-6 space-y-3.5">
                  <div>
                    <label className="font-mono-meta mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#57534E]">
                      {dict.tourDetail.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-[#0E0E0E]/20 bg-[#EFECE6]/45 px-3 py-2 text-xs text-[#0E0E0E] focus:border-[#0E0E0E] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="font-mono-meta mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#57534E]">
                        {dict.tourDetail.contactMethodLabel}
                      </label>
                      <select
                        value={contactMethod}
                        onChange={(e) => setContactMethod(e.target.value as 'email' | 'phone')}
                        className="w-full border border-[#0E0E0E]/20 bg-[#EFECE6]/45 px-2 py-2 text-xs text-[#0E0E0E] focus:border-[#0E0E0E] focus:outline-none"
                      >
                        <option value="email">{dict.tourDetail.contactEmailOption}</option>
                        <option value="phone">{dict.tourDetail.contactPhoneOption}</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="font-mono-meta mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#57534E]">
                        &nbsp;
                      </label>
                      <input
                        type="text"
                        required
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder={
                          contactMethod === 'email'
                            ? dict.tourDetail.contactPlaceholderEmail
                            : dict.tourDetail.contactPlaceholderPhone
                        }
                        className="w-full border border-[#0E0E0E]/20 bg-[#EFECE6]/45 px-3 py-2 text-xs text-[#0E0E0E] focus:border-[#0E0E0E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 text-[11px] leading-snug text-[#57534E]">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 accent-[#D94626]"
                    />
                    <span>{dict.tourDetail.consentLabel}</span>
                  </label>

                  {errorMsg && (
                    <p className="border border-[#D94626]/40 bg-[#D94626]/10 px-3 py-2 text-xs font-medium text-[#D94626]">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 bg-[#D94626] px-5 py-3.5 font-mono-meta text-xs font-semibold uppercase tracking-[0.16em] text-[#EFECE6] transition-colors hover:bg-[#0E0E0E] disabled:opacity-60"
                  >
                    <span>
                      {submitting ? dict.tourDetail.submitting : dict.designSwitcher.nomadCalcSubmit}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="flex items-center justify-center gap-1.5 font-mono-meta text-[10px] text-[#57534E]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0E0E0E]" />
                    <span>{dict.tourDetail.bookingSubnote}</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
