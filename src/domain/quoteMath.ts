import type { VendorQuote } from '../types/event';

/** Calculates the all-in total for a vendor quote including base quote and service/tax percentages. */
export function quoteAllInTotal(q: VendorQuote): number {
  const base = Number.isFinite(q.baseQuote) ? Math.max(0, q.baseQuote) : 0;
  const taxPct = Number.isFinite(q.serviceAndTaxPct) ? Math.max(0, q.serviceAndTaxPct) : 0;
  return Math.round(base * (1 + taxPct / 100));
}
