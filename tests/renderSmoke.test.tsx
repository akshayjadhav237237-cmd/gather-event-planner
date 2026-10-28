import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App';
import { BudgetPanel } from '../src/components/panels/BudgetPanel';
import { IdeasPanel } from '../src/components/panels/IdeasPanel';
import { TimelinePanel } from '../src/components/panels/TimelinePanel';
import { VendorsPanel } from '../src/components/panels/VendorsPanel';
import { Workspace } from '../src/components/layout/Workspace';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { buildPlan } from '../src/domain/buildPlan';
import { usePlanStore } from '../src/store/planStore';

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

describe('Render Smoke Tests', () => {
  it('renders Launchpad view in App when no context is active with exactly one h1', () => {
    usePlanStore.getState().clearAll();
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('Plan the celebration, not the spreadsheet.');
    expect(countH1Tags(html)).toBe(1);
    assertCleanMarkup(html);
  });

  for (const scenario of DEMO_SCENARIOS) {
    describe(`Scenario: ${scenario.label} (${scenario.id})`, () => {
      const bundle = buildPlan(scenario.context, TODAY);

      it('renders BudgetPanel without errors or corrupt text', () => {
        const html = renderToStaticMarkup(<BudgetPanel bundle={bundle} today={TODAY} />);
        expect(html).toContain('Where the money goes');
        expect(html).toContain('Category breakdown');
        assertCleanMarkup(html);
      });

      it('renders TimelinePanel without errors or corrupt text', () => {
        const html = renderToStaticMarkup(<TimelinePanel bundle={bundle} today={TODAY} />);
        expect(html).toContain('What to do, and when');
        assertCleanMarkup(html);
      });

      it('renders VendorsPanel without errors or corrupt text', () => {
        const html = renderToStaticMarkup(<VendorsPanel bundle={bundle} today={TODAY} />);
        expect(html).toContain('Choose with confidence');
        assertCleanMarkup(html);
      });

      it('renders IdeasPanel without errors or corrupt text', () => {
        const html = renderToStaticMarkup(
          <IdeasPanel
            bundle={bundle}
            today={TODAY}
            hasLiveKey={false}
            onOpenAiSettings={() => {}}
          />
        );
        expect(html).toContain('Ideas shaped around your event');
        assertCleanMarkup(html);
      });

      it('renders full Workspace with active context having exactly one h1', () => {
        const html = renderToStaticMarkup(
          <Workspace bundle={bundle} hasLiveKey={false} onOpenAiSettings={() => {}} />
        );
        expect(html).toContain(scenario.context.title);
        expect(countH1Tags(html)).toBe(1);
        assertCleanMarkup(html);
      });
    });
  }
});
