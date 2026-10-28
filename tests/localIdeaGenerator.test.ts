import { describe, expect, it } from 'vitest';
import { generateLocalIdeas, regenerateLocalSection } from '../src/ai/localIdeaGenerator';
import type { AiPlanInput } from '../src/ai/aiTypes';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { evaluateContext } from '../src/domain/decisionMatrix';
import { deriveSignals } from '../src/domain/signals';
import type { EventContext } from '../src/types/event';
import { PersonalizedIdeasSchema } from '../src/types/schemas';

function buildAiInput(ctx: EventContext, today: string = '2026-10-20'): AiPlanInput {
  const signals = deriveSignals(ctx, today);
  const decision = evaluateContext(ctx, signals);
  return { context: ctx, signals, decision };
}

describe('localIdeaGenerator', () => {
  const TODAY = '2026-10-20';
  const scenarios = getDemoScenarios(TODAY);

  it('validates against PersonalizedIdeasSchema across all 4 demo scenarios', () => {
    expect(scenarios).toHaveLength(4);
    for (const s of scenarios) {
      const input = buildAiInput(s.context, TODAY);
      const ideas = generateLocalIdeas(input);
      const result = PersonalizedIdeasSchema.safeParse(ideas);
      expect(result.success).toBe(true);
    }
  });

  it('outputs exactly 3 themes, 3 catering, 3 activities, 4 bespoke tasks', () => {
    const input = buildAiInput(scenarios[0]!.context, TODAY);
    const ideas = generateLocalIdeas(input);
    expect(ideas.source).toBe('local');
    expect(ideas.themeConcepts).toHaveLength(3);
    expect(ideas.cateringIdeas).toHaveLength(3);
    expect(ideas.activityIdeas).toHaveLength(3);
    expect(ideas.bespokeTasks).toHaveLength(4);
  });

  it('is completely deterministic for identical input and variant', () => {
    const input = buildAiInput(scenarios[1]!.context, TODAY);
    const run1 = generateLocalIdeas(input, 0);
    const run2 = generateLocalIdeas(input, 0);
    expect(run1).toEqual(run2);
  });

  it('produces different permutations or ideas between variant 0 and variant 1', () => {
    const input = buildAiInput(scenarios[0]!.context, TODAY);
    const v0 = generateLocalIdeas(input, 0);
    const v1 = generateLocalIdeas(input, 1);
    expect(v0).not.toEqual(v1);
  });

  it('boosts matching seeds to top when notes mention garden or barbecue', () => {
    const input = buildAiInput(scenarios[0]!.context, TODAY);
    const ideas = generateLocalIdeas(input, 0, 'We want a relaxing garden cocktail vibe');
    expect(ideas.activityIdeas[0]?.title).toContain('Garden');
  });

  it('never echoes user notes text verbatim into output properties', () => {
    const input = buildAiInput(scenarios[0]!.context, TODAY);
    const secret = 'TOP_SECRET_UNTRUSTED_INJECTION_PAYLOAD_999';
    const ideas = generateLocalIdeas(input, 0, secret);
    const json = JSON.stringify(ideas);
    expect(json.includes(secret)).toBe(false);
  });

  it('triggers contradiction advisory on past date', () => {
    const pastContext = { ...scenarios[0]!.context, eventDate: '2025-01-01' };
    const input = buildAiInput(pastContext, TODAY);
    const ideas = generateLocalIdeas(input);
    expect(ideas.contradictionAdvisory).toBe(
      'Event date is in the past. Update the date to see accurate planning timelines.'
    );
  });

  it('triggers contradiction advisory on tight budget with luxury note', () => {
    const stretch = scenarios.find((s) => s.id === 'stretch-budget-wedding')!;
    const input = buildAiInput(stretch.context, TODAY);
    const ideas = generateLocalIdeas(input, 0, 'We demand a luxury plated 5-star experience');
    expect(ideas.contradictionAdvisory).toContain('Per-guest budget');
    expect(ideas.contradictionAdvisory).toContain('may be tight for premium elements');
  });

  it('sets contradiction advisory to null on neutral context', () => {
    const stretch = scenarios.find((s) => s.id === 'stretch-budget-wedding')!;
    const input = buildAiInput(stretch.context, TODAY);
    const ideas = generateLocalIdeas(input, 0, 'Simple gathering with friends');
    expect(ideas.contradictionAdvisory).toBeNull();
  });

  it('resolves all tokens with zero unresolved {token} strings in output', () => {
    for (const s of scenarios) {
      const input = buildAiInput(s.context, TODAY);
      const ideas = generateLocalIdeas(input, 0);
      const json = JSON.stringify(ideas);
      expect(json).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
    }
  });

  it('replaces ONLY the targeted section in regenerateLocalSection', () => {
    const input = buildAiInput(scenarios[0]!.context, TODAY);
    const original = generateLocalIdeas(input, 0);

    const reThemes = regenerateLocalSection(original, 'themeConcepts', input, 1);
    expect(reThemes.cateringIdeas).toEqual(original.cateringIdeas);
    expect(reThemes.activityIdeas).toEqual(original.activityIdeas);
    expect(reThemes.bespokeTasks).toEqual(original.bespokeTasks);
    expect(reThemes.contradictionAdvisory).toEqual(original.contradictionAdvisory);

    const reCatering = regenerateLocalSection(original, 'cateringIdeas', input, 1);
    expect(reCatering.themeConcepts).toEqual(original.themeConcepts);
    expect(reCatering.activityIdeas).toEqual(original.activityIdeas);
    expect(reCatering.bespokeTasks).toEqual(original.bespokeTasks);

    const reBespoke = regenerateLocalSection(original, 'bespokeTasks', input, 1);
    expect(reBespoke.themeConcepts).toEqual(original.themeConcepts);
    expect(reBespoke.cateringIdeas).toEqual(original.cateringIdeas);
    expect(reBespoke.activityIdeas).toEqual(original.activityIdeas);
  });
});
