import {
  createLead,
  ensureSeeded,
  LeadPersistenceError,
  LeadValidationError,
} from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';

const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipBuckets.get(ip);
  if (!entry || entry.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  ensureSeeded();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  // Honeypot anti-spam trap
  if (typeof body.website_hp === 'string' && body.website_hp.trim().length > 0) {
    return NextResponse.json({ ok: false, error: 'Spam detected' }, { status: 400 });
  }

  try {
    const result = createLead(body as never, 'website-form');
    return NextResponse.json(
      {
        ok: true,
        id: result.lead.id,
        requestNumber: result.lead.requestNumber,
        deduplicated: result.deduplicated,
      },
      { status: result.deduplicated ? 200 : 201 }
    );
  } catch (err) {
    if (err instanceof LeadValidationError) {
      return NextResponse.json(
        { ok: false, error: err.issues[0] || err.message, issues: err.issues },
        { status: 400 }
      );
    }
    if (err instanceof LeadPersistenceError) {
      return NextResponse.json(
        { ok: false, error: 'Temporary storage error. Please try submitting again.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}
