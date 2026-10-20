import type { PlanBundle } from '../types/engine';
import type { EventContext } from '../types/event';
import { buildBudget } from './budgetEngine';
import { evaluateContext } from './decisionMatrix';
import { deriveSignals } from './signals';
import { buildTimeline } from './timelineEngine';
import { buildVendorGuides } from './vendorEngine';

/** Assembles a complete deterministic plan bundle incorporating budget, timeline, decisions, and vendor guides. */
export function buildPlan(ctx: EventContext, today: string): PlanBundle {
  const signals = deriveSignals(ctx, today);
  const decision = evaluateContext(ctx, signals);
  const budget = buildBudget(ctx, signals, decision);
  const timeline = buildTimeline(ctx, signals, decision, today);
  const vendorGuides = buildVendorGuides(ctx, decision);

  return {
    context: ctx,
    signals,
    decision,
    budget,
    timeline,
    vendorGuides,
  };
}
