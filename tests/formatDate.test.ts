import { describe, expect, it } from 'vitest';
import { formatDateLong, formatDateShort } from '../src/ui/formatDate';

describe('formatDateLong', () => {
  it('formats standard dates correctly in UTC', () => {
    expect(formatDateLong('2026-06-15')).toBe('June 15, 2026');
    expect(formatDateLong('2026-01-01')).toBe('January 1, 2026');
  });

  it('correctly handles UTC leap day in a leap year', () => {
    expect(formatDateLong('2024-02-29')).toBe('February 29, 2024');
    expect(formatDateLong('2028-02-29')).toBe('February 29, 2028');
  });

  it('correctly handles month-end dates', () => {
    expect(formatDateLong('2026-01-31')).toBe('January 31, 2026');
    expect(formatDateLong('2026-02-28')).toBe('February 28, 2026');
    expect(formatDateLong('2026-04-30')).toBe('April 30, 2026');
    expect(formatDateLong('2026-12-31')).toBe('December 31, 2026');
  });

  it('falls back to returning the original string when given an invalid date', () => {
    expect(formatDateLong('invalid-date')).toBe('invalid-date');
    expect(formatDateLong('')).toBe('');
    expect(formatDateLong('2026-02-29')).toBe('2026-02-29');
    expect(formatDateLong('2026-13-01')).toBe('2026-13-01');
    expect(formatDateLong('2026-04-31')).toBe('2026-04-31');
  });

  it('respects different locales', () => {
    const formattedFr = formatDateLong('2026-06-15', 'fr-FR');
    expect(formattedFr.toLowerCase()).toContain('juin');
  });
});

describe('formatDateShort', () => {
  it('formats dates in short format (e.g. 12 Mar 2027 or Mar 12, 2027 depending on locale)', () => {
    const shortEn = formatDateShort('2027-03-12', 'en-GB');
    expect(shortEn).toMatch(/12\s+Mar\s+2027/);
    const shortUs = formatDateShort('2027-03-12', 'en-US');
    expect(shortUs).toMatch(/Mar\s+12,\s+2027/);
  });

  it('handles leap days and month ends in short format', () => {
    expect(formatDateShort('2024-02-29', 'en-GB')).toMatch(/29\s+Feb\s+2024/);
    expect(formatDateShort('2026-12-31', 'en-GB')).toMatch(/31\s+Dec\s+2026/);
  });

  it('falls back safely for invalid input', () => {
    expect(formatDateShort('invalid-date')).toBe('invalid-date');
    expect(formatDateShort('')).toBe('');
    expect(formatDateShort('2026-02-29')).toBe('2026-02-29');
  });
});
