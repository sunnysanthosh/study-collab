import validator from 'validator';

const DEFAULT_MAX_LEN = 10_000;

/**
 * Sanitize a string: trim, escape HTML, enforce max length.
 * Use for plain-text user input (names, emails, message content, topic fields).
 */
export function sanitizeString(
  value: unknown,
  maxLength: number = DEFAULT_MAX_LEN
): string {
  if (value == null) return '';
  const s = String(value).trim();
  const escaped = validator.escape(s);
  if (maxLength > 0 && escaped.length > maxLength) {
    return escaped.slice(0, maxLength);
  }
  return escaped;
}

/**
 * Sanitize email: trim, normalize, validate format. Returns empty string if invalid.
 */
export function sanitizeEmail(value: unknown): string {
  if (value == null) return '';
  const s = String(value).trim();
  if (!validator.isEmail(s)) return '';
  return validator.normalizeEmail(s, { gmail_remove_dots: false }) as string || s;
}

/**
 * Recursively sanitize string values in an object.
 * Skips keys that match skipKeys (e.g. 'password', 'email' for validation).
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { skipKeys?: string[]; maxLength?: number } = {}
): T {
  const skipKeys = new Set(options.skipKeys ?? [
    'password', 'password_hash', 'token', 'refreshToken', 'accessToken',
    'email', // preserve for format validation
  ]);
  const maxLen = options.maxLength ?? DEFAULT_MAX_LEN;

  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (skipKeys.has(k)) {
      (out as Record<string, unknown>)[k] = v;
      continue;
    }
    if (v != null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      (out as Record<string, unknown>)[k] = sanitizeObject(v as Record<string, unknown>, { skipKeys: [...skipKeys], maxLength: maxLen });
    } else if (Array.isArray(v)) {
      (out as Record<string, unknown>)[k] = v.map((item) =>
        typeof item === 'string' ? sanitizeString(item, maxLen) : item
      );
    } else if (typeof v === 'string') {
      (out as Record<string, unknown>)[k] = sanitizeString(v, maxLen);
    } else {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}
