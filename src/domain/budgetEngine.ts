import { CONTINGENCY_MAX, CONTINGENCY_MIN, MAX_PRIORITIES } from '../config/constants';
import { getBudgetPreset } from '../data/budgetPresets';
import { getCostSavingSwap } from '../data/budgetSwaps';
import { CATEGORY_SETS, type CategoryDef } from '../data/categories';
import type { ContextSignals, DecisionResult } from '../types/engine';
import type { BudgetBreakdown, BudgetCategoryRow, EventContext, EventType } from '../types/event';
import { allocateByWeights } from '../utils/allocate';

export const BASE_CONTINGENCY_HEURISTICS: Record<EventType, number> = {
  wedding: 0.08,
  birthday: 0.07,
  community: 0.12,
};

export const DEFAULT_CONTINGENCY_RATE = 0.08;
export const DECIMAL_PRECISION_FACTOR = 10000;
export const PRIORITY_WEIGHT_MULTIPLIER = 1.25;
export const MICRO_EVENT_FIXED_COST_MULTIPLIER = 1.15;
export const ILLUSTRATIVE_ADDON_PCT = 0.2;

function calculateContingency(
  eventType: EventType,
  totalBudget: number,
  contingencyDelta: number
): { contingencyPct: number; contingencyAmount: number; allocatableBudget: number } {
  const baseRate = BASE_CONTINGENCY_HEURISTICS[eventType] ?? DEFAULT_CONTINGENCY_RATE;
  const clamped = Math.min(CONTINGENCY_MAX, Math.max(CONTINGENCY_MIN, baseRate + contingencyDelta));
  const contingencyPct = Math.round(clamped * DECIMAL_PRECISION_FACTOR) / DECIMAL_PRECISION_FACTOR;
  const contingencyAmount = Math.round(totalBudget * contingencyPct);
  const allocatableBudget = Math.max(0, totalBudget - contingencyAmount);
  return { contingencyPct, contingencyAmount, allocatableBudget };
}

function calculateCategoryWeights(
  categoryDefs: readonly CategoryDef[],
  preset: Record<string, number>,
  prioritySet: Set<string>,
  isMicroEvent: boolean
): number[] {
  return categoryDefs.map((cat) => {
    let weight = preset[cat.id] ?? 0;
    if (prioritySet.has(cat.id)) weight *= PRIORITY_WEIGHT_MULTIPLIER;
    if (isMicroEvent && cat.isFixedCost) weight *= MICRO_EVENT_FIXED_COST_MULTIPLIER;
    return weight;
  });
}

function buildCategoryRows(
  categoryDefs: readonly CategoryDef[],
  preset: Record<string, number>,
  allocatedAmounts: number[],
  allocatableBudget: number,
  prioritySet: Set<string>
): BudgetCategoryRow[] {
  return categoryDefs.map((cat, idx) => {
    const allocatedAmount = allocatedAmounts[idx] ?? 0;
    const allocatedPct =
      allocatableBudget > 0 ? Math.round((allocatedAmount / allocatableBudget) * 1000) / 10 : 0;

    return {
      id: cat.id,
      name: cat.name,
      baselinePct: preset[cat.id] ?? 0,
      allocatedPct,
      allocatedAmount,
      isPriority: prioritySet.has(cat.id),
      isFixedCost: cat.isFixedCost,
      costSavingSwap: getCostSavingSwap(cat.id),
    };
  });
}

import { buildBudgetAlerts, evaluateActuals } from './budgetAlerts';

export { evaluateActuals };

/** Computes a deterministic integer budget breakdown with category allocations and feasibility alerts. */
export function buildBudget(
  ctx: EventContext,
  signals: ContextSignals,
  decision: DecisionResult
): BudgetBreakdown {
  const { contingencyPct, contingencyAmount, allocatableBudget } = calculateContingency(
    ctx.eventType,
    ctx.totalBudget,
    decision.contingencyDelta
  );
  const preset = getBudgetPreset(ctx.eventType, ctx.subFormat);
  const categoryDefs = CATEGORY_SETS[ctx.eventType] ?? [];
  const prioritySet = new Set(ctx.priorities.slice(0, MAX_PRIORITIES));

  const weights = calculateCategoryWeights(categoryDefs, preset, prioritySet, signals.isMicroEvent);
  const allocatedAmounts = allocateByWeights(weights, allocatableBudget);
  const categories = buildCategoryRows(
    categoryDefs,
    preset,
    allocatedAmounts,
    allocatableBudget,
    prioritySet
  );

  const perGuestAllocatable =
    ctx.guestCount > 0 ? Math.floor(allocatableBudget / ctx.guestCount) : 0;
  const { alerts, allInExposureNote } = buildBudgetAlerts(ctx, signals, categories);

  return {
    currency: ctx.currency,
    totalBudget: ctx.totalBudget,
    contingencyPct,
    contingencyAmount,
    allocatableBudget,
    perGuestAllocatable,
    allInExposureNote,
    categories,
    alerts,
  };
}
