const SENSITIVE_KEY_RE =
  /phone|email|contact|token|secret|password|hash|authorization|cookie|signature|api_?key|access_?key|bot_?token|app_?secret/i;

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_PATTERN = /\+\d[\d\s().-]{6,18}\d/g;

function scrubString(val: string): string {
  return val
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
    .replace(PHONE_PATTERN, '[REDACTED_PHONE]');
}

export function redactSensitive<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return scrubString(value) as T;
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item)) as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_RE.test(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactSensitive(val);
      }
    }
    return out as T;
  }
  return value;
}

function emit(level: 'INFO' | 'WARN' | 'ERROR', event: string, meta?: Record<string, unknown>) {
  if (process.env.KT_LOG_SILENT === '1') return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(meta ? { meta: redactSensitive(meta) } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === 'ERROR') {
    console.error(line);
  } else if (level === 'WARN') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => emit('INFO', event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => emit('WARN', event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit('ERROR', event, meta),
};
