import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ensureSeeded, verifyStaffSessionToken, type StaffUser, type UserRole } from '@kt/core';

export const STAFF_COOKIE_NAME = 'kt_staff_session';

export async function getCurrentStaffUser(): Promise<StaffUser | null> {
  ensureSeeded();
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  return verifyStaffSessionToken(token);
}

export async function requireStaffPageAuth(allowedRoles?: UserRole[]): Promise<StaffUser> {
  const user = await getCurrentStaffUser();
  if (!user) {
    redirect('/admin/login');
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect('/admin');
  }
  return user;
}

export async function requireStaffApiAuth(allowedRoles?: UserRole[]): Promise<StaffUser | null> {
  const user = await getCurrentStaffUser();
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;
  return user;
}
