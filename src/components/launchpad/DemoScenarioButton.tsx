import type { DemoScenario } from '../../data/demoScenarios';
import { EVENT_TYPE_LABELS } from '../../ui/labels';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../ui/Badge';

export interface DemoScenarioButtonProps {
  scenario: DemoScenario;
  onClick: () => void;
}

export function DemoScenarioButton({ scenario, onClick }: DemoScenarioButtonProps) {
  const { context } = scenario;
  const budgetFormatted = formatCurrency(context.totalBudget, context.currency);
  const typeLabel = EVENT_TYPE_LABELS[context.eventType];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start p-5 text-left bg-surface border border-line rounded-card transition-colors duration-150 ease-out hover:border-line-control hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 min-h-[44px] cursor-pointer w-full"
    >
      <div className="flex items-center gap-2 mb-2 w-full justify-between">
        <Badge tone="neutral">{typeLabel}</Badge>
        <span className="text-xs text-muted tabular-nums font-medium">{budgetFormatted}</span>
      </div>

      <span className="text-base font-medium text-ink mb-1">{scenario.label}</span>

      <span className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">{scenario.blurb}</span>

      <div className="mt-auto pt-2 border-t border-line w-full flex items-center justify-between text-xs text-muted">
        <span>{context.guestCount} guests</span>
        <span className="text-accent font-medium">Load scenario &rarr;</span>
      </div>
    </button>
  );
}
