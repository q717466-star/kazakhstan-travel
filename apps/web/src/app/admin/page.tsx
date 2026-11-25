import { listLeads, listManagerNotifications, listTours } from '@kt/core';
import { ArrowRight, Bell, MessageSquare, Send, Globe } from 'lucide-react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { MarkAllReadButton } from '@/components/admin/MarkAllReadButton';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const user = await requireStaffPageAuth();
  const leads = listLeads();
  const tours = listTours({ includeInactive: true });
  const notifications = listManagerNotifications(12);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const byChannel = {
    website: leads.filter((l) => l.channel === 'website').length,
    telegram: leads.filter((l) => l.channel === 'telegram').length,
    whatsapp: leads.filter((l) => l.channel === 'whatsapp').length,
  };

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1B1E1D]">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#555C58]">
            Unified registry across Website, Telegram Bot, and WhatsApp Cloud API.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5">
            <span className="font-mono-meta text-xs uppercase text-[#555C58]">Total Requests</span>
            <p className="font-display mt-2 text-4xl font-semibold text-[#163024]">{leads.length}</p>
            <p className="mt-1 text-xs text-[#555C58]">{tours.length} tours in CMS</p>
          </div>
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5">
            <span className="flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[#555C58]">
              <Globe className="h-3.5 w-3.5 text-[#163024]" /> Website
            </span>
            <p className="font-display mt-2 text-4xl font-semibold text-[#1B1E1D]">
              {byChannel.website}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5">
            <span className="flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[#555C58]">
              <Send className="h-3.5 w-3.5 text-[#163024]" /> Telegram Bot
            </span>
            <p className="font-display mt-2 text-4xl font-semibold text-[#1B1E1D]">
              {byChannel.telegram}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5">
            <span className="flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[#555C58]">
              <MessageSquare className="h-3.5 w-3.5 text-[#B85A3A]" /> WhatsApp Bot
            </span>
            <p className="font-display mt-2 text-4xl font-semibold text-[#1B1E1D]">
              {byChannel.whatsapp}
            </p>
          </div>
        </div>

        {/* Manager Notifications Feed */}
        <section className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#B85A3A]" />
              <h2 className="font-display text-2xl font-semibold">Manager Notifications</h2>
            </div>
            <div className="flex items-center gap-3">
              <MarkAllReadButton unreadCount={unreadCount} />
              <Link
                href="/admin/leads"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#163024] hover:text-[#B85A3A]"
              >
                <span>Open Lead Registry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-[rgba(27,30,29,0.08)]">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.targetUrl}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F4] px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-meta text-xs font-bold text-[#163024]">
                      #{n.requestNumber}
                    </span>
                    <span className="rounded-full bg-[#F2ECE1] px-2 py-0.5 text-[11px] font-medium uppercase">
                      {n.channel}
                    </span>
                    {!n.isRead && (
                      <span className="rounded-full bg-[#B85A3A] px-2 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#1B1E1D]">{n.summary}</p>
                </div>
                <span className="font-mono-meta text-xs text-[#555C58]">
                  {n.createdAt.slice(0, 16).replace('T', ' ')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
