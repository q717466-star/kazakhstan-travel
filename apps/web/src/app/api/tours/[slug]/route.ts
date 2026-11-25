import { ensureSeeded, getTourByCode, getTourBySlug } from '@kt/core';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  ensureSeeded();
  const { slug } = await context.params;
  const tour = getTourBySlug(slug) ?? getTourByCode(slug);
  if (!tour || !tour.isActive) {
    return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
  }
  return NextResponse.json({ tour });
}
