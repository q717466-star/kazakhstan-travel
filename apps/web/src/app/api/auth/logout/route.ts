import { logoutStaffSession } from '@kt/core';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { STAFF_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const store = await cookies();
  const token = store.get(STAFF_COOKIE_NAME)?.value;
  logoutStaffSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(STAFF_COOKIE_NAME);
  return res;
}
