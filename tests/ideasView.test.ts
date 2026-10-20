import { describe, expect, it } from 'vitest';
import type { ContextSignals } from '../src/types/engine';
import type { EventContext } from '../src/types/event';
import {
  decideIdeasAction,
  describeResult,
  ideasFingerprint,
  SECTION_LABELS,
} from '../src/ui/ideasView';

function makeContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    id: 'evt-1',
    title: 'Spring Garden Party',
    eventType: 'birthday',
    subFormat: 'adult_milestone',
    eventDate: '2026-05-15',
    currency: 'USD',
    totalBudget: 5000,
    guestCount: 40,
    setting: 'outdoor',
    season: 'summer',
    priorities: ['catering'],
    flags: ['gluten_free', 'vegan'],
    userNotes: 'Rustic floral',
    ...overrides,
  };
}

function makeSignals(overrides: Partial<ContextSignals> = {}): ContextSignals {
  return {
    daysUntilEvent: 90,
    isPast: false,
    isShortNotice: false,
    perGuestBudget: 125,
    floorPerGuest: 50,
    isBelowFloor: false,
    budgetTier: 'moderate',
    isMicroEvent: true,
    isLargeCrowd: false,
    isOutdoorExposed: true,
    hasYoungKids: false,
    hasSchoolKids: false,
    ...overrides,
  };
}

describe('ideasView UI logic', () => {
  describe('ideasFingerprint', () => {
    it('is stable for identical inputs', () => {
      const ctx = makeContext();
      const sig = makeSignals();
      expect(ideasFingerprint(ctx, sig)).toBe(ideasFingerprint(ctx, sig));
    });

    it('ignores non-functional fields like title, eventDate, and totalBudget', () => {
      const base = ideasFingerprint(makeContext(), makeSignals());
      const mod = ideasFingerprint(
        makeContext({
          title: 'Different Title',
          eventDate: '2027-12-31',
          totalBudget: 99999,
          guestCount: 999,
          id: 'diff-id',
        }),
        makeSignals()
      );
      expect(base).toBe(mod);
    });

    it('ignores context flags ordering by sorting flags', () => {
      const c1 = makeContext({ flags: ['gluten_free', 'vegan', 'wheelchair_access'] });
      const c2 = makeContext({ flags: ['wheelchair_access', 'vegan', 'gluten_free'] });
      expect(ideasFingerprint(c1, makeSignals())).toBe(ideasFingerprint(c2, makeSignals()));
    });

    it('trims whitespace around user notes', () => {
      const c1 = makeContext({ userNotes: 'Cozy vibes' });
      const c2 = makeContext({ userNotes: '   Cozy vibes \n\t  ' });
      expect(ideasFingerprint(c1, makeSignals())).toBe(ideasFingerprint(c2, makeSignals()));
    });

    it('changes when functional context or signal fields change', () => {
      const ctx = makeContext();
      const sig = makeSignals();
      const base = ideasFingerprint(ctx, sig);

      expect(ideasFingerprint(makeContext({ setting: 'indoor' }), sig)).not.toBe(base);
      expect(ideasFingerprint(makeContext({ season: 'winter' }), sig)).not.toBe(base);
      expect(
        ideasFingerprint(makeContext({ eventType: 'wedding', subFormat: 'western' }), sig)
      ).not.toBe(base);
      expect(ideasFingerprint(makeContext({ flags: ['halal'] }), sig)).not.toBe(base);
      expect(ideasFingerprint(ctx, makeSignals({ budgetTier: 'tight' }))).not.toBe(base);
      expect(ideasFingerprint(ctx, makeSignals({ isShortNotice: true }))).not.toBe(base);
      expect(ideasFingerprint(makeContext({ userNotes: 'Neon' }), sig)).not.toBe(base);
    });
  });

  describe('decideIdeasAction', () => {
    it('returns generate when there are no ideas yet', () => {
      const action = decideIdeasAction({
        hasIdeas: false,
        knownFingerprint: 'fp-1',
        currentFingerprint: 'fp-1',
        hasLiveKey: true,
      });
      expect(action).toBe('generate');
    });

    it('returns record_baseline when ideas exist but known fingerprint is null', () => {
      const action = decideIdeasAction({
        hasIdeas: true,
        knownFingerprint: null,
        currentFingerprint: 'fp-1',
        hasLiveKey: false,
      });
      expect(action).toBe('record_baseline');
    });

    it('returns none when known fingerprint matches current fingerprint', () => {
      const action = decideIdeasAction({
        hasIdeas: true,
        knownFingerprint: 'fp-1',
        currentFingerprint: 'fp-1',
        hasLiveKey: true,
      });
      expect(action).toBe('none');
    });

    it('returns regenerate_local when fingerprint differs and hasLiveKey is false', () => {
      const action = decideIdeasAction({
        hasIdeas: true,
        knownFingerprint: 'fp-1',
        currentFingerprint: 'fp-2',
        hasLiveKey: false,
      });
      expect(action).toBe('regenerate_local');
    });

    it('returns mark_stale when fingerprint differs and hasLiveKey is true', () => {
      const action = decideIdeasAction({
        hasIdeas: true,
        knownFingerprint: 'fp-1',
        currentFingerprint: 'fp-2',
        hasLiveKey: true,
      });
      expect(action).toBe('mark_stale');
    });
  });

  describe('describeResult', () => {
    it('describes live ideas when mode is live', () => {
      const res = describeResult('local', 'live', null);
      expect(res.label).toBe('Live ideas');
      expect(res.tone).toBe('accent');
      expect(res.detail).toContain('Gemini');
    });

    it('describes live ideas when source is live without fallback', () => {
      const res = describeResult('live', null, null);
      expect(res.label).toBe('Live ideas');
      expect(res.tone).toBe('accent');
    });

    it('describes fallback for specific reasons', () => {
      const r1 = describeResult('local', 'fallback', 'rate_limited');
      expect(r1.label).toBe('Offline fallback');
      expect(r1.tone).toBe('warning');
      expect(r1.detail).toContain('cooldown');

      const r2 = describeResult('local', 'fallback', 'timeout');
      expect(r2.detail).toContain('timeout');

      const r3 = describeResult('local', 'fallback', 'invalid_response');
      expect(r3.detail).toContain('bounds');

      const r4 = describeResult('local', 'fallback', 'network');
      expect(r4.detail).toBe('Operating on offline ideas as fallback.');
    });

    it('describes offline ideas for local mode / default', () => {
      const res = describeResult('local', 'local', null);
      expect(res.label).toBe('Offline ideas');
      expect(res.tone).toBe('neutral');
      expect(res.detail).toContain('heuristic banks');
    });
  });

  describe('SECTION_LABELS', () => {
    it('contains all 4 idea sections with exact labels', () => {
      expect(SECTION_LABELS.themeConcepts).toBe('Themes');
      expect(SECTION_LABELS.cateringIdeas).toBe('Food & Drink');
      expect(SECTION_LABELS.activityIdeas).toBe('Activities');
      expect(SECTION_LABELS.bespokeTasks).toBe('Bespoke Checklist');
    });
  });
});
