import type { PlanBundle } from '../types/engine';
import type { EventContext } from '../types/event';
import { buildBudget } from './budgetEngine';
import { evaluateContext } from './decisionMatrix';
import { deriveSignals } from './signals';
import { buildTimeline } from './timelineEngine';
import { buildVendorGuides } from './vendorEngine';

let lastPlanInput: { context: EventContext; today: string } | null = null;
let lastPlanBundle: PlanBundle | null = null;

function isContextEqual(a: EventContext, b: EventContext): boolean {
  if (a === b) return true;
  if (
    a.id !== b.id ||
    a.title !== b.title ||
    a.eventType !== b.eventType ||
    a.subFormat !== b.subFormat ||
    a.eventDate !== b.eventDate ||
    a.currency !== b.currency ||
    a.totalBudget !== b.totalBudget ||
    a.guestCount !== b.guestCount ||
    a.setting !== b.setting ||
    a.season !== b.season ||
    a.userNotes !== b.userNotes
  ) {
    return false;
  }
  if (
    a.priorities.length !== b.priorities.length ||
    !a.priorities.every((p, i) => p === b.priorities[i])
  ) {
    return false;
  }
  if (a.flags.length !== b.flags.length || !a.flags.every((f, i) => f === b.flags[i])) {
    return false;
  }
  return true;
}

/** Assembles a complete deterministic plan bundle incorporating budget, timeline, decisions, and vendor guides. */
export function buildPlan(ctx: EventContext, today: string): PlanBundle {
  if (
    lastPlanInput &&
    lastPlanBundle &&
    lastPlanInput.today === today &&
    isContextEqual(lastPlanInput.context, ctx)
  ) {
    return lastPlanBundle;
  }

  const signals = deriveSignals(ctx, today);
  const decision = evaluateContext(ctx, signals);
  const budget = buildBudget(ctx, signals, decision);
  const timeline = buildTimeline(ctx, signals, decision, today);
  const vendorGuides = buildVendorGuides(ctx, decision);

  const bundle: PlanBundle = {
    context: ctx,
    signals,
    decision,
    budget,
    timeline,
    vendorGuides,
  };

  lastPlanInput = { context: ctx, today };
  lastPlanBundle = bundle;
  return bundle;
}
