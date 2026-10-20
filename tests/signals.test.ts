import { describe, expect, it } from 'vitest';
import { deriveSignals } from '../src/domain/signals';
import type { EventContext } from '../src/types/event';

function createMockContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    id: 'ctx-signal-test',
    title: 'Signals Test Celebration',
    eventType: 'birthday',
    subFormat: 'adult_milestone',
    eventDate: '2026-11-20',
    currency: 'USD',
    totalBudget: 5000,
    guestCount: 50,
    setting: 'indoor',
    season: 'winter',
    priorities: [],
    flags: [],
    userNotes: '',
    ...overrides,
  };
}

describe('deriveSignals', () => {
  const today = '2026-10-20';

  it('calculates daysUntilEvent and isPast across negative, zero, and positive days', () => {
    const pastCtx = createMockContext({ eventDate: '2026-10-15' });
    const pastSignals = deriveSignals(pastCtx, today);
    expect(pastSignals.daysUntilEvent).toBe(-5);
    expect(pastSignals.isPast).toBe(true);

    const sameDayCtx = createMockContext({ eventDate: '2026-10-20' });
    const sameDaySignals = deriveSignals(sameDayCtx, today);
    expect(sameDaySignals.daysUntilEvent).toBe(0);
    expect(sameDaySignals.isPast).toBe(false);

    const futureCtx = createMockContext({ eventDate: '2026-10-25' });
    const futureSignals = deriveSignals(futureCtx, today);
    expect(futureSignals.daysUntilEvent).toBe(5);
    expect(futureSignals.isPast).toBe(false);
  });

  it('evaluates isShortNotice on boundary values of 20 and 21 days', () => {
    const day20Ctx = createMockContext({ eventDate: '2026-11-09' });
    expect(deriveSignals(day20Ctx, today).daysUntilEvent).toBe(20);
    expect(deriveSignals(day20Ctx, today).isShortNotice).toBe(true);

    const day21Ctx = createMockContext({ eventDate: '2026-11-10' });
    expect(deriveSignals(day21Ctx, today).daysUntilEvent).toBe(21);
    expect(deriveSignals(day21Ctx, today).isShortNotice).toBe(false);

    const day0Ctx = createMockContext({ eventDate: '2026-10-20' });
    expect(deriveSignals(day0Ctx, today).isShortNotice).toBe(true);

    const pastCtx = createMockContext({ eventDate: '2026-10-19' });
    expect(deriveSignals(pastCtx, today).isShortNotice).toBe(false);
  });

  it('evaluates isMicroEvent on boundary values of 49 and 50 guests', () => {
    const microCtx = createMockContext({ guestCount: 49 });
    expect(deriveSignals(microCtx, today).isMicroEvent).toBe(true);

    const standardCtx = createMockContext({ guestCount: 50 });
    expect(deriveSignals(standardCtx, today).isMicroEvent).toBe(false);
  });

  it('evaluates isLargeCrowd on boundary values of 999 and 1000 guests', () => {
    const underCtx = createMockContext({ guestCount: 999 });
    expect(deriveSignals(underCtx, today).isLargeCrowd).toBe(false);

    const crowdCtx = createMockContext({ guestCount: 1000 });
    expect(deriveSignals(crowdCtx, today).isLargeCrowd).toBe(true);
  });

  it('computes integer perGuestBudget with floor division', () => {
    const ctx = createMockContext({ totalBudget: 5055, guestCount: 50 });
    const signals = deriveSignals(ctx, today);
    expect(signals.perGuestBudget).toBe(101);
  });

  it('retrieves floorPerGuest by eventType and currency', () => {
    const weddingInr = createMockContext({ eventType: 'wedding', currency: 'INR' });
    expect(deriveSignals(weddingInr, today).floorPerGuest).toBe(1500);

    const birthdayUsd = createMockContext({ eventType: 'birthday', currency: 'USD' });
    expect(deriveSignals(birthdayUsd, today).floorPerGuest).toBe(15);

    const commEur = createMockContext({ eventType: 'community', currency: 'EUR' });
    expect(deriveSignals(commEur, today).floorPerGuest).toBe(5);
  });

  it('evaluates isBelowFloor and budgetTier at exact floor boundaries', () => {
    // Birthday USD floor is 15. 2x floor is 30.
    const belowCtx = createMockContext({ guestCount: 10, totalBudget: 149 });
    const belowSig = deriveSignals(belowCtx, today);
    expect(belowSig.perGuestBudget).toBe(14);
    expect(belowSig.floorPerGuest).toBe(15);
    expect(belowSig.isBelowFloor).toBe(true);
    expect(belowSig.budgetTier).toBe('tight');

    const exactFloorCtx = createMockContext({ guestCount: 10, totalBudget: 150 });
    const exactFloorSig = deriveSignals(exactFloorCtx, today);
    expect(exactFloorSig.perGuestBudget).toBe(15);
    expect(exactFloorSig.isBelowFloor).toBe(false);
    expect(exactFloorSig.budgetTier).toBe('moderate');

    const justBelowDoubleCtx = createMockContext({ guestCount: 10, totalBudget: 299 });
    const justBelowDoubleSig = deriveSignals(justBelowDoubleCtx, today);
    expect(justBelowDoubleSig.perGuestBudget).toBe(29);
    expect(justBelowDoubleSig.budgetTier).toBe('moderate');

    const exactDoubleCtx = createMockContext({ guestCount: 10, totalBudget: 300 });
    const exactDoubleSig = deriveSignals(exactDoubleCtx, today);
    expect(exactDoubleSig.perGuestBudget).toBe(30);
    expect(exactDoubleSig.budgetTier).toBe('generous');
  });

  it('evaluates isOutdoorExposed correctly across venue settings', () => {
    expect(deriveSignals(createMockContext({ setting: 'outdoor' }), today).isOutdoorExposed).toBe(
      true
    );
    expect(deriveSignals(createMockContext({ setting: 'hybrid' }), today).isOutdoorExposed).toBe(
      true
    );
    expect(deriveSignals(createMockContext({ setting: 'indoor' }), today).isOutdoorExposed).toBe(
      false
    );
  });

  it('evaluates hasYoungKids and hasSchoolKids based on subFormat', () => {
    const youngCtx = createMockContext({ subFormat: 'kids_1_3' });
    const youngSig = deriveSignals(youngCtx, today);
    expect(youngSig.hasYoungKids).toBe(true);
    expect(youngSig.hasSchoolKids).toBe(false);

    const schoolCtx = createMockContext({ subFormat: 'kids_4_12' });
    const schoolSig = deriveSignals(schoolCtx, today);
    expect(schoolSig.hasYoungKids).toBe(false);
    expect(schoolSig.hasSchoolKids).toBe(true);

    const adultCtx = createMockContext({ subFormat: 'adult_milestone' });
    const adultSig = deriveSignals(adultCtx, today);
    expect(adultSig.hasYoungKids).toBe(false);
    expect(adultSig.hasSchoolKids).toBe(false);
  });
});
