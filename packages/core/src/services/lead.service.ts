import crypto from 'node:crypto';
import { isDbFailureSimulated, runInTransaction } from '../db/client.js';
import { logger } from '../logger.js';
import {
  getLeadById,
  getLeadByIdempotencyKey,
} from '../repositories/leads.repo.js';
import { getTourByCode } from '../repositories/tours.repo.js';
import type { Lead, LeadStatus } from '../types.js';
import { createLeadSchema, type CreateLeadInput } from '../validation.js';
import {
  createManagerNotificationRecord,
  dispatchExternalManagerAlerts,
} from './notification.service.js';

export class LeadPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadPersistenceError';
  }
}

export class LeadValidationError extends Error {
  public issues: string[];
  constructor(issues: string[]) {
    super(issues.join('; '));
    this.name = 'LeadValidationError';
    this.issues = issues;
  }
}

export interface CreateLeadResult {
  lead: Lead;
  deduplicated: boolean;
}

export function createLead(rawInput: CreateLeadInput, actor = 'system'): CreateLeadResult {
  const parsed = createLeadSchema.safeParse(rawInput);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`);
    throw new LeadValidationError(issues);
  }
  const input = parsed.data;

  if (isDbFailureSimulated()) {
    logger.error('lead_create_simulated_failure', {
      channel: input.channel,
      requestType: input.requestType,
    });
    throw new LeadPersistenceError('Database persistence temporarily unavailable');
  }

  if (input.idempotencyKey) {
    const existing = getLeadByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      logger.info('lead_create_deduplicated', {
        requestNumber: existing.requestNumber,
        channel: existing.channel,
      });
      return { lead: existing, deduplicated: true };
    }
  }

  let resolvedTourTitle = input.tourTitleSnapshot ?? null;
  let resolvedTourCode = input.tourCode ? input.tourCode.toUpperCase() : null;
  if (input.requestType === 'book_tour' && resolvedTourCode) {
    const tour = getTourByCode(resolvedTourCode);
    if (!tour) {
      throw new LeadValidationError([`tourCode: Unknown tour code "${resolvedTourCode}"`]);
    }
    resolvedTourCode = tour.code;
    if (!resolvedTourTitle) {
      resolvedTourTitle = tour.title[input.locale] || tour.title.en;
    }
  }

  const createdLead = runInTransaction((db) => {
    const seqRow = db.prepare(`SELECT next_val FROM lead_sequence WHERE id = 1`).get() as
      | { next_val: number }
      | undefined;
    const nextNum = seqRow?.next_val ?? 1;
    db.prepare(`UPDATE lead_sequence SET next_val = ? WHERE id = 1`).run(nextNum + 1);

    const requestNumber = `KT-${String(nextNum).padStart(5, '0')}`;
    const id = `lead_${crypto.randomUUID().slice(0, 12)}`;
    const now = new Date().toISOString();
    const consentAt = input.consentAt ?? now;

    db.prepare(
      `INSERT INTO leads (
         id, request_number, channel, locale, request_type, tour_code, tour_title_snapshot,
         custom_params_json, preferred_date, is_flexible_dates, participants,
         customer_name, contact_method, contact_value, country, notes,
         consent_given, consent_at, status, external_chat_id, external_user_handle,
         idempotency_key, assigned_manager_id, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'new', ?, ?, ?, NULL, ?, ?)`
    ).run(
      id,
      requestNumber,
      input.channel,
      input.locale,
      input.requestType,
      resolvedTourCode,
      resolvedTourTitle,
      input.customParams ? JSON.stringify(input.customParams) : null,
      input.isFlexibleDates ? null : input.preferredDate ?? null,
      input.isFlexibleDates ? 1 : 0,
      input.participants,
      input.customerName,
      input.contactMethod,
      input.contactValue,
      input.country ?? null,
      input.notes ?? null,
      consentAt,
      input.externalChatId ?? null,
      input.externalUserHandle ?? null,
      input.idempotencyKey ?? null,
      now,
      now
    );

    db.prepare(
      `INSERT INTO lead_events (id, lead_id, actor, event_type, from_status, to_status, message, created_at)
       VALUES (?, ?, ?, 'created', NULL, 'new', ?, ?)`
    ).run(
      `evt_${crypto.randomUUID().slice(0, 10)}`,
      id,
      actor,
      `Lead created via ${input.channel} (${input.locale})`,
      now
    );

    const lead = getLeadById(id)!;
    const notif = createManagerNotificationRecord(lead);
    db.prepare(
      `INSERT INTO lead_events (id, lead_id, actor, event_type, from_status, to_status, message, created_at)
       VALUES (?, ?, 'system', 'notification_sent', 'new', 'new', ?, ?)`
    ).run(
      `evt_${crypto.randomUUID().slice(0, 10)}`,
      id,
      `Manager alert generated (${notif.deliveryStatus}) -> ${notif.targetUrl}`,
      now
    );

    return { lead, notif };
  });

  logger.info('lead_created', {
    id: createdLead.lead.id,
    requestNumber: createdLead.lead.requestNumber,
    channel: createdLead.lead.channel,
    requestType: createdLead.lead.requestType,
    locale: createdLead.lead.locale,
  });

  // Fire and forget external notification alert (non-blocking)
  void dispatchExternalManagerAlerts(createdLead.notif);

  return { lead: createdLead.lead, deduplicated: false };
}

export const ALLOWED_STATUSES: LeadStatus[] = [
  'new',
  'in_progress',
  'proposal_sent',
  'awaiting_payment',
  'confirmed',
  'cancelled',
];

export function updateLeadStatus(
  leadId: string,
  nextStatus: LeadStatus,
  actor: string,
  note?: string
): Lead | null {
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw new LeadValidationError([`Invalid status: ${nextStatus}`]);
  }
  const existing = getLeadById(leadId);
  if (!existing) return null;

  const now = new Date().toISOString();
  runInTransaction((db) => {
    db.prepare(`UPDATE leads SET status = ?, updated_at = ? WHERE id = ?`).run(nextStatus, now, leadId);
    const msg = note?.trim()
      ? `Status changed from ${existing.status} to ${nextStatus}: ${note.trim()}`
      : `Status changed from ${existing.status} to ${nextStatus}`;
    db.prepare(
      `INSERT INTO lead_events (id, lead_id, actor, event_type, from_status, to_status, message, created_at)
       VALUES (?, ?, ?, 'status_changed', ?, ?, ?, ?)`
    ).run(
      `evt_${crypto.randomUUID().slice(0, 10)}`,
      leadId,
      actor,
      existing.status,
      nextStatus,
      msg,
      now
    );
  });

  logger.info('lead_status_updated', {
    leadId,
    requestNumber: existing.requestNumber,
    from: existing.status,
    to: nextStatus,
  });

  return getLeadById(leadId);
}

export function addLeadNote(leadId: string, actor: string, message: string): Lead | null {
  const existing = getLeadById(leadId);
  if (!existing) return null;
  const trimmed = message.trim();
  if (!trimmed) throw new LeadValidationError(['Note cannot be empty']);

  const now = new Date().toISOString();
  runInTransaction((db) => {
    db.prepare(`UPDATE leads SET updated_at = ? WHERE id = ?`).run(now, leadId);
    db.prepare(
      `INSERT INTO lead_events (id, lead_id, actor, event_type, from_status, to_status, message, created_at)
       VALUES (?, ?, ?, 'note_added', ?, ?, ?, ?)`
    ).run(
      `evt_${crypto.randomUUID().slice(0, 10)}`,
      leadId,
      actor,
      existing.status,
      existing.status,
      trimmed,
      now
    );
  });

  return getLeadById(leadId);
}
