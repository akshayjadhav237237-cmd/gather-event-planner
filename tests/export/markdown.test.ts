import { describe, expect, it } from 'vitest';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildPlan } from '../../src/domain/buildPlan';
import { buildPlanBrief, type PlanExportInput } from '../../src/export/markdown';
import type { PersonalizedIdeas, VendorQuote } from '../../src/types/event';

function createMockIdeas(): PersonalizedIdeas {
  return {
    source: 'local',
    themeConcepts: [
      { id: 't1', title: 'Golden Sunset', summary: 'Warm amber tones.', whyItFits: 'Fits evening.', colorPalette: ['#f59e0b', '#d97706', '#b45309'] },
      { id: 't2', title: 'Rustic Garden', summary: 'Earthy greens.', whyItFits: 'Fits outdoor.', colorPalette: ['#10b981', '#059669', '#047857'] },
      { id: 't3', title: 'Monochrome Chic', summary: 'Crisp black & white.', whyItFits: 'Formal gathering.', colorPalette: ['#111827', '#6b7280', '#f3f4f6'] },
    ],
    cateringIdeas: [
      { id: 'c1', title: 'Grazing Table', summary: 'Artisanal breads.', whyItFits: 'Mingling.', allergySafetyNote: 'Gluten label.', budgetSwapIdea: 'Local cheese.' },
      { id: 'c2', title: 'Street Food', summary: 'Custom bowls.', whyItFits: 'High energy.', allergySafetyNote: 'Nut free.', budgetSwapIdea: 'Fewer proteins.' },
      { id: 'c3', title: 'Family Feast', summary: 'Shared platters.', whyItFits: 'Conversation.', allergySafetyNote: 'Dietary checks.', budgetSwapIdea: 'Seasonal sides.' },
    ],
    activityIdeas: [
      { id: 'a1', title: 'Memory Wall', summary: 'Instant photos.', whyItFits: 'Low-cost keepsake.', audienceFit: 'All ages.', safetyNote: 'Tuck cords.' },
      { id: 'a2', title: 'Trivia Quiz', summary: 'Tailored questions.', whyItFits: 'Engages groups.', audienceFit: 'Teens & adults.', safetyNote: 'Audio clear.' },
      { id: 'a3', title: 'Acoustic Set', summary: 'Acoustic guitar.', whyItFits: 'Cocktail hour.', audienceFit: 'All guests.', safetyNote: 'Volume check.' },
    ],
    bespokeTasks: [
      { title: 'Confirm acoustic gear', phase: 'Details', rationale: 'Verify power access.' },
      { title: 'Print allergy labels', phase: 'Final Week', rationale: 'Protect sensitive guests.' },
      { title: 'Purchase instant film', phase: 'Details', rationale: 'Stock for memory wall.' },
      { title: 'Finalize trivia script', phase: 'Final Week', rationale: 'Confirm pacing.' },
    ],
    contradictionAdvisory: null,
  };
}

describe('buildPlanBrief', () => {
  const today = '2027-01-01';
  const scenarios = getDemoScenarios(today);

  it('renders all 4 demo scenarios without NaN, undefined, or [object Object]', () => {
    for (const scenario of scenarios) {
      const bundle = buildPlan(scenario.context, today);
      const input: PlanExportInput = { bundle, taskCompletion: {}, actualSpend: {}, vendorQuotes: [], ideas: null };
      const md = buildPlanBrief(input);
      expect(md).toContain(`# ${scenario.context.title}`);
      expect(md).toContain('## Why this plan looks this way');
      expect(md).toContain('## Budget');
      expect(md).toContain('## Timeline');
      expect(md).toContain('## Vendor quotes');
      expect(md).toContain('This plan provides planning heuristics and suggestions');
      expect(md).not.toContain('NaN');
      expect(md).not.toContain('undefined');
      expect(md).not.toContain('[object Object]');
    }
  });

  it('omits Ideas section when ideas is null', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const md = buildPlanBrief({ bundle, taskCompletion: {}, actualSpend: {}, vendorQuotes: [], ideas: null });
    expect(md).not.toContain('## Ideas');
  });

  it('renders Ideas section when ideas are provided', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const md = buildPlanBrief({ bundle, taskCompletion: {}, actualSpend: {}, vendorQuotes: [], ideas: createMockIdeas() });
    expect(md).toContain('## Ideas');
    expect(md).toContain('### Theme concepts');
    expect(md).toContain('Golden Sunset');
    expect(md).toContain('### Catering concepts');
    expect(md).toContain('Grazing Table');
    expect(md).toContain('### Activities');
    expect(md).toContain('Memory Wall');
    expect(md).toContain('### Bespoke tasks');
    expect(md).toContain('Confirm acoustic gear');
  });

  it('displays empty message when no vendor quotes are present', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const md = buildPlanBrief({ bundle, taskCompletion: {}, actualSpend: {}, vendorQuotes: [], ideas: null });
    expect(md).toContain('No quotes added yet.');
  });

  it('renders quotes with details when present', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const quotes: VendorQuote[] = [
      {
        id: 'q1',
        categoryId: 'catering',
        vendorName: 'Royal Feast Catering',
        baseQuote: 1000000,
        serviceAndTaxPct: 18,
        depositPaid: 200000,
        contractSigned: true,
        insuranceVerified: true,
        backupPlan: 'Backup team ready',
      },
    ];
    const md = buildPlanBrief({ bundle, taskCompletion: {}, actualSpend: {}, vendorQuotes: quotes, ideas: null });
    expect(md).toContain('Royal Feast Catering');
    expect(md).toContain('Contract signed: Yes');
    expect(md).toContain('Insurance verified: Yes');
  });

  it('reflects task completion checkboxes accurately', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const firstTaskId = bundle.timeline.tasks[0]?.id;
    const taskCompletion = firstTaskId ? { [firstTaskId]: true } : {};
    const md = buildPlanBrief({ bundle, taskCompletion, actualSpend: {}, vendorQuotes: [], ideas: null });
    expect(md).toContain('- [x]');
    expect(md).toContain('- [ ]');
  });

  it('renders baseline note when no decision adaptations are triggered', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const bundleWithoutAdaptations = {
      ...bundle,
      decision: { ...bundle.decision, adaptations: [] },
    };
    const md = buildPlanBrief({
      bundle: bundleWithoutAdaptations,
      taskCompletion: {},
      actualSpend: {},
      vendorQuotes: [],
      ideas: null,
    });
    expect(md).toContain('Standard baseline planning rules applied.');
  });
});
