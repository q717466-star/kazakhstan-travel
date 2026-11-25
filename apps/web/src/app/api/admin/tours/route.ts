import { listTours, upsertTour, type Tour } from '@kt/core';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await requireStaffApiAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ tours: listTours({ includeInactive: true }) });
}

export async function POST(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin', 'editor']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as Omit<Tour, 'id' | 'updatedAt'> & { id?: string };
  if (!body.code || !body.slug || !body.title?.en) {
    return NextResponse.json({ error: 'code, slug, and title.en are required' }, { status: 400 });
  }

  const saved = upsertTour(body);
  revalidatePath('/', 'layout');
  return NextResponse.json({ tour: saved });
}
