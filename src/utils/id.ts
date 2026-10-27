import { ignoreExpectedError } from './errors';

let fallbackCounter = 0;

/**
 * Generates a unique identifier string without ever throwing an exception.
 * Tries `crypto.randomUUID`, then `crypto.getRandomValues`, then timestamp + counter.
 */
export function createId(): string {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      if (typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
      }
      if (typeof globalThis.crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        globalThis.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      }
    }
  } catch (_err) {
    ignoreExpectedError(_err, 'crypto API unavailable or blocked');
  }

  fallbackCounter = (fallbackCounter + 1) % 1_000_000;
  const timestamp = Date.now().toString(36);
  const count = fallbackCounter.toString(36).padStart(4, '0');
  return `id-${timestamp}-${count}`;
}
