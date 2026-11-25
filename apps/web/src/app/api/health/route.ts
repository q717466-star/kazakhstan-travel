import { ensureSeeded, getDb, listTours } from '@kt/core';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    ensureSeeded();
    const db = getDb();
    db.prepare('SELECT 1').get();
    const toursCount = listTours().length;
    return NextResponse.json({ status: 'ok', database: 'connected', toursCount });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err instanceof Error ? err.message : 'db_error' },
      { status: 500 }
    );
  }
}
