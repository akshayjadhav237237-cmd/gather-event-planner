import { MAX_NOTES_LENGTH } from '../config/constants';
import type { PersonalizedIdeas } from '../types/event';
import { PersonalizedIdeasSchema } from '../types/schemas';
import { isPlausibleApiKey } from './apiKeyStorage';
import { LlmError } from './llmError';

export { isPlausibleApiKey };

const INJECTION_PATTERNS: readonly RegExp[] = [
  /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions?|rules?|prompts?)/i,
  /(?:reveal|print|show|output|leak|expose)\s+(?:the\s+)?(?:system\s+prompt|instructions?|api\s*key|secret)/i,
  /\byou\s+are\s+now\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bjailbreak\b/i,
  /(?:^|\n)\s*(?:system|assistant|user)\s*:/i,
  /<\/?[a-zA-Z_][\w-]*>/i,
];

const MAX_RAW_RESPONSE_CHARS = 20000;
const CODE_FENCE_REGEX = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i;

function stripControlChars(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if ((code >= 0 && code <= 0x1f) || (code >= 0x7f && code <= 0x9f)) {
      continue;
    }
    result += text[i];
  }
  return result;
}

/** Normalizes, strips control and delimiter characters, collapses whitespace, and bounds user text safely. */
export function sanitizeUserText(raw: string, maxLen: number = MAX_NOTES_LENGTH): string {
  const limit = Math.max(0, maxLen);
  const normalized = raw.normalize('NFKC');
  const withoutControls = stripControlChars(normalized);
  let cleaned = withoutControls.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

  if (cleaned.length > limit) {
    cleaned = cleaned.slice(0, limit);
    if (/[\uD800-\uDBFF]$/.test(cleaned)) {
      cleaned = cleaned.slice(0, -1);
    }
  }

  return cleaned;
}

/** Scans user text for prompt injection and role override attempt patterns. */
export function detectInjection(text: string): { flagged: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const pattern of INJECTION_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      matches.push(match[0].trim());
    }
  }
  return { flagged: matches.length > 0, matches };
}

/** Generates a cryptographically random 16-hex-character nonce string. */
export function createNonce(): string {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    throw new LlmError('crypto_unavailable');
  }
  const bytes = new Uint8Array(8);
  cryptoObj.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Wraps untrusted user notes in unique nonce-delimited tags. */
export function wrapUntrusted(text: string, nonce: string): string {
  return `<user_notes_${nonce}>${text}</user_notes_${nonce}>`;
}

/** Safely parses candidate JSON text from an LLM response with size and fence guards. */
export function parseJsonSafely(raw: string): unknown | null {
  if (typeof raw !== 'string' || raw.length > MAX_RAW_RESPONSE_CHARS) {
    return null;
  }
  let payload = raw.trim();
  const fenceMatch = CODE_FENCE_REGEX.exec(payload);
  if (fenceMatch && fenceMatch[1] !== undefined) {
    payload = fenceMatch[1].trim();
  }
  try {
    const parsed: unknown = JSON.parse(payload);
    return parsed;
  } catch {
    return null;
  }
}

/** Validates an untrusted parsed object against the strict PersonalizedIdeas schema. */
export function validateIdeas(
  candidate: unknown
): { ok: true; value: PersonalizedIdeas } | { ok: false } {
  const result = PersonalizedIdeasSchema.safeParse(candidate);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return { ok: false };
}
