import { ignoreExpectedError } from './errors';

export interface StorageAdapter {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
  clear?: () => void;
}

function getUnderlyingStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && globalThis[type]) {
      return globalThis[type];
    }
    if (typeof window !== 'undefined' && window[type]) {
      return window[type];
    }
  } catch (_err) {
    ignoreExpectedError(_err, `${type} access denied`);
  }
  return null;
}

/** Creates a storage adapter that falls back to in-memory storage when browser storage is unavailable or throws. */
export function createSafeStorage(type: 'localStorage' | 'sessionStorage'): StorageAdapter {
  const memoryFallback = new Map<string, string>();

  return {
    getItem: (name: string): string | null => {
      const storage = getUnderlyingStorage(type);
      if (storage) {
        try {
          return storage.getItem(name);
        } catch (_err) {
          ignoreExpectedError(_err, `${type} getItem access denied`);
        }
      }
      return memoryFallback.get(name) ?? null;
    },

    setItem: (name: string, value: string): void => {
      const storage = getUnderlyingStorage(type);
      if (storage) {
        try {
          storage.setItem(name, value);
          return;
        } catch (_err) {
          ignoreExpectedError(_err, `${type} setItem quota or security exception`);
        }
      }
      memoryFallback.set(name, value);
    },

    removeItem: (name: string): void => {
      const storage = getUnderlyingStorage(type);
      if (storage) {
        try {
          storage.removeItem(name);
        } catch (_err) {
          ignoreExpectedError(_err, `${type} removeItem access denied`);
        }
      }
      memoryFallback.delete(name);
    },

    clear: (): void => {
      const storage = getUnderlyingStorage(type);
      if (storage) {
        try {
          storage.clear();
        } catch (_err) {
          ignoreExpectedError(_err, `${type} clear access denied`);
        }
      }
      memoryFallback.clear();
    },
  };
}

/** Resilient localStorage adapter with memory fallback for plan state persistence. */
export const safeLocalStorage: StorageAdapter = createSafeStorage('localStorage');

/** Resilient sessionStorage adapter with memory fallback for transient session tokens. */
export const safeSessionStorage: StorageAdapter = createSafeStorage('sessionStorage');
