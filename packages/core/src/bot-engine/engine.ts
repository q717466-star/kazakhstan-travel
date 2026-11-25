import { logger } from '../logger.js';
import { getTourByCode, listTours } from '../repositories/tours.repo.js';
import {
  createLead,
  LeadPersistenceError,
  LeadValidationError,
} from '../services/lead.service.js';
import type {
  BotButton,
  BotReply,
  BotSession,
  IncomingBotEvent,
  Locale,
} from '../types.js';
import {
  isValidEmail,
  isValidInternationalPhone,
  isValidIsoDateNotPast,
  isValidParticipants,
  normalizePhone,
} from '../validation.js';
import { getBotCopy } from './i18n.js';
import {
  createEmptyDraft,
  getBotSession,
  makeSessionKey,
  markEventProcessed,
  saveBotSession,
  wasEventProcessed,
} from './sessions.repo.js';

function languageButtons(): BotButton[] {
  return [
    { id: 'lang:en', label: 'English' },
    { id: 'lang:ru', label: 'Русский' },
    { id: 'lang:kk', label: 'Қазақша' },
  ];
}

function mainMenuButtons(locale: Locale): BotButton[] {
  const c = getBotCopy(locale);
  return [
    { id: 'type:book', label: c.btnBookTour },
    { id: 'type:plan', label: c.btnPlanTrip },
    { id: 'menu:lang', label: c.btnChangeLang },
  ];
}

function tourListButtons(locale: Locale): BotButton[] {
  const c = getBotCopy(locale);
  const tours = listTours({ sort: 'recommended' }).slice(0, 8);
  const btns: BotButton[] = tours.map((t) => ({
    id: `tour:${t.code}`,
    label: `${t.title[locale] || t.title.en} (${t.durationDays}d · $${t.priceFromUsd})`,
  }));
  btns.push({ id: 'type:plan', label: c.btnPlanTrip });
  btns.push({ id: 'action:cancel', label: c.btnCancel });
  return btns;
}

function interestButtons(locale: Locale, selected: string[]): BotButton[] {
  const c = getBotCopy(locale);
  const btns: BotButton[] = c.customInterestOptions.map((opt) => {
    const active = selected.includes(opt.id);
    return {
      id: `interest:${opt.id}`,
      label: active ? `[x] ${opt.label}` : opt.label,
    };
  });
  btns.push({ id: 'interests:done', label: c.btnInterestsDone });
  btns.push({ id: 'action:cancel', label: c.btnCancel });
  return btns;
}

function formatSummary(session: BotSession): BotReply {
  const c = getBotCopy(session.locale);
  const d = session.draft;
  const lines: string[] = [c.summaryTitle, ''];

  lines.push(
    `• ${c.labelType}: ${d.requestType === 'book_tour' ? c.typeBookLabel : c.typePlanLabel}`
  );
  if (d.requestType === 'book_tour') {
    lines.push(`• ${c.labelTour}: ${d.tourTitleSnapshot || d.tourCode} (${d.tourCode})`);
  } else {
    lines.push(`• ${c.labelDestination}: ${d.customDestination || '-'}`);
    lines.push(`• ${c.labelDuration}: ${d.customDuration || '-'}`);
    const interestLabels = (d.customInterests ?? []).map((id) => {
      const match = c.customInterestOptions.find((o) => o.id === id);
      return match ? match.label : id;
    });
    lines.push(`• ${c.labelInterests}: ${interestLabels.join(', ') || '-'}`);
  }

  lines.push(
    `• ${c.labelDate}: ${d.isFlexibleDates ? c.labelFlexible : (d.preferredDate ?? '-')}`
  );
  lines.push(`• ${c.labelParticipants}: ${d.participants ?? '-'}`);
  lines.push(`• ${c.labelName}: ${d.customerName ?? '-'}`);
  const contactDesc =
    d.contactMethod === 'chat'
      ? c.thisChatLabel
      : `${d.contactMethod === 'email' ? 'Email' : 'Phone'}: ${d.contactValue}`;
  lines.push(`• ${c.labelContact}: ${contactDesc}`);
  if (d.country) {
    lines.push(`• ${c.labelCountry}: ${d.country}`);
  }
  if (d.notes) {
    lines.push(`• ${c.labelNotes}: ${d.notes}`);
  }

  return {
    text: lines.join('\n'),
    buttons: [
      { id: 'review:consent', label: c.btnContinueConsent },
      { id: 'review:edit_params', label: c.btnEditParams },
      { id: 'review:edit_contact', label: c.btnEditContact },
      { id: 'action:cancel', label: c.btnCancel },
    ],
  };
}

function extractTourCodeFromInput(rawText?: string, startPayload?: string): string | null {
  const candidateSources = [startPayload, rawText].filter(Boolean) as string[];
  for (const src of candidateSources) {
    const trimmed = src.trim();
    // Telegram /start tour_CHARYN-1D or tour:CHARYN-1D
    const startMatch = trimmed.match(/^(?:\/start\s+)?tour[_:]([A-Za-z0-9-]+)$/i);
    if (startMatch) return startMatch[1].toUpperCase();

    // WhatsApp prefilled text e.g. "Hello! I'd like to book tour CHARYN-1D" or "[CHARYN-1D]" or "#CHARYN-1D"
    const tagMatch = trimmed.match(/(?:tour[:#\s]+|\[)([A-Z]{2,12}-[A-Z0-9-]{2,20})\]?/i);
    if (tagMatch) return tagMatch[1].toUpperCase();

    // Direct match against existing tour codes in text
    const allTours = listTours();
    const upper = trimmed.toUpperCase();
    for (const tour of allTours) {
      if (upper.includes(tour.code)) {
        return tour.code;
      }
    }
  }
  return null;
}

function submitDraftLead(session: BotSession, event: IncomingBotEvent): BotReply[] {
  const c = getBotCopy(session.locale);
  const d = session.draft;

  try {
    const result = createLead(
      {
        channel: session.channel,
        locale: session.locale,
        requestType: d.requestType ?? 'plan_trip',
        tourCode: d.requestType === 'book_tour' ? d.tourCode ?? null : null,
        tourTitleSnapshot: d.requestType === 'book_tour' ? d.tourTitleSnapshot ?? null : null,
        customParams:
          d.requestType === 'plan_trip'
            ? {
                destination: d.customDestination ?? 'Kazakhstan',
                durationLabel: d.customDuration ?? 'Flexible',
                interests: d.customInterests && d.customInterests.length > 0 ? d.customInterests : ['nature'],
              }
            : null,
        preferredDate: d.isFlexibleDates ? null : d.preferredDate ?? null,
        isFlexibleDates: Boolean(d.isFlexibleDates),
        participants: d.participants ?? 1,
        customerName: d.customerName ?? event.userDisplayName ?? 'Guest',
        contactMethod: d.contactMethod ?? 'chat',
        contactValue:
          d.contactMethod === 'chat'
            ? event.userHandle || session.chatId
            : (d.contactValue ?? session.chatId),
        country: d.country ?? null,
        notes: d.notes ?? null,
        consentGiven: true,
        consentAt: d.consentAt ?? new Date().toISOString(),
        externalChatId: session.chatId,
        externalUserHandle: event.userHandle ?? null,
        idempotencyKey: `draft:${d.draftId}`,
      },
      `${session.channel}-bot`
    );

    session.step = 'completed';
    session.lastLeadNumber = result.lead.requestNumber;
    saveBotSession(session);

    const msg = result.deduplicated
      ? c.duplicateSubmitNotice(result.lead.requestNumber)
      : c.confirmationMsg(result.lead.requestNumber);

    return [
      {
        text: msg,
        buttons: [{ id: 'action:restart', label: c.btnStartNew }],
      },
    ];
  } catch (err) {
    if (err instanceof LeadPersistenceError || err instanceof LeadValidationError) {
      logger.warn('bot_lead_submit_failed', {
        channel: session.channel,
        error: err.message,
      });
    } else {
      logger.error('bot_lead_submit_unexpected_error', {
        channel: session.channel,
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
    // Preserve draft and keep step at consent_gate so user can retry without refilling!
    session.step = 'consent_gate';
    saveBotSession(session);
    return [
      {
        text: c.saveErrorMsg,
        buttons: [
          { id: 'consent:agree', label: c.btnRetrySubmit },
          { id: 'review:back', label: c.btnBackToReview },
          { id: 'action:cancel', label: c.btnCancel },
        ],
      },
    ];
  }
}

function advanceAfterParams(session: BotSession): BotReply[] {
  const c = getBotCopy(session.locale);
  if (session.draft.editReturnToReview && session.draft.customerName && session.draft.contactMethod) {
    session.draft.editReturnToReview = false;
    session.step = 'review_summary';
    saveBotSession(session);
    return [formatSummary(session)];
  }
  session.step = 'contact_name';
  saveBotSession(session);
  return [{ text: c.namePrompt, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
}

function advanceAfterContact(session: BotSession): BotReply[] {
  const c = getBotCopy(session.locale);
  if (session.draft.editReturnToReview) {
    session.draft.editReturnToReview = false;
    session.step = 'review_summary';
    saveBotSession(session);
    return [formatSummary(session)];
  }
  session.step = 'optional_country';
  saveBotSession(session);
  return [
    {
      text: c.countryPrompt,
      buttons: [
        { id: 'skip:country', label: c.btnSkip },
        { id: 'action:cancel', label: c.btnCancel },
      ],
    },
  ];
}

export function handleIncomingBotEvent(event: IncomingBotEvent): BotReply[] {
  if (event.externalEventId) {
    const check = wasEventProcessed(event.channel, event.externalEventId);
    if (check.processed) {
      logger.info('bot_event_deduplicated', {
        channel: event.channel,
        externalEventId: event.externalEventId,
      });
      return Array.isArray(check.cachedReplies) ? (check.cachedReplies as BotReply[]) : [];
    }
  }

  const replies = processBotTurn(event);

  if (event.externalEventId) {
    markEventProcessed(event.channel, event.externalEventId, replies);
  }

  return replies;
}

function processBotTurn(event: IncomingBotEvent): BotReply[] {
  const existing = getBotSession(event.channel, event.chatId);
  let session: BotSession =
    existing ?? {
      sessionKey: makeSessionKey(event.channel, event.chatId),
      channel: event.channel,
      chatId: event.chatId,
      locale: 'en', // English by default per spec
      step: 'choose_type',
      draft: createEmptyDraft(),
      lastLeadNumber: null,
      updatedAt: new Date().toISOString(),
    };

  const text = (event.text ?? '').trim();
  const cb = (event.callbackData ?? '').trim();
  const lowerText = text.toLowerCase();
  const c = getBotCopy(session.locale);

  // 1. Handle /cancel or cancel button anywhere
  if (lowerText === '/cancel' || lowerText === 'cancel' || cb === 'action:cancel') {
    session.step = 'choose_type';
    session.draft = createEmptyDraft();
    saveBotSession(session);
    return [
      {
        text: c.cancelledMsg,
        buttons: [{ id: 'action:restart', label: c.btnStartNew }, ...languageButtons()],
      },
    ];
  }

  // 2. Language switcher anytime
  if (cb === 'menu:lang' || lowerText === '/lang' || lowerText === 'language') {
    return [{ text: c.chooseLanguagePrompt, buttons: languageButtons() }];
  }

  if (cb.startsWith('lang:') || ['english', 'русский', 'қазақша', 'en', 'ru', 'kk'].includes(lowerText)) {
    let nextLocale: Locale = session.locale;
    if (cb === 'lang:en' || lowerText === 'english' || lowerText === 'en') nextLocale = 'en';
    if (cb === 'lang:ru' || lowerText === 'русский' || lowerText === 'ru') nextLocale = 'ru';
    if (cb === 'lang:kk' || lowerText === 'қазақша' || lowerText === 'kk') nextLocale = 'kk';

    session.locale = nextLocale;
    const nextCopy = getBotCopy(nextLocale);

    // If user switched language while already in a step, re-render current menu/prompt cleanly in new language
    if (session.step === 'completed') {
      session.step = 'choose_type';
      session.draft = createEmptyDraft();
    }
    saveBotSession(session);

    if (session.step === 'review_summary') {
      return [{ text: nextCopy.languageUpdated }, formatSummary(session)];
    }
    if (session.step === 'consent_gate') {
      return [
        { text: nextCopy.languageUpdated },
        {
          text: nextCopy.consentPrompt,
          buttons: [
            { id: 'consent:agree', label: nextCopy.btnConsentAgree },
            { id: 'consent:decline', label: nextCopy.btnConsentDecline },
          ],
        },
      ];
    }

    session.step = 'choose_type';
    saveBotSession(session);
    return [
      { text: `${nextCopy.languageUpdated}\n\n${nextCopy.chooseTypePrompt}`, buttons: mainMenuButtons(nextLocale) },
    ];
  }

  // Quick slash commands available from any step
  if (lowerText === '/tours') {
    session.draft = createEmptyDraft();
    session.draft.requestType = 'book_tour';
    session.step = 'choose_tour';
    saveBotSession(session);
    return [{ text: c.chooseTourPrompt, buttons: tourListButtons(session.locale) }];
  }

  if (lowerText === '/plan') {
    session.draft = createEmptyDraft();
    session.draft.requestType = 'plan_trip';
    session.step = 'custom_destination';
    saveBotSession(session);
    return [
      {
        text: c.customDestPrompt,
        buttons: [
          ...c.customDestOptions.map((opt, idx) => ({ id: `dest:${idx}`, label: opt })),
          { id: 'action:cancel', label: c.btnCancel },
        ],
      },
    ];
  }

  // 3. Handle /start, action:restart, or incoming deep link with tour code
  const isStartCmd = lowerText.startsWith('/start') || cb === 'action:restart';
  const maybeTourCode = extractTourCodeFromInput(text, event.startPayload);

  // Trigger deep-link entry if /start payload given OR if first message / completed session includes a tour code
  if (
    isStartCmd ||
    (!existing && maybeTourCode) ||
    (session.step === 'completed' && maybeTourCode) ||
    (session.step === 'choose_type' && maybeTourCode)
  ) {
    session.draft = createEmptyDraft();

    if (maybeTourCode) {
      const tour = getTourByCode(maybeTourCode);
      if (tour && tour.isActive) {
        session.draft.requestType = 'book_tour';
        session.draft.tourCode = tour.code;
        session.draft.tourTitleSnapshot = tour.title[session.locale] || tour.title.en;
        session.step = 'choose_date';
        saveBotSession(session);
        const curCopy = getBotCopy(session.locale);
        return [
          {
            text: `${curCopy.tourPreselected(session.draft.tourTitleSnapshot, tour.code)}\n\n${curCopy.datePrompt}`,
            buttons: [
              { id: 'date:flexible', label: curCopy.btnFlexibleDates },
              ...languageButtons(),
              { id: 'action:cancel', label: curCopy.btnCancel },
            ],
          },
        ];
      } else {
        session.step = 'choose_tour';
        saveBotSession(session);
        const curCopy = getBotCopy(session.locale);
        return [
          {
            text: `${curCopy.tourNotFound(maybeTourCode)}\n\n${curCopy.chooseTourPrompt}`,
            buttons: tourListButtons(session.locale),
          },
        ];
      }
    }

    // Standard entry without tour code -> show welcome, main menu + language options
    session.step = 'choose_type';
    saveBotSession(session);
    const curCopy = getBotCopy(session.locale);
    return [
      {
        text: `${curCopy.welcome}\n\n${curCopy.chooseTypePrompt}`,
        buttons: [...mainMenuButtons(session.locale), ...languageButtons()],
      },
    ];
  }

  // If session was previously completed and user sends a fresh generic message ("Hi", "Hello")
  if (session.step === 'completed' && !cb) {
    session.step = 'choose_type';
    session.draft = createEmptyDraft();
    saveBotSession(session);
    return [
      {
        text: `${c.welcome}\n\n${c.chooseTypePrompt}`,
        buttons: [...mainMenuButtons(session.locale), ...languageButtons()],
      },
    ];
  }

  // 4. Step state machine
  switch (session.step) {
    case 'choose_language':
    case 'choose_type': {
      if (cb === 'type:book' || lowerText === '1' || lowerText.includes('book') || lowerText.includes('готов') || lowerText.includes('дайын')) {
        session.draft.requestType = 'book_tour';
        session.step = 'choose_tour';
        saveBotSession(session);
        return [{ text: c.chooseTourPrompt, buttons: tourListButtons(session.locale) }];
      }
      if (cb === 'type:plan' || lowerText === '2' || lowerText.includes('plan') || lowerText.includes('индивиду') || lowerText.includes('жеке')) {
        session.draft.requestType = 'plan_trip';
        session.step = 'custom_destination';
        saveBotSession(session);
        return [
          {
            text: c.customDestPrompt,
            buttons: [
              ...c.customDestOptions.map((opt, idx) => ({ id: `dest:${idx}`, label: opt })),
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }
      return [
        {
          text: `${c.welcome}\n\n${c.chooseTypePrompt}`,
          buttons: [...mainMenuButtons(session.locale), ...languageButtons()],
        },
      ];
    }

    case 'choose_tour': {
      if (cb === 'type:plan') {
        session.draft.requestType = 'plan_trip';
        session.step = 'custom_destination';
        saveBotSession(session);
        return [
          {
            text: c.customDestPrompt,
            buttons: [
              ...c.customDestOptions.map((opt, idx) => ({ id: `dest:${idx}`, label: opt })),
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }

      let pickedCode = cb.startsWith('tour:') ? cb.slice(5) : null;
      if (!pickedCode && text) {
        const tours = listTours({ sort: 'recommended' }).slice(0, 8);
        if (/^\d+$/.test(text)) {
          const idx = Number(text) - 1;
          if (tours[idx]) pickedCode = tours[idx].code;
        } else {
          const found = tours.find(
            (t) =>
              t.code.toLowerCase() === lowerText ||
              t.title[session.locale].toLowerCase().includes(lowerText) ||
              t.title.en.toLowerCase().includes(lowerText)
          );
          if (found) pickedCode = found.code;
        }
      }

      if (pickedCode) {
        const tour = getTourByCode(pickedCode);
        if (tour) {
          session.draft.requestType = 'book_tour';
          session.draft.tourCode = tour.code;
          session.draft.tourTitleSnapshot = tour.title[session.locale] || tour.title.en;
          session.step = 'choose_date';
          saveBotSession(session);
          return [
            {
              text: `${c.tourPreselected(session.draft.tourTitleSnapshot, tour.code)}\n\n${c.datePrompt}`,
              buttons: [
                { id: 'date:flexible', label: c.btnFlexibleDates },
                { id: 'action:cancel', label: c.btnCancel },
              ],
            },
          ];
        }
      }

      return [
        {
          text: `${c.tourNotFound(text || cb)}\n\n${c.chooseTourPrompt}`,
          buttons: tourListButtons(session.locale),
        },
      ];
    }

    case 'custom_destination': {
      let chosen = '';
      if (cb.startsWith('dest:')) {
        const idx = Number(cb.slice(5));
        chosen = c.customDestOptions[idx] ?? '';
      } else if (text.length >= 2) {
        if (/^\d+$/.test(text)) {
          const idx = Number(text) - 1;
          chosen = c.customDestOptions[idx] ?? text;
        } else {
          chosen = text;
        }
      }

      if (!chosen) {
        return [
          {
            text: c.customDestPrompt,
            buttons: c.customDestOptions.map((opt, idx) => ({ id: `dest:${idx}`, label: opt })),
          },
        ];
      }

      session.draft.requestType = 'plan_trip';
      session.draft.customDestination = chosen;
      session.step = 'custom_duration';
      saveBotSession(session);
      return [
        {
          text: c.customDurationPrompt,
          buttons: [
            ...c.customDurationOptions.map((opt, idx) => ({ id: `dur:${idx}`, label: opt })),
            { id: 'action:cancel', label: c.btnCancel },
          ],
        },
      ];
    }

    case 'custom_duration': {
      let chosen = '';
      if (cb.startsWith('dur:')) {
        const idx = Number(cb.slice(4));
        chosen = c.customDurationOptions[idx] ?? '';
      } else if (text.length >= 1) {
        if (/^\d+$/.test(text) && Number(text) <= c.customDurationOptions.length && Number(text) >= 1) {
          chosen = c.customDurationOptions[Number(text) - 1];
        } else {
          chosen = text;
        }
      }

      if (!chosen) {
        return [
          {
            text: c.customDurationPrompt,
            buttons: c.customDurationOptions.map((opt, idx) => ({ id: `dur:${idx}`, label: opt })),
          },
        ];
      }

      session.draft.customDuration = chosen;
      session.step = 'custom_interests';
      if (!Array.isArray(session.draft.customInterests)) {
        session.draft.customInterests = [];
      }
      saveBotSession(session);
      return [
        {
          text: c.customInterestsPrompt,
          buttons: interestButtons(session.locale, session.draft.customInterests),
        },
      ];
    }

    case 'custom_interests': {
      const current = session.draft.customInterests ?? [];
      if (cb.startsWith('interest:')) {
        const id = cb.slice(9);
        const exists = current.includes(id);
        session.draft.customInterests = exists ? current.filter((i) => i !== id) : [...current, id];
        saveBotSession(session);
        return [
          {
            text: c.customInterestsPrompt,
            buttons: interestButtons(session.locale, session.draft.customInterests),
          },
        ];
      }

      if (cb === 'interests:done') {
        if (current.length === 0) {
          return [
            {
              text: c.needAtLeastOneInterest,
              buttons: interestButtons(session.locale, current),
            },
          ];
        }
        session.step = 'choose_date';
        saveBotSession(session);
        return [
          {
            text: c.datePrompt,
            buttons: [
              { id: 'date:flexible', label: c.btnFlexibleDates },
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }

      // Text input: comma-separated interests or single interest
      if (text.length >= 2) {
        const parts = text
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length > 0) {
          const mapped = parts.map((p) => {
            const matched = c.customInterestOptions.find(
              (o) => o.label.toLowerCase() === p.toLowerCase() || o.id === p.toLowerCase()
            );
            return matched ? matched.id : p;
          });
          session.draft.customInterests = Array.from(new Set([...current, ...mapped]));
          session.step = 'choose_date';
          saveBotSession(session);
          return [
            {
              text: c.datePrompt,
              buttons: [
                { id: 'date:flexible', label: c.btnFlexibleDates },
                { id: 'action:cancel', label: c.btnCancel },
              ],
            },
          ];
        }
      }

      return [
        {
          text: c.needAtLeastOneInterest,
          buttons: interestButtons(session.locale, current),
        },
      ];
    }

    case 'choose_date': {
      if (
        cb === 'date:flexible' ||
        lowerText.includes('flex') ||
        lowerText.includes('гибк') ||
        lowerText.includes('икемді')
      ) {
        session.draft.isFlexibleDates = true;
        session.draft.preferredDate = null;
        session.step = 'choose_participants';
        saveBotSession(session);
        return [{ text: c.participantsPrompt, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
      }

      const check = isValidIsoDateNotPast(text);
      if (!check.valid) {
        return [
          {
            text: check.reason === 'past' ? c.dateInPast : c.dateInvalidFormat,
            buttons: [
              { id: 'date:flexible', label: c.btnFlexibleDates },
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }

      session.draft.isFlexibleDates = false;
      session.draft.preferredDate = text.trim();
      session.step = 'choose_participants';
      saveBotSession(session);
      return [{ text: c.participantsPrompt, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
    }

    case 'choose_participants': {
      if (!isValidParticipants(text)) {
        return [
          {
            text: c.participantsInvalid,
            buttons: [{ id: 'action:cancel', label: c.btnCancel }],
          },
        ];
      }
      session.draft.participants = Number(text.trim());
      return advanceAfterParams(session);
    }

    case 'contact_name': {
      if (text.length < 2) {
        return [{ text: c.nameInvalid, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
      }
      session.draft.customerName = text;
      session.step = 'contact_method';
      saveBotSession(session);
      return [
        {
          text: c.contactMethodPrompt,
          buttons: [
            { id: 'contact:chat', label: c.btnContactThisChat },
            { id: 'contact:email', label: c.btnContactEmail },
            { id: 'contact:phone', label: c.btnContactPhone },
            { id: 'action:cancel', label: c.btnCancel },
          ],
        },
      ];
    }

    case 'contact_method': {
      if (
        cb === 'contact:chat' ||
        lowerText.includes('chat') ||
        lowerText.includes('чат') ||
        lowerText === '1'
      ) {
        // Spec requirement: DO NOT re-ask phone number if reply is in the current chat!
        session.draft.contactMethod = 'chat';
        session.draft.contactValue = event.userHandle || session.chatId;
        return advanceAfterContact(session);
      }
      if (cb === 'contact:email' || lowerText.includes('email') || lowerText.includes('почт') || lowerText === '2') {
        session.draft.contactMethod = 'email';
        session.step = 'contact_value';
        saveBotSession(session);
        return [{ text: c.contactEmailPrompt, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
      }
      if (
        cb === 'contact:phone' ||
        lowerText.includes('phone') ||
        lowerText.includes('номер') ||
        lowerText.includes('телефон') ||
        lowerText === '3'
      ) {
        session.draft.contactMethod = 'phone';
        session.step = 'contact_value';
        saveBotSession(session);
        return [{ text: c.contactPhonePrompt, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
      }

      return [
        {
          text: c.contactMethodPrompt,
          buttons: [
            { id: 'contact:chat', label: c.btnContactThisChat },
            { id: 'contact:email', label: c.btnContactEmail },
            { id: 'contact:phone', label: c.btnContactPhone },
          ],
        },
      ];
    }

    case 'contact_value': {
      if (session.draft.contactMethod === 'email') {
        if (!isValidEmail(text)) {
          return [{ text: c.contactEmailInvalid, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
        }
        session.draft.contactValue = text.trim();
        return advanceAfterContact(session);
      }

      if (!isValidInternationalPhone(text)) {
        return [{ text: c.contactPhoneInvalid, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
      }
      session.draft.contactValue = normalizePhone(text);
      return advanceAfterContact(session);
    }

    case 'optional_country': {
      if (cb === 'skip:country' || lowerText === 'skip' || lowerText === 'пропустить' || lowerText === '-') {
        session.draft.country = null;
      } else if (text.length >= 2) {
        session.draft.country = text;
      } else {
        return [
          {
            text: c.countryPrompt,
            buttons: [
              { id: 'skip:country', label: c.btnSkip },
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }

      session.step = 'optional_notes';
      saveBotSession(session);
      return [
        {
          text: c.notesPrompt,
          buttons: [
            { id: 'skip:notes', label: c.btnSkip },
            { id: 'action:cancel', label: c.btnCancel },
          ],
        },
      ];
    }

    case 'optional_notes': {
      if (cb === 'skip:notes' || lowerText === 'skip' || lowerText === 'пропустить' || lowerText === '-') {
        session.draft.notes = null;
      } else if (text.length >= 1) {
        session.draft.notes = text;
      } else {
        return [
          {
            text: c.notesPrompt,
            buttons: [
              { id: 'skip:notes', label: c.btnSkip },
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }

      session.step = 'review_summary';
      saveBotSession(session);
      return [formatSummary(session)];
    }

    case 'review_summary': {
      if (cb === 'review:consent' || lowerText === '1' || lowerText.includes('submit') || lowerText.includes('перейти')) {
        session.step = 'consent_gate';
        saveBotSession(session);
        return [
          {
            text: c.consentPrompt,
            buttons: [
              { id: 'consent:agree', label: c.btnConsentAgree },
              { id: 'consent:decline', label: c.btnConsentDecline },
              { id: 'review:back', label: c.btnBackToReview },
            ],
          },
        ];
      }
      if (cb === 'review:edit_params' || lowerText.includes('edit trip') || lowerText.includes('параметр')) {
        session.draft.editReturnToReview = true;
        if (session.draft.requestType === 'book_tour') {
          session.step = 'choose_date';
          saveBotSession(session);
          return [
            {
              text: c.datePrompt,
              buttons: [
                { id: 'date:flexible', label: c.btnFlexibleDates },
                { id: 'action:cancel', label: c.btnCancel },
              ],
            },
          ];
        } else {
          session.step = 'custom_destination';
          saveBotSession(session);
          return [
            {
              text: c.customDestPrompt,
              buttons: c.customDestOptions.map((opt, idx) => ({ id: `dest:${idx}`, label: opt })),
            },
          ];
        }
      }
      if (cb === 'review:edit_contact' || lowerText.includes('edit contact') || lowerText.includes('контакт')) {
        session.draft.editReturnToReview = true;
        session.step = 'contact_name';
        saveBotSession(session);
        return [{ text: c.namePrompt, buttons: [{ id: 'action:cancel', label: c.btnCancel }] }];
      }

      return [formatSummary(session)];
    }

    case 'consent_gate': {
      if (cb === 'review:back') {
        session.step = 'review_summary';
        saveBotSession(session);
        return [formatSummary(session)];
      }
      if (cb === 'consent:decline' || lowerText === 'no' || lowerText === 'нет' || lowerText === 'жоқ' || lowerText.includes('decline')) {
        // Explicit spec requirement: MUST NOT create a lead when consent is refused
        return [
          {
            text: c.consentDeclinedMsg,
            buttons: [
              { id: 'consent:agree', label: c.btnConsentAgree },
              { id: 'review:back', label: c.btnBackToReview },
              { id: 'action:cancel', label: c.btnCancel },
            ],
          },
        ];
      }
      if (
        cb === 'consent:agree' ||
        lowerText === 'yes' ||
        lowerText === 'agree' ||
        lowerText === 'да' ||
        lowerText === 'иә' ||
        lowerText.includes('соглас') ||
        lowerText.includes('келіс')
      ) {
        session.draft.consentGiven = true;
        session.draft.consentAt = new Date().toISOString();
        return submitDraftLead(session, event);
      }

      return [
        {
          text: c.consentPrompt,
          buttons: [
            { id: 'consent:agree', label: c.btnConsentAgree },
            { id: 'consent:decline', label: c.btnConsentDecline },
            { id: 'review:back', label: c.btnBackToReview },
          ],
        },
      ];
    }

    default:
      session.step = 'choose_type';
      saveBotSession(session);
      return [{ text: c.fallbackTextPrompt, buttons: mainMenuButtons(session.locale) }];
  }
}
