import { safeValidateIdeasSession } from '../types/schemas';

export interface IdeasSession {
  fingerprint: string;
  variant: number;
}

const sessionStore = new Map<string, IdeasSession>();

export function getSession(contextId: string): IdeasSession | undefined {
  const item = sessionStore.get(contextId);
  if (!item) return undefined;
  const validated = safeValidateIdeasSession(item);
  if (!validated) {
    sessionStore.delete(contextId);
    return undefined;
  }
  return validated;
}

export function setSession(contextId: string, session: IdeasSession): void {
  const validated = safeValidateIdeasSession(session);
  if (validated) {
    sessionStore.set(contextId, validated);
  }
}

export function clearSession(contextId: string): void {
  sessionStore.delete(contextId);
}

export function clearAllSessions(): void {
  sessionStore.clear();
}
