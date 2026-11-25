import {
  processWhatsAppWebhook,
  verifyWhatsAppSignature,
  type WhatsAppWebhookPayload,
} from '@kt/bots';
import { ensureSeeded, logger } from '@kt/core';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'kt_whatsapp_verify_dev';

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  ensureSeeded();
  const rawBody = await req.text();
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();

  if (appSecret) {
    const sig = req.headers.get('x-hub-signature-256');
    if (!verifyWhatsAppSignature(rawBody, sig, appSecret)) {
      logger.warn('whatsapp_webhook_invalid_signature', {});
      return NextResponse.json({ error: 'Invalid Meta signature' }, { status: 401 });
    }
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const result = await processWhatsAppWebhook(payload);
  return NextResponse.json({ ok: true, ...result });
}
