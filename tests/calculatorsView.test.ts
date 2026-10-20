import { describe, expect, it } from 'vitest';
import {
  ADD_ON_OPTIONS,
  describeFoodChange,
  describeTier,
  guestSliderBounds,
  parseFinanceInputs,
} from '../src/ui/calculatorsView';

describe('guestSliderBounds', () => {
  it('handles guestCount = 1', () => {
    const bounds = guestSliderBounds(1);
    expect(bounds.min).toBe(1);
    expect(bounds.max).toBeGreaterThanOrEqual(1);
    expect(bounds.step).toBeGreaterThanOrEqual(1);
    expect(bounds.min).toBeLessThanOrEqual(1);
  });

  it('handles guestCount = 2', () => {
    const bounds = guestSliderBounds(2);
    expect(bounds.min).toBe(1);
    expect(bounds.max).toBe(3);
    expect(bounds.step).toBe(1);
    expect(bounds.min).toBeLessThanOrEqual(2);
    expect(bounds.max).toBeGreaterThanOrEqual(2);
  });

  it('handles guestCount = 49', () => {
    const bounds = guestSliderBounds(49);
    expect(bounds.min).toBe(24);
    expect(bounds.max).toBe(74);
    expect(bounds.step).toBe(1);
    expect(bounds.min).toBeLessThanOrEqual(49);
    expect(bounds.max).toBeGreaterThanOrEqual(49);
  });

  it('handles guestCount = 50', () => {
    const bounds = guestSliderBounds(50);
    expect(bounds.min).toBe(25);
    expect(bounds.max).toBe(75);
    expect(bounds.step).toBe(1);
    expect(bounds.min).toBeLessThanOrEqual(50);
    expect(bounds.max).toBeGreaterThanOrEqual(50);
  });

  it('handles guestCount = 150', () => {
    const bounds = guestSliderBounds(150);
    expect(bounds.min).toBe(75);
    expect(bounds.max).toBe(225);
    expect(bounds.step).toBe(3);
    expect(bounds.min).toBeLessThanOrEqual(150);
    expect(bounds.max).toBeGreaterThanOrEqual(150);
  });

  it('handles guestCount = 10000', () => {
    const bounds = guestSliderBounds(10000);
    expect(bounds.min).toBe(5000);
    expect(bounds.max).toBe(10000);
    expect(bounds.step).toBe(200);
    expect(bounds.min).toBeLessThanOrEqual(10000);
    expect(bounds.max).toBeGreaterThanOrEqual(10000);
  });

  it('clamps invalid guest counts to MIN_GUESTS', () => {
    const boundsZero = guestSliderBounds(0);
    expect(boundsZero.min).toBe(1);
    expect(boundsZero.step).toBeGreaterThanOrEqual(1);

    const boundsNegative = guestSliderBounds(-50);
    expect(boundsNegative.min).toBe(1);

    const boundsNaN = guestSliderBounds(NaN);
    expect(boundsNaN.min).toBe(1);
  });

  it('ensures step >= 1 for small guest counts', () => {
    for (let g = 1; g <= 30; g++) {
      const bounds = guestSliderBounds(g);
      expect(bounds.step).toBeGreaterThanOrEqual(1);
      expect(bounds.min).toBeLessThanOrEqual(g);
      expect(bounds.max).toBeGreaterThanOrEqual(g);
    }
  });
});

describe('describeTier', () => {
  it('maps tight tier', () => {
    expect(describeTier('tight')).toEqual({
      label: 'Tight per-guest budget',
      tone: 'warning',
    });
  });

  it('maps moderate tier', () => {
    expect(describeTier('moderate')).toEqual({
      label: 'Moderate per-guest budget',
      tone: 'neutral',
    });
  });

  it('maps generous tier', () => {
    expect(describeTier('generous')).toEqual({
      label: 'Generous per-guest budget',
      tone: 'success',
    });
  });
});

describe('describeFoodChange', () => {
  it('formats positive food delta in INR', () => {
    const text = describeFoodChange(5000, 'INR');
    expect(text).toContain('more on food and drink (estimate)');
    expect(text).toContain('5,000');
  });

  it('formats negative food delta in USD', () => {
    const text = describeFoodChange(-250, 'USD');
    expect(text).toContain('less on food and drink (estimate)');
    expect(text).toContain('250');
  });

  it('formats zero food delta', () => {
    const text = describeFoodChange(0, 'USD');
    expect(text).toBe('No change in food and drink (estimate)');
  });
});

describe('ADD_ON_OPTIONS', () => {
  it('contains expected percentage options', () => {
    expect(ADD_ON_OPTIONS).toEqual([0, 10, 18, 20, 25]);
  });
});

describe('parseFinanceInputs', () => {
  it('successfully parses valid numeric string fields', () => {
    const result = parseFinanceInputs({
      ticketPrice: '25',
      expectedTickets: '100',
      sponsorshipTotal: '500',
      vendorFeeTotal: '300',
      expenses: '2000',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        ticketPrice: 25,
        expectedTickets: 100,
        sponsorshipTotal: 500,
        vendorFeeTotal: 300,
        expenses: 2000,
      });
    }
  });

  it('parses formatted numeric strings with commas and spaces', () => {
    const result = parseFinanceInputs({
      ticketPrice: ' 10 ',
      expectedTickets: '1,500',
      sponsorshipTotal: '2_000',
      vendorFeeTotal: '500',
      expenses: '10,000',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.expectedTickets).toBe(1500);
      expect(result.value.sponsorshipTotal).toBe(2000);
      expect(result.value.expenses).toBe(10000);
    }
  });

  it('allows zero values across all fields', () => {
    const result = parseFinanceInputs({
      ticketPrice: '0',
      expectedTickets: '0',
      sponsorshipTotal: '0',
      vendorFeeTotal: '0',
      expenses: '0',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ticketPrice).toBe(0);
      expect(result.value.expenses).toBe(0);
    }
  });

  it('returns errors for negative or invalid non-numeric inputs', () => {
    const result = parseFinanceInputs({
      ticketPrice: '-10',
      expectedTickets: 'abc',
      sponsorshipTotal: '',
      vendorFeeTotal: '12.5',
      expenses: '-500',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.ticketPrice).toBeDefined();
      expect(result.errors.expectedTickets).toBeDefined();
      expect(result.errors.sponsorshipTotal).toBeDefined();
      expect(result.errors.vendorFeeTotal).toBeDefined();
      expect(result.errors.expenses).toBeDefined();
    }
  });
});
