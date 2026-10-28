import { MAX_GUESTS, MIN_GUESTS } from '../config/constants';
import { getBudgetPreset } from '../data/budgetPresets';
import { getPerHeadFloor } from '../data/perHeadFloors';
import type { BudgetTier } from '../types/engine';
import type { EventContext, EventType } from '../types/event';

// Planning heuristic: primary food allocation category keys mapped by event type.
export const FOOD_CATEGORY_KEYS: Record<EventType, string> = {
  wedding: 'catering',
  birthday: 'catering_cake',
  community: 'food_beverage',
};

export interface WhatIfSimulationResult {
  newGuestCount: number;
  newPerGuestBudget: number;
  estimatedFoodCostChange: number;
  newTier: BudgetTier;
}

/** Simulates downstream budget and tier impacts of adjusting guest counts and food service cost add-ons. */
export function simulateGuestChange(
  ctx: EventContext,
  deltaGuests: number,
  addOnPct: number
): {
  newGuestCount: number;
  newPerGuestBudget: number;
  estimatedFoodCostChange: number;
  newTier: BudgetTier;
} {
  const safeDelta = Number.isFinite(deltaGuests) ? Math.round(deltaGuests) : 0;
  const currentGuests =
    Number.isFinite(ctx.guestCount) && ctx.guestCount > 0 ? Math.floor(ctx.guestCount) : MIN_GUESTS;

  // Planning heuristic: guest count bounded within allowable system capacity limits.
  const newGuestCount = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, currentGuests + safeDelta));

  const safeTotalBudget =
    Number.isFinite(ctx.totalBudget) && ctx.totalBudget > 0 ? Math.floor(ctx.totalBudget) : 0;

  const newPerGuestBudget = Math.floor(safeTotalBudget / newGuestCount);

  // Planning heuristic: minimum per-head spend floor determines baseline budget tier.
  const floor = getPerHeadFloor(ctx.eventType, ctx.currency);
  const newTier: BudgetTier =
    newPerGuestBudget < floor ? 'tight' : newPerGuestBudget < floor * 2 ? 'moderate' : 'generous';

  // Planning heuristic: baseline food expenditure shares derived from archetype presets.
  const preset = getBudgetPreset(ctx.eventType, ctx.subFormat);
  const foodCategoryKey = FOOD_CATEGORY_KEYS[ctx.eventType] ?? 'catering';
  const foodSharePct = preset[foodCategoryKey] ?? 0;

  const baselineFoodAllocation = Math.round(safeTotalBudget * (foodSharePct / 100));
  const guestRatio = newGuestCount / currentGuests;
  const safeAddOnPct = Number.isFinite(addOnPct) && addOnPct > 0 ? addOnPct : 0;
  const costFactor = 1 + safeAddOnPct / 100;

  const simulatedFoodCost = Math.round(baselineFoodAllocation * guestRatio * costFactor);
  const estimatedFoodCostChange = Math.round(simulatedFoodCost - baselineFoodAllocation);

  return {
    newGuestCount,
    newPerGuestBudget,
    estimatedFoodCostChange,
    newTier,
  };
}
