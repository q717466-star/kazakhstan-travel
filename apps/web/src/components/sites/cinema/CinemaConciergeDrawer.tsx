'use client';

import type { Locale } from '@kt/core';
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SiteDictionary } from '@/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  dict: SiteDictionary;
}

export function CinemaConciergeDrawer({ open, onClose, locale, dict }: Props) {
  const [corridor, setCorridor] = useState(dict.planner.destChoices[0] ?? 'Charyn Canyon & Kolsai');
  const [preferredDate, setPreferredDate] = useState('');
  const [isFlexible, setIsFlexible] = useState(true);
  const [participants, setParticipants] = useState('2');
  const [customerName, setCustomerName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `cinema-${Date.now()}`);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
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
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'website',
          locale,
          requestType: 'plan_trip',
          tourTitleSnapshot: `Private Concierge · ${corridor}`,
          customParams: {
            destination: corridor,
            durationLabel: 'Private bespoke departure',
            interests: ['Private Concierge', '4x4 Overland'],
          },
          preferredDate: isFlexible ? null : preferredDate || null,
          isFlexibleDates: isFlexible,
          participants: Number(participants) || 2,
          customerName: customerName.trim(),
          contactMethod,
          contactValue: contactValue.trim(),
          notes: notes.trim() || null,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          idempotencyKey,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; requestNumber?: string; error?: string };
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
    <div
      role="dialog"
      aria-modal="true"
      data-testid="cinema-concierge-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
    >
      <div className="flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-[#D6B36A]/25 bg-[#0A0C10] p-6 text-[#F5F1E8] shadow-2xl sm:p-8">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-2 text-[#D6B36A]">
              <Sparkles className="h-4 w-4" />
              <span className="font-mono-meta text-[11px] uppercase tracking-[0.2em]">
                {dict.designSwitcher.cinemaConciergeBtn}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.designSwitcher.cinemaCloseBtn}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/75 hover:border-[#D6B36A] hover:text-[#D6B36A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6">
            <h2 className="font-editorial text-3xl font-normal italic text-[#F5F1E8]">
              {dict.designSwitcher.cinemaConciergeTitle}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">
              {dict.designSwitcher.cinemaConciergeSub}
            </p>
          </div>

          {ticketNumber ? (
            <div className="mt-8 space-y-4 rounded-2xl border border-[#D6B36A]/40 bg-[#D6B36A]/10 p-5">
              <div className="flex items-center gap-2 text-[#D6B36A]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-mono-meta text-sm font-bold">{ticketNumber}</span>
              </div>
              <p className="text-xs leading-relaxed text-[#F5F1E8]">
                {dict.tourDetail.successTitle} — {dict.tourDetail.successDisclaimer}
              </p>
              <button
                type="button"
                onClick={() => {
                  setTicketNumber(null);
                  setIdempotencyKey(`cinema-${Date.now()}`);
                }}
                className="rounded-full border border-[#D6B36A]/60 px-4 py-2 text-xs font-semibold text-[#D6B36A] hover:bg-[#D6B36A] hover:text-[#050608]"
              >
                {dict.tourDetail.bookAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="font-mono-meta mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">
                  {dict.quickSearch.countryLabel}
                </label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#12161E] px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none"
                >
                  {dict.planner.destChoices.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono-meta mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">
                    {dict.tourDetail.guestsLabel}
                  </label>
                  <select
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#12161E] px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono-meta mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">
                    {dict.tourDetail.dateLabel}
                  </label>
                  <input
                    type="date"
                    disabled={isFlexible}
                    value={preferredDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#12161E] px-3 py-2 text-xs text-[#F5F1E8] disabled:opacity-45 focus:border-[#D6B36A] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <input
                  type="checkbox"
                  checked={isFlexible}
                  onChange={(e) => setIsFlexible(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#D6B36A]"
                />
                <span>{dict.tourDetail.flexibleLabel}</span>
              </label>

              <div>
                <label className="font-mono-meta mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">
                  {dict.tourDetail.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#12161E] px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as 'email' | 'phone')}
                  className="col-span-1 rounded-xl border border-white/15 bg-[#12161E] px-2.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none"
                >
                  <option value="email">{dict.tourDetail.contactEmailOption}</option>
                  <option value="phone">{dict.tourDetail.contactPhoneOption}</option>
                </select>
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
                  className="col-span-2 rounded-xl border border-white/15 bg-[#12161E] px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono-meta mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">
                  {dict.tourDetail.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#12161E] px-3.5 py-2 text-xs text-[#F5F1E8] focus:border-[#D6B36A] focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-2.5 text-[11px] leading-snug text-[#9CA3AF]">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#D6B36A]"
                />
                <span>{dict.tourDetail.consentLabel}</span>
              </label>

              {errorMsg && (
                <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D6B36A] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#050608] transition-colors hover:bg-[#E7C885] disabled:opacity-60"
              >
                <span>{submitting ? dict.tourDetail.submitting : dict.tourDetail.submitBooking}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 border-t border-white/10 pt-4 font-mono-meta text-[10px] text-[#9CA3AF]">
          {dict.contactsPage.officeHoursValue}
        </p>
      </div>
    </div>
  );
}
