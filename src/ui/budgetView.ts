import type { BudgetBreakdown, FeasibilityAlert } from '../types/event';

export type BudgetRowStatus = 'none' | 'ok' | 'near' | 'over';

export interface BudgetRowView {
  id: string;
  name: string;
  allocatedAmount: number;
  allocatedPct: number;
  baselinePct: number;
  pctDelta: number; // allocatedPct - baselinePct, 1 decimal
  isPriority: boolean;
  isFixedCost: boolean;
  swap: string | null;
  spent: number;
  remaining: number; // allocatedAmount - spent (can be negative)
  usedPct: number; // integer, clamped to 999, 0 when allocated === 0 && spent === 0
  status: BudgetRowStatus;
}

export interface SpendingSummaryView {
  totalSpent: number;
  remainingOfTotal: number; // breakdown.totalBudget - totalSpent
  spentPctOfTotal: number; // integer 0..999
  overBudget: boolean;
}

export interface SplitAlertsView {
  prominent: FeasibilityAlert[]; // critical and warning, original order
  goodToKnow: FeasibilityAlert[]; // info
}

function normalizeSpend(raw: number | undefined): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) {
    return 0;
  }
  return Math.floor(raw);
}

export function buildBudgetRows(
  breakdown: BudgetBreakdown,
  actualSpend: Record<string, number>,
): BudgetRowView[] {
  return breakdown.categories.map((cat) => {
    const spent = normalizeSpend(actualSpend[cat.id]);
    const remaining = cat.allocatedAmount - spent;

    const usedPct =
      cat.allocatedAmount > 0
        ? Math.min(999, Math.round((spent / cat.allocatedAmount) * 100))
        : spent > 0
          ? 999
          : 0;

    let status: BudgetRowStatus;
    if (spent === 0) {
      status = 'none';
    } else if (spent > cat.allocatedAmount || (cat.allocatedAmount === 0 && spent > 0)) {
      status = 'over';
    } else if (usedPct >= 90) {
      status = 'near';
    } else {
      status = 'ok';
    }

    const pctDelta = Math.round((cat.allocatedPct - cat.baselinePct) * 10) / 10;

    return {
      id: cat.id,
      name: cat.name,
      allocatedAmount: cat.allocatedAmount,
      allocatedPct: cat.allocatedPct,
      baselinePct: cat.baselinePct,
      pctDelta,
      isPriority: cat.isPriority,
      isFixedCost: cat.isFixedCost,
      swap: cat.costSavingSwap,
      spent,
      remaining,
      usedPct,
      status,
    };
  });
}

export function summarizeSpending(
  breakdown: BudgetBreakdown,
  actualSpend: Record<string, number>,
): SpendingSummaryView {
  let totalSpent = 0;
  for (const cat of breakdown.categories) {
    totalSpent += normalizeSpend(actualSpend[cat.id]);
  }

  const remainingOfTotal = breakdown.totalBudget - totalSpent;
  const spentPctOfTotal =
    breakdown.totalBudget > 0
      ? Math.min(999, Math.round((totalSpent / breakdown.totalBudget) * 100))
      : 0;
  const overBudget = totalSpent > breakdown.totalBudget;

  return {
    totalSpent,
    remainingOfTotal,
    spentPctOfTotal,
    overBudget,
  };
}

export function splitAlerts(alerts: readonly FeasibilityAlert[]): SplitAlertsView {
  const prominent: FeasibilityAlert[] = [];
  const goodToKnow: FeasibilityAlert[] = [];

  for (const alert of alerts) {
    if (alert.severity === 'critical' || alert.severity === 'warning') {
      prominent.push(alert);
    } else if (alert.severity === 'info') {
      goodToKnow.push(alert);
    }
  }

  return { prominent, goodToKnow };
}
