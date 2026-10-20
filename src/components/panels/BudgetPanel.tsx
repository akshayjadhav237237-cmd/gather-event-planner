import type { PlanBundle } from '../../types/engine';
import { Card } from '../ui/Card';

export interface BudgetPanelProps {
  bundle: PlanBundle;
  className?: string;
}

export function BudgetPanel({ bundle, className = '' }: BudgetPanelProps) {
  return (
    <Card padding="lg" className={className} aria-labelledby="budget-panel-title">
      <div className="space-y-4">
        <h2 id="budget-panel-title" className="font-serif text-2xl text-ink">
          Budget Planning ({bundle.context.currency})
        </h2>
        <p className="text-sm text-muted">
          This section is being built.
        </p>
      </div>
    </Card>
  );
}
