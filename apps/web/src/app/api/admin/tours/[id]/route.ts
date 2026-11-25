import { deleteTourById } from '@kt/core';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireStaffApiAuth(['admin', 'editor']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await context.params;
  const deleted = deleteTourById(id);
  revalidatePath('/', 'layout');
  return NextResponse.json({ deleted });
}
