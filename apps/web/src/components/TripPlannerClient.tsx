'use client';

import type { Locale } from '@kt/core';
import { CheckCircle2, Copy, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { trackEvent } from '@/lib/analytics';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
}

export function TripPlannerClient({ locale, dict }: Props) {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(dict.planner.destChoices[0]);
  const [customDestination, setCustomDestination] = useState('');
  const [durationLabel, setDurationLabel] = useState(dict.planner.durationChoices[1]);
  const [interests, setInterests] = useState<string[]>(['nature', 'offroad']);
  const [preferredDate, setPreferredDate] = useState('');
  const [isFlexibleDates, setIsFlexibleDates] = useState(false);
  const [participants, setParticipants] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const interestOptions = [
    { id: 'nature', label: dict.catalog.activities.nature },
    { id: 'mountains', label: dict.catalog.activities.mountains },
    { id: 'photography', label: dict.catalog.activities.photography },
    { id: 'culture', label: dict.catalog.activities.culture },
    { id: 'active', label: dict.catalog.activities.active },
    { id: 'offroad', label: dict.catalog.activities.offroad },
  ];

  const finalDestination = customDestination.trim() || destination;

  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function goStep(next: number) {
    setErrorMsg(null);
    if (step === 3 && interests.length === 0) {
      setErrorMsg(dict.planner.selectInterestError);
      return;
    }
    if (step === 4 && next > 4 && !isFlexibleDates) {
      const todayIso = new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        setErrorMsg(dict.tourDetail.validationDateFormat);
        return;
      }
      if (preferredDate < todayIso) {
        setErrorMsg(dict.tourDetail.validationDatePast);
        return;
      }
    }
    if (step === 5 && next > 5 && (!Number.isInteger(participants) || participants < 1)) {
      setErrorMsg(dict.tourDetail.validationGuests);
      return;
    }
    setStep(next);
    trackEvent({
      name: 'use_trip_planner',
      step: next,
      step_name: dict.planner.steps[next - 1] || String(next),
    });
  }

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
          customParams: {
            destination: finalDestination,
            durationLabel,
            interests,
          },
          preferredDate: isFlexibleDates ? null : preferredDate,
          isFlexibleDates,
          participants,
          customerName: customerName.trim(),
          contactMethod,
          contactValue: contactValue.trim(),
          country: country.trim() || null,
          notes: notes.trim() || null,
          consentGiven: true,
          consentAt: new Date().toISOString(),
          idempotencyKey: `planner-${Date.now()}`,
          website_hp: honeypot,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        requestNumber?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.requestNumber) {
        setErrorMsg(data.error || dict.tourDetail.submitError);
        trackEvent({ name: 'submit_lead_error', reason: data.error || 'planner_error' });
        return;
      }
      setSubmittedNumber(data.requestNumber);
      trackEvent({
        name: 'submit_lead_success',
        request_number: data.requestNumber,
        request_type: 'plan_trip',
      });
    } catch {
      setErrorMsg(dict.tourDetail.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  const summaryPlainText = [
    `${dict.planner.summaryLabel} ${submittedNumber ? `#${submittedNumber}` : ''}`,
    `${dict.planner.steps[0]}: ${finalDestination}`,
    `${dict.planner.steps[1]}: ${durationLabel}`,
    `${dict.planner.steps[2]}: ${interests.join(', ')}`,
    `${dict.planner.steps[3]}: ${isFlexibleDates ? dict.tourDetail.flexibleLabel : preferredDate || '-'}`,
    `${dict.planner.steps[4]}: ${participants} ${dict.planner.paxUnit}`,
    `${dict.tourDetail.nameLabel}: ${customerName}`,
    `${dict.tourDetail.contactMethodLabel}: ${contactValue}`,
  ].join('\n');

  if (submittedNumber) {
    const mailtoHref = `mailto:?subject=${encodeURIComponent(
      `Kazakhstan Travel Request #${submittedNumber}`
    )}&body=${encodeURIComponent(summaryPlainText)}`;

    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-[26px] border border-black/[0.08] bg-white p-8 text-center shadow-xs sm:p-10">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#111111]" />
        <div>
          <span className="font-mono-meta text-xs uppercase tracking-widest text-[#737373]">
            {dict.tourDetail.successTitle}
          </span>
          <h2 className="font-display mt-1 text-4xl font-semibold text-[#111111]">
            #{submittedNumber}
          </h2>
        </div>

        <p className="rounded-2xl bg-[#F5F5F6] p-4 text-sm text-[#111111]">
          {dict.tourDetail.successDisclaimer}
        </p>

        <div className="rounded-2xl border border-black/[0.08] bg-[#F5F5F6] p-5 text-left">
          <p className="font-mono-meta mb-2 text-xs uppercase tracking-wider text-[#737373]">
            {dict.planner.summaryLabel}
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm text-[#111111]">
            {summaryPlainText}
          </pre>
        </div>

        <p className="text-xs text-[#737373]">{dict.planner.emailSummaryHint}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(summaryPlainText);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] px-5 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#F5F5F6]"
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? dict.planner.copiedLabel : dict.planner.copySummaryBtn}</span>
          </button>
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#262626]"
          >
            <Mail className="h-4 w-4" />
            <span>{dict.planner.emailSummaryBtn}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[26px] border border-black/[0.08] bg-white p-6 shadow-xs sm:p-10">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between font-mono-meta text-xs uppercase tracking-wider text-[#737373]">
          <span>
            {dict.planner.stepPrefix} {step} / 6
          </span>
          <span className="font-sans font-semibold text-[#111111]">{dict.planner.steps[step - 1]}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-1.5 overflow-hidden rounded-full bg-[#ECECEE]">
              <motion.div
                initial={false}
                animate={{ scaleX: idx <= step ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-full origin-left bg-[#111111]"
              />
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0.4, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.4, x: -16 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  {dict.planner.step1Prompt}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dict.planner.destChoices.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDestination(opt);
                        setCustomDestination('');
                      }}
                      className={`rounded-2xl border p-4 text-left text-sm font-medium transition-all ${
                        destination === opt && !customDestination
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-black/[0.08] bg-[#F5F5F6] text-[#111111] hover:border-black/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  placeholder={dict.planner.customDestPlaceholder}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-4 py-3 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  {dict.planner.step2Prompt}
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {dict.planner.durationChoices.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDurationLabel(opt)}
                      className={`rounded-2xl border p-4 text-center text-sm font-semibold transition-all ${
                        durationLabel === opt
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-black/[0.08] bg-[#F5F5F6] text-[#111111] hover:border-black/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  {dict.planner.step3Prompt}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interestOptions.map((opt) => {
                    const active = interests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInterest(opt.id)}
                        className={`rounded-2xl border p-4 text-left text-sm font-semibold transition-all ${
                          active
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-black/[0.08] bg-[#F5F5F6] text-[#111111] hover:border-black/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  {dict.planner.step4Prompt}
                </h2>
                <input
                  type="date"
                  disabled={isFlexibleDates}
                  min={new Date().toISOString().slice(0, 10)}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-4 py-3 text-base disabled:opacity-45 focus:border-[#111111] focus:bg-white focus:outline-none"
                />
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-[#111111]">
                  <input
                    type="checkbox"
                    checked={isFlexibleDates}
                    onChange={(e) => setIsFlexibleDates(e.target.checked)}
                    className="h-4 w-4 accent-[#111111]"
                  />
                  <span>{dict.tourDetail.flexibleLabel}</span>
                </label>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  {dict.planner.step5Prompt}
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                    className="h-12 w-12 rounded-full border border-black/[0.15] text-xl font-semibold hover:bg-[#F5F5F6]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={participants}
                    onChange={(e) => setParticipants(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 rounded-xl border border-black/[0.1] bg-[#F5F5F6] py-3 text-center font-display text-3xl font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setParticipants((p) => Math.min(50, p + 1))}
                    className="h-12 w-12 rounded-full border border-black/[0.15] text-xl font-semibold hover:bg-[#F5F5F6]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
                  {dict.planner.step6Prompt}
                </h2>

                <div className="space-y-1 rounded-xl bg-[#F5F5F6] p-4 text-xs text-[#737373]">
                  <p>
                    <strong className="text-[#111111]">{dict.planner.steps[0]}:</strong> {finalDestination} ·{' '}
                    <strong className="text-[#111111]">{durationLabel}</strong>
                  </p>
                  <p>
                    <strong className="text-[#111111]">{dict.planner.steps[3]}:</strong>{' '}
                    {isFlexibleDates ? dict.tourDetail.flexibleLabel : preferredDate} ·{' '}
                    <strong className="text-[#111111]">{participants} {dict.planner.paxUnit}</strong>
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[#111111]">{dict.tourDetail.nameLabel}</span>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
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
                      className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
                    />
                  </label>
                </div>

                <div>
                  <div className="mb-2 flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setContactMethod('email')}
                      className={`rounded-xl border px-3 py-1.5 font-medium ${
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
                      className={`rounded-xl border px-3 py-1.5 font-medium ${
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
                    className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2.5 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
                  />
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#111111]">{dict.tourDetail.notesLabel}</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-3.5 py-2 text-sm focus:border-[#111111] focus:bg-white focus:outline-none"
                  />
                </label>

                <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#737373]">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#111111]"
                  />
                  <span>{dict.tourDetail.consentLabel}</span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {errorMsg && (
          <p className="rounded-xl border border-black/[0.1] bg-[#F5F5F6] px-4 py-2.5 text-xs font-medium text-[#111111]">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-black/[0.08] pt-5">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => goStep(step - 1)}
            className="rounded-full border border-black/[0.12] px-5 py-2.5 text-sm font-medium text-[#111111] hover:bg-[#F5F5F6] disabled:opacity-35"
          >
            {dict.planner.backBtn}
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => goStep(step + 1)}
              className="rounded-full bg-[#111111] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#262626]"
            >
              {dict.planner.nextBtn}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#111111] px-7 py-3 text-sm font-semibold text-white hover:bg-[#262626] disabled:opacity-60"
            >
              {submitting ? dict.tourDetail.submitting : dict.planner.submitBtn}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
