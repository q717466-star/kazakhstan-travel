import { processTelegramUpdate, type TelegramUpdate } from '@kt/bots';
import { ensureSeeded, logger } from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  ensureSeeded();

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expectedSecret) {
    const headerSecret = req.headers.get('x-telegram-bot-api-secret-token')?.trim();
    if (headerSecret !== expectedSecret) {
      logger.warn('telegram_webhook_unauthorized', {});
      return NextResponse.json({ error: 'Unauthorized webhook secret' }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: 'Invalid Telegram JSON payload' }, { status: 400 });
  }

  const result = await processTelegramUpdate(update);
  return NextResponse.json({ ok: true, ...result });
}
