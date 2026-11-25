import { redirect } from 'next/navigation';
import { getCurrentStaffUser } from '@/lib/auth';
import { AdminLoginClient } from '@/components/admin/AdminLoginClient';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const user = await getCurrentStaffUser();
  if (user) {
    redirect('/admin');
  }

  return <AdminLoginClient showDemoHint={process.env.NODE_ENV !== 'production'} />;
}
