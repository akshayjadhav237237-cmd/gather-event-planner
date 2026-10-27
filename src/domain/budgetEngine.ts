import { CONTINGENCY_MAX, CONTINGENCY_MIN, MAX_PRIORITIES } from '../config/constants';
import { getBudgetPreset } from '../data/budgetPresets';
import { getCostSavingSwap } from '../data/budgetSwaps';
import { CATEGORY_SETS, type CategoryDef } from '../data/categories';
import type { ContextSignals, DecisionResult } from '../types/engine';
import type {
  BudgetBreakdown,
  BudgetCategoryRow,
  EventContext,
  EventType,
  FeasibilityAlert,
} from '../types/event';
import { allocateByWeights } from '../utils/allocate';
import { formatCurrency } from '../utils/currency';

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
  contingencyDelta: number,
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
  isMicroEvent: boolean,
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
  prioritySet: Set<string>,
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

function buildBudgetAlerts(
  ctx: EventContext,
  signals: ContextSignals,
  categories: BudgetCategoryRow[],
): { alerts: FeasibilityAlert[]; allInExposureNote: string } {
  const alerts: FeasibilityAlert[] = [];

  if (signals.isPast) {
    alerts.push({
      code: 'DATE_IN_PAST',
      severity: 'warning',
      message: 'The selected event date has already passed. Allocations reflect retrospective planning.',
      remedies: [
        'Update the target date to a future calendar date to generate forward-looking timeline milestones.',
        'Utilize this budget breakdown to audit or reconcile past expenditures.',
      ],
    });
  }

  if (signals.isBelowFloor) {
    const severity = signals.perGuestBudget < signals.floorPerGuest / 2 ? 'critical' : 'warning';
    const supportedGuests = Math.floor(ctx.totalBudget / signals.floorPerGuest);
    alerts.push({
      code: 'UNREALISTIC_PER_HEAD',
      severity,
      message: `Estimated spend of ${formatCurrency(signals.perGuestBudget, ctx.currency)} per guest is below the baseline planning floor of ${formatCurrency(signals.floorPerGuest, ctx.currency)} for ${ctx.eventType} events.`,
      remedies: [
        `At this total budget (before contingency reserves), the baseline planning floor supports about ${supportedGuests} guests.`,
        'Reduce guest count to raise spend per attendee closer to baseline vendor expectations.',
        'Increase overall event budget to adequately support minimum hospitality overheads.',
        'Adopt simplified hospitality formats such as drop-off catering or cocktail receptions.',
      ],
    });
  }

  if (signals.isMicroEvent) {
    alerts.push({
      code: 'MICRO_EVENT_FIXED_COSTS',
      severity: 'info',
      message: 'For micro-events (fewer than 50 guests), fixed costs for venue, photography, and setup absorb a larger share of the budget than per-guest variables.',
      remedies: [
        'Inquire with venues regarding hourly rental packages or off-peak slots suited for intimate groups.',
        'Prioritize direct experiential elements over high fixed staging investments.',
        'Negotiate bespoke small-group vendor packages to avoid standard minimum head counts.',
      ],
    });
  }

  const foodCat = categories.find(
    (c) => c.id === 'catering' || c.id === 'catering_cake' || c.id === 'food_beverage',
  );
  const foodAmount = foodCat ? foodCat.allocatedAmount : 0;
  const illustrativeAddon = Math.round(foodAmount * ILLUSTRATIVE_ADDON_PCT);
  const addonPctText = `${Math.round(ILLUSTRATIVE_ADDON_PCT * 100)}%`;
  const formattedAlloc = formatCurrency(foodAmount, ctx.currency);
  const formattedAddon = formatCurrency(illustrativeAddon, ctx.currency);
  const allInExposureNote = `If your food and beverage quotes exclude service charges or taxes, an illustrative add-on of ${addonPctText} on your allocation of ${formattedAlloc} would be ${formattedAddon}. Always ask vendors for all-in quotes.`;

  alerts.push({
    code: 'HIDDEN_COST_EXPOSURE',
    severity: 'info',
    message: allInExposureNote,
    remedies: [
      'Request itemized, all-inclusive estimates from vendors including taxes, gratuity, and administration fees.',
      'Maintain the contingency reserve to absorb unexpected service fees or overtime surcharges.',
      'Clarify delivery, setup, and teardown charges prior to contract execution.',
    ],
  });

  return { alerts, allInExposureNote };
}

/** Computes a deterministic integer budget breakdown with category allocations and feasibility alerts. */
export function buildBudget(
  ctx: EventContext,
  signals: ContextSignals,
  decision: DecisionResult,
): BudgetBreakdown {
  const { contingencyPct, contingencyAmount, allocatableBudget } = calculateContingency(
    ctx.eventType,
    ctx.totalBudget,
    decision.contingencyDelta,
  );
  const preset = getBudgetPreset(ctx.eventType, ctx.subFormat);
  const categoryDefs = CATEGORY_SETS[ctx.eventType] ?? [];
  const prioritySet = new Set(ctx.priorities.slice(0, MAX_PRIORITIES));

  const weights = calculateCategoryWeights(categoryDefs, preset, prioritySet, signals.isMicroEvent);
  const allocatedAmounts = allocateByWeights(weights, allocatableBudget);
  const categories = buildCategoryRows(categoryDefs, preset, allocatedAmounts, allocatableBudget, prioritySet);

  const perGuestAllocatable = ctx.guestCount > 0 ? Math.floor(allocatableBudget / ctx.guestCount) : 0;
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

/** Evaluates user actual spend entries against allocated category budgets and flags overages. */
export function evaluateActuals(
  breakdown: BudgetBreakdown,
  actualSpend: Record<string, number>,
): FeasibilityAlert[] {
  const alerts: FeasibilityAlert[] = [];
  let totalActual = 0;

  for (const cat of breakdown.categories) {
    const spend = actualSpend[cat.id];
    if (typeof spend === 'number' && Number.isFinite(spend) && spend > 0) {
      totalActual += spend;
      if (spend > cat.allocatedAmount) {
        const diff = spend - cat.allocatedAmount;
        alerts.push({
          code: 'OVER_CAP',
          severity: 'warning',
          message: `${cat.name} actual spend (${formatCurrency(spend, breakdown.currency)}) exceeds allocated cap of ${formatCurrency(cat.allocatedAmount, breakdown.currency)} by ${formatCurrency(diff, breakdown.currency)}.`,
          remedies: [
            cat.costSavingSwap ?? 'Review discretionary scope and renegotiate pending line items.',
            'Rebalance budget from underspent categories or use contingency buffer to cover the difference.',
          ],
        });
      }
    }
  }

  for (const [key, spend] of Object.entries(actualSpend)) {
    if (typeof spend === 'number' && Number.isFinite(spend) && spend > 0) {
      if (!breakdown.categories.some((c) => c.id === key)) totalActual += spend;
    }
  }

  if (totalActual > breakdown.totalBudget) {
    const overage = totalActual - breakdown.totalBudget;
    alerts.unshift({
      code: 'OVER_CAP',
      severity: 'critical',
      message: `Total actual expenditure (${formatCurrency(totalActual, breakdown.currency)}) exceeds total event budget of ${formatCurrency(breakdown.totalBudget, breakdown.currency)} by ${formatCurrency(overage, breakdown.currency)}.`,
      remedies: [
        'Halt discretionary commitments and review remaining supplier payment milestones.',
        'Identify flexible categories to scale down before signing remaining agreements.',
        'Inject additional reserve funding to absorb the deficit.',
      ],
    });
  }

  return alerts;
}
