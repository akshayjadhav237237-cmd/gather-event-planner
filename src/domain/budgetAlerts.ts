import { ILLUSTRATIVE_ADDON_PCT } from './budgetEngine';
import type { ContextSignals } from '../types/engine';
import type {
  BudgetBreakdown,
  BudgetCategoryRow,
  EventContext,
  FeasibilityAlert,
} from '../types/event';
import { formatCurrency } from '../utils/currency';

export function buildBudgetAlerts(
  ctx: EventContext,
  signals: ContextSignals,
  categories: BudgetCategoryRow[]
): { alerts: FeasibilityAlert[]; allInExposureNote: string } {
  const alerts: FeasibilityAlert[] = [];

  if (signals.isPast) {
    alerts.push({
      code: 'DATE_IN_PAST',
      severity: 'warning',
      message:
        'The selected event date has already passed. Allocations reflect retrospective planning.',
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
      message:
        'For micro-events (fewer than 50 guests), fixed costs for venue, photography, and setup absorb a larger share of the budget than per-guest variables.',
      remedies: [
        'Inquire with venues regarding hourly rental packages or off-peak slots suited for intimate groups.',
        'Prioritize direct experiential elements over high fixed staging investments.',
        'Negotiate bespoke small-group vendor packages to avoid standard minimum head counts.',
      ],
    });
  }

  const foodCat = categories.find(
    (c) => c.id === 'catering' || c.id === 'catering_cake' || c.id === 'food_beverage'
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

export function evaluateActuals(
  breakdown: BudgetBreakdown,
  actualSpend: Record<string, number>
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
