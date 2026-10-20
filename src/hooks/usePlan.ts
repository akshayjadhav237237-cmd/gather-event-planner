import { useMemo } from 'react';
import { buildPlan } from '../domain/buildPlan';
import { usePlanStore } from '../store/planStore';
import type { PlanBundle } from '../types/engine';
import type { EventContext } from '../types/event';
import { useToday } from './useToday';

export interface UsePlanResult {
  context: EventContext | null;
  bundle: PlanBundle | null;
  today: string;
}

/**
 * Accesses active event context from state store and builds the deterministic plan bundle.
 */
export function usePlan(): UsePlanResult {
  const context = usePlanStore((state) => state.context);
  const today = useToday();

  const bundle = useMemo(() => {
    if (!context) {
      return null;
    }
    try {
      return buildPlan(context, today);
    } catch {
      return null;
    }
  }, [context, today]);

  return { context, bundle, today };
}
