import { listLeads, type Channel, type LeadStatus } from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin', 'manager']);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const leads = listLeads({
    channel: (sp.get('channel') as Channel | 'all') ?? 'all',
    status: (sp.get('status') as LeadStatus | 'all') ?? 'all',
    search: sp.get('search') ?? undefined,
  });

  return NextResponse.json({ leads });
}
