export type Locale = 'en' | 'ru' | 'kk';

export type LocalizedText = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type Channel = 'website' | 'telegram' | 'whatsapp';

export type LeadStatus =
  | 'new'
  | 'in_progress'
  | 'proposal_sent'
  | 'awaiting_payment'
  | 'confirmed'
  | 'cancelled';

export type RequestType = 'book_tour' | 'plan_trip';

export type ContactMethod = 'chat' | 'email' | 'phone';

export type UserRole = 'admin' | 'manager' | 'editor';

export type TourCategory =
  | 'day-trips'
  | 'two-three-day'
  | 'multi-day'
  | 'kazakhstan'
  | 'kyrgyzstan'
  | 'central-asia';

export type DifficultyLevel = 'easy' | 'moderate' | 'expedition';

export type ActivityType =
  | 'nature'
  | 'mountains'
  | 'photography'
  | 'culture'
  | 'active'
  | 'offroad';

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export interface RoutePoint {
  name: LocalizedText;
  description: LocalizedText;
  lat: number;
  lng: number;
  elevationM?: number;
  stopMinutes?: number;
  day?: number;
}

export interface ItineraryDay {
  day: number;
  title: LocalizedText;
  summary: LocalizedText;
  locations: LocalizedText;
  transferInfo: LocalizedText;
  meals: LocalizedText;
  accommodation: LocalizedText;
}

export interface Tour {
  id: string;
  code: string;
  slug: string;
  category: TourCategory;
  country: 'Kazakhstan' | 'Kyrgyzstan' | 'Central Asia';
  region: LocalizedText;
  durationDays: number;
  durationLabel: LocalizedText;
  priceFromUsd: number;
  priceUnit: LocalizedText;
  format: LocalizedText;
  seasons: SeasonType[];
  activities: ActivityType[];
  difficulty: DifficultyLevel;
  maxGuests: number;
  popularityScore: number;
  recommendedOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  title: LocalizedText;
  subtitle: LocalizedText;
  shortDescription: LocalizedText;
  highlights: LocalizedList;
  coverImage: string;
  gallery: string[];
  routePoints: RoutePoint[];
  itineraryDays: ItineraryDay[];
  included: LocalizedList;
  excluded: LocalizedList;
  vehicleInfo: LocalizedText;
  guideInfo: LocalizedText;
  requirements: LocalizedText;
  clothingAdvice: LocalizedText;
  cancellationPolicy: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  updatedAt: string;
}

export interface Destination {
  id: string;
  slug: string;
  country: 'Kazakhstan' | 'Kyrgyzstan' | 'Central Asia';
  regionTag: string;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  image: string;
  lat: number;
  lng: number;
  elevationM: number;
  bestMonths: LocalizedText;
  tourCodes: string[];
  sortOrder: number;
  isFeatured: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorOrigin: string;
  travelDate: string; // YYYY-MM-DD
  rating: number;
  tourCode: string | null;
  title: LocalizedText;
  body: LocalizedText;
  photos: string[];
  videoUrl: string | null;
  sourceName: string;
  sourceUrl: string | null;
  isFeatured: boolean;
}

export interface BlogArticle {
  id: string;
  slug: string;
  category: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedList; // array of paragraphs per locale
  coverImage: string;
  publishedAt: string; // YYYY-MM-DD
  readMinutes: number;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  isPublished: boolean;
}

export interface CustomTripParams {
  destination: string;
  durationLabel: string;
  interests: string[];
}

export interface Lead {
  id: string;
  requestNumber: string; // e.g. KT-00001
  channel: Channel;
  locale: Locale;
  requestType: RequestType;
  tourCode: string | null;
  tourTitleSnapshot: string | null;
  customParams: CustomTripParams | null;
  preferredDate: string | null; // YYYY-MM-DD
  isFlexibleDates: boolean;
  participants: number;
  customerName: string;
  contactMethod: ContactMethod;
  contactValue: string;
  country: string | null;
  notes: string | null;
  consentGiven: boolean;
  consentAt: string; // ISO 8601
  status: LeadStatus;
  externalChatId: string | null;
  externalUserHandle: string | null;
  idempotencyKey: string | null;
  assignedManagerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadEvent {
  id: string;
  leadId: string;
  actor: string;
  eventType: 'created' | 'status_changed' | 'note_added' | 'notification_sent';
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus | null;
  message: string;
  createdAt: string;
}

export interface ManagerNotification {
  id: string;
  leadId: string;
  requestNumber: string;
  channel: Channel;
  targetUrl: string;
  summary: string;
  deliveryStatus: 'queued' | 'sent' | 'simulated';
  isRead: boolean;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type BotStep =
  | 'choose_language'
  | 'choose_type'
  | 'choose_tour'
  | 'custom_destination'
  | 'custom_duration'
  | 'custom_interests'
  | 'choose_date'
  | 'choose_participants'
  | 'contact_name'
  | 'contact_method'
  | 'contact_value'
  | 'optional_country'
  | 'optional_notes'
  | 'review_summary'
  | 'consent_gate'
  | 'completed';

export interface BotDraft {
  draftId: string;
  requestType?: RequestType;
  tourCode?: string;
  tourTitleSnapshot?: string;
  customDestination?: string;
  customDuration?: string;
  customInterests?: string[];
  preferredDate?: string | null;
  isFlexibleDates?: boolean;
  participants?: number;
  customerName?: string;
  contactMethod?: ContactMethod;
  contactValue?: string;
  country?: string | null;
  notes?: string | null;
  consentGiven?: boolean;
  consentAt?: string;
  editReturnToReview?: boolean;
}

export interface BotSession {
  sessionKey: string; // `${channel}:${chatId}`
  channel: 'telegram' | 'whatsapp';
  chatId: string;
  locale: Locale;
  step: BotStep;
  draft: BotDraft;
  lastLeadNumber: string | null;
  updatedAt: string;
}

export interface BotButton {
  id: string;
  label: string;
  url?: string;
}

export interface BotReply {
  text: string;
  buttons?: BotButton[];
  parseMode?: 'Markdown' | 'HTML' | 'plain';
}

export interface IncomingBotEvent {
  channel: 'telegram' | 'whatsapp';
  chatId: string;
  externalEventId: string;
  text?: string;
  callbackData?: string;
  userHandle?: string;
  userDisplayName?: string;
  startPayload?: string;
}
