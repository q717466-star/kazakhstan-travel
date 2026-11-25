'use client';

import type { Locale } from '@kt/core';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { trackEvent } from '@/lib/analytics';

export function ContactFormClient({ locale, dict }: { locale: Locale; dict: SiteDictionary }) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [contactVal, setContactVal] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2 || contactVal.trim().length < 4) {
      setError(dict.tourDetail.validationContact);
      return;
    }
    if (!consent) {
      setError(dict.tourDetail.validationConsent);
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
          customParams: {
            destination: dict.contactsPage.generalTopic,
            durationLabel: dict.tourDetail.flexibleLabel,
            interests: ['nature'],
          },
          preferredDate: null,
          isFlexibleDates: true,
          participants: 2,
          customerName: name.trim(),
          contactMethod: method,
          contactValue: contactVal.trim(),
          notes: notes.trim() || dict.contactsPage.generalDefaultNote,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          idempotencyKey: `contacts-${Date.now()}`,
          website_hp: honeypot,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; requestNumber?: string; error?: string };
      if (!res.ok || !data.ok || !data.requestNumber) {
        setError(data.error || dict.tourDetail.submitError);
        return;
      }
      setRequestNumber(data.requestNumber);
      trackEvent({
        name: 'submit_lead_success',
        request_number: data.requestNumber,
        request_type: 'contact',
      });
    } catch {
      setError(dict.tourDetail.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  if (requestNumber) {
    return (
      <div className="space-y-3 rounded-[24px] border border-black/[0.08] bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#111111]" />
        <h3 className="font-display text-3xl font-semibold text-[#111111]">#{requestNumber}</h3>
        <p className="text-sm text-[#737373]">{dict.tourDetail.successDisclaimer}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[24px] border border-black/[0.08] bg-white p-6 sm:p-8"
    >
      <div>
        <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
          {dict.contactsPage.formTitle}
        </h2>
        <p className="mt-1 text-sm text-[#737373]">{dict.contactsPage.formSubtitle}</p>
      </div>

      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-[#111111]">{dict.tourDetail.nameLabel}</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
        />
      </label>

      <div>
        <div className="mb-2 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`rounded-xl border px-3 py-1.5 font-medium ${
              method === 'email'
                ? 'border-[#111111] bg-[#111111] text-white'
                : 'border-black/[0.1] bg-[#F5F5F6] text-[#111111]'
            }`}
          >
            {dict.tourDetail.contactEmailOption}
          </button>
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`rounded-xl border px-3 py-1.5 font-medium ${
              method === 'phone'
                ? 'border-[#111111] bg-[#111111] text-white'
                : 'border-black/[0.1] bg-[#F5F5F6] text-[#111111]'
            }`}
          >
            {dict.tourDetail.contactPhoneOption}
          </button>
        </div>
        <input
          type={method === 'email' ? 'email' : 'tel'}
          required
          value={contactVal}
          onChange={(e) => setContactVal(e.target.value)}
          placeholder={
            method === 'email'
              ? dict.tourDetail.contactPlaceholderEmail
              : dict.tourDetail.contactPlaceholderPhone
          }
          className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
        />
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-[#111111]">{dict.tourDetail.notesLabel}</span>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#737373]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#111111]"
        />
        <span>{dict.tourDetail.consentLabel}</span>
      </label>

      {error && (
        <p className="rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2 text-xs font-medium text-[#111111]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-[#111111] py-3.5 text-sm font-semibold text-white hover:bg-[#262626] disabled:opacity-60"
      >
        {submitting ? dict.tourDetail.submitting : dict.tourDetail.submitBooking}
      </button>
    </form>
  );
}
