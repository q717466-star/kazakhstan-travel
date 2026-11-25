import { getTelegramBotInfo, setupTelegramWebhook } from '@kt/bots';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function detectPublicSiteUrl(req: NextRequest, overrideUrl?: string): string {
  const explicit = overrideUrl?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL?.trim();
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    (vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//i, '')}` : '');
  if (envUrl) return envUrl.replace(/\/$/, '');

  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    return `${proto}://${forwardedHost}`.replace(/\/$/, '');
  }

  return req.nextUrl.origin.replace(/\/$/, '');
}

export async function GET(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin', 'manager']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const secretConfigured = Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim());
  const siteUrl = detectPublicSiteUrl(req);
  const webhookUrl = `${siteUrl}/api/webhooks/telegram`;

  if (!token) {
    return NextResponse.json({
      tokenConfigured: false,
      webhookSecretConfigured: secretConfigured,
      siteUrl,
      webhookUrl,
    });
  }

  const info = await getTelegramBotInfo(token);
  return NextResponse.json({
    tokenConfigured: true,
    webhookSecretConfigured: secretConfigured,
    siteUrl,
    webhookUrl,
    bot: info.bot,
    webhookInfo: info.webhookInfo,
    error: info.ok ? undefined : info.error,
  });
}

export async function POST(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: 'TELEGRAM_BOT_TOKEN is not set on the server. Add it in Render Environment Variables.',
      },
      { status: 400 }
    );
  }

  let body: { siteUrl?: string } = {};
  try {
    body = (await req.json()) as { siteUrl?: string };
  } catch {
    body = {};
  }

  const siteUrl = detectPublicSiteUrl(req, body.siteUrl);
  if (!/^https:\/\//i.test(siteUrl)) {
    return NextResponse.json(
      {
        ok: false,
        siteUrl,
        webhookUrl: `${siteUrl}/api/webhooks/telegram`,
        error:
          'Telegram webhooks require an HTTPS URL (deploy to Render first, or pass an https:// URL).',
      },
      { status: 400 }
    );
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const result = await setupTelegramWebhook(token, siteUrl, secret);

  return NextResponse.json(
    {
      ...result,
      siteUrl,
      tokenConfigured: true,
      webhookSecretConfigured: Boolean(secret),
    },
    { status: result.ok ? 200 : 502 }
  );
}
