import { ensureSeeded, loginStaff } from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  ensureSeeded();
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const session = loginStaff(body.email, body.password);
  if (!session) {
    return NextResponse.json({ error: 'Invalid credentials or inactive account' }, { status: 401 });
  }

  const isHttps =
    req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

  const res = NextResponse.json({ ok: true, user: session.user });
  res.cookies.set(STAFF_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
