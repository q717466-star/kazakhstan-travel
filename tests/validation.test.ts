import { describe, expect, it } from 'vitest';
import {
  createLeadSchema,
  isValidEmail,
  isValidInternationalPhone,
  isValidIsoDateNotPast,
  isValidParticipants,
  redactSensitive,
  resolveDbPath,
} from '@kt/core';

describe('Validation & Privacy Guards', () => {
  it('validates YYYY-MM-DD dates and rejects malformed or past dates', () => {
    expect(isValidIsoDateNotPast('2027-06-15', '2026-11-21')).toEqual({ valid: true });
    expect(isValidIsoDateNotPast('2026-11-21', '2026-11-21')).toEqual({ valid: true });
    expect(isValidIsoDateNotPast('2026-11-20', '2026-11-21')).toEqual({
      valid: false,
      reason: 'past',
    });
    expect(isValidIsoDateNotPast('2027-02-30', '2026-11-21')).toEqual({
      valid: false,
      reason: 'format',
    });
    expect(isValidIsoDateNotPast('15.06.2027', '2026-11-21')).toEqual({
      valid: false,
      reason: 'format',
    });
  });

  it('validates integer participant counts > 0', () => {
    expect(isValidParticipants(1)).toBe(true);
    expect(isValidParticipants(6)).toBe(true);
    expect(isValidParticipants('4')).toBe(true);
    expect(isValidParticipants(0)).toBe(false);
    expect(isValidParticipants(-3)).toBe(false);
    expect(isValidParticipants(2.5)).toBe(false);
    expect(isValidParticipants('two')).toBe(false);
    expect(isValidParticipants(99)).toBe(false);
  });

  it('accepts international phone numbers from any country and rejects invalid input', () => {
    expect(isValidInternationalPhone('+44 20 7946 0958')).toBe(true);
    expect(isValidInternationalPhone('+1-415-555-0199')).toBe(true);
    expect(isValidInternationalPhone('+49 30 901820')).toBe(true);
    expect(isValidInternationalPhone('+81 3 5555 0199')).toBe(true);
    expect(isValidInternationalPhone('+7 (777) 525-98-85')).toBe(true);
    expect(isValidInternationalPhone('12345')).toBe(false);
    expect(isValidInternationalPhone('not-a-phone')).toBe(false);
  });

  it('validates email format', () => {
    expect(isValidEmail('traveler@example.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
    expect(isValidEmail('bad@domain')).toBe(false);
  });

  it('requires consentGiven=true in createLeadSchema', () => {
    const res = createLeadSchema.safeParse({
      channel: 'website',
      locale: 'en',
      requestType: 'book_tour',
      tourCode: 'CHARYN-1D',
      preferredDate: '2027-07-01',
      isFlexibleDates: false,
      participants: 2,
      customerName: 'Elena',
      contactMethod: 'email',
      contactValue: 'elena@example.com',
      consentGiven: false,
    });
    expect(res.success).toBe(false);
  });

  it('scrubs PII, emails, phones, and secrets in logs', () => {
    const cleaned = redactSensitive({
      token: '123456:ABC-SECRET',
      contactValue: '+44 20 7946 0958',
      note: 'Reach me at guest@example.com or +1 415 555 0199',
      safeField: 'KT-00001',
    });
    expect(cleaned.token).toBe('[REDACTED]');
    expect(cleaned.contactValue).toBe('[REDACTED]');
    expect(cleaned.note).not.toContain('guest@example.com');
    expect(cleaned.note).not.toContain('555');
    expect(cleaned.safeField).toBe('KT-00001');
  });

  it('uses writable /tmp SQLite path on Vercel serverless runtime when KT_DB_PATH is unset', () => {
    const prevDbPath = process.env.KT_DB_PATH;
    const prevVercel = process.env.VERCEL;
    try {
      delete process.env.KT_DB_PATH;
      process.env.VERCEL = '1';
      expect(resolveDbPath()).toBe('/tmp/kazakhstan-travel.db');
    } finally {
      if (prevDbPath === undefined) delete process.env.KT_DB_PATH;
      else process.env.KT_DB_PATH = prevDbPath;
      if (prevVercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = prevVercel;
    }
  });
});
