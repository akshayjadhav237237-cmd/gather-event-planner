import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { generateLocalIdeas } from '../src/ai/localIdeaGenerator';
import { PrintBrief } from '../src/components/print/PrintBrief';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { buildPlan } from '../src/domain/buildPlan';
import type { VendorQuote } from '../src/types/event';

const TODAY = '2026-10-20';
const DEMO_SCENARIOS = getDemoScenarios(TODAY);

function assertCleanMarkup(html: string): void {
  expect(html).not.toMatch(/\bNaN\b/);
  expect(html).not.toMatch(/\bundefined\b/);
  expect(html).not.toContain('[object Object]');
  expect(html).not.toMatch(/\bInfinity\b/);
}

function countH1Tags(html: string): number {
  return (html.match(/<h1[\s>]/g) || []).length;
}

describe('PrintBrief component', () => {
  for (const scenario of DEMO_SCENARIOS) {
    it(`renders demo scenario ${scenario.id} with clean markup and zero h1 tags`, () => {
      const bundle = buildPlan(scenario.context, TODAY);
      const html = renderToStaticMarkup(
        <PrintBrief
          bundle={bundle}
          taskCompletion={{}}
          actualSpend={{}}
          vendorQuotes={[]}
          ideas={null}
          today={TODAY}
        />
      );

      expect(countH1Tags(html)).toBe(0);
      assertCleanMarkup(html);
      expect(html).toContain(scenario.context.title);
      expect(html).toContain('Why this plan looks this way');
      expect(html).toContain('Budget');
      expect(html).toContain('Timeline');
      expect(html).toContain('Day-of Schedule');
      expect(html).toContain('Vendor Quotes');
      expect(html).toContain('Open the Ideas tab to include ideas in this brief.');
    });
  }

  it('renders ideas correctly when generated locally', () => {
    const scenario = DEMO_SCENARIOS[0]!;
    const bundle = buildPlan(scenario.context, TODAY);
    const ideas = generateLocalIdeas({ context: bundle.context, signals: bundle.signals });

    const html = renderToStaticMarkup(
      <PrintBrief
        bundle={bundle}
        taskCompletion={{}}
        actualSpend={{}}
        vendorQuotes={[]}
        ideas={ideas}
        today={TODAY}
      />
    );

    expect(countH1Tags(html)).toBe(0);
    assertCleanMarkup(html);
    expect(html).toContain('Personalized Ideas');
    expect(html).toContain('Theme Concepts');
    expect(html).toContain('Catering Ideas');
    expect(html).toContain(ideas.themeConcepts[0]!.title);
  });

  it('renders vendor quotes comparison table when quotes are provided', () => {
    const scenario = DEMO_SCENARIOS[0]!;
    const bundle = buildPlan(scenario.context, TODAY);
    const mockQuote: VendorQuote = {
      id: 'q-sample-1',
      categoryId: bundle.budget.categories[0]!.id,
      vendorName: 'Apex Audio & Staging',
      baseQuote: 5000,
      serviceAndTaxPct: 15,
      depositPaid: 1500,
      contractSigned: true,
      insuranceVerified: true,
      backupPlan: 'Secondary backup generator',
    };

    const html = renderToStaticMarkup(
      <PrintBrief
        bundle={bundle}
        taskCompletion={{}}
        actualSpend={{}}
        vendorQuotes={[mockQuote]}
        ideas={null}
        today={TODAY}
      />
    );

    assertCleanMarkup(html);
    expect(html).toContain('Vendor quotes comparison');
    expect(html).toContain('Apex Audio &amp; Staging');
    expect(html).toContain('Yes');
  });

  it('renders standard baseline rules message when adaptations are empty', () => {
    const scenario = DEMO_SCENARIOS[0]!;
    const bundle = buildPlan(scenario.context, TODAY);
    const bundleNoAdaptations = {
      ...bundle,
      decision: {
        ...bundle.decision,
        adaptations: [],
      },
    };

    const html = renderToStaticMarkup(
      <PrintBrief
        bundle={bundleNoAdaptations}
        taskCompletion={{}}
        actualSpend={{}}
        vendorQuotes={[]}
        ideas={null}
        today={TODAY}
      />
    );

    assertCleanMarkup(html);
    expect(html).toContain('Standard baseline planning rules applied.');
  });
});
