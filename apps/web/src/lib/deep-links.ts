import type { Locale } from '@kt/core';

export function getMessengerConfig() {
  return {
    telegramUsername:
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
      process.env.TELEGRAM_BOT_USERNAME ||
      'travel32_bot',
    whatsappPhone:
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE ||
      process.env.WHATSAPP_DISPLAY_PHONE ||
      '77775259885',
  };
}

export function buildTelegramDeepLink(tourCode?: string): string {
  const { telegramUsername } = getMessengerConfig();
  const cleanUser = telegramUsername.replace(/^@/, '');
  if (tourCode) {
    return `https://t.me/${cleanUser}?start=${encodeURIComponent(`tour_${tourCode}`)}`;
  }
  return `https://t.me/${cleanUser}`;
}

export function buildWhatsAppDeepLink(
  tourCode?: string,
  tourTitle?: string,
  locale: Locale = 'en'
): string {
  const { whatsappPhone } = getMessengerConfig();
  const digits = whatsappPhone.replace(/\D/g, '');
  let message: string;
  if (locale === 'ru') {
    message = tourCode
      ? `Здравствуйте, Kazakhstan Travel! Интересует тур ${tourCode}${tourTitle ? ` (${tourTitle})` : ''}.`
      : 'Здравствуйте, Kazakhstan Travel! Хочу спланировать индивидуальное путешествие.';
  } else if (locale === 'kk') {
    message = tourCode
      ? `Сәлеметсіз бе, Kazakhstan Travel! ${tourCode}${tourTitle ? ` (${tourTitle})` : ''} туры туралы сұрағым келеді.`
      : 'Сәлеметсіз бе, Kazakhstan Travel! Жеке сапарды жоспарлағым келеді.';
  } else {
    message = tourCode
      ? `Hello Kazakhstan Travel! I would like to inquire about tour ${tourCode}${tourTitle ? ` (${tourTitle})` : ''}.`
      : 'Hello Kazakhstan Travel! I would like to plan a private expedition in Kazakhstan.';
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
