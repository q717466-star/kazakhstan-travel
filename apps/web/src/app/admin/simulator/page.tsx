import { listManagerNotifications, listTours } from '@kt/core';
import { AdminShell } from '@/components/admin/AdminShell';
import { BotSimulatorClient } from '@/components/admin/BotSimulatorClient';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminSimulatorPage() {
  const user = await requireStaffPageAuth();
  const tours = listTours();
  const unreadCount = listManagerNotifications(50).filter((n) => !n.isRead).length;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1B1E1D]">
            Telegram & WhatsApp Simulator
          </h1>
          <p className="mt-1 text-sm text-[#555C58]">
            End-to-end verification bench connected to the live webhook adapters and shared CRM
            database.
          </p>
        </div>
        <BotSimulatorClient tours={tours} />
      </div>
    </AdminShell>
  );
}
