'use client';

import type { Lead, LeadEvent, LeadStatus } from '@kt/core';
import { ArrowLeft, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function LeadDetailClient({
  initialLead,
  initialEvents,
}: {
  initialLead: Lead;
  initialEvents: LeadEvent[];
}) {
  const [lead, setLead] = useState(initialLead);
  const [events, setEvents] = useState(initialEvents);
  const [status, setStatus] = useState<LeadStatus>(initialLead.status);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) {
        const data = (await res.json()) as { lead: Lead; events: LeadEvent[] };
        setLead(data.lead);
        setEvents(data.events);
        setNote('');
      }
    } finally {
      setSaving(false);
    }
  }

  const waTarget =
    lead.contactMethod === 'phone' || lead.channel === 'whatsapp'
      ? `https://wa.me/${lead.contactValue.replace(/\D/g, '')}?text=${encodeURIComponent(
          `Hello ${lead.customerName}! Regarding your Kazakhstan Travel request #${lead.requestNumber}...`
        )}`
      : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#163024] hover:text-[#B85A3A]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Lead Registry</span>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#163024]">
              Request #{lead.requestNumber}
            </h1>
            <span className="rounded-full bg-[#F2ECE1] px-3 py-1 text-xs font-semibold uppercase">
              {lead.channel}
            </span>
            <span className="font-mono-meta rounded-full border border-[rgba(27,30,29,0.15)] px-3 py-1 text-xs">
              Lang: {lead.locale.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 font-mono-meta text-xs text-[#555C58]">
            Created: {lead.createdAt} · Updated: {lead.updatedAt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {waTarget && (
            <a
              href={waTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#B85A3A] px-4 py-2 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Reply on WhatsApp</span>
            </a>
          )}
          {lead.contactMethod === 'email' && (
            <a
              href={`mailto:${lead.contactValue}?subject=${encodeURIComponent(
                `Kazakhstan Travel Request #${lead.requestNumber}`
              )}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#163024] px-4 py-2 text-xs font-semibold text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email Guest</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Lead Metadata Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6 space-y-4">
            <h2 className="font-display text-2xl font-semibold">Traveler & Trip Details</h2>

            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-mono-meta text-[11px] uppercase text-[#555C58]">Request Type</dt>
                <dd className="mt-0.5 font-semibold">{lead.requestType}</dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase text-[#555C58]">Participants</dt>
                <dd className="mt-0.5 font-semibold">{lead.participants} travelers</dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase text-[#555C58]">Travel Date</dt>
                <dd className="mt-0.5 font-mono-meta font-semibold">
                  {lead.isFlexibleDates ? 'Flexible dates' : lead.preferredDate}
                </dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase text-[#555C58]">Customer Name</dt>
                <dd className="mt-0.5 font-semibold">{lead.customerName}</dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase text-[#555C58]">Contact Channel</dt>
                <dd className="mt-0.5 font-semibold">
                  {lead.contactMethod} — {lead.contactValue}
                </dd>
              </div>
              <div>
                <dt className="font-mono-meta text-[11px] uppercase text-[#555C58]">Country</dt>
                <dd className="mt-0.5">{lead.country || 'Not provided'}</dd>
              </div>
            </dl>

            <div className="border-t border-[rgba(27,30,29,0.08)] pt-4 text-sm">
              <p className="font-mono-meta text-[11px] uppercase text-[#555C58]">
                {lead.requestType === 'book_tour' ? 'Selected Tour' : 'Custom Itinerary Parameters'}
              </p>
              {lead.requestType === 'book_tour' ? (
                <p className="mt-1 font-semibold text-[#163024]">
                  {lead.tourTitleSnapshot} ({lead.tourCode})
                </p>
              ) : (
                <div className="mt-1 space-y-1">
                  <p>
                    <strong>Region:</strong> {lead.customParams?.destination}
                  </p>
                  <p>
                    <strong>Duration:</strong> {lead.customParams?.durationLabel}
                  </p>
                  <p>
                    <strong>Interests:</strong> {lead.customParams?.interests.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="border-t border-[rgba(27,30,29,0.08)] pt-4 text-sm">
                <p className="font-mono-meta text-[11px] uppercase text-[#555C58]">Guest Notes</p>
                <p className="mt-1 rounded-xl bg-[#FAF8F4] p-3 text-[#1B1E1D]">{lead.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                Personal data consent recorded: <strong>{String(lead.consentGiven)}</strong> at{' '}
                <span className="font-mono-meta">{lead.consentAt}</span>
              </span>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6 space-y-4">
            <h2 className="font-display text-2xl font-semibold">Interaction & Audit History</h2>
            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-xl border border-[rgba(27,30,29,0.08)] bg-[#FAF8F4] p-3.5 text-sm"
                >
                  <div className="flex items-center justify-between text-xs font-mono-meta text-[#555C58]">
                    <span>
                      {evt.eventType} · {evt.actor}
                    </span>
                    <span>{evt.createdAt.slice(0, 19).replace('T', ' ')}</span>
                  </div>
                  <p className="mt-1 text-[#1B1E1D]">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Update Panel */}
        <form
          onSubmit={saveUpdate}
          className="lg:col-span-5 rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6 space-y-4"
        >
          <h2 className="font-display text-2xl font-semibold">Manage Status & Notes</h2>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Pipeline Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full rounded-xl border border-[rgba(27,30,29,0.16)] bg-[#FAF8F4] px-3.5 py-2.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Manager Note</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Confirmed 4x4 guide availability, sent personalized quote link..."
              className="w-full rounded-xl border border-[rgba(27,30,29,0.16)] bg-[#FAF8F4] px-3.5 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-[#163024] py-3 text-sm font-semibold text-white hover:bg-[#1F4232] disabled:opacity-60"
          >
            {saving ? 'Updating...' : 'Save Status / Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
