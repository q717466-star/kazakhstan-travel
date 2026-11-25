import { listManagerNotifications, listStaffUsers } from '@kt/core';
import { AdminShell } from '@/components/admin/AdminShell';
import { UsersRbacClient } from '@/components/admin/UsersRbacClient';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireStaffPageAuth(['admin']);
  const users = listStaffUsers();
  const unreadCount = listManagerNotifications(50).filter((n) => !n.isRead).length;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1B1E1D]">
            Staff Roles & Access Control
          </h1>
          <p className="mt-1 text-sm text-[#555C58]">
            Manage Admin, Travel Manager, and Content Editor permissions.
          </p>
        </div>
        <UsersRbacClient initialUsers={users} />
      </div>
    </AdminShell>
  );
}
