import { getDb } from '../db/client.js';
import type {
  Channel,
  ContactMethod,
  CustomTripParams,
  Lead,
  LeadEvent,
  LeadStatus,
  Locale,
  ManagerNotification,
  RequestType,
} from '../types.js';

interface LeadRow {
  id: string;
  request_number: string;
  channel: Channel;
  locale: Locale;
  request_type: RequestType;
  tour_code: string | null;
  tour_title_snapshot: string | null;
  custom_params_json: string | null;
  preferred_date: string | null;
  is_flexible_dates: number;
  participants: number;
  customer_name: string;
  contact_method: ContactMethod;
  contact_value: string;
  country: string | null;
  notes: string | null;
  consent_given: number;
  consent_at: string;
  status: LeadStatus;
  external_chat_id: string | null;
  external_user_handle: string | null;
  idempotency_key: string | null;
  assigned_manager_id: string | null;
  created_at: string;
  updated_at: string;
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    requestNumber: row.request_number,
    channel: row.channel,
    locale: row.locale,
    requestType: row.request_type,
    tourCode: row.tour_code,
    tourTitleSnapshot: row.tour_title_snapshot,
    customParams: row.custom_params_json
      ? (JSON.parse(row.custom_params_json) as CustomTripParams)
      : null,
    preferredDate: row.preferred_date,
    isFlexibleDates: row.is_flexible_dates === 1,
    participants: row.participants,
    customerName: row.customer_name,
    contactMethod: row.contact_method,
    contactValue: row.contact_value,
    country: row.country,
    notes: row.notes,
    consentGiven: row.consent_given === 1,
    consentAt: row.consent_at,
    status: row.status,
    externalChatId: row.external_chat_id,
    externalUserHandle: row.external_user_handle,
    idempotencyKey: row.idempotency_key,
    assignedManagerId: row.assigned_manager_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface LeadListFilters {
  channel?: Channel | 'all';
  status?: LeadStatus | 'all';
  search?: string;
  limit?: number;
}

export function listLeads(filters: LeadListFilters = {}): Lead[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.channel && filters.channel !== 'all') {
    clauses.push('channel = ?');
    params.push(filters.channel);
  }
  if (filters.status && filters.status !== 'all') {
    clauses.push('status = ?');
    params.push(filters.status);
  }
  if (filters.search && filters.search.trim()) {
    const pattern = `%${filters.search.trim().toLowerCase()}%`;
    clauses.push(
      '(lower(request_number) LIKE ? OR lower(customer_name) LIKE ? OR lower(coalesce(tour_code, \'\')) LIKE ? OR lower(contact_value) LIKE ?)'
    );
    params.push(pattern, pattern, pattern, pattern);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';
  const rows = db
    .prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC ${limit}`)
    .all(...params) as unknown as LeadRow[];

  return rows.map(mapLead);
}

export function getLeadById(id: string): Lead | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id) as unknown as LeadRow | undefined;
  return row ? mapLead(row) : null;
}

export function getLeadByRequestNumber(requestNumber: string): Lead | null {
  const db = getDb();
  const normalized = requestNumber.replace(/^#/, '').toUpperCase();
  const row = db
    .prepare(`SELECT * FROM leads WHERE upper(request_number) = ?`)
    .get(normalized) as unknown as LeadRow | undefined;
  return row ? mapLead(row) : null;
}

export function getLeadByIdempotencyKey(key: string): Lead | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM leads WHERE idempotency_key = ?`)
    .get(key) as unknown as LeadRow | undefined;
  return row ? mapLead(row) : null;
}

export function getLeadEvents(leadId: string): LeadEvent[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM lead_events WHERE lead_id = ? ORDER BY created_at ASC`)
    .all(leadId) as unknown as Array<{
    id: string;
    lead_id: string;
    actor: string;
    event_type: LeadEvent['eventType'];
    from_status: LeadStatus | null;
    to_status: LeadStatus | null;
    message: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    leadId: r.lead_id,
    actor: r.actor,
    eventType: r.event_type,
    fromStatus: r.from_status,
    toStatus: r.to_status,
    message: r.message,
    createdAt: r.created_at,
  }));
}

export function listManagerNotifications(limit = 30): ManagerNotification[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM manager_notifications ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as unknown as Array<{
    id: string;
    lead_id: string;
    request_number: string;
    channel: Channel;
    target_url: string;
    summary: string;
    delivery_status: ManagerNotification['deliveryStatus'];
    is_read: number;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    leadId: r.lead_id,
    requestNumber: r.request_number,
    channel: r.channel,
    targetUrl: r.target_url,
    summary: r.summary,
    deliveryStatus: r.delivery_status,
    isRead: r.is_read === 1,
    createdAt: r.created_at,
  }));
}

export function markNotificationRead(id: string): void {
  const db = getDb();
  db.prepare(`UPDATE manager_notifications SET is_read = 1 WHERE id = ?`).run(id);
}

export function markAllNotificationsRead(): void {
  const db = getDb();
  db.prepare(`UPDATE manager_notifications SET is_read = 1`).run();
}
