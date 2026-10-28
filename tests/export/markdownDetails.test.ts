import { describe, expect, it } from 'vitest';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildPlan } from '../../src/domain/buildPlan';
import { buildPlanBrief } from '../../src/export/markdown';
import type { VendorQuote } from '../../src/types/event';

describe('buildPlanBrief - quotes, tasks and adaptations', () => {
  const today = '2027-01-01';
  const scenarios = getDemoScenarios(today);

  it('displays empty message when no vendor quotes are present', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const md = buildPlanBrief({
      bundle,
      taskCompletion: {},
      actualSpend: {},
      vendorQuotes: [],
      ideas: null,
    });
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
    const md = buildPlanBrief({
      bundle,
      taskCompletion: {},
      actualSpend: {},
      vendorQuotes: quotes,
      ideas: null,
    });
    expect(md).toContain('Royal Feast Catering');
    expect(md).toContain('Contract signed: Yes');
    expect(md).toContain('Insurance verified: Yes');
  });

  it('reflects task completion checkboxes accurately', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const firstTaskId = bundle.timeline.tasks[0]?.id;
    const taskCompletion = firstTaskId ? { [firstTaskId]: true } : {};
    const md = buildPlanBrief({
      bundle,
      taskCompletion,
      actualSpend: {},
      vendorQuotes: [],
      ideas: null,
    });
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
