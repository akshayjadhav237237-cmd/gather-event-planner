import { describe, expect, it } from 'vitest';
import type { BudgetBreakdown, FeasibilityAlert } from '../src/types/event';
import { buildBudgetRows, splitAlerts, summarizeSpending } from '../src/ui/budgetView';

function createMockBreakdown(overrides?: Partial<BudgetBreakdown>): BudgetBreakdown {
  return {
    currency: 'USD',
    totalBudget: 10000,
    contingencyPct: 0.1,
    contingencyAmount: 1000,
    allocatableBudget: 9000,
    perGuestAllocatable: 90,
    allInExposureNote: 'Planning estimate',
    alerts: [],
    categories: [
      {
        id: 'venue',
        name: 'Venue & rentals',
        baselinePct: 30,
        allocatedPct: 35.5,
        allocatedAmount: 1000,
        isPriority: true,
        isFixedCost: true,
        costSavingSwap: 'Consider non-peak day',
      },
      {
        id: 'catering',
        name: 'Food & drinks',
        baselinePct: 40,
        allocatedPct: 40,
        allocatedAmount: 2000,
        isPriority: false,
        isFixedCost: false,
        costSavingSwap: null,
      },
    ],
    ...overrides,
  };
}

describe('budgetView', () => {
  describe('buildBudgetRows status and thresholds', () => {
    it('sets status to none when spent is zero', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 0 });
      expect(rows[0].status).toBe('none');
      expect(rows[0].usedPct).toBe(0);
      expect(rows[0].remaining).toBe(1000);
    });

    it('sets status to ok at 89% spent', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 890 });
      expect(rows[0].status).toBe('ok');
      expect(rows[0].usedPct).toBe(89);
      expect(rows[0].remaining).toBe(110);
    });

    it('sets status to near at 90% spent', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 900 });
      expect(rows[0].status).toBe('near');
      expect(rows[0].usedPct).toBe(90);
    });

    it('sets status to near at 100% spent', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 1000 });
      expect(rows[0].status).toBe('near');
      expect(rows[0].usedPct).toBe(100);
      expect(rows[0].remaining).toBe(0);
    });

    it('sets status to over at 101% spent', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 1010 });
      expect(rows[0].status).toBe('over');
      expect(rows[0].usedPct).toBe(101);
      expect(rows[0].remaining).toBe(-10);
    });

    it('handles zero allocation with zero spent as none', () => {
      const breakdown = createMockBreakdown({
        categories: [
          {
            id: 'decor',
            name: 'Decor',
            baselinePct: 0,
            allocatedPct: 0,
            allocatedAmount: 0,
            isPriority: false,
            isFixedCost: false,
            costSavingSwap: null,
          },
        ],
      });
      const rows = buildBudgetRows(breakdown, { decor: 0 });
      expect(rows[0].status).toBe('none');
      expect(rows[0].usedPct).toBe(0);
      expect(rows[0].remaining).toBe(0);
    });

    it('handles zero allocation with positive spent as over', () => {
      const breakdown = createMockBreakdown({
        categories: [
          {
            id: 'decor',
            name: 'Decor',
            baselinePct: 0,
            allocatedPct: 0,
            allocatedAmount: 0,
            isPriority: false,
            isFixedCost: false,
            costSavingSwap: null,
          },
        ],
      });
      const rows = buildBudgetRows(breakdown, { decor: 100 });
      expect(rows[0].status).toBe('over');
      expect(rows[0].usedPct).toBe(999);
      expect(rows[0].remaining).toBe(-100);
    });

    it('calculates negative remaining correctly on overspend', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 1500 });
      expect(rows[0].remaining).toBe(-500);
      expect(rows[0].status).toBe('over');
    });

    it('clamps usedPct to 999 when spending is extreme', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, { venue: 50000 });
      expect(rows[0].usedPct).toBe(999);
    });

    it('handles empty spend map gracefully', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, {});
      expect(rows[0].spent).toBe(0);
      expect(rows[0].status).toBe('none');
      expect(rows[1].spent).toBe(0);
      expect(rows[1].status).toBe('none');
    });

    it('calculates pctDelta rounded to 1 decimal place', () => {
      const breakdown = createMockBreakdown();
      const rows = buildBudgetRows(breakdown, {});
      expect(rows[0].pctDelta).toBe(5.5);
      expect(rows[1].pctDelta).toBe(0);
    });
  });

  describe('summarizeSpending', () => {
    it('summarizes normal spending under total budget', () => {
      const breakdown = createMockBreakdown({ totalBudget: 10000 });
      const summary = summarizeSpending(breakdown, { venue: 1000, catering: 2000 });
      expect(summary.totalSpent).toBe(3000);
      expect(summary.remainingOfTotal).toBe(7000);
      expect(summary.spentPctOfTotal).toBe(30);
      expect(summary.overBudget).toBe(false);
    });

    it('flags overBudget when spending exceeds total budget', () => {
      const breakdown = createMockBreakdown({ totalBudget: 5000 });
      const summary = summarizeSpending(breakdown, { venue: 3000, catering: 3000 });
      expect(summary.totalSpent).toBe(6000);
      expect(summary.remainingOfTotal).toBe(-1000);
      expect(summary.spentPctOfTotal).toBe(120);
      expect(summary.overBudget).toBe(true);
    });

    it('handles zero total budget and clamps percentage', () => {
      const breakdown = createMockBreakdown({ totalBudget: 0 });
      const summary = summarizeSpending(breakdown, { venue: 100 });
      expect(summary.totalSpent).toBe(100);
      expect(summary.spentPctOfTotal).toBe(0);
      expect(summary.overBudget).toBe(true);
    });
  });

  describe('splitAlerts', () => {
    it('separates prominent alerts from good-to-know alerts in order', () => {
      const alerts: FeasibilityAlert[] = [
        { code: 'OVER_CAP', severity: 'critical', message: 'Crit 1', remedies: [] },
        { code: 'HIDDEN_COST_EXPOSURE', severity: 'info', message: 'Info 1', remedies: [] },
        { code: 'UNREALISTIC_PER_HEAD', severity: 'warning', message: 'Warn 1', remedies: [] },
        { code: 'MICRO_EVENT_FIXED_COSTS', severity: 'info', message: 'Info 2', remedies: [] },
      ];
      const result = splitAlerts(alerts);
      expect(result.prominent).toHaveLength(2);
      expect(result.prominent[0].message).toBe('Crit 1');
      expect(result.prominent[1].message).toBe('Warn 1');
      expect(result.goodToKnow).toHaveLength(2);
      expect(result.goodToKnow[0].message).toBe('Info 1');
      expect(result.goodToKnow[1].message).toBe('Info 2');
    });

    it('handles empty alerts list', () => {
      const result = splitAlerts([]);
      expect(result.prominent).toEqual([]);
      expect(result.goodToKnow).toEqual([]);
    });
  });
});
