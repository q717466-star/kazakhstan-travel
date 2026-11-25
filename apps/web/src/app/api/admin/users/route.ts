import { createStaffUser, listStaffUsers, updateStaffUser, type UserRole } from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await requireStaffApiAuth(['admin']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ users: listStaffUsers() });
}

export async function POST(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as {
    email?: string;
    fullName?: string;
    role?: UserRole;
    password?: string;
  };

  if (!body.email || !body.fullName || !body.role || !body.password || body.password.length < 6) {
    return NextResponse.json(
      { error: 'email, fullName, role, and password (min 6 chars) are required' },
      { status: 400 }
    );
  }

  const created = createStaffUser({
    email: body.email,
    fullName: body.fullName,
    role: body.role,
    password: body.password,
  });

  return NextResponse.json({ user: created }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as {
    id?: string;
    role?: UserRole;
    isActive?: boolean;
    fullName?: string;
  };
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updated = updateStaffUser(body.id, {
    role: body.role,
    isActive: body.isActive,
    fullName: body.fullName,
  });
  return NextResponse.json({ user: updated });
}
