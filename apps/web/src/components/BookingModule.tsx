'use client';

import type { Locale, Tour } from '@kt/core';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { buildTelegramDeepLink, buildWhatsAppDeepLink } from '@/lib/deep-links';

interface Props {
  tour: Tour;
  locale: Locale;
  dict: SiteDictionary;
}

export function BookingModule({ tour, locale, dict }: Props) {
  const title = tour.title[locale] || tour.title.en;
  const priceUnit = tour.priceUnit[locale] || tour.priceUnit.en;

  const [preferredDate, setPreferredDate] = useState('');
  const [isFlexibleDates, setIsFlexibleDates] = useState(false);
  const [participants, setParticipants] = useState('2');
  const [customerName, setCustomerName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `web-${tour.code}-${Date.now()}`);

  const tgHref = buildTelegramDeepLink(tour.code);
  const waHref = buildWhatsAppDeepLink(tour.code, title, locale);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const todayIso = new Date().toISOString().slice(0, 10);
    if (!isFlexibleDates) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        setErrorMsg(dict.tourDetail.validationDateFormat);
        return;
      }
      if (preferredDate < todayIso) {
        setErrorMsg(dict.tourDetail.validationDatePast);
        return;
      }
    }

    const pax = Number(participants);
    if (!Number.isInteger(pax) || pax < 1 || pax > 50) {
      setErrorMsg(dict.tourDetail.validationGuests);
      return;
    }

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
          requestType: 'book_tour',
          tourCode: tour.code,
          tourTitleSnapshot: title,
          preferredDate: isFlexibleDates ? null : preferredDate,
          isFlexibleDates,
          participants: pax,
          customerName: customerName.trim(),
          contactMethod,
          contactValue: contactValue.trim(),
          country: country.trim() || null,
          notes: notes.trim() || null,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          idempotencyKey,
          website_hp: honeypot,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        requestNumber?: string;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.requestNumber) {
        const msg = data.error || dict.tourDetail.submitError;
        setErrorMsg(msg);
        trackEvent({ name: 'submit_lead_error', reason: msg, tour_code: tour.code });
        return;
      }

      setSubmittedNumber(data.requestNumber);
      trackEvent({
        name: 'submit_lead_success',
        request_number: data.requestNumber,
        request_type: 'book_tour',
        tour_code: tour.code,
      });
    } catch {
      setErrorMsg(dict.tourDetail.networkError);
      trackEvent({ name: 'submit_lead_error', reason: 'network_error', tour_code: tour.code });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <aside
        id="booking-panel"
        className="rounded-[24px] border border-black/[0.08] bg-white p-6 shadow-xs lg:sticky lg:top-28"
      >
        <div className="border-b border-black/[0.08] pb-5">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="font-mono-meta text-[11px] uppercase tracking-wider text-[#737373]">
                {dict.tourDetail.bookingPriceLabel}
              </span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-[#111111]">
                  ${tour.priceFromUsd.toLocaleString('en-US')}
                </span>
              </div>
              <p className="text-xs text-[#737373]">{priceUnit}</p>
            </div>
            <span className="font-mono-meta rounded-full bg-[#F5F5F6] px-3 py-1 text-xs font-medium text-[#111111]">
              {tour.code}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#737373]">
            {dict.tourDetail.bookingSubnote}
          </p>
        </div>

        {submittedNumber ? (
          <div className="space-y-4 py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#111111]" />
            <div>
              <p className="font-mono-meta text-xs uppercase tracking-widest text-[#737373]">
                {dict.tourDetail.successTitle}
              </p>
              <h3 className="font-display mt-1 text-3xl font-semibold text-[#111111]">
                #{submittedNumber}
              </h3>
            </div>
            <p className="rounded-xl bg-[#F5F5F6] p-4 text-sm text-[#111111]">
              {dict.tourDetail.successDisclaimer}
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmittedNumber(null);
                setIdempotencyKey(`web-${tour.code}-${Date.now()}`);
              }}
              className="text-sm font-semibold text-[#111111] underline"
            >
              {dict.tourDetail.bookAnother}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              type="text"
              name="website_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#111111]">
                {dict.tourDetail.dateLabel}
              </label>
              <input
                type="date"
                disabled={isFlexibleDates}
                min={new Date().toISOString().slice(0, 10)}
                value={preferredDate}
                onFocus={() =>
                  trackEvent({
                    name: 'start_booking_form',
                    source: 'tour_card',
                    tour_code: tour.code,
                  })
                }
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3 py-2.5 text-sm disabled:opacity-45 focus:border-[#111111] focus:bg-white focus:outline-none"
              />
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-[#737373]">
                <input
                  type="checkbox"
                  checked={isFlexibleDates}
                  onChange={(e) => setIsFlexibleDates(e.target.checked)}
                  className="h-4 w-4 accent-[#111111]"
                />
                <span>{dict.tourDetail.flexibleLabel}</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#111111]">
                  {dict.tourDetail.guestsLabel}
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#111111]">
                  {dict.tourDetail.countryLabel}
                </span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={dict.tourDetail.countryPlaceholder}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111111]">
                {dict.tourDetail.nameLabel}
              </span>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
              />
            </label>

            <div>
              <span className="mb-1 block text-xs font-semibold text-[#111111]">
                {dict.tourDetail.contactMethodLabel}
              </span>
              <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setContactMethod('email')}
                  className={`rounded-xl border px-3 py-2 font-medium transition-colors ${
                    contactMethod === 'email'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-black/[0.1] bg-[#F5F5F6] text-[#111111]'
                  }`}
                >
                  {dict.tourDetail.contactEmailOption}
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('phone')}
                  className={`rounded-xl border px-3 py-2 font-medium transition-colors ${
                    contactMethod === 'phone'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-black/[0.1] bg-[#F5F5F6] text-[#111111]'
                  }`}
                >
                  {dict.tourDetail.contactPhoneOption}
                </button>
              </div>
              <input
                type={contactMethod === 'email' ? 'email' : 'tel'}
                required
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactMethod === 'email'
                    ? dict.tourDetail.contactPlaceholderEmail
                    : dict.tourDetail.contactPlaceholderPhone
                }
                className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
              />
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111111]">
                {dict.tourDetail.notesLabel}
              </span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3 py-2 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-[#737373]">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]"
              />
              <span>{dict.tourDetail.consentLabel}</span>
            </label>

            {errorMsg && (
              <p className="rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-xs font-medium text-[#111111]">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#111111] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#262626] disabled:opacity-60"
            >
              {submitting ? dict.tourDetail.submitting : dict.tourDetail.submitBooking}
            </button>
          </form>
        )}

        {/* Instant Messenger Deep-Links with Tour Code */}
        <div className="mt-6 border-t border-black/[0.08] pt-5">
          <p className="mb-3 text-center text-xs text-[#737373]">
            {dict.tourDetail.orBookMessenger}{' '}
            <span className="font-mono-meta font-semibold text-[#111111]">{tour.code}</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={tgHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent({ name: 'click_telegram', source: 'tour_card', tour_code: tour.code })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-3 py-2.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F5F5F6]"
            >
              <Send className="h-3.5 w-3.5 text-[#111111]" />
              <span>{dict.tourDetail.telegramCta}</span>
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent({ name: 'click_whatsapp', source: 'tour_card', tour_code: tour.code })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#111111] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#262626]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{dict.tourDetail.whatsappCta}</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Fixed Mobile Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-black/[0.08] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="min-w-0">
          <span className="font-display block text-2xl font-semibold leading-none text-[#111111]">
            ${tour.priceFromUsd.toLocaleString('en-US')}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-[#737373]">
            {dict.tourDetail.bookingPriceLabel}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.12] bg-[#F5F5F6] text-[#111111]"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href="#booking-panel"
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white"
          >
            {dict.tourDetail.mobileStickyBtn}
          </a>
        </div>
      </div>
    </>
  );
}
