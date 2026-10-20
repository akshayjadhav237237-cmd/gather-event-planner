import { describe, expect, it } from 'vitest';
import { evaluateContext } from '../src/domain/decisionMatrix';
import { RULE_IDS, type RuleId } from '../src/domain/ruleIds';
import { deriveSignals } from '../src/domain/signals';
import type { EventContext } from '../src/types/event';

function createNeutralContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    id: 'ctx-matrix-test',
    title: 'Neutral Test Event',
    eventType: 'birthday',
    subFormat: 'adult_milestone',
    eventDate: '2026-12-01',
    currency: 'USD',
    totalBudget: 10000,
    guestCount: 100,
    setting: 'indoor',
    season: 'mild',
    priorities: [],
    flags: [],
    userNotes: '',
    ...overrides,
  };
}

describe('evaluateContext', () => {
  const today = '2026-10-20';

  it('triggers zero rules on a baseline neutral context', () => {
    const ctx = createNeutralContext();
    const signals = deriveSignals(ctx, today);
    const result = evaluateContext(ctx, signals);

    expect(result.adaptations).toHaveLength(0);
    expect(result.activeRuleIds).toHaveLength(0);
    expect(result.contingencyDelta).toBe(0);
  });

  const ruleCases: Array<{ id: RuleId; overrides: Partial<EventContext> }> = [
    { id: RULE_IDS.PAST_DATE, overrides: { eventDate: '2026-10-10' } },
    { id: RULE_IDS.SHORT_NOTICE, overrides: { eventDate: '2026-11-05' } },
    { id: RULE_IDS.TIGHT_PER_HEAD, overrides: { totalBudget: 1000 } },
    { id: RULE_IDS.MICRO_EVENT, overrides: { guestCount: 30 } },
    { id: RULE_IDS.LARGE_CROWD, overrides: { guestCount: 1200, totalBudget: 120000 } },
    { id: RULE_IDS.YOUNG_KIDS, overrides: { subFormat: 'kids_1_3' } },
    { id: RULE_IDS.SCHOOL_KIDS, overrides: { subFormat: 'kids_4_12' } },
    { id: RULE_IDS.OUTDOOR, overrides: { setting: 'outdoor' } },
    { id: RULE_IDS.HOT_OR_WET_SEASON, overrides: { setting: 'outdoor', season: 'monsoon' } },
    { id: RULE_IDS.ALLERGY_ALERT, overrides: { flags: ['nut_allergy'] } },
    { id: RULE_IDS.DIETARY_CULTURAL, overrides: { flags: ['halal'] } },
    { id: RULE_IDS.ACCESSIBILITY, overrides: { flags: ['wheelchair_access'] } },
    {
      id: RULE_IDS.MULTI_CEREMONY,
      overrides: { eventType: 'wedding', subFormat: 'indian_multiday' },
    },
    { id: RULE_IDS.SURPRISE_PARTY, overrides: { subFormat: 'surprise' } },
    { id: RULE_IDS.COMMUNITY_PUBLIC_EVENT, overrides: { eventType: 'community' } },
    { id: RULE_IDS.SPONSORSHIP, overrides: { flags: ['sponsorship_needed'] } },
    { id: RULE_IDS.OPEN_BAR, overrides: { flags: ['open_bar'], guestCount: 75 } },
    {
      id: RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL,
      overrides: { flags: ['amplified_music', 'residential_venue'] },
    },
  ];

  it.each(ruleCases)('triggers rule $id when matching conditions are met', ({ id, overrides }) => {
    const ctx = createNeutralContext(overrides);
    const signals = deriveSignals(ctx, today);
    const result = evaluateContext(ctx, signals);

    expect(result.activeRuleIds).toContain(id);
    const adaptation = result.adaptations.find((a) => a.ruleId === id);
    expect(adaptation).toBeDefined();
    expect(adaptation?.explanation.length).toBeGreaterThan(15);
  });

  it('calculates dynamic severity for TIGHT_PER_HEAD (critical when < floor/2, warning otherwise)', () => {
    // Birthday USD floor is 15. floor/2 is 7.5.
    const warningCtx = createNeutralContext({ totalBudget: 1000, guestCount: 100 });
    const warningSig = deriveSignals(warningCtx, today); // perGuest = 10
    const warningRes = evaluateContext(warningCtx, warningSig);
    const warnAdapt = warningRes.adaptations.find((a) => a.ruleId === RULE_IDS.TIGHT_PER_HEAD);
    expect(warnAdapt?.severity).toBe('warning');

    const criticalCtx = createNeutralContext({ totalBudget: 500, guestCount: 100 });
    const criticalSig = deriveSignals(criticalCtx, today); // perGuest = 5
    const criticalRes = evaluateContext(criticalCtx, criticalSig);
    const critAdapt = criticalRes.adaptations.find((a) => a.ruleId === RULE_IDS.TIGHT_PER_HEAD);
    expect(critAdapt?.severity).toBe('critical');
  });

  it('orders adaptations by critical -> warning -> info, preserving catalog order on ties', () => {
    const mixedCtx = createNeutralContext({
      eventDate: '2026-10-10', // PAST_DATE (critical)
      setting: 'outdoor', // OUTDOOR (warning)
      guestCount: 30, // MICRO_EVENT (info)
      flags: ['wheelchair_access'], // ACCESSIBILITY (info)
    });
    const signals = deriveSignals(mixedCtx, today);
    const result = evaluateContext(mixedCtx, signals);

    expect(result.adaptations[0]?.severity).toBe('critical');
    expect(result.adaptations[0]?.ruleId).toBe(RULE_IDS.PAST_DATE);

    expect(result.adaptations[1]?.severity).toBe('warning');
    expect(result.adaptations[1]?.ruleId).toBe(RULE_IDS.OUTDOOR);

    const infoAdaptations = result.adaptations.filter((a) => a.severity === 'info');
    expect(infoAdaptations.map((a) => a.ruleId)).toEqual([
      RULE_IDS.MICRO_EVENT,
      RULE_IDS.ACCESSIBILITY,
    ]);
  });

  it('sums contingencyDelta accurately across active rules with float precision', () => {
    const ctx = createNeutralContext({
      eventDate: '2026-11-05', // SHORT_NOTICE: 0.02
      guestCount: 1500, // LARGE_CROWD: 0.02
      totalBudget: 150000,
      setting: 'outdoor', // OUTDOOR: 0.03
    });
    const signals = deriveSignals(ctx, today);
    const result = evaluateContext(ctx, signals);

    expect(result.activeRuleIds).toContain(RULE_IDS.SHORT_NOTICE);
    expect(result.activeRuleIds).toContain(RULE_IDS.LARGE_CROWD);
    expect(result.activeRuleIds).toContain(RULE_IDS.OUTDOOR);
    expect(result.contingencyDelta).toBe(0.07);
  });

  it('guarantees unique adaptation IDs and deterministic execution', () => {
    const ctx = createNeutralContext({
      flags: ['nut_allergy', 'vegan', 'wheelchair_access'],
    });
    const signals = deriveSignals(ctx, today);
    const run1 = evaluateContext(ctx, signals);
    const run2 = evaluateContext(ctx, signals);

    const ids = run1.adaptations.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(run1).toEqual(run2);
  });
});
