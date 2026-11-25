import crypto from 'node:crypto';
import { getDb } from '../db/client.js';
import { logger } from '../logger.js';
import { getStaffUserById, getStaffUserWithHashByEmail, verifyPassword } from '../repositories/users.repo.js';
import type { StaffUser } from '../types.js';

const SIGNED_TOKEN_PREFIX = 'kt1';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSigningSecret(): string {
  return process.env.AUTH_SECRET?.trim() || 'dev-only-change-this-session-secret-in-production';
}

function hashSessionToken(rawToken: string): string {
  return crypto.createHmac('sha256', getSessionSigningSecret()).update(rawToken).digest('hex');
}

function createSignedStaffToken(userId: string, expiresAtMs: number): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      exp: expiresAtMs,
      jti: crypto.randomBytes(8).toString('hex'),
    }),
    'utf-8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSigningSecret()).update(payload).digest('hex');
  return `${SIGNED_TOKEN_PREFIX}.${payload}.${sig}`;
}

function verifySignedStaffToken(rawToken: string): StaffUser | null {
  const parts = rawToken.split('.');
  if (parts.length !== 3 || parts[0] !== SIGNED_TOKEN_PREFIX) return null;
  const [, payloadB64, sigHex] = parts;
  if (!payloadB64 || !sigHex || !/^[0-9a-f]+$/i.test(sigHex)) return null;

  const expectedHex = crypto
    .createHmac('sha256', getSessionSigningSecret())
    .update(payloadB64)
    .digest('hex');
  const providedBuf = Buffer.from(sigHex, 'hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as {
      uid?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.uid !== 'string' || typeof parsed.exp !== 'number') return null;
    if (parsed.exp <= Date.now()) return null;
    const user = getStaffUserById(parsed.uid);
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

export function loginStaff(
  email: string,
  password: string
): { user: StaffUser; token: string; expiresAt: string } | null {
  const found = getStaffUserWithHashByEmail(email);
  if (!found || !found.user.isActive) {
    logger.warn('staff_login_failed', { reason: 'not_found_or_inactive' });
    return null;
  }
  if (!verifyPassword(password, found.passwordHash)) {
    logger.warn('staff_login_failed', { reason: 'bad_password', userId: found.user.id });
    return null;
  }

  const now = new Date();
  const expiresAtMs = now.getTime() + SESSION_TTL_MS;
  const rawToken = createSignedStaffToken(found.user.id, expiresAtMs);
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(expiresAtMs).toISOString();

  const db = getDb();
  db.prepare(
    `INSERT INTO staff_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`
  ).run(tokenHash, found.user.id, expiresAt, now.toISOString());

  logger.info('staff_login_success', { userId: found.user.id, role: found.user.role });
  return { user: found.user, token: rawToken, expiresAt };
}

export function verifyStaffSessionToken(rawToken: string | undefined | null): StaffUser | null {
  if (!rawToken) return null;
  if (rawToken.startsWith(`${SIGNED_TOKEN_PREFIX}.`)) {
    return verifySignedStaffToken(rawToken);
  }
  const db = getDb();
  const tokenHash = hashSessionToken(rawToken);
  const row = db
    .prepare(`SELECT user_id, expires_at FROM staff_sessions WHERE token_hash = ?`)
    .get(tokenHash) as { user_id: string; expires_at: string } | undefined;
  if (!row) return null;
  if (row.expires_at < new Date().toISOString()) {
    db.prepare(`DELETE FROM staff_sessions WHERE token_hash = ?`).run(tokenHash);
    return null;
  }
  const user = getStaffUserById(row.user_id);
  if (!user || !user.isActive) return null;
  return user;
}

export function logoutStaffSession(rawToken: string | undefined | null): void {
  if (!rawToken) return;
  const db = getDb();
  db.prepare(`DELETE FROM staff_sessions WHERE token_hash = ?`).run(hashSessionToken(rawToken));
}
