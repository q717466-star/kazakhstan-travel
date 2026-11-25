import crypto from 'node:crypto';
import {
  ensureSeeded,
  handleIncomingBotEvent,
  logger,
  type BotReply,
  type IncomingBotEvent,
} from '@kt/core';

export interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          phone_number_id?: string;
          display_phone_number?: string;
        };
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp?: string;
          type: 'text' | 'interactive' | string;
          text?: { body: string };
          interactive?: {
            type: string;
            button_reply?: { id: string; title: string };
            list_reply?: { id: string; title: string };
          };
        }>;
      };
    }>;
  }>;
}

export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;
  if (!signatureHeader.startsWith('sha256=')) return false;

  const expectedHex = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const actualHex = signatureHeader.slice(7).trim();
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  const actualBuf = Buffer.from(actualHex, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function buildWhatsAppOutgoingMessage(to: string, reply: BotReply): Record<string, unknown> {
  const buttons = reply.buttons ?? [];
  if (buttons.length >= 1 && buttons.length <= 3) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: reply.text.slice(0, 1024) },
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: {
              id: b.id.slice(0, 256),
              title: b.label.slice(0, 20),
            },
          })),
        },
      },
    };
  }

  if (buttons.length >= 4 && buttons.length <= 10) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: reply.text.slice(0, 1024) },
        action: {
          button: 'Select option',
          sections: [
            {
              title: 'Options',
              rows: buttons.map((b) => ({
                id: b.id.slice(0, 200),
                title: b.label.slice(0, 24),
              })),
            },
          ],
        },
      },
    };
  }

  const numbered =
    buttons.length > 0
      ? `\n\n${buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n')}`
      : '';

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: `${reply.text}${numbered}`.slice(0, 4096) },
  };
}

export interface WhatsAppDispatchResult {
  handled: boolean;
  deliveryMode: 'whatsapp_cloud_api' | 'simulator';
  outcomes: Array<{
    chatId: string;
    messageId: string;
    replies: BotReply[];
  }>;
}

export async function processWhatsAppWebhook(
  payload: WhatsAppWebhookPayload,
  options?: { deliverViaApi?: boolean }
): Promise<WhatsAppDispatchResult> {
  ensureSeeded();

  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const shouldDeliver = Boolean(token && phoneId) && options?.deliverViaApi !== false;
  const outcomes: WhatsAppDispatchResult['outcomes'] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue;

      const contactMap = new Map<string, string>();
      for (const c of value.contacts ?? []) {
        if (c.wa_id && c.profile?.name) {
          contactMap.set(c.wa_id, c.profile.name);
        }
      }

      for (const msg of value.messages) {
        const waId = msg.from;
        const normalizedPhone = waId.startsWith('+') ? waId : `+${waId}`;

        const callbackData =
          msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id || undefined;
        const text =
          msg.text?.body ||
          msg.interactive?.button_reply?.title ||
          msg.interactive?.list_reply?.title ||
          undefined;

        const event: IncomingBotEvent = {
          channel: 'whatsapp',
          chatId: waId,
          externalEventId: msg.id,
          text,
          callbackData,
          userHandle: normalizedPhone,
          userDisplayName: contactMap.get(waId),
        };

        const replies = handleIncomingBotEvent(event);
        outcomes.push({ chatId: waId, messageId: msg.id, replies });

        if (shouldDeliver && token && phoneId) {
          for (const reply of replies) {
            const body = buildWhatsAppOutgoingMessage(waId, reply);
            await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }).catch((err) => {
              logger.error('whatsapp_cloud_send_failed', {
                error: err instanceof Error ? err.message : 'unknown',
              });
            });
          }
        }
      }
    }
  }

  return {
    handled: outcomes.length > 0,
    deliveryMode: shouldDeliver ? 'whatsapp_cloud_api' : 'simulator',
    outcomes,
  };
}
