import { type FC, useMemo } from 'react';
import { evaluateActuals } from '../../domain/budgetEngine';
import type { BudgetBreakdown } from '../../types/event';
import { splitAlerts } from '../../ui/budgetView';
import { AlertCard } from '../shared/AlertCard';
import { Disclosure } from '../ui/Disclosure';
import { VisuallyHidden } from '../ui/VisuallyHidden';

export interface BudgetAlertsProps {
  breakdown: BudgetBreakdown;
  actualSpend: Record<string, number>;
}

export const BudgetAlerts: FC<BudgetAlertsProps> = ({ breakdown, actualSpend }) => {
  const allAlerts = useMemo(() => {
    const actualAlerts = evaluateActuals(breakdown, actualSpend);
    return [...breakdown.alerts, ...actualAlerts];
  }, [breakdown, actualSpend]);

  const { prominent, goodToKnow } = useMemo(
    () => splitAlerts(allAlerts),
    [allAlerts],
  );

  return (
    <section aria-label="Budget alerts" className="space-y-3">
      <VisuallyHidden role="status">
        {`${prominent.length} prominent budget alerts active`}
      </VisuallyHidden>

      {prominent.map((alert, idx) => (
        <AlertCard
          key={`${alert.code}-${idx}`}
          tone={alert.severity === 'critical' ? 'critical' : 'warning'}
          title={alert.message}
        >
          {alert.remedies.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-xs font-semibold text-ink">Options to consider:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-muted">
                {alert.remedies.map((remedy, rIdx) => (
                  <li key={rIdx}>{remedy}</li>
                ))}
              </ul>
            </div>
          )}
        </AlertCard>
      ))}

      {goodToKnow.length > 0 && (
        <Disclosure
          id="budget-good-to-know"
          title={`Good to know (${goodToKnow.length})`}
        >
          <div className="space-y-3 pt-2">
            {goodToKnow.map((alert, idx) => (
              <div key={`${alert.code}-${idx}`} className="space-y-1">
                <p className="text-sm text-ink">{alert.message}</p>
                {alert.remedies.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-muted">
                    {alert.remedies.map((remedy, rIdx) => (
                      <li key={rIdx}>{remedy}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Disclosure>
      )}
    </section>
  );
};
