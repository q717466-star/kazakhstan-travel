import { beforeEach, describe, expect, it } from 'vitest';
import {
  ensureSeeded,
  getBotSession,
  handleIncomingBotEvent,
  listLeads,
  resetDbForTests,
  setSimulateDbFailureForTests,
} from '@kt/core';

describe('Shared Omnichannel Bot Engine', () => {
  beforeEach(() => {
    process.env.KT_DB_PATH = ':memory:';
    process.env.KT_LOG_SILENT = '1';
    resetDbForTests();
    ensureSeeded();
  });

  it('starts in English by default and switches cleanly between EN, RU, and KK without mixing', () => {
    const r1 = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: 'chat-lang',
      externalEventId: 'e1',
      text: '/start',
    });
    expect(r1[0].text).toContain('Welcome to Kazakhstan Travel');

    const rRu = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: 'chat-lang',
      externalEventId: 'e2',
      callbackData: 'lang:ru',
    });
    expect(rRu[0].text).toContain('Выбран русский язык');
    expect(rRu[0].text).not.toContain('How would you like to begin');

    const rKk = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: 'chat-lang',
      externalEventId: 'e3',
      callbackData: 'lang:kk',
    });
    expect(rKk[0].text).toContain('Қазақ тілі таңдалды');
    expect(rKk[0].text).not.toContain('Какой вариант поездки');
  });

  it('handles Telegram tour deep-link, skips redundant phone prompt for current chat, and creates unified lead', () => {
    const startCount = listLeads().length;

    const r1 = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-1',
      text: '/start tour_CHARYN-1D',
      startPayload: 'tour_CHARYN-1D',
      userHandle: '@alex_traveler',
    });
    expect(r1[0].text).toContain('CHARYN-1D');

    // Invalid past date rejected
    const rBadDate = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-2',
      text: '2020-01-01',
    });
    expect(rBadDate[0].text.toLowerCase()).toContain('past');

    // Valid future date accepted
    const rDate = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-3',
      text: '2027-08-10',
    });
    expect(rDate[0].text.toLowerCase()).toContain('traveler');

    // Invalid participants rejected
    const rBadPax = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-4',
      text: '0',
    });
    expect(rBadPax[0].text).toContain('1');

    // Valid participants
    handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-5',
      text: '3',
    });

    // Name
    handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-6',
      text: 'Alex Mercer',
    });

    // Contact method: This chat -> should go straight to optional country, NOT ask phone!
    const rContact = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-7',
      callbackData: 'contact:chat',
      userHandle: '@alex_traveler',
    });
    expect(rContact[0].text.toLowerCase()).toContain('country');

    handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-8',
      callbackData: 'skip:country',
    });
    const rSummary = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-9',
      callbackData: 'skip:notes',
    });
    expect(rSummary[0].text).toContain('2027-08-10');
    expect(rSummary[0].text).toContain('CHARYN-1D');

    // Proceed to consent
    handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-10',
      callbackData: 'review:consent',
    });

    // Refuse consent -> must NOT create lead
    const rDecline = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-11',
      callbackData: 'consent:decline',
    });
    expect(rDecline[0].text.toLowerCase()).toContain('no request was created');
    expect(listLeads().length).toBe(startCount);

    // Agree consent -> creates lead
    const rDone = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-12',
      callbackData: 'consent:agree',
      userHandle: '@alex_traveler',
    });
    expect(rDone[0].text).toMatch(/#KT-\d{5}/);
    expect(rDone[0].text).toContain('Your booking is not confirmed yet.');
    expect(listLeads().length).toBe(startCount + 1);

    // Replaying duplicate externalEventId OR re-clicking agree creates zero duplicates
    handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99100',
      externalEventId: 'tg-12',
      callbackData: 'consent:agree',
    });
    expect(listLeads().length).toBe(startCount + 1);
  });

  it('handles unknown tour code gracefully by showing catalog', () => {
    const r = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: '99101',
      externalEventId: 'unk-1',
      text: '/start tour_UNKNOWN-999',
      startPayload: 'tour_UNKNOWN-999',
    });
    expect(r[0].text).toContain('UNKNOWN-999');
    expect(r[0].buttons?.some((b) => b.id === 'tour:CHARYN-1D')).toBe(true);
  });

  it('supports Plan My Trip via WhatsApp with flexible dates & international phone, plus DB failure retry without refilling', () => {
    const startCount = listLeads().length;
    const chat = '442079460958';

    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w1', text: 'Hi' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w2', callbackData: 'type:plan' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w3', callbackData: 'dest:2' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w4', callbackData: 'dur:2' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w5', callbackData: 'interest:offroad' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w6', callbackData: 'interests:done' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w7', callbackData: 'date:flexible' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w8', text: '4' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w9', text: 'Hannah Abbott' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w10', callbackData: 'contact:phone' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w11', text: '+44 20 7946 0958' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w12', text: 'United Kingdom' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w13', callbackData: 'skip:notes' });
    handleIncomingBotEvent({ channel: 'whatsapp', chatId: chat, externalEventId: 'w14', callbackData: 'review:consent' });

    // Simulate save failure
    setSimulateDbFailureForTests(true);
    const rFail = handleIncomingBotEvent({
      channel: 'whatsapp',
      chatId: chat,
      externalEventId: 'w15',
      callbackData: 'consent:agree',
    });
    expect(rFail[0].text).not.toMatch(/#KT-\d{5}/);
    expect(rFail[0].buttons?.some((b) => b.id === 'consent:agree')).toBe(true);
    expect(listLeads().length).toBe(startCount);

    // Recover DB and retry without refilling
    setSimulateDbFailureForTests(false);
    const rRetry = handleIncomingBotEvent({
      channel: 'whatsapp',
      chatId: chat,
      externalEventId: 'w16',
      callbackData: 'consent:agree',
    });
    expect(rRetry[0].text).toMatch(/#KT-\d{5}/);
    expect(listLeads().length).toBe(startCount + 1);
    const created = listLeads({ channel: 'whatsapp' })[0];
    expect(created.isFlexibleDates).toBe(true);
    expect(created.contactValue).toBe('+442079460958');
  });

  it('supports editing parameters and /cancel draft cancellation', () => {
    const startCount = listLeads().length;
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c1', text: '/start tour_BAO-1D', startPayload: 'tour_BAO-1D' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c2', text: '2027-09-01' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c3', text: '2' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c4', text: 'John Doe' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c5', callbackData: 'contact:chat' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c6', callbackData: 'skip:country' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c7', callbackData: 'skip:notes' });

    // Edit parameters from review
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c8', callbackData: 'review:edit_params' });
    handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c9', text: '2027-10-12' });
    const updatedSummary = handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c10', text: '5' });
    expect(updatedSummary[0].text).toContain('2027-10-12');
    expect(updatedSummary[0].text).toContain('5');

    // Cancel draft
    const cancelled = handleIncomingBotEvent({ channel: 'telegram', chatId: 'edit-1', externalEventId: 'c11', text: '/cancel' });
    expect(cancelled[0].text.toLowerCase()).toContain('cancelled');
    expect(getBotSession('telegram', 'edit-1')?.draft.customerName).toBeUndefined();
    expect(listLeads().length).toBe(startCount);
  });

  it('supports quick /tours and /plan commands without site-design showcase', () => {
    const startReply = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: 'cmd-0',
      externalEventId: 'cmd-start',
      text: '/start',
    });
    expect(startReply[0].buttons?.some((b) => b.id === 'menu:site')).toBe(false);

    const toursReply = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: 'cmd-1',
      externalEventId: 'cmd-tours',
      text: '/tours',
    });
    expect(toursReply[0].buttons?.some((b) => b.id.startsWith('tour:'))).toBe(true);

    const planReply = handleIncomingBotEvent({
      channel: 'telegram',
      chatId: 'cmd-2',
      externalEventId: 'cmd-plan',
      text: '/plan',
    });
    expect(planReply[0].buttons?.some((b) => b.id.startsWith('dest:'))).toBe(true);
    expect(getBotSession('telegram', 'cmd-2')?.step).toBe('custom_destination');
  });
});
