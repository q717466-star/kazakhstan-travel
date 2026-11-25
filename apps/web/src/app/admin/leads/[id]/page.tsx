import {
  getLeadById,
  getLeadEvents,
  listManagerNotifications,
  markNotificationRead,
} from '@kt/core';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { LeadDetailClient } from '@/components/admin/LeadDetailClient';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireStaffPageAuth(['admin', 'manager']);
  const { id } = await params;
  const lead = getLeadById(id);
  if (!lead) notFound();

  const allNotifs = listManagerNotifications(50);
  for (const n of allNotifs) {
    if (n.leadId === id && !n.isRead) {
      markNotificationRead(n.id);
    }
  }

  const events = getLeadEvents(id);
  const unreadCount = listManagerNotifications(50).filter((n) => !n.isRead).length;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <LeadDetailClient initialLead={lead} initialEvents={events} />
    </AdminShell>
  );
}
