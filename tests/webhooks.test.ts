import crypto from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { ensureSeeded, resetDbForTests } from '@kt/core';
import {
  buildTelegramInlineKeyboard,
  processTelegramUpdate,
  processWhatsAppWebhook,
  verifyWhatsAppSignature,
} from '@kt/bots';

describe('Telegram & WhatsApp Webhook Adapters', () => {
  beforeEach(() => {
    process.env.KT_DB_PATH = ':memory:';
    process.env.KT_LOG_SILENT = '1';
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    resetDbForTests();
    ensureSeeded();
  });

  it('verifies Meta WhatsApp Cloud API HMAC-SHA256 signatures accurately', () => {
    const secret = 'test_app_secret_123';
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

    expect(verifyWhatsAppSignature(body, sig, secret)).toBe(true);
    expect(verifyWhatsAppSignature(body + ' ', sig, secret)).toBe(false);
    expect(verifyWhatsAppSignature(body, 'sha256=deadbeef', secret)).toBe(false);
    expect(verifyWhatsAppSignature(body, null, secret)).toBe(false);
  });

  it('dispatches Telegram Update deep-link to shared bot engine', async () => {
    const res = await processTelegramUpdate(
      {
        update_id: 10001,
        message: {
          message_id: 1,
          chat: { id: 55501 },
          from: { id: 55501, first_name: 'Elena', username: 'elena_kz' },
          text: '/start tour_ALTYN-EMEL-2D',
        },
      },
      { deliverViaApi: false }
    );
    expect(res.handled).toBe(true);
    expect(res.replies[0].text).toContain('ALTYN-EMEL-2D');
  });

  it('dispatches WhatsApp Cloud API webhook payload with prefilled tour code', async () => {
    const res = await processWhatsAppWebhook(
      {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  contacts: [{ wa_id: '14155550199', profile: { name: 'Noah' } }],
                  messages: [
                    {
                      from: '14155550199',
                      id: 'wamid.HBgLMTE=',
                      type: 'text',
                      text: { body: 'Hello! I want to inquire about tour CHARYN-KOLSAI-2D' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      { deliverViaApi: false }
    );

    expect(res.handled).toBe(true);
    expect(res.outcomes[0].replies[0].text).toContain('CHARYN-KOLSAI-2D');
  });

  it('emits url inline buttons only for HTTPS links and falls back safely for localhost URLs', () => {
    const kb = buildTelegramInlineKeyboard({
      text: 'Choose edition',
      buttons: [
        { id: 'site:aero', label: '06 · Aero', url: 'https://kz.onrender.com/ru?design=aero' },
        { id: 'site:local', label: 'Local', url: 'http://localhost:3000/ru?design=aero' },
        { id: 'type:book', label: 'Book a Tour' },
      ],
    });

    expect(kb?.inline_keyboard[0][0]).toEqual({
      text: '06 · Aero',
      url: 'https://kz.onrender.com/ru?design=aero',
    });
    expect(kb?.inline_keyboard[1][0]).toEqual({
      text: 'Local',
      callback_data: 'site:local',
    });
    expect(kb?.inline_keyboard[2][0]).toEqual({
      text: 'Book a Tour',
      callback_data: 'type:book',
    });
  });
});
