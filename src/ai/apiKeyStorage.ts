import { API_KEY_SESSION_KEY } from '../config/constants';
import { isPlausibleApiKey } from './securityGuard';

/** Retrieves the active Gemini API key from session storage, or null if unset or inaccessible. */
export function getApiKey(): string | null {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const stored = sessionStorage.getItem(API_KEY_SESSION_KEY);
    if (!stored || stored.trim().length === 0) {
      return null;
    }
    return stored.trim();
  } catch {
    return null;
  }
}

/** Validates and saves a candidate Gemini API key to session storage. Returns false if format is invalid. */
export function setApiKey(value: string): boolean {
  if (!isPlausibleApiKey(value)) {
    return false;
  }
  try {
    if (typeof sessionStorage === 'undefined') {
      return false;
    }
    sessionStorage.setItem(API_KEY_SESSION_KEY, value.trim());
    return true;
  } catch {
    return false;
  }
}

/** Removes any stored Gemini API key from session storage. */
export function clearApiKey(): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(API_KEY_SESSION_KEY);
    }
  } catch {
    // Gracefully handle storage errors
  }
}

/** Returns whether a non-empty API key is currently stored in session storage. */
export function hasApiKey(): boolean {
  return getApiKey() !== null;
}
