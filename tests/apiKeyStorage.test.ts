import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearApiKey, getApiKey, hasApiKey, setApiKey } from '../src/ai/apiKeyStorage';
import { API_KEY_SESSION_KEY } from '../src/config/constants';

class MockStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

class ThrowingStorage implements Storage {
  get length(): number {
    throw new Error('SecurityError');
  }

  getItem(): string | null {
    throw new Error('SecurityError');
  }

  setItem(): void {
    throw new Error('QuotaExceededError');
  }

  removeItem(): void {
    throw new Error('SecurityError');
  }

  clear(): void {
    throw new Error('SecurityError');
  }

  key(): string | null {
    throw new Error('SecurityError');
  }
}

describe('apiKeyStorage', () => {
  const originalStorage = globalThis.sessionStorage;
  const validKey = 'TESTKSyD-1234567890abcdefghijklmnopqrstuvwxyz';

  beforeEach(() => {
    globalThis.sessionStorage = new MockStorage();
  });

  afterEach(() => {
    if (originalStorage) {
      globalThis.sessionStorage = originalStorage;
    } else {
      delete (globalThis as Record<string, unknown>).sessionStorage;
    }
  });

  it('returns null and false when storage is initially empty', () => {
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
  });

  it('saves and retrieves a valid API key', () => {
    const success = setApiKey(validKey);
    expect(success).toBe(true);
    expect(getApiKey()).toBe(validKey);
    expect(hasApiKey()).toBe(true);
    expect(globalThis.sessionStorage.getItem(API_KEY_SESSION_KEY)).toBe(validKey);
  });

  it('trims whitespace when saving and retrieving', () => {
    const success = setApiKey(`  ${validKey}  `);
    expect(success).toBe(true);
    expect(getApiKey()).toBe(validKey);
  });

  it('rejects invalid or malformed candidate keys', () => {
    expect(setApiKey('')).toBe(false);
    expect(setApiKey('too-short')).toBe(false);
    expect(setApiKey(`invalid chars!@#$ ${validKey}`)).toBe(false);
    expect(setApiKey('a'.repeat(250))).toBe(false);
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
  });

  it('clears stored key on clearApiKey', () => {
    setApiKey(validKey);
    expect(hasApiKey()).toBe(true);
    clearApiKey();
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
  });

  it('gracefully handles missing sessionStorage (returns null/false and does not throw)', () => {
    delete (globalThis as Record<string, unknown>).sessionStorage;
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
    expect(setApiKey(validKey)).toBe(false);
    expect(() => clearApiKey()).not.toThrow();
  });

  it('survives throwing sessionStorage without uncaught errors', () => {
    globalThis.sessionStorage = new ThrowingStorage();
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
    expect(setApiKey(validKey)).toBe(false);
    expect(() => clearApiKey()).not.toThrow();
  });
});
