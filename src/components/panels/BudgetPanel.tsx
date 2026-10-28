import { useMemo, type FC } from 'react';
import { usePlanStore } from '../../store/planStore';
import { buildBudgetRows, summarizeSpending } from '../../ui/budgetView';
import { BudgetAlerts, BudgetSummary, CategoryList } from '../budget';
import { CommunityFinance } from '../calculators/CommunityFinance';
import { WhatIfSimulator } from '../calculators/WhatIfSimulator';
import { SectionHeader } from '../shared/SectionHeader';
import type { PanelProps } from './types';

export const BudgetPanel: FC<PanelProps> = ({ bundle }) => {
  const actualSpend = usePlanStore((s) => s.actualSpend);
  const setActualSpend = usePlanStore((s) => s.setActualSpend);

  const breakdown = bundle.budget;
  const rows = useMemo(() => buildBudgetRows(breakdown, actualSpend), [breakdown, actualSpend]);
  const summary = useMemo(
    () => summarizeSpending(breakdown, actualSpend),
    [breakdown, actualSpend]
  );

  return (
    <div className="space-y-8" aria-labelledby="budget-panel-heading">
      <SectionHeader
        headingId="budget-panel-heading"
        eyebrow="Budget"
        title="Where the money goes"
        description="Splits are planning heuristics. Your priorities and guest count adjust them."
      />

      <BudgetSummary breakdown={breakdown} summary={summary} />

      <BudgetAlerts breakdown={breakdown} actualSpend={actualSpend} />

      <section aria-label="Category breakdown" className="space-y-4">
        <h3 className="font-serif text-xl text-ink font-normal">Category breakdown</h3>
        <CategoryList rows={rows} currency={breakdown.currency} onSpendChange={setActualSpend} />
      </section>

      <section aria-label="Planning calculators" className="space-y-6">
        <WhatIfSimulator
          context={bundle.context}
          signals={bundle.signals}
          breakdown={bundle.budget}
        />

        {bundle.context.eventType === 'community' && (
          <CommunityFinance context={bundle.context} breakdown={bundle.budget} />
        )}
      </section>
    </div>
  );
};
