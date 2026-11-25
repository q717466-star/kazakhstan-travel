import crypto from 'node:crypto';
import { getDb } from '../db/client.js';
import type { BotDraft, BotSession, BotStep, Locale } from '../types.js';

interface SessionRow {
  session_key: string;
  channel: 'telegram' | 'whatsapp';
  chat_id: string;
  locale: Locale;
  step: BotStep;
  draft_json: string;
  last_lead_number: string | null;
  updated_at: string;
}

export function makeSessionKey(channel: 'telegram' | 'whatsapp', chatId: string): string {
  return `${channel}:${chatId}`;
}

export function createEmptyDraft(): BotDraft {
  return {
    draftId: crypto.randomUUID(),
    customInterests: [],
  };
}

export function getBotSession(channel: 'telegram' | 'whatsapp', chatId: string): BotSession | null {
  const db = getDb();
  const key = makeSessionKey(channel, chatId);
  const row = db
    .prepare(`SELECT * FROM bot_sessions WHERE session_key = ?`)
    .get(key) as unknown as SessionRow | undefined;
  if (!row) return null;
  return {
    sessionKey: row.session_key,
    channel: row.channel,
    chatId: row.chat_id,
    locale: row.locale,
    step: row.step,
    draft: JSON.parse(row.draft_json) as BotDraft,
    lastLeadNumber: row.last_lead_number,
    updatedAt: row.updated_at,
  };
}

export function saveBotSession(session: BotSession): BotSession {
  const db = getDb();
  const updatedAt = new Date().toISOString();
  const next: BotSession = { ...session, updatedAt };
  db.prepare(
    `INSERT INTO bot_sessions (session_key, channel, chat_id, locale, step, draft_json, last_lead_number, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_key) DO UPDATE SET
       locale = excluded.locale,
       step = excluded.step,
       draft_json = excluded.draft_json,
       last_lead_number = excluded.last_lead_number,
       updated_at = excluded.updated_at`
  ).run(
    next.sessionKey,
    next.channel,
    next.chatId,
    next.locale,
    next.step,
    JSON.stringify(next.draft),
    next.lastLeadNumber,
    next.updatedAt
  );
  return next;
}

export function wasEventProcessed(
  channel: 'telegram' | 'whatsapp',
  externalEventId: string
): { processed: boolean; cachedReplies?: unknown } {
  if (!externalEventId) return { processed: false };
  const db = getDb();
  const row = db
    .prepare(`SELECT response_json FROM idempotency_keys WHERE channel = ? AND external_event_id = ?`)
    .get(channel, externalEventId) as { response_json: string | null } | undefined;
  if (!row) return { processed: false };
  return {
    processed: true,
    cachedReplies: row.response_json ? JSON.parse(row.response_json) : undefined,
  };
}

export function markEventProcessed(
  channel: 'telegram' | 'whatsapp',
  externalEventId: string,
  replies: unknown
): void {
  if (!externalEventId) return;
  const db = getDb();
  db.prepare(
    `INSERT OR IGNORE INTO idempotency_keys (channel, external_event_id, processed_at, response_json)
     VALUES (?, ?, ?, ?)`
  ).run(channel, externalEventId, new Date().toISOString(), JSON.stringify(replies));
}
