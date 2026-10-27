// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';
import { resetTestStore } from '../helpers/dom';

describe('Launchpad and Tabs Interaction Tests', () => {
  beforeAll(async () => {
    await import('../../src/components/layout/Workspace');
  });

  beforeEach(() => {
    resetTestStore();
  });

  afterEach(() => {
    cleanup();
    resetTestStore();
  });

  // Test 1: Launchpad shows single h1; clicking sample scenario card loads scenario workspace with title as h1
  it('renders Launchpad with single h1, loads sample scenario on card click, and presents workspace h1', async () => {
    render(<App />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toContain('Plan the celebration, not the spreadsheet.');

    const scenarioCard = screen.getByRole('button', {
      name: /Multiday Traditional Wedding/i,
    });
    fireEvent.click(scenarioCard);

    const h1 = await screen.findByRole(
      'heading',
      { level: 1, name: /Multiday Traditional Wedding/i },
      { timeout: 5000 }
    );
    expect(h1).toBeDefined();
    const workspaceHeadings = screen.getAllByRole('heading', { level: 1 });
    expect(workspaceHeadings).toHaveLength(1);
    expect(workspaceHeadings[0]?.textContent).toContain('Multiday Traditional Wedding');
  });

  // Test 2: Tabs exist; keyboard navigation updates active tab; only active panel is mounted
  it('provides accessible tabs navigable via Arrow keys, Home, and End, mounting only the active panel', async () => {
    const user = userEvent.setup({ delay: null, skipHover: true, pointerEventsCheck: 0 });
    render(<App />);

    // Load scenario to reach workspace
    fireEvent.click(screen.getByRole('button', { name: /Multiday Traditional Wedding/i }));

    const budgetTab = await screen.findByRole('tab', { name: /budget/i });
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    const vendorsTab = screen.getByRole('tab', { name: /vendors/i });
    const ideasTab = screen.getByRole('tab', { name: /ideas/i });

    expect(budgetTab).toBeDefined();
    expect(timelineTab).toBeDefined();
    expect(vendorsTab).toBeDefined();
    expect(ideasTab).toBeDefined();

    // Initially Budget is selected
    expect(budgetTab.getAttribute('aria-selected')).toBe('true');
    expect(timelineTab.getAttribute('aria-selected')).toBe('false');
    expect(screen.getByText('Where the money goes')).toBeDefined();
    expect(screen.queryByText('What to do, and when')).toBeNull();

    // Focus budget tab and press ArrowRight to go to Timeline
    budgetTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(timelineTab.getAttribute('aria-selected')).toBe('true');
    expect(budgetTab.getAttribute('aria-selected')).toBe('false');
    expect(screen.getByText('What to do, and when')).toBeDefined();
    expect(screen.queryByText('Where the money goes')).toBeNull();

    // ArrowRight to Vendors
    await user.keyboard('{ArrowRight}');
    expect(vendorsTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Choose with confidence')).toBeDefined();
    expect(screen.queryByText('What to do, and when')).toBeNull();

    // End key moves to last tab (Ideas)
    await user.keyboard('{End}');
    expect(ideasTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Ideas shaped around your event')).toBeDefined();

    // ArrowLeft moves back to Vendors
    await user.keyboard('{ArrowLeft}');
    expect(vendorsTab.getAttribute('aria-selected')).toBe('true');

    // Home key moves to first tab (Budget)
    await user.keyboard('{Home}');
    expect(budgetTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Where the money goes')).toBeDefined();
  });

  // Test 10: Start over button opens reset confirmation dialog; confirming clears store and returns to launchpad
  it('opens reset confirmation dialog from header and returns to launchpad when confirmed', async () => {
    render(<App />);

    // Enter workspace via scenario
    fireEvent.click(screen.getByRole('button', { name: /Multiday Traditional Wedding/i }));
    await screen.findByRole('heading', { level: 1, name: /Multiday Traditional Wedding/i });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Multiday Traditional Wedding');

    // Click Start over in header
    const startOverBtn = screen.getByRole('button', { name: /start over/i });
    fireEvent.click(startOverBtn);

    // Confirmation dialog appears
    expect(screen.getByText('Clear everything on this device?')).toBeDefined();
    const confirmBtn = screen.getByRole('button', { name: /clear everything/i });
    fireEvent.click(confirmBtn);

    // Returns to launchpad with its single h1
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toContain('Plan the celebration, not the spreadsheet.');
  });
});
