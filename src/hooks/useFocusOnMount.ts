import { useEffect, useRef, type RefObject } from 'react';

/**
 * Hook that focuses the referenced element (or queries view H1) when mounted
 * or when a trigger key changes.
 * Ensures the target element has tabIndex="-1" for programmatic focus if none is set.
 * Uses preventScroll to avoid synchronous forced reflow caused by viewport scrolling.
 */
export function useFocusOnMount<T extends HTMLElement>(triggerKey?: unknown): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el =
      ref.current ?? (typeof document !== 'undefined' ? document.querySelector<T>('h1') : null);
    if (el) {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '-1');
      }
      el.focus({ preventScroll: true });
    }
  }, [triggerKey]);

  return ref;
}
