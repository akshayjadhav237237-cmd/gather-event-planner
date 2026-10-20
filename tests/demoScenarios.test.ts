import { describe, expect, it } from 'vitest';
import { EVENT_SUBFORMATS } from '../src/config/constants';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { EventContextSchema } from '../src/types/schemas';

describe('demoScenarios', () => {
  const TODAY = '2026-10-20';
  const scenarios = getDemoScenarios(TODAY);

  it('provides exactly 4 pre-configured scenarios', () => {
    expect(scenarios).toHaveLength(4);
    const ids = scenarios.map((s) => s.id);
    expect(ids).toEqual([
      'indian-wedding',
      'kids-birthday-rush',
      'community-festival',
      'stretch-budget-wedding',
    ]);
  });

  it('ensures all scenarios have non-empty titles, blurbs, and valid ids', () => {
    for (const s of scenarios) {
      expect(s.id.trim().length).toBeGreaterThan(0);
      expect(s.label.trim().length).toBeGreaterThan(0);
      expect(s.blurb.trim().length).toBeGreaterThan(0);
      expect(s.context.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('validates every demo scenario against EventContextSchema with zero issues', () => {
    for (const s of scenarios) {
      const result = EventContextSchema.safeParse(s.context);
      expect(result.success).toBe(true);
    }
  });

  it('ensures each scenario subformat matches permitted event type subformats', () => {
    for (const s of scenarios) {
      const allowed = EVENT_SUBFORMATS[s.context.eventType];
      expect(allowed).toBeDefined();
      expect(allowed).toContain(s.context.subFormat);
    }
  });

  it('validates currency codes and budget realism for all scenarios', () => {
    const indianWedding = scenarios.find((s) => s.id === 'indian-wedding');
    expect(indianWedding?.context.currency).toBe('INR');
    expect(indianWedding?.context.totalBudget).toBe(3500000);
    expect(indianWedding?.context.guestCount).toBe(300);

    const kidsBirthday = scenarios.find((s) => s.id === 'kids-birthday-rush');
    expect(kidsBirthday?.context.currency).toBe('USD');
    expect(kidsBirthday?.context.totalBudget).toBe(850);
    expect(kidsBirthday?.context.guestCount).toBe(20);

    const festival = scenarios.find((s) => s.id === 'community-festival');
    expect(festival?.context.currency).toBe('USD');
    expect(festival?.context.totalBudget).toBe(40000);
    expect(festival?.context.guestCount).toBe(2500);

    const budgetWedding = scenarios.find((s) => s.id === 'stretch-budget-wedding');
    expect(budgetWedding?.context.currency).toBe('INR');
    expect(budgetWedding?.context.totalBudget).toBe(300000);
    expect(budgetWedding?.context.guestCount).toBe(400);
  });

  it('generates relative event dates strictly dependent on the passed today parameter', () => {
    const refA = '2025-01-01';
    const refB = '2026-06-15';
    const scenariosA = getDemoScenarios(refA);
    const scenariosB = getDemoScenarios(refB);

    expect(scenariosA[0].context.eventDate).not.toEqual(scenariosB[0].context.eventDate);
    expect(scenariosA[1].context.eventDate).toBe('2025-01-17');
    expect(scenariosB[1].context.eventDate).toBe('2026-07-01');
  });
});
