import { describe, expect, it } from 'vitest';
import type { VendorQuote } from '../src/types/event';
import { compareQuotes, quoteAllInTotal, summarizeVendorSpend } from '../src/domain/vendorEngine';

function createQuote(overrides: Partial<VendorQuote> = {}): VendorQuote {
  return {
    id: 'q1',
    categoryId: 'venue',
    vendorName: 'Venue Option A',
    baseQuote: 1000,
    serviceAndTaxPct: 18,
    depositPaid: 200,
    contractSigned: true,
    insuranceVerified: true,
    backupPlan: 'Indoor hall available',
    ...overrides,
  };
}

describe('quoteAllInTotal', () => {
  it('calculates total with 0% tax', () => {
    const q = createQuote({ baseQuote: 2500, serviceAndTaxPct: 0 });
    expect(quoteAllInTotal(q)).toBe(2500);
  });

  it('calculates total with 18% tax and service fee', () => {
    const q = createQuote({ baseQuote: 1000, serviceAndTaxPct: 18 });
    expect(quoteAllInTotal(q)).toBe(1180);
  });

  it('correctly rounds fractional cents to nearest whole integer', () => {
    const q = createQuote({ baseQuote: 100, serviceAndTaxPct: 18.5 });
    expect(quoteAllInTotal(q)).toBe(119);
  });

  it('handles negative base quote or tax without throwing', () => {
    const q1 = createQuote({ baseQuote: -500, serviceAndTaxPct: 10 });
    expect(quoteAllInTotal(q1)).toBe(0);

    const q2 = createQuote({ baseQuote: 500, serviceAndTaxPct: -10 });
    expect(quoteAllInTotal(q2)).toBe(500);
  });

  it('handles NaN and Infinity values safely', () => {
    const q1 = createQuote({ baseQuote: Number.NaN, serviceAndTaxPct: 18 });
    expect(quoteAllInTotal(q1)).toBe(0);

    const q2 = createQuote({ baseQuote: Number.POSITIVE_INFINITY, serviceAndTaxPct: 10 });
    expect(quoteAllInTotal(q2)).toBe(0);

    const q3 = createQuote({ baseQuote: 500, serviceAndTaxPct: Number.NaN });
    expect(quoteAllInTotal(q3)).toBe(500);

    const q4 = createQuote({ baseQuote: 500, serviceAndTaxPct: Number.POSITIVE_INFINITY });
    expect(quoteAllInTotal(q4)).toBe(500);
  });
});

describe('compareQuotes', () => {
  it('filters quotes matching the category ID only', () => {
    const quotes: VendorQuote[] = [
      createQuote({ id: '1', categoryId: 'venue', baseQuote: 1000 }),
      createQuote({ id: '2', categoryId: 'catering', baseQuote: 500 }),
    ];
    const res = compareQuotes(quotes, 'venue');
    expect(res).toHaveLength(1);
    expect(res[0].quote.id).toBe('1');
  });

  it('sorts quotes ascending by all-in price and flags isLowest', () => {
    const quotes: VendorQuote[] = [
      createQuote({ id: 'exp', baseQuote: 2000, serviceAndTaxPct: 10 }),
      createQuote({ id: 'cheap', baseQuote: 1000, serviceAndTaxPct: 10 }),
    ];
    const res = compareQuotes(quotes, 'venue');
    expect(res[0].quote.id).toBe('cheap');
    expect(res[0].isLowest).toBe(true);
    expect(res[1].quote.id).toBe('exp');
    expect(res[1].isLowest).toBe(false);
  });

  it('preserves original input order on price ties', () => {
    const quotes: VendorQuote[] = [
      createQuote({ id: 'tie-1', baseQuote: 1000, serviceAndTaxPct: 10 }),
      createQuote({ id: 'tie-2', baseQuote: 1000, serviceAndTaxPct: 10 }),
    ];
    const res = compareQuotes(quotes, 'venue');
    expect(res[0].quote.id).toBe('tie-1');
    expect(res[0].isLowest).toBe(true);
    expect(res[1].quote.id).toBe('tie-2');
    expect(res[1].isLowest).toBe(false);
  });

  it('computes remaining deposit balance accurately', () => {
    const q = createQuote({ baseQuote: 1000, serviceAndTaxPct: 10, depositPaid: 300 });
    const res = compareQuotes([q], 'venue');
    expect(res[0].allInTotal).toBe(1100);
    expect(res[0].depositRemaining).toBe(800);
  });

  it('flags missing contract signature and unverified insurance', () => {
    const q = createQuote({ contractSigned: false, insuranceVerified: false });
    const res = compareQuotes([q], 'venue');
    expect(res[0].missingChecks).toContain('Contract not signed');
    expect(res[0].missingChecks).toContain('Insurance not verified');
  });

  it('returns empty array when no quotes match the category', () => {
    const res = compareQuotes([], 'venue');
    expect(res).toEqual([]);
  });
});

describe('summarizeVendorSpend', () => {
  it('returns zero totals for empty quotes list', () => {
    const summary = summarizeVendorSpend([]);
    expect(summary.totalAllIn).toBe(0);
    expect(summary.totalDeposits).toBe(0);
    expect(summary.outstanding).toBe(0);
    expect(summary.byCategory).toEqual({});
  });

  it('aggregates total spend, deposits, and per-category breakdown', () => {
    const quotes: VendorQuote[] = [
      createQuote({ categoryId: 'venue', baseQuote: 1000, serviceAndTaxPct: 10, depositPaid: 200 }),
      createQuote({ categoryId: 'venue', baseQuote: 500, serviceAndTaxPct: 0, depositPaid: 100 }),
      createQuote({
        categoryId: 'catering',
        baseQuote: 800,
        serviceAndTaxPct: 20,
        depositPaid: 300,
      }),
    ];
    const summary = summarizeVendorSpend(quotes);
    expect(summary.totalAllIn).toBe(1100 + 500 + 960);
    expect(summary.totalDeposits).toBe(600);
    expect(summary.outstanding).toBe(2560 - 600);
    expect(summary.byCategory.venue).toBe(1600);
    expect(summary.byCategory.catering).toBe(960);
  });

  it('clamps outstanding balance to zero if deposits exceed total', () => {
    const quotes = [createQuote({ baseQuote: 100, serviceAndTaxPct: 0, depositPaid: 200 })];
    const summary = summarizeVendorSpend(quotes);
    expect(summary.outstanding).toBe(0);
  });
});
