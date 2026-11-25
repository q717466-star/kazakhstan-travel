import { ensureSeeded, logger } from '@kt/core';
import { loadLocalEnvFile } from './env-loader.js';
import {
  getTelegramBotInfo,
  processTelegramUpdate,
  registerTelegramCommandsAndMenu,
  resolveBotPublicSiteUrl,
  type TelegramUpdate,
} from './telegram-adapter.js';

async function pollLoop() {
  loadLocalEnvFile();

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error(
      'Missing TELEGRAM_BOT_TOKEN in environment. Copy .env.example to .env and configure TELEGRAM_BOT_TOKEN.'
    );
    process.exit(1);
  }

  ensureSeeded();

  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`).catch(
    () => undefined
  );
  await registerTelegramCommandsAndMenu(token, resolveBotPublicSiteUrl()).catch(() => undefined);
  const info = await getTelegramBotInfo(token);
  if (info.bot?.username) {
    console.log(`Telegram bot ready (long polling): https://t.me/${info.bot.username}`);
  }

  let offset = 0;
  logger.info('telegram_polling_started', { botUsername: info.bot?.username ?? null });

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?timeout=25&offset=${offset}`
      );
      if (!res.ok) {
        logger.warn('telegram_poll_http_error', { status: res.status });
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      const data = (await res.json()) as { ok: boolean; result?: TelegramUpdate[] };
      if (data.ok && Array.isArray(data.result)) {
        for (const upd of data.result) {
          offset = Math.max(offset, upd.update_id + 1);
          await processTelegramUpdate(upd, { deliverViaApi: true });
        }
      }
    } catch (err) {
      logger.error('telegram_poll_exception', {
        error: err instanceof Error ? err.message : 'unknown',
      });
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

void pollLoop();
