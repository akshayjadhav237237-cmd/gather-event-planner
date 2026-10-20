import { describe, expect, it } from 'vitest';
import { MAX_GUESTS, MIN_GUESTS } from '../src/config/constants';
import { simulateGuestChange } from '../src/domain/whatIf';
import type { EventContext } from '../types/event';

const createTestContext = (overrides?: Partial<EventContext>): EventContext => ({
  id: 'ctx-whatif-test',
  title: 'Test Event',
  eventType: 'wedding',
  subFormat: 'western',
  eventDate: '2026-11-15',
  currency: 'USD',
  totalBudget: 10000,
  guestCount: 100,
  setting: 'indoor',
  season: 'summer',
  priorities: ['catering'],
  flags: [],
  userNotes: '',
  ...overrides,
});

describe('simulateGuestChange', () => {
  it('clamps guest count within allowable bounds [MIN_GUESTS, MAX_GUESTS]', () => {
    const ctx = createTestContext({ guestCount: 50 });

    const clampedMin = simulateGuestChange(ctx, -200, 0);
    expect(clampedMin.newGuestCount).toBe(MIN_GUESTS);

    const clampedMax = simulateGuestChange(ctx, 20000, 0);
    expect(clampedMax.newGuestCount).toBe(MAX_GUESTS);
  });

  it('correctly updates guest counts on increase and decrease', () => {
    const ctx = createTestContext({ guestCount: 100 });

    const increased = simulateGuestChange(ctx, 50, 0);
    expect(increased.newGuestCount).toBe(150);

    const decreased = simulateGuestChange(ctx, -30, 0);
    expect(decreased.newGuestCount).toBe(70);
  });

  it('calculates floored per-guest allocatable budget correctly', () => {
    const ctx = createTestContext({ totalBudget: 10000, guestCount: 100 });

    const sim = simulateGuestChange(ctx, 50, 0); // 150 guests -> 10000 / 150 = 66
    expect(sim.newPerGuestBudget).toBe(66);
  });

  it('simulates budget tier transitions across generous, moderate, and tight', () => {
    // Floor for wedding in USD is 40. Moderate is 40..79, Generous is >= 80.
    const ctx = createTestContext({ totalBudget: 6000, guestCount: 50 });

    // 50 guests: 6000 / 50 = 120 (>= 80) -> generous
    const resGenerous = simulateGuestChange(ctx, 0, 0);
    expect(resGenerous.newTier).toBe('generous');

    // 100 guests: 6000 / 100 = 60 (>= 40 and < 80) -> moderate
    const resModerate = simulateGuestChange(ctx, 50, 0);
    expect(resModerate.newTier).toBe('moderate');

    // 200 guests: 6000 / 200 = 30 (< 40) -> tight
    const resTight = simulateGuestChange(ctx, 150, 0);
    expect(resTight.newTier).toBe('tight');
  });

  it('computes food cost delta for guest changes and service add-ons', () => {
    // Wedding western: catering baseline is 25% of 10,000 = 2,500
    const ctx = createTestContext({ totalBudget: 10000, guestCount: 100 });

    // No change in guests or add-on -> 0 change
    const noChange = simulateGuestChange(ctx, 0, 0);
    expect(noChange.estimatedFoodCostChange).toBe(0);

    // 20% add-on with same guest count -> 2500 * 1.2 - 2500 = 500
    const withAddOn = simulateGuestChange(ctx, 0, 20);
    expect(withAddOn.estimatedFoodCostChange).toBe(500);

    // Guest count increases by 20% with 10% add-on
    // baseline = 2500; ratio = 120/100 = 1.2; factor = 1.1; 2500 * 1.2 * 1.1 = 3300 -> diff 800
    const combined = simulateGuestChange(ctx, 20, 10);
    expect(combined.estimatedFoodCostChange).toBe(800);
  });

  it('supports birthday and community event archetypes', () => {
    // Birthday adult: catering_cake is 30% of 5,000 = 1,500
    const birthdayCtx = createTestContext({
      eventType: 'birthday',
      subFormat: 'adult_milestone',
      totalBudget: 5000,
      guestCount: 50,
      currency: 'USD',
    });
    const bdaySim = simulateGuestChange(birthdayCtx, 25, 0);
    expect(bdaySim.newGuestCount).toBe(75);
    // 1500 * (75/50) = 2250 -> delta = 750
    expect(bdaySim.estimatedFoodCostChange).toBe(750);

    // Community festival: food_beverage is 15% of 20,000 = 3,000
    const communityCtx = createTestContext({
      eventType: 'community',
      subFormat: 'festival',
      totalBudget: 20000,
      guestCount: 200,
      currency: 'USD',
    });
    const commSim = simulateGuestChange(communityCtx, -50, 0);
    expect(commSim.newGuestCount).toBe(150);
    // 3000 * (150/200) = 2250 -> delta = -750
    expect(commSim.estimatedFoodCostChange).toBe(-750);
  });

  it('safely handles non-throwing edge cases and invalid inputs', () => {
    const ctx = createTestContext({ totalBudget: 0, guestCount: 0 });

    const zeroBudget = simulateGuestChange(ctx, 50, 0);
    expect(zeroBudget.newPerGuestBudget).toBe(0);
    expect(zeroBudget.estimatedFoodCostChange).toBe(0);
    expect(zeroBudget.newTier).toBe('tight');

    const nanInputs = simulateGuestChange(ctx, Number.NaN, Number.NaN);
    expect(nanInputs.newGuestCount).toBe(MIN_GUESTS);
    expect(nanInputs.estimatedFoodCostChange).toBe(0);
  });
});
