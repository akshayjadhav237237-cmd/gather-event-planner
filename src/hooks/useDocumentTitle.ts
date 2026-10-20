import { useEffect } from 'react';

const APP_NAME = 'Gather';
const DEFAULT_TITLE = 'Gather · Celebration & Event Planner';

/**
 * Updates document.title.
 * If title is provided, formats as "${title} · Gather".
 * If empty or null, defaults to "Gather · Celebration & Event Planner".
 */
export function useDocumentTitle(title?: string | null): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (title && title.trim()) {
      document.title = `${title.trim()} · ${APP_NAME}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [title]);
}
