import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { safeLocalStorage } from '../src/store/planStore';

describe('safeLocalStorage', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    safeLocalStorage.removeItem('test-key');
  });

  afterEach(() => {
    if (originalLocalStorage) {
      globalThis.localStorage = originalLocalStorage;
    }
  });

  it('sets, gets, and removes values in memory fallback when localStorage is absent', () => {
    // Simulate environment without localStorage
    delete (globalThis as Record<string, unknown>).localStorage;

    safeLocalStorage.setItem('mem-key', 'mem-val');
    expect(safeLocalStorage.getItem('mem-key')).toBe('mem-val');

    safeLocalStorage.removeItem('mem-key');
    expect(safeLocalStorage.getItem('mem-key')).toBeNull();
  });

  it('catches and handles localStorage security exceptions gracefully', () => {
    // Simulate throwing localStorage (e.g. private mode or storage disabled)
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('Access denied');
        },
        setItem: () => {
          throw new Error('Quota exceeded');
        },
        removeItem: () => {
          throw new Error('Access denied');
        },
      },
      configurable: true,
      writable: true,
    });

    expect(() => safeLocalStorage.setItem('err-key', 'val')).not.toThrow();
    expect(safeLocalStorage.getItem('err-key')).toBe('val');
    expect(() => safeLocalStorage.removeItem('err-key')).not.toThrow();
  });
});
