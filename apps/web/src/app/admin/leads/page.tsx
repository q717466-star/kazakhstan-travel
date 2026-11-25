import { listLeads, listManagerNotifications } from '@kt/core';
import { AdminShell } from '@/components/admin/AdminShell';
import { LeadsRegistryClient } from '@/components/admin/LeadsRegistryClient';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const user = await requireStaffPageAuth(['admin', 'manager']);
  const leads = listLeads();
  const unreadCount = listManagerNotifications(50).filter((n) => !n.isRead).length;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1B1E1D]">
            Unified Lead Registry
          </h1>
          <p className="mt-1 text-sm text-[#555C58]">
            Single source of truth for Website forms, Telegram Bot, and WhatsApp Cloud API.
          </p>
        </div>
        <LeadsRegistryClient initialLeads={leads} />
      </div>
    </AdminShell>
  );
}
