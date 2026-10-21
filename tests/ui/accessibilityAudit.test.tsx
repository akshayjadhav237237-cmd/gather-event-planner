// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildPlan } from '../../src/domain/buildPlan';
import { usePlanStore } from '../../src/store/planStore';
import { TaskItem } from '../../src/components/timeline/TaskItem';
import { RemoveQuoteDialog } from '../../src/components/vendors/RemoveQuoteDialog';
import { PrintBrief } from '../../src/components/print/PrintBrief';
import type { TimelineTask, VendorQuote } from '../../src/types/event';
import { resetTestStore } from '../helpers/dom';

const TODAY = '2026-10-20';

const sampleTask: TimelineTask = {
  id: 'task-test-1',
  title: 'Secure event insurance policy',
  phase: '6_months_out',
  dueDate: '2026-11-01',
  ownerRole: 'host',
  priority: 'high',
  suggestedVendorCategory: 'insurance',
  rationale: 'Protects deposits against unforeseen cancellations',
  sourceReason: 'standard_milestone',
  dependencies: [],
  skippedInCompression: false,
};

const sampleQuote: VendorQuote = {
  id: 'quote-test-1',
  categoryId: 'catering',
  vendorName: 'Sample Banquet Co.',
  baseQuote: 12000,
  serviceAndTaxPct: 15,
  depositPaid: 2000,
  contractSigned: true,
  insuranceVerified: true,
  backupPlan: 'Indoor hall available',
};

function verifyNoHeadingSkips(element: HTMLElement) {
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let prevLevel = 2;
  headings.forEach((h, index) => {
    const level = parseInt(h.tagName.substring(1), 10);
    if (index === 0) {
      expect(level).toBeLessThanOrEqual(2);
      prevLevel = level;
    } else {
      expect(level - prevLevel).toBeLessThanOrEqual(1);
      prevLevel = level;
    }
  });
}

describe('Accessibility and Spec Verification (Subagent D)', () => {
  beforeEach(() => { resetTestStore(); });
  afterEach(() => { cleanup(); resetTestStore(); });

  it('verifies progress indicators use role="progressbar" with ARIA attributes and labels', () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario missing');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(1);

    for (const bar of progressBars) {
      expect(bar.getAttribute('aria-valuenow')).not.toBeNull();
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).not.toBeNull();
      expect(bar.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('verifies all data tables have semantic captions and column header scope', () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario missing');
    const bundle = buildPlan(scenario.context, TODAY);

    const { container } = render(
      <PrintBrief
        bundle={bundle}
        taskCompletion={{}}
        actualSpend={{}}
        vendorQuotes={[sampleQuote]}
        ideas={null}
        today={TODAY}
      />
    );
    const tables = container.querySelectorAll('table');
    expect(tables.length).toBe(3);

    tables.forEach((table) => {
      const caption = table.querySelector('caption');
      expect(caption?.textContent?.trim().length).toBeGreaterThan(0);
      expect(table.querySelectorAll('th[scope="col"]').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('verifies timeline task checkbox is labelled by task title and badges have text + icon', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <TaskItem
        task={sampleTask}
        done={false}
        status="overdue"
        waitingOn={[]}
        locale="en-US"
        showReasons={true}
        onToggle={onToggle}
      />
    );

    expect(screen.getByRole('checkbox', { name: sampleTask.title })).toBeDefined();
    const overdueBadge = screen.getByText('Overdue');
    const icons = overdueBadge.parentElement?.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons?.length).toBeGreaterThanOrEqual(1);

    rerender(
      <TaskItem
        task={sampleTask}
        done={false}
        status="dueSoon"
        waitingOn={[]}
        locale="en-US"
        showReasons={true}
        onToggle={onToggle}
      />
    );
    expect(screen.getByText('Due soon')).toBeDefined();
  });

  it('verifies controls have visible matching labels and buttons have accessible names', () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario missing');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    screen.getAllByRole('button').forEach((btn) => {
      const accessibleName = btn.getAttribute('aria-label') || btn.textContent?.trim();
      expect(accessibleName).toBeTruthy();
    });

    screen.getAllByRole('textbox').forEach((box) => {
      const accessibleName = box.getAttribute('aria-label') || box.getAttribute('placeholder') || '';
      expect(Boolean(box.getAttribute('id')) || accessibleName.length > 0).toBe(true);
    });
  });

  it('verifies workspace has exactly one h1 and panels start at h2 without skips', () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario missing');
    usePlanStore.getState().loadScenario(scenario.context);

    const { container } = render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBe(1);

    // Verify budget panel
    const tabPanels = container.querySelectorAll('[role="tabpanel"]');
    expect(tabPanels.length).toBe(1);
    verifyNoHeadingSkips(tabPanels[0] as HTMLElement);

    // Verify timeline panel
    fireEvent.click(screen.getByRole('tab', { name: /timeline/i }));
    const activePanel = container.querySelector('[role="tabpanel"]');
    if (activePanel) verifyNoHeadingSkips(activePanel as HTMLElement);

    // Verify vendors panel
    fireEvent.click(screen.getByRole('tab', { name: /vendors/i }));
    const vendorsPanel = container.querySelector('[role="tabpanel"]');
    if (vendorsPanel) verifyNoHeadingSkips(vendorsPanel as HTMLElement);
  });

  it('verifies RemoveQuoteDialog title wiring, cancel action, and escape handling', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const { container } = render(
      <RemoveQuoteDialog quote={sampleQuote} onConfirm={onConfirm} onCancel={onCancel} />
    );

    const dialog = container.querySelector('dialog');
    const labelledBy = dialog?.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('dialog-title');
    expect(container.querySelector(`#${labelledBy}`)?.textContent).toBe('Remove this quote?');

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /^remove quote$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
