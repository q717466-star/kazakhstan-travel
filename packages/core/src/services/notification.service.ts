import crypto from 'node:crypto';
import { getDb } from '../db/client.js';
import { logger } from '../logger.js';
import type { Lead, ManagerNotification } from '../types.js';

export async function dispatchExternalManagerAlerts(notification: ManagerNotification): Promise<void> {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const managerChatId = process.env.TELEGRAM_MANAGER_CHAT_ID?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    (vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//i, '')}` : '') ||
    'http://localhost:3000'
  ).replace(/\/$/, '');

  if (tgToken && managerChatId) {
    try {
      const text = [
        `New Kazakhstan Travel Request #${notification.requestNumber}`,
        `Channel: ${notification.channel.toUpperCase()}`,
        `Summary: ${notification.summary}`,
        `Open card: ${siteUrl}${notification.targetUrl}`,
      ].join('\n');

      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: managerChatId, text }),
      });

      const db = getDb();
      db.prepare(`UPDATE manager_notifications SET delivery_status = 'sent' WHERE id = ?`).run(notification.id);
      logger.info('manager_telegram_alert_sent', {
        notificationId: notification.id,
        requestNumber: notification.requestNumber,
      });
    } catch (err) {
      logger.warn('manager_telegram_alert_failed', {
        notificationId: notification.id,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }
}

export function createManagerNotificationRecord(lead: Lead): ManagerNotification {
  const db = getDb();
  const id = `notif_${crypto.randomUUID().slice(0, 12)}`;
  const now = new Date().toISOString();
  const targetUrl = `/admin/leads/${lead.id}`;
  const tripLabel =
    lead.requestType === 'book_tour'
      ? lead.tourTitleSnapshot || lead.tourCode || 'Tour'
      : `Custom: ${lead.customParams?.destination ?? 'Kazakhstan'}`;
  const dateLabel = lead.isFlexibleDates ? 'Flexible dates' : (lead.preferredDate ?? 'TBD');
  const summary = `${tripLabel} · ${lead.participants} pax · ${dateLabel} · ${lead.locale.toUpperCase()}`;

  const deliveryStatus: ManagerNotification['deliveryStatus'] =
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_MANAGER_CHAT_ID ? 'queued' : 'simulated';

  db.prepare(
    `INSERT INTO manager_notifications (
       id, lead_id, request_number, channel, target_url, summary, delivery_status, is_read, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
  ).run(id, lead.id, lead.requestNumber, lead.channel, targetUrl, summary, deliveryStatus, now);

  const record: ManagerNotification = {
    id,
    leadId: lead.id,
    requestNumber: lead.requestNumber,
    channel: lead.channel,
    targetUrl,
    summary,
    deliveryStatus,
    isRead: false,
    createdAt: now,
  };

  logger.info('manager_notification_created', {
    notificationId: id,
    requestNumber: lead.requestNumber,
    channel: lead.channel,
    targetUrl,
    deliveryStatus,
  });

  return record;
}
