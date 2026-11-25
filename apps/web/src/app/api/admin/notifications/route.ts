import {
  listManagerNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await requireStaffApiAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ notifications: listManagerNotifications(50) });
}

export async function POST(req: NextRequest) {
  const user = await requireStaffApiAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json()) as { id?: string; all?: boolean };
  if (body.all) {
    markAllNotificationsRead();
  } else if (body.id) {
    markNotificationRead(body.id);
  }
  return NextResponse.json({ ok: true });
}
