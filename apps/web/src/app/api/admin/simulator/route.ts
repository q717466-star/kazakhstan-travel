import { processTelegramUpdate, processWhatsAppWebhook } from '@kt/bots';
import {
  getBotSession,
  isDbFailureSimulated,
  listLeads,
  setPersistedSimDbFailure,
} from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireStaffApiAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const channel = (req.nextUrl.searchParams.get('channel') as 'telegram' | 'whatsapp') || 'telegram';
  const chatId = req.nextUrl.searchParams.get('chatId') || (channel === 'telegram' ? '900100' : '442079460958');
  const session = getBotSession(channel, chatId);

  return NextResponse.json({
    session,
    simulateDbFailure: isDbFailureSimulated(),
    recentLeads: listLeads({ channel, limit: 5 }),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireStaffApiAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as {
    action?: 'send' | 'toggle_db_failure';
    simulateDbFailure?: boolean;
    channel?: 'telegram' | 'whatsapp';
    chatId?: string;
    text?: string;
    callbackData?: string;
    eventId?: string;
  };

  if (body.action === 'toggle_db_failure') {
    setPersistedSimDbFailure(Boolean(body.simulateDbFailure));
    return NextResponse.json({ ok: true, simulateDbFailure: isDbFailureSimulated() });
  }

  const channel = body.channel === 'whatsapp' ? 'whatsapp' : 'telegram';
  const chatId = body.chatId || (channel === 'telegram' ? '900100' : '442079460958');
  const eventId = body.eventId || `sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  if (channel === 'telegram') {
    const updateId = Number(eventId.replace(/\D/g, '').slice(-9)) || Date.now();
    const res = await processTelegramUpdate(
      body.callbackData
        ? {
            update_id: updateId,
            callback_query: {
              id: `cb_${eventId}`,
              from: { id: Number(chatId) || 900100, first_name: 'Simulator', username: 'sim_guest' },
              message: { message_id: 1, chat: { id: Number(chatId) || 900100 } },
              data: body.callbackData,
            },
          }
        : {
            update_id: updateId,
            message: {
              message_id: 1,
              from: { id: Number(chatId) || 900100, first_name: 'Simulator', username: 'sim_guest' },
              chat: { id: Number(chatId) || 900100 },
              text: body.text || '/start',
            },
          },
      { deliverViaApi: false }
    );

    return NextResponse.json({
      ok: true,
      mode: 'simulator',
      eventId,
      replies: res.replies,
      session: getBotSession('telegram', chatId),
      recentLeads: listLeads({ channel: 'telegram', limit: 5 }),
    });
  }

  // WhatsApp Cloud API exact payload simulation
  const res = await processWhatsAppWebhook(
    {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                contacts: [{ wa_id: chatId, profile: { name: 'WhatsApp Guest' } }],
                messages: [
                  body.callbackData
                    ? {
                        from: chatId,
                        id: eventId,
                        type: 'interactive',
                        interactive: {
                          type: 'button_reply',
                          button_reply: { id: body.callbackData, title: body.text || body.callbackData },
                        },
                      }
                    : {
                        from: chatId,
                        id: eventId,
                        type: 'text',
                        text: { body: body.text || 'Hello' },
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

  return NextResponse.json({
    ok: true,
    mode: 'simulator',
    eventId,
    replies: res.outcomes[0]?.replies ?? [],
    session: getBotSession('whatsapp', chatId),
    recentLeads: listLeads({ channel: 'whatsapp', limit: 5 }),
  });
}
