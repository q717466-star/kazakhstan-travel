import { listManagerNotifications, listTours } from '@kt/core';
import { AdminShell } from '@/components/admin/AdminShell';
import { ToursCmsClient } from '@/components/admin/ToursCmsClient';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminToursPage() {
  const user = await requireStaffPageAuth(['admin', 'editor']);
  const tours = listTours({ includeInactive: true });
  const unreadCount = listManagerNotifications(50).filter((n) => !n.isRead).length;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1B1E1D]">Tours CMS</h1>
          <p className="mt-1 text-sm text-[#555C58]">
            Manage tours, pricing, multi-language copy (EN/RU/KK), day-by-day itineraries, photos,
            and SEO metadata without editing source code.
          </p>
        </div>
        <ToursCmsClient initialTours={tours} />
      </div>
    </AdminShell>
  );
}
