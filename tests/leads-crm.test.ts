import { beforeEach, describe, expect, it } from 'vitest';
import {
  createLead,
  ensureSeeded,
  getDb,
  getLeadEvents,
  listLeads,
  listManagerNotifications,
  loginStaff,
  resetDbForTests,
  updateLeadStatus,
  verifyStaffSessionToken,
} from '@kt/core';

describe('Unified CRM Leads & Notifications', () => {
  beforeEach(() => {
    process.env.KT_DB_PATH = ':memory:';
    process.env.KT_LOG_SILENT = '1';
    resetDbForTests();
    ensureSeeded();
  });

  it('stores leads from website, telegram, and whatsapp in one registry with sequential numbers and manager notifications', () => {
    const webRes = createLead({
      channel: 'website',
      locale: 'en',
      requestType: 'book_tour',
      tourCode: 'CHARYN-1D',
      preferredDate: '2027-06-20',
      isFlexibleDates: false,
      participants: 2,
      customerName: 'Sophie Laurent',
      contactMethod: 'email',
      contactValue: 'sophie@example.org',
      consentGiven: true,
      idempotencyKey: 'web-test-1',
    });

    const tgRes = createLead({
      channel: 'telegram',
      locale: 'ru',
      requestType: 'plan_trip',
      customParams: {
        destination: 'Altyn-Emel',
        durationLabel: '3 days',
        interests: ['photography', 'offroad'],
      },
      preferredDate: null,
      isFlexibleDates: true,
      participants: 4,
      customerName: 'Иван Петров',
      contactMethod: 'chat',
      contactValue: '@ivan_p',
      consentGiven: true,
      idempotencyKey: 'tg-test-1',
    });

    expect(webRes.lead.requestNumber).toBe('KT-00004');
    expect(tgRes.lead.requestNumber).toBe('KT-00005');

    const all = listLeads();
    expect(all.some((l) => l.channel === 'website')).toBe(true);
    expect(all.some((l) => l.channel === 'telegram')).toBe(true);
    expect(all.some((l) => l.channel === 'whatsapp')).toBe(true);

    const onlyWeb = listLeads({ channel: 'website' });
    expect(onlyWeb.every((l) => l.channel === 'website')).toBe(true);

    const notifs = listManagerNotifications();
    expect(notifs.some((n) => n.requestNumber === 'KT-00004' && n.targetUrl === `/admin/leads/${webRes.lead.id}`)).toBe(true);

    // Status transitions across CRM states
    const updated1 = updateLeadStatus(webRes.lead.id, 'in_progress', 'manager@test', 'Reviewed vehicle availability');
    expect(updated1?.status).toBe('in_progress');
    const updated2 = updateLeadStatus(webRes.lead.id, 'confirmed', 'manager@test');
    expect(updated2?.status).toBe('confirmed');

    const events = getLeadEvents(webRes.lead.id);
    expect(events.length).toBeGreaterThanOrEqual(4);
  });

  it('prevents duplicate creation when same idempotencyKey is submitted twice', () => {
    const first = createLead({
      channel: 'website',
      locale: 'en',
      requestType: 'book_tour',
      tourCode: 'BAO-1D',
      preferredDate: '2027-07-11',
      isFlexibleDates: false,
      participants: 2,
      customerName: 'Kenji Sato',
      contactMethod: 'phone',
      contactValue: '+81 90 1234 5678',
      consentGiven: true,
      idempotencyKey: 'same-key-123',
    });
    const second = createLead({
      channel: 'website',
      locale: 'en',
      requestType: 'book_tour',
      tourCode: 'BAO-1D',
      preferredDate: '2027-07-11',
      isFlexibleDates: false,
      participants: 2,
      customerName: 'Kenji Sato',
      contactMethod: 'phone',
      contactValue: '+81 90 1234 5678',
      consentGiven: true,
      idempotencyKey: 'same-key-123',
    });

    expect(first.deduplicated).toBe(false);
    expect(second.deduplicated).toBe(true);
    expect(second.lead.requestNumber).toBe(first.lead.requestNumber);
  });

  it('verifies signed kt1 staff session tokens statelessly across serverless instances', () => {
    const auth = loginStaff('admin@kazakhstan-travel.local', 'Admin!2026');
    expect(auth).not.toBeNull();
    expect(auth?.token.startsWith('kt1.')).toBe(true);

    // Simulate a separate serverless instance without local staff_sessions row
    getDb().prepare(`DELETE FROM staff_sessions`).run();
    const verified = verifyStaffSessionToken(auth?.token);
    expect(verified?.email).toBe('admin@kazakhstan-travel.local');
    expect(verified?.role).toBe('admin');

    expect(verifyStaffSessionToken(`${auth?.token}tampered`)).toBeNull();
  });
});
