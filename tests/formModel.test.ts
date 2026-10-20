import { describe, expect, it } from 'vitest';
import { CURRENCY_CODES, EVENT_TYPES } from '../src/config/constants';
import { getPerHeadFloor } from '../src/data/perHeadFloors';
import type { EventContext } from '../src/types/event';
import {
  applyEventTypeChange,
  createDraft,
  describeBudgetHint,
  draftFromContext,
  parseDraft,
  parseWholeNumber,
  toggleFlag,
  togglePriority,
} from '../src/ui/formModel';

describe('formModel', () => {
  const TODAY = '2026-10-20';

  it('createDraft passes parseDraft across all 3 event types x 4 currencies', () => {
    for (const type of EVENT_TYPES) {
      for (const curr of CURRENCY_CODES) {
        const draft = createDraft(type, TODAY, curr);
        const result = parseDraft(draft, `test-${type}-${curr}`);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.eventType).toBe(type);
          expect(result.value.currency).toBe(curr);
          const floor = getPerHeadFloor(type, curr);
          const perGuest = result.value.totalBudget / result.value.guestCount;
          expect(perGuest).toBeGreaterThan(floor);
        }
      }
    }
  });

  it('parseWholeNumber handles commas, spaces, underscores, and bad input', () => {
    expect(parseWholeNumber('1,000,000')).toBe(1000000);
    expect(parseWholeNumber(' 250 000 ')).toBe(250000);
    expect(parseWholeNumber('10_500')).toBe(10500);
    expect(parseWholeNumber('42')).toBe(42);
    expect(parseWholeNumber('0')).toBe(0);
    expect(Number.isNaN(parseWholeNumber(''))).toBe(true);
    expect(Number.isNaN(parseWholeNumber('-50'))).toBe(true);
    expect(Number.isNaN(parseWholeNumber('12.34'))).toBe(true);
    expect(Number.isNaN(parseWholeNumber('abc'))).toBe(true);
    expect(Number.isNaN(parseWholeNumber('100k'))).toBe(true);
  });

  it('returns structured validation errors for invalid fields', () => {
    const draft = createDraft('wedding', TODAY, 'INR');
    draft.title = '';
    draft.totalBudget = '0';
    draft.guestCount = '0';
    draft.eventDate = 'invalid-date';
    draft.userNotes = 'x'.repeat(301);

    const result = parseDraft(draft, 'test-err');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe('Enter a title for your event.');
      expect(result.errors.totalBudget).toBe('Enter a budget greater than zero.');
      expect(result.errors.guestCount).toBe('Enter a guest count between 1 and 10,000.');
      expect(result.errors.eventDate).toBe('Select a valid calendar date.');
      expect(result.errors.userNotes).toBe('Notes cannot exceed 300 characters.');
    }
  });

  it('rejects guest count above 10,000', () => {
    const draft = createDraft('community', TODAY, 'USD');
    draft.guestCount = '10001';
    const result = parseDraft(draft, 'test-guests');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.guestCount).toBe('Enter a guest count between 1 and 10,000.');
    }
  });

  it('applyEventTypeChange resets subFormat and cleans priorities and flags', () => {
    let draft = createDraft('wedding', TODAY, 'INR');
    draft.priorities = ['ceremony_rituals', 'venue'];
    draft.flags = ['multi_ceremony', 'open_bar', 'nut_allergy'];

    draft = applyEventTypeChange(draft, 'community');
    expect(draft.eventType).toBe('community');
    expect(draft.subFormat).toBe('festival');
    expect(draft.priorities).not.toContain('ceremony_rituals');
    expect(draft.flags).not.toContain('multi_ceremony');
    expect(draft.flags).not.toContain('open_bar');
    expect(draft.flags).toContain('nut_allergy');
  });

  it('togglePriority enforces 3 items max and category validity', () => {
    let draft = createDraft('wedding', TODAY, 'INR');
    draft = togglePriority(draft, 'invalid_cat');
    expect(draft.priorities).toHaveLength(0);

    draft = togglePriority(draft, 'venue');
    expect(draft.priorities).toEqual(['venue']);
    draft = togglePriority(draft, 'catering');
    draft = togglePriority(draft, 'decor_florals');
    expect(draft.priorities).toHaveLength(3);

    draft = togglePriority(draft, 'photo_video');
    expect(draft.priorities).toHaveLength(3);
    expect(draft.priorities).not.toContain('photo_video');

    draft = togglePriority(draft, 'venue');
    expect(draft.priorities).toEqual(['catering', 'decor_florals']);
  });

  it('toggleFlag toggles flags on and off', () => {
    let draft = createDraft('birthday', TODAY, 'USD');
    expect(draft.flags).not.toContain('latex_allergy');
    draft = toggleFlag(draft, 'latex_allergy');
    expect(draft.flags).toContain('latex_allergy');
    draft = toggleFlag(draft, 'latex_allergy');
    expect(draft.flags).not.toContain('latex_allergy');
  });

  it('describeBudgetHint generates formatted string and empty string on bad data', () => {
    const draft = createDraft('wedding', TODAY, 'USD');
    draft.totalBudget = '15000';
    draft.guestCount = '100';
    expect(describeBudgetHint(draft)).toBe('About $150 per guest');

    draft.guestCount = '0';
    expect(describeBudgetHint(draft)).toBe('');
    draft.guestCount = '50';
    draft.totalBudget = 'invalid';
    expect(describeBudgetHint(draft)).toBe('');
  });

  it('draftFromContext round-trips from EventContext', () => {
    const ctx: EventContext = {
      id: 'custom-1',
      title: 'Diamond Jubilee',
      eventType: 'birthday',
      subFormat: 'adult_milestone',
      eventDate: '2026-12-31',
      currency: 'GBP',
      totalBudget: 8000,
      guestCount: 60,
      setting: 'hybrid',
      season: 'winter',
      priorities: ['venue', 'catering_cake'],
      flags: ['wheelchair_access'],
      userNotes: 'Formal dress code.',
    };

    const draft = draftFromContext(ctx);
    expect(draft.totalBudget).toBe('8000');
    expect(draft.guestCount).toBe('60');
    expect(draft.title).toBe('Diamond Jubilee');

    const result = parseDraft(draft, ctx.id);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(ctx);
    }
  });
});
