import type { Locale } from '../types.js';

export interface BotCopy {
  welcome: string;
  chooseLanguagePrompt: string;
  languageUpdated: string;
  chooseTypePrompt: string;
  btnBookTour: string;
  btnPlanTrip: string;
  btnChangeLang: string;
  btnCancel: string;
  btnBackToReview: string;
  btnSkip: string;
  btnFlexibleDates: string;
  tourNotFound: (code: string) => string;
  tourPreselected: (title: string, code: string) => string;
  chooseTourPrompt: string;
  customDestPrompt: string;
  customDestOptions: string[];
  customDurationPrompt: string;
  customDurationOptions: string[];
  customInterestsPrompt: string;
  customInterestOptions: Array<{ id: string; label: string }>;
  btnInterestsDone: string;
  needAtLeastOneInterest: string;
  datePrompt: string;
  dateInvalidFormat: string;
  dateInPast: string;
  participantsPrompt: string;
  participantsInvalid: string;
  namePrompt: string;
  nameInvalid: string;
  contactMethodPrompt: string;
  btnContactThisChat: string;
  btnContactEmail: string;
  btnContactPhone: string;
  contactEmailPrompt: string;
  contactEmailInvalid: string;
  contactPhonePrompt: string;
  contactPhoneInvalid: string;
  countryPrompt: string;
  notesPrompt: string;
  summaryTitle: string;
  labelType: string;
  labelTour: string;
  labelDestination: string;
  labelDuration: string;
  labelInterests: string;
  labelDate: string;
  labelFlexible: string;
  labelParticipants: string;
  labelName: string;
  labelContact: string;
  labelCountry: string;
  labelNotes: string;
  typeBookLabel: string;
  typePlanLabel: string;
  thisChatLabel: string;
  btnContinueConsent: string;
  btnEditParams: string;
  btnEditContact: string;
  consentPrompt: string;
  btnConsentAgree: string;
  btnConsentDecline: string;
  consentDeclinedMsg: string;
  saveErrorMsg: string;
  btnRetrySubmit: string;
  cancelledMsg: string;
  btnStartNew: string;
  confirmationMsg: (requestNumber: string) => string;
  duplicateSubmitNotice: (requestNumber: string) => string;
  fallbackTextPrompt: string;
}

const EN: BotCopy = {
  welcome:
    'Welcome to Kazakhstan Travel. We design private 4x4 expeditions across Kazakhstan, Kyrgyzstan, and Central Asia.',
  chooseLanguagePrompt: 'Select your preferred language (English is active by default):',
  languageUpdated: 'Language set to English.',
  chooseTypePrompt: 'How would you like to begin?',
  btnBookTour: 'Book a Tour',
  btnPlanTrip: 'Plan My Trip',
  btnChangeLang: 'Language: EN / RU / KK',
  btnCancel: 'Cancel Draft',
  btnBackToReview: 'Back to Summary',
  btnSkip: 'Skip',
  btnFlexibleDates: 'Flexible dates',
  tourNotFound: (code) =>
    `We could not find tour code "${code}". Please select an available tour below or choose "Plan My Trip".`,
  tourPreselected: (title, code) =>
    `Selected tour: ${title} (${code}).`,
  chooseTourPrompt: 'Please choose a tour from our signature private 4x4 routes:',
  customDestPrompt: 'Step 1/3 — Where would you like to travel? Pick an option or type your region:',
  customDestOptions: [
    'Almaty, Charyn & Kolsai',
    'Altyn-Emel Desert & Mountains',
    'Kazakhstan & Kyrgyzstan',
    'Grand Central Asia Ring',
  ],
  customDurationPrompt: 'Step 2/3 — Preferred trip duration? Choose below or type number of days:',
  customDurationOptions: ['1 Day', '2–3 Days', '4–6 Days', '7+ Days'],
  customInterestsPrompt:
    'Step 3/3 — Pick your travel interests (tap one or more, or type comma-separated, then press "Done"):',
  customInterestOptions: [
    { id: 'nature', label: 'Nature' },
    { id: 'mountains', label: 'Mountains' },
    { id: 'photography', label: 'Photography' },
    { id: 'culture', label: 'Culture' },
    { id: 'active', label: 'Active Hiking' },
    { id: 'offroad', label: 'Off-Road 4x4' },
  ],
  btnInterestsDone: 'Done — Continue',
  needAtLeastOneInterest: 'Please select at least one interest before continuing.',
  datePrompt:
    'Enter your preferred start date in YYYY-MM-DD format (e.g. 2027-06-15), or tap "Flexible dates":',
  dateInvalidFormat: 'Invalid date format. Please enter a real date as YYYY-MM-DD (for example 2027-06-15), or tap "Flexible dates".',
  dateInPast: 'That date is in the past. Please enter an upcoming date in YYYY-MM-DD format, or tap "Flexible dates".',
  participantsPrompt: 'How many travelers will join? Enter a whole number greater than 0 (e.g. 2):',
  participantsInvalid: 'Please enter a valid whole number of travelers between 1 and 50 (for example: 2).',
  namePrompt: 'What is your full name?',
  nameInvalid: 'Please enter your name (at least 2 characters).',
  contactMethodPrompt: 'How should our travel manager contact you with availability and pricing?',
  btnContactThisChat: 'This chat (no number needed)',
  btnContactEmail: 'Email',
  btnContactPhone: 'International Phone / WhatsApp',
  contactEmailPrompt: 'Please enter your email address:',
  contactEmailInvalid: 'That does not look like a valid email address. Please try again (e.g. name@example.com).',
  contactPhonePrompt: 'Please enter your international phone number with country code (e.g. +44 20 7946 0958 or +1 415 555 0199):',
  contactPhoneInvalid: 'Invalid international phone format. Include country code + and 7–15 digits (any country allowed).',
  countryPrompt: 'Optional: Which country are you traveling from? (Type country or tap Skip)',
  notesPrompt: 'Optional: Any preferences, children seats, hotel tier, or questions? (Type note or tap Skip)',
  summaryTitle: 'Please review your trip request:',
  labelType: 'Request type',
  labelTour: 'Tour',
  labelDestination: 'Region',
  labelDuration: 'Duration',
  labelInterests: 'Interests',
  labelDate: 'Preferred date',
  labelFlexible: 'Flexible dates',
  labelParticipants: 'Travelers',
  labelName: 'Name',
  labelContact: 'Reply via',
  labelCountry: 'Country',
  labelNotes: 'Preferences',
  typeBookLabel: 'Book a Tour',
  typePlanLabel: 'Plan My Trip (Custom)',
  thisChatLabel: 'Current messenger chat',
  btnContinueConsent: 'Proceed to Submit',
  btnEditParams: 'Edit Trip Details',
  btnEditContact: 'Edit Contact',
  consentPrompt:
    'Personal Data Notice: Your name, trip parameters, and contact details will be used solely by Kazakhstan Travel to prepare availability and pricing. We do not collect passport or payment card data here. Do you consent to processing this request?',
  btnConsentAgree: 'I Agree & Submit Request',
  btnConsentDecline: 'Decline',
  consentDeclinedMsg:
    'Understood — no request was created without your consent. You can agree when ready, edit your draft, or cancel.',
  saveErrorMsg:
    'Temporary error while saving your request. Your draft has been kept intact and no request number was issued. Please tap Retry to submit again.',
  btnRetrySubmit: 'Retry Submission',
  cancelledMsg: 'Your draft request has been cancelled. Tap below whenever you want to start again.',
  btnStartNew: 'Start New Request',
  confirmationMsg: (num) =>
    `Thanks! We’ve received your request #${num}. Our team will contact you to confirm availability and pricing. Your booking is not confirmed yet.`,
  duplicateSubmitNotice: (num) =>
    `Your request #${num} is already recorded. Our team will reach out shortly.`,
  fallbackTextPrompt: 'Please choose one of the buttons or type your reply.',
};

const RU: BotCopy = {
  welcome:
    'Добро пожаловать в Kazakhstan Travel. Мы организуем индивидуальные 4x4-экспедиции по Казахстану, Кыргызстану и Центральной Азии.',
  chooseLanguagePrompt: 'Выберите язык общения (по умолчанию используется английский):',
  languageUpdated: 'Выбран русский язык.',
  chooseTypePrompt: 'Какой вариант поездки вам интересен?',
  btnBookTour: 'Book a Tour — Готовый тур',
  btnPlanTrip: 'Plan My Trip — Индивидуальный маршрут',
  btnChangeLang: 'Язык: EN / RU / KK',
  btnCancel: 'Отменить черновик',
  btnBackToReview: 'Вернуться к сводке',
  btnSkip: 'Пропустить',
  btnFlexibleDates: 'Даты гибкие',
  tourNotFound: (code) =>
    `Тур с кодом «${code}» не найден. Выберите подходящий тур из списка ниже или перейдите к индивидуальному маршруту.`,
  tourPreselected: (title, code) =>
    `Выбран тур: ${title} (${code}).`,
  chooseTourPrompt: 'Выберите один из наших авторских индивидуальных туров:',
  customDestPrompt: 'Шаг 1/3 — Куда планируете поехать? Выберите направление или напишите свой вариант:',
  customDestOptions: [
    'Алматы, Чарын и Кольсай',
    'Алтын-Эмель (бархан и Актау)',
    'Казахстан и Кыргызстан',
    'Большое кольцо Центральной Азии',
  ],
  customDurationPrompt: 'Шаг 2/3 — Желаемая продолжительность поездки?',
  customDurationOptions: ['1 день', '2–3 дня', '4–6 дней', '7+ дней'],
  customInterestsPrompt:
    'Шаг 3/3 — Выберите интересы (нажмите один или несколько вариантов, либо напишите через запятую и нажмите «Готово»):',
  customInterestOptions: [
    { id: 'nature', label: 'Природа' },
    { id: 'mountains', label: 'Горы' },
    { id: 'photography', label: 'Фотография' },
    { id: 'culture', label: 'Культура' },
    { id: 'active', label: 'Активный отдых' },
    { id: 'offroad', label: 'Внедорожные экспедиции' },
  ],
  btnInterestsDone: 'Готово — далее',
  needAtLeastOneInterest: 'Пожалуйста, выберите хотя бы один интерес.',
  datePrompt:
    'Укажите желаемую дату начала в формате ГГГГ-ММ-ДД (например, 2027-06-15) или нажмите «Даты гибкие»:',
  dateInvalidFormat: 'Неверный формат даты. Введите реальную дату строго в виде ГГГГ-ММ-ДД (например, 2027-06-15) или нажмите «Даты гибкие».',
  dateInPast: 'Указанная дата уже в прошлом. Введите будущую дату в формате ГГГГ-ММ-ДД или нажмите «Даты гибкие».',
  participantsPrompt: 'Сколько человек поедет? Введите целое число больше 0 (например: 2):',
  participantsInvalid: 'Укажите целое число участников от 1 до 50 (например: 2).',
  namePrompt: 'Как вас зовут (имя и фамилия)?',
  nameInvalid: 'Пожалуйста, введите имя (минимум 2 символа).',
  contactMethodPrompt: 'Каким способом менеджеру удобнее связаться с вами?',
  btnContactThisChat: 'Ответить в этот чат',
  btnContactEmail: 'Электронная почта',
  btnContactPhone: 'Международный номер телефона',
  contactEmailPrompt: 'Введите ваш адрес электронной почты:',
  contactEmailInvalid: 'Некорректный формат email. Попробуйте ещё раз (например, name@example.com).',
  contactPhonePrompt: 'Введите международный номер телефона с кодом страны (например, +44 20 7946 0958 или +7 777 525 98 85):',
  contactPhoneInvalid: 'Неверный формат номера. Укажите международный номер с кодом страны (от 7 до 15 цифр).',
  countryPrompt: 'Необязательно: из какой вы страны? (Напишите или нажмите «Пропустить»)',
  notesPrompt: 'Необязательно: ваши пожелания по маршруту, автокреслу или проживанию (или нажмите «Пропустить»)',
  summaryTitle: 'Проверьте вашу заявку перед отправкой:',
  labelType: 'Тип заявки',
  labelTour: 'Тур',
  labelDestination: 'Направление',
  labelDuration: 'Длительность',
  labelInterests: 'Интересы',
  labelDate: 'Дата поездки',
  labelFlexible: 'Даты гибкие',
  labelParticipants: 'Участников',
  labelName: 'Имя',
  labelContact: 'Канал ответа',
  labelCountry: 'Страна',
  labelNotes: 'Пожелания',
  typeBookLabel: 'Готовый тур',
  typePlanLabel: 'Индивидуальный маршрут',
  thisChatLabel: 'Текущий чат в мессенджере',
  btnContinueConsent: 'Перейти к подтверждению',
  btnEditParams: 'Изменить параметры',
  btnEditContact: 'Изменить контакты',
  consentPrompt:
    'Согласие на обработку данных: ваше имя, параметры поездки и контакт используются только командой Kazakhstan Travel для расчёта стоимости и проверки наличия мест. Паспортные и платёжные данные здесь не запрашиваются. Подтверждаете отправку?',
  btnConsentAgree: 'Согласен и отправить',
  btnConsentDecline: 'Отказаться',
  consentDeclinedMsg:
    'Хорошо — без вашего явного согласия заявка не создана. Вы можете согласиться, изменить данные или отменить черновик.',
  saveErrorMsg:
    'Не удалось сохранить заявку из-за временной ошибки сервера. Черновик сохранён, номер не выдан. Нажмите «Повторить отправку» — заполнять анкету заново не нужно.',
  btnRetrySubmit: 'Повторить отправку',
  cancelledMsg: 'Черновик заявки отменён. Вы можете начать новую заявку в любой момент.',
  btnStartNew: 'Начать заново',
  confirmationMsg: (num) =>
    `Спасибо! Мы получили вашу заявку #${num}. Наша команда свяжется с вами для подтверждения наличия мест и стоимости. Бронирование ещё не подтверждено.`,
  duplicateSubmitNotice: (num) =>
    `Заявка #${num} уже зарегистрирована. Менеджер скоро свяжется с вами.`,
  fallbackTextPrompt: 'Пожалуйста, воспользуйтесь кнопками ниже или введите текстовый ответ.',
};

const KK: BotCopy = {
  welcome:
    'Kazakhstan Travel қызметіне қош келдіңіз! Біз Қазақстан, Қырғызстан және Орталық Азия бойынша жеке 4x4 экспедицияларын ұйымдастырамыз.',
  chooseLanguagePrompt: 'Тілді таңдаңыз (әдепкі тіл — ағылшынша):',
  languageUpdated: 'Қазақ тілі таңдалды.',
  chooseTypePrompt: 'Сапарды қалай таңдайсыз?',
  btnBookTour: 'Дайын тур брондау',
  btnPlanTrip: 'Жеке бағыт құрастыру',
  btnChangeLang: 'Тіл: EN / RU / KK',
  btnCancel: 'Өтінімді тоқтату',
  btnBackToReview: 'Қорытындыға оралу',
  btnSkip: 'Өткізіп жіберу',
  btnFlexibleDates: 'Икемді күндер',
  tourNotFound: (code) =>
    `«${code}» коды бар тур табылмады. Төмендегі тізімнен тур таңдаңыз немесе жеке бағытты құрастырыңыз.`,
  tourPreselected: (title, code) =>
    `Таңдалған тур: ${title} (${code}).`,
  chooseTourPrompt: 'Біздің авторлық жеке 4x4 турларының бірін таңдаңыз:',
  customDestPrompt: '1/3-қадам — Қай бағытқа барғыңыз келеді? Таңдаңыз немесе жазыңыз:',
  customDestOptions: [
    'Алматы, Шарын және Көлсай',
    'Алтын-Емел (Айғайқұм және Ақтау)',
    'Қазақстан және Қырғызстан',
    'Орталық Азия үлкен сақинасы',
  ],
  customDurationPrompt: '2/3-қадам — Сапардың ұзақтығы қандай болғаны дұрыс?',
  customDurationOptions: ['1 күн', '2–3 күн', '4–6 күн', '7+ күн'],
  customInterestsPrompt:
    '3/3-қадам — Қызығушылықтарыңызды белгілеңіз (бірнешеуін таңдап немесе үтір арқылы жазып, «Дайын» батырмасын басыңыз):',
  customInterestOptions: [
    { id: 'nature', label: 'Табиғат' },
    { id: 'mountains', label: 'Таулар' },
    { id: 'photography', label: 'Фототүсірілім' },
    { id: 'culture', label: 'Мәдениет' },
    { id: 'active', label: 'Белсенді демалыс' },
    { id: 'offroad', label: '4x4 жолсыз сапар' },
  ],
  btnInterestsDone: 'Дайын — жалғастыру',
  needAtLeastOneInterest: 'Кемінде бір қызығушылықты таңдаңыз.',
  datePrompt:
    'Сапардың басталу күнін ЖЖЖЖ-АА-КК форматында жазыңыз (мысалы: 2027-06-15) немесе «Икемді күндер» батырмасын басыңыз:',
  dateInvalidFormat: 'Күн форматы қате. Нақты күнді ЖЖЖЖ-АА-КК (мысалы 2027-06-15) түрінде енгізіңіз немесе «Икемді күндер» таңдаңыз.',
  dateInPast: 'Өткен күнді таңдауға болмайды. Алдағы күнді ЖЖЖЖ-АА-КК форматында енгізіңіз.',
  participantsPrompt: 'Сапарға неше адам қатысады? 0-ден үлкен бүтін сан жазыңыз (мысалы: 2):',
  participantsInvalid: '1 мен 50 аралығындағы бүтін санды енгізіңіз (мысалы: 2).',
  namePrompt: 'Аты-жөніңіз кім?',
  nameInvalid: 'Есіміңізді енгізіңіз (кемінде 2 әріп).',
  contactMethodPrompt: 'Менеджер сізбен қай байланыс арнасы арқылы хабарласқаны дұрыс?',
  btnContactThisChat: 'Осы чатқа жазу',
  btnContactEmail: 'Электрондық пошта',
  btnContactPhone: 'Халықаралық телефон нөмірі',
  contactEmailPrompt: 'Электрондық пошта мекенжайыңызды енгізіңіз:',
  contactEmailInvalid: 'Электрондық пошта форматы қате. Қайта тексеріп енгізіңіз.',
  contactPhonePrompt: 'Ел кодымен халықаралық телефон нөмірін енгізіңіз (мысалы: +44 20 7946 0958 немесе +7 777 525 98 85):',
  contactPhoneInvalid: 'Телефон нөмірінің форматы қате. Ел кодымен (+ белгісімен, 7–15 цифр) енгізіңіз.',
  countryPrompt: 'Міндетті емес: қай елден келесіз? (Елді жазыңыз немесе «Өткізіп жіберу» басыңыз)',
  notesPrompt: 'Міндетті емес: қосымша тілектеріңіз бар ма? (Жазыңыз немесе «Өткізіп жіберу» басыңыз)',
  summaryTitle: 'Жібермес бұрын өтінім деректерін тексеріңіз:',
  labelType: 'Өтінім түрі',
  labelTour: 'Тур',
  labelDestination: 'Бағыт',
  labelDuration: 'Ұзақтығы',
  labelInterests: 'Қызығушылықтар',
  labelDate: 'Сапар күні',
  labelFlexible: 'Икемді күндер',
  labelParticipants: 'Қатысушылар саны',
  labelName: 'Аты-жөні',
  labelContact: 'Байланыс',
  labelCountry: 'Елі',
  labelNotes: 'Тілектер',
  typeBookLabel: 'Дайын тур',
  typePlanLabel: 'Жеке бағыт',
  thisChatLabel: 'Осы мессенджер чаты',
  btnContinueConsent: 'Растауға өту',
  btnEditParams: 'Сапар дерегін өзгерту',
  btnEditContact: 'Байланысты өзгерту',
  consentPrompt:
    'Дербес деректерді өңдеу: сіздің аты-жөніңіз, сапар параметрлері мен байланыс деректеріңіз тек Kazakhstan Travel менеджерінің орын саны мен бағаны нақтылауы үшін қолданылады. Төлқұжат пен банк картасы деректері сұралмайды. Жіберуге келісесіз бе?',
  btnConsentAgree: 'Келісемін және жіберемін',
  btnConsentDecline: 'Бас тарту',
  consentDeclinedMsg:
    'Түсінікті — келісімсіз өтінім тіркелмейді. Келісім бере аласыз, деректерді түзете аласыз немесе жобаны тоқтата аласыз.',
  saveErrorMsg:
    'Уақытша серверлік қатеге байланысты өтінім сақталмады. Енгізген деректеріңіз сақталды, нөмір берілген жоқ. Қайта жіберу түймесін басыңыз.',
  btnRetrySubmit: 'Қайта жіберу',
  cancelledMsg: 'Өтінім жобасы тоқтатылды. Жаңадан бастау үшін төмендегі батырманы басыңыз.',
  btnStartNew: 'Жаңадан бастау',
  confirmationMsg: (num) =>
    `Рақмет! Сіздің #${num} өтініміңіз қабылданды. Біздің топ орындар мен бағаны нақтылау үшін сізбен хабарласады. Брондау әлі расталған жоқ.`,
  duplicateSubmitNotice: (num) =>
    `#${num} өтінімі тіркелген. Менеджер сізбен жақын арада хабарласады.`,
  fallbackTextPrompt: 'Төмендегі батырмаларды таңдаңыз немесе мәтін енгізіңіз.',
};

export const BOT_I18N: Record<Locale, BotCopy> = { en: EN, ru: RU, kk: KK };

export function getBotCopy(locale: Locale): BotCopy {
  return BOT_I18N[locale] ?? EN;
}
