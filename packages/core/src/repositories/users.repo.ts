import crypto from 'node:crypto';
import { getDb } from '../db/client.js';
import type { StaffUser, UserRole } from '../types.js';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

interface StaffUserRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  password_hash: string;
  is_active: number;
  created_at: string;
}

function mapUser(row: StaffUserRow): StaffUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export function listStaffUsers(): StaffUser[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT id, email, full_name, role, password_hash, is_active, created_at FROM staff_users ORDER BY created_at ASC`)
    .all() as unknown as StaffUserRow[];
  return rows.map(mapUser);
}

export function getStaffUserWithHashByEmail(email: string): { user: StaffUser; passwordHash: string } | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, email, full_name, role, password_hash, is_active, created_at FROM staff_users WHERE lower(email) = lower(?)`)
    .get(email.trim()) as unknown as StaffUserRow | undefined;
  if (!row) return null;
  return { user: mapUser(row), passwordHash: row.password_hash };
}

export function getStaffUserById(id: string): StaffUser | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, email, full_name, role, password_hash, is_active, created_at FROM staff_users WHERE id = ?`)
    .get(id) as unknown as StaffUserRow | undefined;
  return row ? mapUser(row) : null;
}

export function createStaffUser(input: {
  id?: string;
  email: string;
  fullName: string;
  role: UserRole;
  password: string;
  isActive?: boolean;
}): StaffUser {
  const db = getDb();
  const id = input.id ?? crypto.randomUUID();
  const now = new Date().toISOString();
  const hash = hashPassword(input.password);
  db.prepare(
    `INSERT INTO staff_users (id, email, full_name, role, password_hash, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, input.email.trim().toLowerCase(), input.fullName.trim(), input.role, hash, input.isActive === false ? 0 : 1, now);

  return getStaffUserById(id)!;
}

export function updateStaffUser(
  id: string,
  patch: { fullName?: string; role?: UserRole; isActive?: boolean; password?: string }
): StaffUser | null {
  const existing = getStaffUserById(id);
  if (!existing) return null;
  const db = getDb();
  if (patch.password) {
    db.prepare(`UPDATE staff_users SET password_hash = ? WHERE id = ?`).run(hashPassword(patch.password), id);
  }
  db.prepare(
    `UPDATE staff_users SET full_name = ?, role = ?, is_active = ? WHERE id = ?`
  ).run(
    patch.fullName?.trim() ?? existing.fullName,
    patch.role ?? existing.role,
    patch.isActive === undefined ? (existing.isActive ? 1 : 0) : patch.isActive ? 1 : 0,
    id
  );
  return getStaffUserById(id);
}
