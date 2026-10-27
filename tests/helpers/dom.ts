import { configure } from '@testing-library/react';
import { vi } from 'vitest';
import { clearApiKey } from '../../src/ai/apiKeyStorage';
import { usePlanStore } from '../../src/store/planStore';

configure({ asyncUtilTimeout: 5000 });

// Polyfill HTMLDialogElement modal methods in jsdom if missing
if (typeof window !== 'undefined' && typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
      try {
        this.open = true;
      } catch {
        // attribute already set
      }
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      try {
        this.open = false;
      } catch {
        // attribute already removed
      }
    };
  }
}

// Polyfill Blob.prototype.text in environments where jsdom omits it
if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function (this: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

/** Resets store, clears API key, and cleans storage across test boundaries. */
export function resetTestStore(): void {
  usePlanStore.getState().clearAll();
  clearApiKey();
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear();
    } catch {
      // ignore
    }
    try {
      window.localStorage.clear();
    } catch {
      // ignore
    }
  }
}

/** Configures navigator.clipboard with a mock implementation. */
export function stubClipboard(): { writeText: ReturnType<typeof vi.fn> } {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return { writeText };
}

/** Stubs URL.createObjectURL and URL.revokeObjectURL on window. */
export function stubObjectURL(): {
  createObjectURL: ReturnType<typeof vi.fn>;
  revokeObjectURL: ReturnType<typeof vi.fn>;
} {
  const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  const revokeObjectURL = vi.fn();
  if (typeof window !== 'undefined') {
    window.URL.createObjectURL = createObjectURL as unknown as (obj: Blob | MediaSource) => string;
    window.URL.revokeObjectURL = revokeObjectURL as unknown as (url: string) => void;
  }
  return { createObjectURL, revokeObjectURL };
}
