import { describe, it, expect } from 'vitest';
import { nextTabIndex } from '../src/ui/tabNav';

describe('nextTabIndex', () => {
  it('navigates forward with ArrowRight and wraps around', () => {
    expect(nextTabIndex(0, 3, 'ArrowRight')).toBe(1);
    expect(nextTabIndex(1, 3, 'ArrowRight')).toBe(2);
    expect(nextTabIndex(2, 3, 'ArrowRight')).toBe(0);
  });

  it('navigates backward with ArrowLeft and wraps around', () => {
    expect(nextTabIndex(0, 3, 'ArrowLeft')).toBe(2);
    expect(nextTabIndex(2, 3, 'ArrowLeft')).toBe(1);
    expect(nextTabIndex(1, 3, 'ArrowLeft')).toBe(0);
  });

  it('navigates to first tab with Home', () => {
    expect(nextTabIndex(2, 4, 'Home')).toBe(0);
    expect(nextTabIndex(0, 4, 'Home')).toBe(0);
  });

  it('navigates to last tab with End', () => {
    expect(nextTabIndex(0, 4, 'End')).toBe(3);
    expect(nextTabIndex(3, 4, 'End')).toBe(3);
  });

  it('returns null for unrelated keys', () => {
    expect(nextTabIndex(1, 3, 'Tab')).toBeNull();
    expect(nextTabIndex(1, 3, 'Enter')).toBeNull();
    expect(nextTabIndex(1, 3, ' ')).toBeNull();
    expect(nextTabIndex(1, 3, 'Escape')).toBeNull();
  });

  it('handles single tab correctly', () => {
    expect(nextTabIndex(0, 1, 'ArrowRight')).toBe(0);
    expect(nextTabIndex(0, 1, 'ArrowLeft')).toBe(0);
    expect(nextTabIndex(0, 1, 'Home')).toBe(0);
    expect(nextTabIndex(0, 1, 'End')).toBe(0);
  });

  it('returns null when count is zero or negative', () => {
    expect(nextTabIndex(0, 0, 'ArrowRight')).toBeNull();
    expect(nextTabIndex(0, -1, 'ArrowLeft')).toBeNull();
  });
});
