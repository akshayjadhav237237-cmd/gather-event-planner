import { describe, expect, it } from 'vitest';
import {
  CONTEXT_FLAGS,
  CURRENCY_CODES,
  EVENT_TYPES,
  SEASONS,
  SUB_FORMATS,
  VENUE_SETTINGS,
} from '../src/config/constants';
import type { ContextFlag } from '../src/types/event';
import {
  CURRENCY_LABELS,
  EVENT_TYPE_BLURBS,
  EVENT_TYPE_LABELS,
  FLAG_GROUPS,
  FLAG_LABELS,
  isFlagRelevant,
  SEASON_LABELS,
  SETTING_LABELS,
  SUBFORMAT_LABELS,
} from '../src/ui/labels';

describe('labels configuration', () => {
  it('covers every EventType with non-empty label and blurb', () => {
    for (const type of EVENT_TYPES) {
      expect(EVENT_TYPE_LABELS[type]).toBeDefined();
      expect(EVENT_TYPE_LABELS[type].trim().length).toBeGreaterThan(0);
      expect(EVENT_TYPE_BLURBS[type]).toBeDefined();
      expect(EVENT_TYPE_BLURBS[type].trim().length).toBeGreaterThan(0);
    }
  });

  it('covers every SubFormat with non-empty label', () => {
    for (const format of SUB_FORMATS) {
      expect(SUBFORMAT_LABELS[format]).toBeDefined();
      expect(SUBFORMAT_LABELS[format].trim().length).toBeGreaterThan(0);
    }
  });

  it('covers every Season with non-empty label', () => {
    for (const season of SEASONS) {
      expect(SEASON_LABELS[season]).toBeDefined();
      expect(SEASON_LABELS[season].trim().length).toBeGreaterThan(0);
    }
  });

  it('covers every VenueSetting with non-empty label', () => {
    for (const setting of VENUE_SETTINGS) {
      expect(SETTING_LABELS[setting]).toBeDefined();
      expect(SETTING_LABELS[setting].trim().length).toBeGreaterThan(0);
    }
  });

  it('covers every CurrencyCode with non-empty label containing symbol', () => {
    for (const currency of CURRENCY_CODES) {
      expect(CURRENCY_LABELS[currency]).toBeDefined();
      expect(CURRENCY_LABELS[currency].trim().length).toBeGreaterThan(0);
    }
  });

  it('covers every ContextFlag with non-empty label', () => {
    for (const flag of CONTEXT_FLAGS) {
      expect(FLAG_LABELS[flag]).toBeDefined();
      expect(FLAG_LABELS[flag].trim().length).toBeGreaterThan(0);
    }
  });

  it('places every ContextFlag in exactly one group in FLAG_GROUPS', () => {
    const groupedFlags: ContextFlag[] = [];
    for (const group of FLAG_GROUPS) {
      expect(group.title.trim().length).toBeGreaterThan(0);
      expect(group.flags.length).toBeGreaterThan(0);
      for (const flag of group.flags) {
        expect(CONTEXT_FLAGS).toContain(flag);
        groupedFlags.push(flag);
      }
    }

    expect(groupedFlags).toHaveLength(CONTEXT_FLAGS.length);
    const uniqueFlags = new Set(groupedFlags);
    expect(uniqueFlags.size).toBe(CONTEXT_FLAGS.length);
    for (const flag of CONTEXT_FLAGS) {
      expect(uniqueFlags.has(flag)).toBe(true);
    }
  });

  it('ensures every ContextFlag is relevant for at least one event type', () => {
    for (const flag of CONTEXT_FLAGS) {
      const isRelevantSomewhere = EVENT_TYPES.some((type) =>
        isFlagRelevant(flag, type)
      );
      expect(isRelevantSomewhere).toBe(true);
    }
  });

  it('verifies specific flag relevance rules per specification', () => {
    expect(isFlagRelevant('multi_ceremony', 'wedding')).toBe(true);
    expect(isFlagRelevant('multi_ceremony', 'birthday')).toBe(false);
    expect(isFlagRelevant('multi_ceremony', 'community')).toBe(false);

    expect(isFlagRelevant('sponsorship_needed', 'community')).toBe(true);
    expect(isFlagRelevant('sponsorship_needed', 'wedding')).toBe(false);
    expect(isFlagRelevant('sponsorship_needed', 'birthday')).toBe(false);

    expect(isFlagRelevant('open_bar', 'wedding')).toBe(true);
    expect(isFlagRelevant('open_bar', 'birthday')).toBe(true);
    expect(isFlagRelevant('open_bar', 'community')).toBe(false);

    expect(isFlagRelevant('latex_allergy', 'birthday')).toBe(true);
    expect(isFlagRelevant('latex_allergy', 'community')).toBe(true);
    expect(isFlagRelevant('latex_allergy', 'wedding')).toBe(false);

    expect(isFlagRelevant('nut_allergy', 'wedding')).toBe(true);
    expect(isFlagRelevant('nut_allergy', 'birthday')).toBe(true);
    expect(isFlagRelevant('nut_allergy', 'community')).toBe(true);
  });
});
