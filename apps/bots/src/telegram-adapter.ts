import {
  ensureSeeded,
  handleIncomingBotEvent,
  logger,
  type BotReply,
  type IncomingBotEvent,
} from '@kt/core';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: { id: number };
    };
    data?: string;
  };
}

export interface TelegramDispatchResult {
  handled: boolean;
  deliveryMode: 'telegram_api' | 'simulator';
  chatId?: string;
  replies: BotReply[];
}

export interface TelegramBotUserInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
}

export type TelegramInlineButton =
  | { text: string; callback_data: string }
  | { text: string; url: string };

const TELEGRAM_COMMANDS_BY_LOCALE = {
  en: [
    { command: 'start', description: 'Start booking or open main menu' },
    { command: 'tours', description: 'Browse private 4x4 tours' },
    { command: 'plan', description: 'Design a custom itinerary' },
    { command: 'lang', description: 'Switch language (EN / RU / KK)' },
    { command: 'cancel', description: 'Cancel current request draft' },
  ],
  ru: [
    { command: 'start', description: 'Главное меню и бронирование' },
    { command: 'tours', description: 'Выбрать готовый 4x4 тур' },
    { command: 'plan', description: 'Индивидуальный маршрут' },
    { command: 'lang', description: 'Сменить язык (EN / RU / KK)' },
    { command: 'cancel', description: 'Отменить текущий черновик' },
  ],
  kk: [
    { command: 'start', description: 'Басты мәзір және брондау' },
    { command: 'tours', description: 'Дайын 4x4 турды таңдау' },
    { command: 'plan', description: 'Жеке бағыт құрастыру' },
    { command: 'lang', description: 'Тілді ауыстыру (EN / RU / KK)' },
    { command: 'cancel', description: 'Ағымдағы өтінімді тоқтату' },
  ],
} as const;

export function resolveBotPublicSiteUrl(overrideUrl?: string): string {
  const vercelUrl = process.env.VERCEL_URL?.trim();
  return (
    overrideUrl?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    (vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//i, '')}` : '') ||
    ''
  ).replace(/\/$/, '');
}

async function callTelegramMethod<T>(
  token: string,
  method: string,
  payload?: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = (await res.json()) as { ok?: boolean; result?: T; description?: string };
  return {
    ok: Boolean(res.ok && data.ok),
    result: data.result,
    description: data.description,
  };
}

export async function getTelegramBotInfo(token: string): Promise<{
  ok: boolean;
  bot?: TelegramBotUserInfo;
  webhookInfo?: TelegramWebhookInfo;
  error?: string;
}> {
  try {
    const [meRes, hookRes] = await Promise.all([
      callTelegramMethod<TelegramBotUserInfo>(token, 'getMe'),
      callTelegramMethod<TelegramWebhookInfo>(token, 'getWebhookInfo'),
    ]);
    if (!meRes.ok) {
      return { ok: false, error: meRes.description || 'Telegram getMe failed' };
    }
    return {
      ok: true,
      bot: meRes.result,
      webhookInfo: hookRes.ok ? hookRes.result : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error calling Telegram API',
    };
  }
}

export async function registerTelegramCommandsAndMenu(
  token: string,
  _siteUrl?: string
): Promise<{ commandsOk: boolean; menuButtonOk: boolean; error?: string }> {
  let commandsOk = true;
  let menuButtonOk = false;
  let lastError: string | undefined;

  const commandScopes = [
    { languageCode: undefined, commands: TELEGRAM_COMMANDS_BY_LOCALE.en },
    { languageCode: 'ru', commands: TELEGRAM_COMMANDS_BY_LOCALE.ru },
    { languageCode: 'kk', commands: TELEGRAM_COMMANDS_BY_LOCALE.kk },
  ];

  for (const entry of commandScopes) {
    const payload: Record<string, unknown> = { commands: entry.commands };
    if (entry.languageCode) {
      payload.language_code = entry.languageCode;
    }
    const res = await callTelegramMethod<boolean>(token, 'setMyCommands', payload);
    if (!res.ok) {
      commandsOk = false;
      lastError = res.description || 'Failed to register bot commands';
    }
  }

  const menuRes = await callTelegramMethod<boolean>(token, 'setChatMenuButton', {
    menu_button: { type: 'commands' },
  });
  menuButtonOk = menuRes.ok;
  if (!menuRes.ok && !lastError) {
    lastError = menuRes.description;
  }

  return { commandsOk, menuButtonOk, error: lastError };
}

export async function setupTelegramWebhook(
  token: string,
  siteUrl: string,
  webhookSecret?: string
): Promise<{
  ok: boolean;
  webhookUrl: string;
  bot?: TelegramBotUserInfo;
  webhookInfo?: TelegramWebhookInfo;
  commandsOk: boolean;
  menuButtonOk: boolean;
  error?: string;
}> {
  const cleanUrl = siteUrl.trim().replace(/\/$/, '');
  if (!/^https:\/\//i.test(cleanUrl)) {
    return {
      ok: false,
      webhookUrl: `${cleanUrl}/api/webhooks/telegram`,
      commandsOk: false,
      menuButtonOk: false,
      error: 'Telegram requires a public HTTPS URL for webhooks (e.g. https://your-service.onrender.com).',
    };
  }

  const webhookUrl = `${cleanUrl}/api/webhooks/telegram`;
  const { commandsOk, menuButtonOk, error: menuError } = await registerTelegramCommandsAndMenu(
    token,
    cleanUrl
  );

  const payload: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
  };
  const secret = webhookSecret?.trim();
  if (secret) {
    payload.secret_token = secret;
  }

  const setHookRes = await callTelegramMethod<boolean>(token, 'setWebhook', payload);
  const info = await getTelegramBotInfo(token);

  return {
    ok: setHookRes.ok,
    webhookUrl,
    bot: info.bot,
    webhookInfo: info.webhookInfo,
    commandsOk,
    menuButtonOk,
    error: setHookRes.ok ? menuError : setHookRes.description || 'setWebhook failed',
  };
}

export function buildTelegramInlineKeyboard(reply: BotReply) {
  if (!reply.buttons || reply.buttons.length === 0) return undefined;
  const rows: Array<Array<TelegramInlineButton>> = [];

  for (const btn of reply.buttons) {
    if (btn.url && /^https:\/\//i.test(btn.url)) {
      rows.push([{ text: btn.label.slice(0, 64), url: btn.url }]);
      continue;
    }

    // Group short language buttons side-by-side; full labels 1 per row
    if (btn.id.startsWith('lang:')) {
      const lastRow = rows[rows.length - 1];
      if (
        lastRow &&
        lastRow.every((b) => 'callback_data' in b && b.callback_data.startsWith('lang:')) &&
        lastRow.length < 3
      ) {
        lastRow.push({ text: btn.label, callback_data: btn.id });
        continue;
      }
    }
    rows.push([{ text: btn.label.slice(0, 64), callback_data: btn.id.slice(0, 64) }]);
  }

  return { inline_keyboard: rows };
}

export async function processTelegramUpdate(
  update: TelegramUpdate,
  options?: { deliverViaApi?: boolean }
): Promise<TelegramDispatchResult> {
  ensureSeeded();

  let event: IncomingBotEvent | null = null;
  let callbackQueryId: string | undefined;

  if (update.callback_query?.message?.chat) {
    const cq = update.callback_query;
    callbackQueryId = cq.id;
    event = {
      channel: 'telegram',
      chatId: String(cq.message!.chat.id),
      externalEventId: `tg_upd_${update.update_id}`,
      callbackData: cq.data ?? '',
      userHandle: cq.from.username ? `@${cq.from.username}` : `tg:${cq.from.id}`,
      userDisplayName: [cq.from.first_name, cq.from.last_name].filter(Boolean).join(' ').trim() || undefined,
    };
  } else if (update.message?.text && update.message.chat) {
    const msg = update.message;
    const rawText = msg.text!.trim();
    const startMatch = rawText.match(/^\/start(?:\s+(.+))?$/i);
    event = {
      channel: 'telegram',
      chatId: String(msg.chat.id),
      externalEventId: `tg_upd_${update.update_id}`,
      text: rawText,
      startPayload: startMatch?.[1]?.trim(),
      userHandle: msg.from?.username ? `@${msg.from.username}` : msg.from ? `tg:${msg.from.id}` : undefined,
      userDisplayName: msg.from
        ? [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ').trim() || undefined
        : undefined,
    };
  }

  if (!event) {
    return { handled: false, deliveryMode: 'simulator', replies: [] };
  }

  const replies = handleIncomingBotEvent(event);
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const shouldDeliver = Boolean(token) && options?.deliverViaApi !== false;

  if (shouldDeliver && token) {
    if (callbackQueryId) {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId }),
      }).catch((err) => {
        logger.warn('telegram_answer_callback_failed', {
          error: err instanceof Error ? err.message : 'unknown',
        });
      });
    }

    for (const reply of replies) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: event.chatId,
          text: reply.text,
          reply_markup: buildTelegramInlineKeyboard(reply),
        }),
      }).catch((err) => {
        logger.error('telegram_send_message_failed', {
          error: err instanceof Error ? err.message : 'unknown',
        });
      });
    }
  }

  return {
    handled: true,
    deliveryMode: shouldDeliver ? 'telegram_api' : 'simulator',
    chatId: event.chatId,
    replies,
  };
}
