'use client';

import type { Channel, Lead, LeadStatus } from '@kt/core';
import { RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'bg-[#B85A3A]/15 text-[#9B482C]',
  in_progress: 'bg-amber-100 text-amber-900',
  proposal_sent: 'bg-sky-100 text-sky-900',
  awaiting_payment: 'bg-violet-100 text-violet-900',
  confirmed: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-stone-200 text-stone-700',
};

export function LeadsRegistryClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [channel, setChannel] = useState<Channel | 'all'>('all');
  const [status, setStatus] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (channel !== 'all') p.set('channel', channel);
      if (status !== 'all') p.set('status', status);
      if (search.trim()) p.set('search', search.trim());
      const res = await fetch(`/api/admin/leads?${p.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { leads: Lead[] };
        setLeads(data.leads);
      }
    } finally {
      setLoading(false);
    }
  }

  const visible = leads.filter((l) => {
    if (channel !== 'all' && l.channel !== channel) return false;
    if (status !== 'all' && l.status !== status) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${l.requestNumber} ${l.customerName} ${l.tourCode ?? ''} ${l.contactValue}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555C58]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search #KT-00001, name, tour code..."
            className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <select
          aria-label="Filter by channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value as Channel | 'all')}
          className="rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 text-sm"
        >
          <option value="all">All Channels</option>
          <option value="website">Website</option>
          <option value="telegram">Telegram</option>
          <option value="whatsapp">WhatsApp</option>
        </select>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus | 'all')}
          className="rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="awaiting_payment">Awaiting Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#163024] px-4 py-2 text-sm font-medium text-white hover:bg-[#1F4232]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[rgba(27,30,29,0.1)] bg-[#FAF8F4] font-mono-meta text-xs uppercase text-[#555C58]">
            <tr>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Guest & Contact</th>
              <th className="px-4 py-3">Trip / Tour</th>
              <th className="px-4 py-3">Date / Pax</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(27,30,29,0.07)]">
            {visible.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#FAF8F4]/70">
                <td className="px-4 py-3.5">
                  <span className="font-mono-meta font-semibold text-[#163024]">
                    #{lead.requestNumber}
                  </span>
                  <span className="block text-[11px] text-[#555C58]">
                    {lead.createdAt.slice(0, 16).replace('T', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full bg-[#F2ECE1] px-2.5 py-1 text-xs font-semibold uppercase">
                    {lead.channel}
                  </span>
                  <span className="ml-1.5 font-mono-meta text-[11px] text-[#555C58]">
                    {lead.locale.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-[#1B1E1D]">{lead.customerName}</p>
                  <p className="text-xs text-[#555C58]">
                    {lead.contactMethod}: {lead.contactValue}
                  </p>
                </td>
                <td className="px-4 py-3.5 max-w-[260px]">
                  <span className="font-mono-meta text-[11px] uppercase text-[#B85A3A]">
                    {lead.requestType}
                  </span>
                  <p className="truncate font-medium text-[#1B1E1D]">
                    {lead.requestType === 'book_tour'
                      ? lead.tourTitleSnapshot || lead.tourCode
                      : lead.customParams?.destination}
                  </p>
                </td>
                <td className="px-4 py-3.5 font-mono-meta text-xs">
                  <span>{lead.isFlexibleDates ? 'Flexible' : lead.preferredDate}</span>
                  <span className="block text-[#555C58]">{lead.participants} pax</span>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      STATUS_BADGE[lead.status]
                    }`}
                  >
                    {lead.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="font-semibold text-[#163024] hover:text-[#B85A3A]"
                  >
                    Open Card →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
