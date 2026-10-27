import { describe, expect, it } from 'vitest';
import { formatCompact, formatCurrency } from '../src/utils/currency';

const normalizeSpace = (val: string): string => val.replace(/\u00A0/g, ' ');

describe('formatCurrency', () => {
  it('formats INR with lakh and crore grouping', () => {
    expect(formatCurrency(1500000, 'INR')).toBe('₹15,00,000');
    expect(formatCurrency(12000000, 'INR')).toBe('₹1,20,00,000');
    expect(formatCurrency(50000, 'INR')).toBe('₹50,000');
  });

  it('formats USD, EUR, and GBP appropriately', () => {
    expect(formatCurrency(1500000, 'USD')).toBe('$1,500,000');
    expect(normalizeSpace(formatCurrency(1500000, 'EUR'))).toBe('1.500.000 €');
    expect(formatCurrency(1500000, 'GBP')).toBe('£1,500,000');
  });

  it('handles negative monetary amounts without throwing', () => {
    expect(formatCurrency(-1500000, 'INR')).toBe('-₹15,00,000');
    expect(formatCurrency(-1500000, 'USD')).toBe('-$1,500,000');
  });

  it('handles zero cleanly', () => {
    expect(formatCurrency(0, 'INR')).toBe('₹0');
    expect(formatCurrency(0, 'USD')).toBe('$0');
    expect(normalizeSpace(formatCurrency(0, 'EUR'))).toBe('0 €');
    expect(formatCurrency(0, 'GBP')).toBe('£0');
  });

  it('handles NaN and Infinity safely without throwing', () => {
    expect(() => formatCurrency(Number.NaN, 'INR')).not.toThrow();
    expect(() => formatCurrency(Number.POSITIVE_INFINITY, 'USD')).not.toThrow();
    expect(() => formatCurrency(Number.NEGATIVE_INFINITY, 'EUR')).not.toThrow();

    expect(formatCurrency(Number.NaN, 'INR')).toBe('₹0');
    expect(formatCurrency(Number.POSITIVE_INFINITY, 'USD')).toBe('$0');
    expect(normalizeSpace(formatCurrency(Number.NEGATIVE_INFINITY, 'EUR'))).toBe('0 €');
  });
});

describe('formatCompact', () => {
  it('formats INR amounts using K, L, and Cr suffixes', () => {
    expect(formatCompact(50000, 'INR')).toBe('₹50 K');
    expect(formatCompact(1500000, 'INR')).toBe('₹15 L');
    expect(formatCompact(12000000, 'INR')).toBe('₹1.2 Cr');
    expect(formatCompact(500, 'INR')).toBe('₹500');
  });

  it('formats USD, EUR, and GBP with K, M, and B suffixes', () => {
    expect(formatCompact(1500000, 'USD')).toBe('$1.5M');
    expect(formatCompact(500000, 'EUR')).toBe('€500K');
    expect(formatCompact(10000, 'GBP')).toBe('£10K');
    expect(formatCompact(1500000000, 'USD')).toBe('$1.5B');
    expect(formatCompact(250, 'USD')).toBe('$250');
  });

  it('handles negative values in compact formatting', () => {
    expect(formatCompact(-1500000, 'INR')).toBe('-₹15 L');
    expect(formatCompact(-12000000, 'INR')).toBe('-₹1.2 Cr');
    expect(formatCompact(-1500000, 'USD')).toBe('-$1.5M');
  });

  it('handles 0, NaN, and Infinity safely in compact mode', () => {
    expect(formatCompact(0, 'INR')).toBe('₹0');
    expect(formatCompact(0, 'USD')).toBe('$0');
    expect(formatCompact(Number.NaN, 'INR')).toBe('₹0');
    expect(formatCompact(Number.POSITIVE_INFINITY, 'USD')).toBe('$0');
  });
});
