import { CURRENCY_LOCALE } from '../config/constants';
import type { CurrencyCode } from '../types/event';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

function formatCompactNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded.toString();
}

/** Formats an integer amount as localized currency string without fractional units. */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  const locale = CURRENCY_LOCALE[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/** Formats an amount with compact notation (e.g. 1.2M, 50K, 2.5L, 1.5Cr). */
export function formatCompact(amount: number, currency: CurrencyCode): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';
  if (!Number.isFinite(amount) || amount === 0) {
    return `${symbol}0`;
  }

  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const sign = isNegative ? '-' : '';

  if (currency === 'INR') {
    if (abs >= 10_000_000) {
      return `${sign}${symbol}${formatCompactNumber(abs / 10_000_000)} Cr`;
    }
    if (abs >= 100_000) {
      return `${sign}${symbol}${formatCompactNumber(abs / 100_000)} L`;
    }
    if (abs >= 1_000) {
      return `${sign}${symbol}${formatCompactNumber(abs / 1_000)} K`;
    }
    return `${sign}${symbol}${Math.round(abs)}`;
  }

  if (abs >= 1_000_000_000) {
    return `${sign}${symbol}${formatCompactNumber(abs / 1_000_000_000)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${symbol}${formatCompactNumber(abs / 1_000_000)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${symbol}${formatCompactNumber(abs / 1_000)}K`;
  }
  return `${sign}${symbol}${Math.round(abs)}`;
}
