import { loadLocalEnvFile } from './env-loader.js';
import {
  getTelegramBotInfo,
  registerTelegramCommandsAndMenu,
  resolveBotPublicSiteUrl,
  setupTelegramWebhook,
} from './telegram-adapter.js';

async function main() {
  loadLocalEnvFile();

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error(
      [
        'Missing TELEGRAM_BOT_TOKEN.',
        '1. Open @BotFather in Telegram -> run /newbot -> copy your bot token.',
        '2. Set TELEGRAM_BOT_TOKEN in .env (for local use) or Render Environment Variables.',
        '3. Re-run: npm run bot:setup -- --url=https://your-service.onrender.com',
      ].join('\n')
    );
    process.exit(1);
  }

  const urlFlag = process.argv.find((arg) => arg.startsWith('--url='))?.slice(6);
  const positionalUrl = process.argv.slice(2).find((arg) => /^https?:\/\//i.test(arg));
  const siteUrl = resolveBotPublicSiteUrl(urlFlag || positionalUrl);
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (/^https:\/\//i.test(siteUrl)) {
    const result = await setupTelegramWebhook(token, siteUrl, webhookSecret);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) {
      process.exit(1);
    }
    return;
  }

  const cmdResult = await registerTelegramCommandsAndMenu(token);
  const info = await getTelegramBotInfo(token);
  console.log(
    JSON.stringify(
      {
        mode: 'commands_only',
        ...cmdResult,
        bot: info.bot,
        webhookInfo: info.webhookInfo,
        note: 'Pass --url=https://your-service.onrender.com once hosted to bind webhook & WebApp menu button.',
      },
      null,
      2
    )
  );
  if (!info.ok || !cmdResult.commandsOk) {
    process.exit(1);
  }
}

void main();
