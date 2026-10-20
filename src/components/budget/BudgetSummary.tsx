import type { FC } from 'react';
import type { BudgetBreakdown } from '../../types/event';
import type { SpendingSummaryView } from '../../ui/budgetView';
import { formatCurrency } from '../../utils/currency';
import { ProgressBar } from '../shared/ProgressBar';
import { Card } from '../ui/Card';
import { Stat } from '../ui/Stat';

export interface BudgetSummaryProps {
  breakdown: BudgetBreakdown;
  summary: SpendingSummaryView;
}

export const BudgetSummary: FC<BudgetSummaryProps> = ({ breakdown, summary }) => {
  const currency = breakdown.currency;
  const contingencyPctRounded = Math.round(breakdown.contingencyPct * 100);

  return (
    <Card padding="md" className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Stat
          label="Total budget"
          value={formatCurrency(breakdown.totalBudget, currency)}
          sub="Whole celebration"
        />
        <Stat
          label="Contingency buffer"
          value={formatCurrency(breakdown.contingencyAmount, currency)}
          sub={`${contingencyPctRounded}% held back`}
        />
        <Stat
          label="To allocate"
          value={formatCurrency(breakdown.allocatableBudget, currency)}
          sub="Across all categories"
        />
        <Stat
          label="Per guest"
          value={formatCurrency(breakdown.perGuestAllocatable, currency)}
          sub="Allocatable per head"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-line">
        <div className="flex items-center justify-between text-xs text-ink font-medium">
          <span>Spent so far</span>
          <span className="tabular-nums text-muted">{summary.spentPctOfTotal}%</span>
        </div>
        <ProgressBar
          label="Spent so far"
          value={summary.totalSpent}
          max={breakdown.totalBudget}
          tone={summary.overBudget ? 'critical' : 'accent'}
        />
        <p className="text-xs text-muted tabular-nums">
          {`${formatCurrency(summary.totalSpent, currency)} of ${formatCurrency(breakdown.totalBudget, currency)} spent (${summary.spentPctOfTotal}%)`}
        </p>
      </div>
    </Card>
  );
};
