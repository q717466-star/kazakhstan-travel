import { ensureSeeded, listTours } from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  ensureSeeded();
  const sp = req.nextUrl.searchParams;
  const tours = listTours({
    country: sp.get('country') ?? undefined,
    category: sp.get('category') ?? undefined,
    durationBucket: sp.get('duration') ?? undefined,
    maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
    season: sp.get('season') ?? undefined,
    activity: sp.get('activity') ?? undefined,
    difficulty: sp.get('difficulty') ?? undefined,
    guests: sp.get('guests') ? Number(sp.get('guests')) : undefined,
    query: sp.get('q') ?? undefined,
    sort: (sp.get('sort') as 'recommended' | 'popularity' | 'price_asc' | 'duration_asc') ?? 'recommended',
  });
  return NextResponse.json({ tours });
}
