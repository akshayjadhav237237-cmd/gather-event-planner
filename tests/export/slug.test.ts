import { describe, expect, it } from 'vitest';
import { toFileSlug } from '../../src/export/slug';

describe('toFileSlug', () => {
  it('converts standard celebration title to lowercase hyphenated slug', () => {
    expect(toFileSlug('Summer Birthday 2027')).toBe('summer-birthday-2027');
  });

  it('normalizes and strips unicode accents', () => {
    expect(toFileSlug('Événement Célébration')).toBe('evenement-celebration');
    expect(toFileSlug('Niño & Schön')).toBe('nino-schon');
  });

  it('strips symbols and non-alphanumeric characters except hyphens', () => {
    expect(toFileSlug("John & Jane's Wedding! #1")).toBe('john-janes-wedding-1');
    expect(toFileSlug('Festival @ the Park ($100)')).toBe('festival-the-park-100');
  });

  it('collapses multiple spaces, underscores, and hyphens into single hyphens', () => {
    expect(toFileSlug('Community___Block   Party---2027')).toBe('community-block-party-2027');
  });

  it('trims leading and trailing hyphens', () => {
    expect(toFileSlug('--My Event--')).toBe('my-event');
    expect(toFileSlug('   ---Special Day---   ')).toBe('special-day');
  });

  it('truncates to maximum 50 characters without trailing hyphen', () => {
    const longTitle =
      'Super Long Celebration Event Title That Definitely Exceeds Fifty Characters Limit';
    const slug = toFileSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('trims trailing hyphen if cut at boundary', () => {
    // 49 characters followed by a hyphen and more letters
    const prefix = 'a'.repeat(49);
    const title = `${prefix}-extra-content`;
    const slug = toFileSlug(title);
    expect(slug).toBe(prefix);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('returns default fallback for empty string or symbols-only title', () => {
    expect(toFileSlug('')).toBe('event-plan');
    expect(toFileSlug('   ')).toBe('event-plan');
    expect(toFileSlug('!@#$%^&*()_+{}[]:;<>?,./')).toBe('event-plan');
  });

  it('respects custom fallback when provided', () => {
    expect(toFileSlug('', 'my-fallback')).toBe('my-fallback');
    expect(toFileSlug('???', 'custom-slug')).toBe('custom-slug');
  });

  it('never returns an empty string even if fallback is empty', () => {
    expect(toFileSlug('', '')).toBe('event-plan');
  });
});
