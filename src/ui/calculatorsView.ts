import { MAX_GUESTS, MIN_GUESTS } from '../config/constants';
import type { BudgetTier } from '../types/engine';
import type { CurrencyCode } from '../types/event';
import { formatCurrency } from '../utils/currency';
import { parseWholeNumber } from './formModel';

export function guestSliderBounds(guestCount: number): { min: number; max: number; step: number } {
  const safeGuest =
    Number.isFinite(guestCount) && guestCount >= MIN_GUESTS
      ? Math.min(MAX_GUESTS, Math.floor(guestCount))
      : MIN_GUESTS;

  const rawMin = Math.max(MIN_GUESTS, Math.floor(0.5 * safeGuest));
  const min = Math.min(safeGuest, rawMin);
  const rawMax = Math.max(safeGuest + 1, Math.ceil(1.5 * safeGuest));
  const max = Math.min(MAX_GUESTS, Math.max(min + 1, rawMax));
  const step = Math.max(1, Math.round(safeGuest / 50));

  return { min, max, step };
}

export const ADD_ON_OPTIONS = [0, 10, 18, 20, 25] as const;

export function describeTier(tier: BudgetTier): {
  label: string;
  tone: 'warning' | 'neutral' | 'success';
} {
  switch (tier) {
    case 'tight':
      return { label: 'Tight per-guest budget', tone: 'warning' };
    case 'moderate':
      return { label: 'Moderate per-guest budget', tone: 'neutral' };
    case 'generous':
      return { label: 'Generous per-guest budget', tone: 'success' };
  }
}

export function describeFoodChange(amount: number, currency: CurrencyCode): string {
  if (amount > 0) {
    return `About ${formatCurrency(amount, currency)} more on food and drink (estimate)`;
  }
  if (amount < 0) {
    return `About ${formatCurrency(Math.abs(amount), currency)} less on food and drink (estimate)`;
  }
  return 'No change in food and drink (estimate)';
}

export interface FinanceFormFields {
  ticketPrice: string;
  expectedTickets: string;
  sponsorshipTotal: string;
  vendorFeeTotal: string;
  expenses: string;
}

export type ParseFinanceResult =
  | {
      ok: true;
      value: {
        ticketPrice: number;
        expectedTickets: number;
        sponsorshipTotal: number;
        vendorFeeTotal: number;
        expenses: number;
      };
    }
  | {
      ok: false;
      errors: Partial<Record<keyof FinanceFormFields, string>>;
    };

export function parseFinanceInputs(fields: FinanceFormFields): ParseFinanceResult {
  const errors: Partial<Record<keyof FinanceFormFields, string>> = {};

  const ticketPrice = parseWholeNumber(fields.ticketPrice);
  if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
    errors.ticketPrice = 'Enter a valid ticket price (0 or more).';
  }

  const expectedTickets = parseWholeNumber(fields.expectedTickets);
  if (!Number.isFinite(expectedTickets) || expectedTickets < 0) {
    errors.expectedTickets = 'Enter a valid number of tickets (0 or more).';
  }

  const sponsorshipTotal = parseWholeNumber(fields.sponsorshipTotal);
  if (!Number.isFinite(sponsorshipTotal) || sponsorshipTotal < 0) {
    errors.sponsorshipTotal = 'Enter a valid sponsorship total (0 or more).';
  }

  const vendorFeeTotal = parseWholeNumber(fields.vendorFeeTotal);
  if (!Number.isFinite(vendorFeeTotal) || vendorFeeTotal < 0) {
    errors.vendorFeeTotal = 'Enter a valid vendor fee total (0 or more).';
  }

  const expenses = parseWholeNumber(fields.expenses);
  if (!Number.isFinite(expenses) || expenses < 0) {
    errors.expenses = 'Enter a valid expense total (0 or more).';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      ticketPrice,
      expectedTickets,
      sponsorshipTotal,
      vendorFeeTotal,
      expenses,
    },
  };
}
