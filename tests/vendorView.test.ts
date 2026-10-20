import { describe, expect, it } from 'vitest';
import type { BudgetBreakdown, VendorQuote } from '../src/types/event';
import { categoryAllocationStatus, summarizeCommitments } from '../src/ui/vendorView';

function makeQuote(partial: Partial<VendorQuote> & { id: string; categoryId: string; vendorName: string }): VendorQuote {
  return {
    baseQuote: 10000,
    serviceAndTaxPct: 0,
    depositPaid: 0,
    contractSigned: false,
    insuranceVerified: false,
    backupPlan: '',
    ...partial,
  };
}

describe('vendorView', () => {
  const dummyBreakdown: BudgetBreakdown = {
    currency: 'INR',
    totalBudget: 100000,
    contingencyPct: 0.1,
    contingencyAmount: 10000,
    allocatableBudget: 90000,
    perGuestAllocatable: 900,
    allInExposureNote: '',
    categories: [
      {
        id: 'venue',
        name: 'Venue & Spaces',
        baselinePct: 0.35,
        allocatedPct: 0.35,
        allocatedAmount: 31500,
        isPriority: false,
        isFixedCost: true,
        costSavingSwap: null,
      },
      {
        id: 'catering',
        name: 'Food & Beverage',
        baselinePct: 0.3,
        allocatedPct: 0.3,
        allocatedAmount: 27000,
        isPriority: false,
        isFixedCost: false,
        costSavingSwap: null,
      },
    ],
    alerts: [],
  };

  describe('summarizeCommitments', () => {
    it('counts only signed quotes and never sums competing unsigned quotes', () => {
      const quotes: VendorQuote[] = [
        makeQuote({
          id: 'q1',
          categoryId: 'venue',
          vendorName: 'Venue A (Signed)',
          baseQuote: 20000,
          serviceAndTaxPct: 10, // 22,000 allIn
          depositPaid: 5000,
          contractSigned: true,
          insuranceVerified: true,
        }),
        makeQuote({
          id: 'q2',
          categoryId: 'venue',
          vendorName: 'Venue B (Competing Shortlist)',
          baseQuote: 25000,
          serviceAndTaxPct: 10,
          contractSigned: false,
        }),
        makeQuote({
          id: 'q3',
          categoryId: 'catering',
          vendorName: 'Caterer C (Signed)',
          baseQuote: 10000,
          serviceAndTaxPct: 0, // 10,000 allIn
          depositPaid: 10000,
          contractSigned: true,
          insuranceVerified: true,
        }),
      ];

      const summary = summarizeCommitments(quotes);

      // Signed quotes are q1 and q3:
      // signedAllIn = 22,000 + 10,000 = 32,000
      // signedDeposits = 5,000 + 10,000 = 15,000
      // signedOutstanding = 32,000 - 15,000 = 17,000
      // shortlistedCount = 3 (includes competing q2)
      expect(summary.signedAllIn).toBe(32000);
      expect(summary.signedDeposits).toBe(15000);
      expect(summary.signedOutstanding).toBe(17000);
      expect(summary.shortlistedCount).toBe(3);
    });

    it('returns zero commitments when no quotes have signed contracts', () => {
      const quotes: VendorQuote[] = [
        makeQuote({
          id: 'q1',
          categoryId: 'venue',
          vendorName: 'Venue A',
          baseQuote: 15000,
          serviceAndTaxPct: 10,
          contractSigned: false,
        }),
      ];

      const summary = summarizeCommitments(quotes);
      expect(summary.signedAllIn).toBe(0);
      expect(summary.signedDeposits).toBe(0);
      expect(summary.signedOutstanding).toBe(0);
      expect(summary.shortlistedCount).toBe(1);
    });
  });

  describe('categoryAllocationStatus', () => {
    it('handles unknown category returning null allocation and 0 overBy', () => {
      const quotes: VendorQuote[] = [
        makeQuote({
          id: 'q1',
          categoryId: 'unknown-cat',
          vendorName: 'Unknown Vendor',
          baseQuote: 5000,
        }),
      ];

      const status = categoryAllocationStatus('unknown-cat', quotes, dummyBreakdown);
      expect(status.allocation).toBeNull();
      expect(status.lowestAllIn).toBe(5000);
      expect(status.overBy).toBe(0);
    });

    it('handles zero quotes in category', () => {
      const status = categoryAllocationStatus('venue', [], dummyBreakdown);
      expect(status.allocation).toBe(31500);
      expect(status.lowestAllIn).toBeNull();
      expect(status.overBy).toBe(0);
    });

    it('computes status when lowest quote is under allocation', () => {
      const quotes: VendorQuote[] = [
        makeQuote({ id: 'q1', categoryId: 'venue', vendorName: 'Venue Budget', baseQuote: 20000 }),
        makeQuote({ id: 'q2', categoryId: 'venue', vendorName: 'Venue Premium', baseQuote: 28000 }),
      ];

      const status = categoryAllocationStatus('venue', quotes, dummyBreakdown);
      expect(status.allocation).toBe(31500);
      expect(status.lowestAllIn).toBe(20000);
      expect(status.overBy).toBe(0);
    });

    it('computes status and overBy amount when lowest quote exceeds allocation', () => {
      const quotes: VendorQuote[] = [
        makeQuote({ id: 'q1', categoryId: 'catering', vendorName: 'Caterer High', baseQuote: 30000 }),
        makeQuote({ id: 'q2', categoryId: 'catering', vendorName: 'Caterer Higher', baseQuote: 35000 }),
      ];

      const status = categoryAllocationStatus('catering', quotes, dummyBreakdown);
      expect(status.allocation).toBe(27000);
      expect(status.lowestAllIn).toBe(30000);
      expect(status.overBy).toBe(3000); // 30000 - 27000
    });
  });
});
