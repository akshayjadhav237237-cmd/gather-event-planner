import { afterEach, describe, expect, it } from 'vitest';
import {
  clearAllSessions,
  clearSession,
  getSession,
  setSession,
  type IdeasSession,
} from '../src/hooks/ideasSession';

describe('ideasSession', () => {
  afterEach(() => {
    clearAllSessions();
  });

  it('stores and retrieves session for a context ID', () => {
    const session: IdeasSession = { fingerprint: 'fp-123', variant: 2 };
    setSession('ctx-1', session);

    expect(getSession('ctx-1')).toEqual(session);
    expect(getSession('ctx-nonexistent')).toBeUndefined();
  });

  it('clears session for a specific context ID', () => {
    setSession('ctx-1', { fingerprint: 'fp-1', variant: 1 });
    setSession('ctx-2', { fingerprint: 'fp-2', variant: 2 });

    clearSession('ctx-1');
    expect(getSession('ctx-1')).toBeUndefined();
    expect(getSession('ctx-2')).toBeDefined();
  });

  it('clears all sessions on clearAllSessions', () => {
    setSession('ctx-1', { fingerprint: 'fp-1', variant: 1 });
    setSession('ctx-2', { fingerprint: 'fp-2', variant: 2 });

    clearAllSessions();
    expect(getSession('ctx-1')).toBeUndefined();
    expect(getSession('ctx-2')).toBeUndefined();
  });
});
