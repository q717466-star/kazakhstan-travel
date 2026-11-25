import { z } from 'zod';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function getTodayIsoUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isValidIsoDateNotPast(
  dateStr: string,
  todayIso: string = getTodayIsoUtc()
): { valid: boolean; reason?: 'format' | 'past' } {
  const trimmed = dateStr.trim();
  if (!ISO_DATE_RE.test(trimmed)) {
    return { valid: false, reason: 'format' };
  }
  const [yStr, mStr, dStr] = trimmed.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (
    parsed.getUTCFullYear() !== y ||
    parsed.getUTCMonth() + 1 !== m ||
    parsed.getUTCDate() !== d
  ) {
    return { valid: false, reason: 'format' };
  }
  if (trimmed < todayIso) {
    return { valid: false, reason: 'past' };
  }
  return { valid: true };
}

export function isValidParticipants(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 1 && value <= 50;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) return false;
    const n = Number(trimmed);
    return Number.isInteger(n) && n >= 1 && n <= 50;
  }
  return false;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= 160 && EMAIL_RE.test(trimmed);
}

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : `+${digits}`;
}

export function isValidInternationalPhone(raw: string): boolean {
  const trimmed = raw.trim();
  if (!/^[+\d\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  // E.164 international phone numbers: 7 to 15 digits, explicitly allowing any country code
  if (digits.length < 7 || digits.length > 15) return false;
  // Require either leading '+' or international 00 prefix or standard 10+ digit number
  if (trimmed.startsWith('+') || trimmed.startsWith('00')) return true;
  return digits.length >= 10;
}

export const customTripParamsSchema = z.object({
  destination: z.string().trim().min(2).max(160),
  durationLabel: z.string().trim().min(1).max(80),
  interests: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
});

export const createLeadSchema = z
  .object({
    channel: z.enum(['website', 'telegram', 'whatsapp']),
    locale: z.enum(['en', 'ru', 'kk']),
    requestType: z.enum(['book_tour', 'plan_trip']),
    tourCode: z.string().trim().min(2).max(40).nullable().optional(),
    tourTitleSnapshot: z.string().trim().max(200).nullable().optional(),
    customParams: customTripParamsSchema.nullable().optional(),
    preferredDate: z.string().trim().nullable().optional(),
    isFlexibleDates: z.boolean().default(false),
    participants: z.number().int().min(1).max(50),
    customerName: z.string().trim().min(2).max(120),
    contactMethod: z.enum(['chat', 'email', 'phone']),
    contactValue: z.string().trim().min(2).max(180),
    country: z.string().trim().max(80).nullable().optional(),
    notes: z.string().trim().max(1500).nullable().optional(),
    consentGiven: z.literal(true, {
      errorMap: () => ({ message: 'Personal data consent is required' }),
    }),
    consentAt: z.string().datetime({ offset: true }).optional(),
    externalChatId: z.string().trim().max(120).nullable().optional(),
    externalUserHandle: z.string().trim().max(120).nullable().optional(),
    idempotencyKey: z.string().trim().min(4).max(160).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requestType === 'book_tour' && !data.tourCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tourCode'],
        message: 'tourCode is required for book_tour requests',
      });
    }
    if (data.requestType === 'plan_trip' && !data.customParams) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customParams'],
        message: 'customParams are required for plan_trip requests',
      });
    }
    if (!data.isFlexibleDates) {
      if (!data.preferredDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['preferredDate'],
          message: 'preferredDate (YYYY-MM-DD) is required when dates are not flexible',
        });
      } else {
        const check = isValidIsoDateNotPast(data.preferredDate);
        if (!check.valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['preferredDate'],
            message:
              check.reason === 'past'
                ? 'preferredDate cannot be in the past'
                : 'preferredDate must be valid YYYY-MM-DD',
          });
        }
      }
    }
    if (data.contactMethod === 'email' && !isValidEmail(data.contactValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contactValue'],
        message: 'Invalid email address format',
      });
    }
    if (data.contactMethod === 'phone' && !isValidInternationalPhone(data.contactValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contactValue'],
        message: 'Invalid international phone number format',
      });
    }
  });

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
