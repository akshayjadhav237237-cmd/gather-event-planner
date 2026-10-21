import { useMemo } from 'react';
import type { PlanExportInput } from '../export/markdown';
import { usePlan } from './usePlan';
import { usePlanStore } from '../store/planStore';

/**
 * Aggregates current plan bundle and user modifications into a PlanExportInput structure.
 */
export function useExportState(): PlanExportInput | null {
  const { bundle } = usePlan();
  const taskCompletion = usePlanStore((s) => s.taskCompletion);
  const actualSpend = usePlanStore((s) => s.actualSpend);
  const vendorQuotes = usePlanStore((s) => s.vendorQuotes);
  const ideas = usePlanStore((s) => s.ideas);

  return useMemo(() => {
    if (!bundle) {
      return null;
    }
    return {
      bundle,
      taskCompletion,
      actualSpend,
      vendorQuotes,
      ideas,
    };
  }, [bundle, taskCompletion, actualSpend, vendorQuotes, ideas]);
}
