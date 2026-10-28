import type { BudgetBreakdown, VendorQuote } from '../types/event';
import { quoteAllInTotal } from '../domain/vendorEngine';

export interface CommitmentSummaryView {
  signedAllIn: number;
  signedDeposits: number;
  signedOutstanding: number;
  shortlistedCount: number;
}

export function summarizeCommitments(quotes: readonly VendorQuote[]): CommitmentSummaryView {
  const signedQuotes = quotes.filter((q) => q.contractSigned);
  const signedAllIn = signedQuotes.reduce((acc, q) => acc + quoteAllInTotal(q), 0);
  const signedDeposits = signedQuotes.reduce(
    (acc, q) => acc + (Number.isFinite(q.depositPaid) ? Math.max(0, q.depositPaid) : 0),
    0
  );
  const signedOutstanding = Math.max(0, signedAllIn - signedDeposits);
  const shortlistedCount = quotes.length;

  return {
    signedAllIn,
    signedDeposits,
    signedOutstanding,
    shortlistedCount,
  };
}

export function categoryAllocationStatus(
  categoryId: string,
  quotes: readonly VendorQuote[],
  breakdown: BudgetBreakdown
): { allocation: number | null; lowestAllIn: number | null; overBy: number } {
  const cat = breakdown.categories.find((c) => c.id === categoryId);
  const allocation = cat ? cat.allocatedAmount : null;
  const categoryQuotes = quotes.filter((q) => q.categoryId === categoryId);
  const lowestAllIn =
    categoryQuotes.length > 0 ? Math.min(...categoryQuotes.map((q) => quoteAllInTotal(q))) : null;
  const overBy =
    lowestAllIn !== null && allocation !== null && lowestAllIn > allocation
      ? lowestAllIn - allocation
      : 0;

  return { allocation, lowestAllIn, overBy };
}
