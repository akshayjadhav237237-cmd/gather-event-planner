import { describe, expect, it } from 'vitest';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildPlan } from '../../src/domain/buildPlan';
import { buildPlanBrief, type PlanExportInput } from '../../src/export/markdown';
import { createMockIdeas } from '../helpers/markdownFixtures';

describe('buildPlanBrief - core structure and ideas', () => {
  const today = '2027-01-01';
  const scenarios = getDemoScenarios(today);

  it('renders all 4 demo scenarios without NaN, undefined, or [object Object]', () => {
    for (const scenario of scenarios) {
      const bundle = buildPlan(scenario.context, today);
      const input: PlanExportInput = {
        bundle,
        taskCompletion: {},
        actualSpend: {},
        vendorQuotes: [],
        ideas: null,
      };
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
    const md = buildPlanBrief({
      bundle,
      taskCompletion: {},
      actualSpend: {},
      vendorQuotes: [],
      ideas: null,
    });
    expect(md).not.toContain('## Ideas');
  });

  it('renders Ideas section when ideas are provided', () => {
    const bundle = buildPlan(scenarios[0]!.context, today);
    const md = buildPlanBrief({
      bundle,
      taskCompletion: {},
      actualSpend: {},
      vendorQuotes: [],
      ideas: createMockIdeas(),
    });
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
});
