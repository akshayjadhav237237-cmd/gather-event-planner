export interface IdeasSession {
  fingerprint: string;
  variant: number;
}

const sessionStore = new Map<string, IdeasSession>();

export function getSession(contextId: string): IdeasSession | undefined {
  return sessionStore.get(contextId);
}

export function setSession(contextId: string, session: IdeasSession): void {
  sessionStore.set(contextId, session);
}

export function clearSession(contextId: string): void {
  sessionStore.delete(contextId);
}

export function clearAllSessions(): void {
  sessionStore.clear();
}
