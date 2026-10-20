import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  daysBetween,
  isValidIsoDate,
  todayIso,
} from '../src/utils/dateMath';

describe('isValidIsoDate', () => {
  it('accepts valid calendar dates', () => {
    expect(isValidIsoDate('2026-05-15')).toBe(true);
    expect(isValidIsoDate('2026-01-31')).toBe(true);
    expect(isValidIsoDate('2026-12-31')).toBe(true);
  });

  it('validates leap years correctly', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('2000-02-29')).toBe(true);
    expect(isValidIsoDate('2026-02-29')).toBe(false);
    expect(isValidIsoDate('1900-02-29')).toBe(false);
  });

  it('rejects invalid day counts and out-of-range months', () => {
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('2026-04-31')).toBe(false);
    expect(isValidIsoDate('2026-13-01')).toBe(false);
    expect(isValidIsoDate('2026-00-10')).toBe(false);
    expect(isValidIsoDate('2026-01-00')).toBe(false);
  });

  it('rejects malformed strings', () => {
    expect(isValidIsoDate('')).toBe(false);
    expect(isValidIsoDate('2026-1-1')).toBe(false);
    expect(isValidIsoDate('2026/01/01')).toBe(false);
    expect(isValidIsoDate('2026-05-15T00:00:00Z')).toBe(false);
    expect(isValidIsoDate('random-text')).toBe(false);
  });
});

describe('daysBetween', () => {
  it('computes positive, negative, and zero day differences', () => {
    expect(daysBetween('2026-01-01', '2026-01-10')).toBe(9);
    expect(daysBetween('2026-01-10', '2026-01-01')).toBe(-9);
    expect(daysBetween('2026-03-15', '2026-03-15')).toBe(0);
  });

  it('correctly accounts for leap day spans', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
  });

  it('throws on invalid ISO date inputs', () => {
    expect(() => daysBetween('invalid', '2026-01-01')).toThrow();
    expect(() => daysBetween('2026-01-01', '2026-02-30')).toThrow();
  });
});

describe('addDays', () => {
  it('adds positive and negative day counts', () => {
    expect(addDays('2026-01-30', 5)).toBe('2026-02-04');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-06-15', 0)).toBe('2026-06-15');
  });

  it('handles negative days across leap years', () => {
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('throws on invalid ISO date inputs', () => {
    expect(() => addDays('2026-02-30', 1)).toThrow();
  });
});

describe('addMonths', () => {
  it('clamps to month-end correctly for Jan 31 + 1 month in non-leap vs leap year', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
  });

  it('clamps to month-end for August 31 + 1 month', () => {
    expect(addMonths('2026-08-31', 1)).toBe('2026-09-30');
  });

  it('handles Feb 29 leap to non-leap clamp', () => {
    expect(addMonths('2024-02-29', 12)).toBe('2025-02-28');
    expect(addMonths('2024-02-29', 48)).toBe('2028-02-29');
  });

  it('handles negative month shifts with clamping', () => {
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(addMonths('2024-03-31', -1)).toBe('2024-02-29');
    expect(addMonths('2026-01-15', -2)).toBe('2025-11-15');
  });

  it('preserves day when within target month bounds', () => {
    expect(addMonths('2026-01-15', 1)).toBe('2026-02-15');
    expect(addMonths('2026-05-31', 2)).toBe('2026-07-31');
  });

  it('throws on invalid ISO input', () => {
    expect(() => addMonths('not-a-date', 1)).toThrow();
  });
});

describe('todayIso', () => {
  it('returns a valid UTC ISO date matching format YYYY-MM-DD', () => {
    const today = todayIso();
    expect(isValidIsoDate(today)).toBe(true);
    expect(/^\d{4}-\d{2}-\d{2}$/.test(today)).toBe(true);
  });
});
