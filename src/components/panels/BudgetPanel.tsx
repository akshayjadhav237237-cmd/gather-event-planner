import type { PanelProps } from './types';
import { Card } from '../ui/Card';

export function BudgetPanel({ bundle }: PanelProps) {
  return (
    <Card padding="lg" aria-labelledby="budget-panel-title">
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
