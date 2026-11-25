import {
  addLeadNote,
  getLeadById,
  getLeadEvents,
  updateLeadStatus,
  type LeadStatus,
} from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireStaffApiAuth(['admin', 'manager']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const lead = getLeadById(id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const events = getLeadEvents(id);
  return NextResponse.json({ lead, events });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireStaffApiAuth(['admin', 'manager']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const body = (await req.json()) as { status?: LeadStatus; note?: string };

  let updated = getLeadById(id);
  if (!updated) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  if (body.status && body.status !== updated.status) {
    updated = updateLeadStatus(id, body.status, user.email, body.note);
  } else if (body.note?.trim()) {
    updated = addLeadNote(id, user.email, body.note);
  }

  return NextResponse.json({ lead: updated, events: getLeadEvents(id) });
}
