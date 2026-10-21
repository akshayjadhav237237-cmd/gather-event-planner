// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildPlan } from '../../src/domain/buildPlan';
import { usePlanStore } from '../../src/store/planStore';
import { resetTestStore } from '../helpers/dom';

const TODAY = '2026-10-20';

describe('Timeline and Budget Interaction Tests', () => {
  beforeEach(() => {
    resetTestStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    resetTestStore();
  });

  // Test 3: Timeline: Ticking a task checkbox increases "tasks done" count in vitals; unticking decreases it
  it('updates completed task counts in vitals strip when checkboxes are toggled in timeline', async () => {
    const user = userEvent.setup();
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    const bundle = buildPlan(scenario.context, TODAY);
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // Switch to Timeline tab
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    await user.click(timelineTab);

    const firstTask = bundle.timeline.tasks.find((t) => !t.skippedInCompression);
    if (!firstTask) throw new Error('No unskipped task found');

    const totalTasks = bundle.timeline.tasks.filter((t) => !t.skippedInCompression).length;
    expect(screen.getByText(`0/${totalTasks}`)).toBeDefined();

    const taskCheckbox = screen.getByLabelText(firstTask.title);
    expect(taskCheckbox).toBeDefined();

    // Tick task checkbox
    await user.click(taskCheckbox);
    expect(screen.getByText(`1/${totalTasks}`)).toBeDefined();

    // Untick task checkbox
    await user.click(taskCheckbox);
    expect(screen.getByText(`0/${totalTasks}`)).toBeDefined();
  });

  // Test 4: Edit form: Editing guest count to valid value updates calculation; '0' displays inline error
  it('updates per-guest budget calculation on valid guest count, and displays inline error on invalid 0', () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // Initial guest count is 300, 3,500,000 / 300 = 11,666 / guest
    expect(screen.getAllByText(/11.*666.*guest/i).length).toBeGreaterThanOrEqual(1);

    const guestInput = screen.getByLabelText(/estimated guest count/i);

    // Edit guest count to valid value 180 across debounce
    vi.useFakeTimers();
    fireEvent.change(guestInput, { target: { value: '180' } });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // 3,500,000 / 180 = 19,444 / guest
    expect(usePlanStore.getState().context?.guestCount).toBe(180);
    expect(screen.getAllByText(/19.*444.*guest/i).length).toBeGreaterThanOrEqual(1);

    // Enter invalid 0
    fireEvent.change(guestInput, { target: { value: '0' } });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Inline error displayed
    expect(screen.getByText('Enter a guest count between 1 and 10,000.')).toBeDefined();
    // Context guest count remains 180
    expect(usePlanStore.getState().context?.guestCount).toBe(180);

    vi.useRealTimers();
  });

  // Test 5: Budget: Spend larger than allocation shows over-allocation badge; clearing removes badge
  it('displays over-allocation badge when spend exceeds allocation and clears it when input is reset', () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // In budget tab by default
    const spendInputs = screen.getAllByLabelText(/spent so far on/i);
    const firstInput = spendInputs[0];
    if (!firstInput) throw new Error('No budget spend input found');

    vi.useFakeTimers();

    // Enter large spend exceeding allocation
    fireEvent.change(firstInput, { target: { value: '99999999' } });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Over-allocation badge displayed
    expect(screen.getByText(/over by/i)).toBeDefined();

    // Reset/clear field
    fireEvent.change(firstInput, { target: { value: '' } });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Over-allocation badge removed
    expect(screen.queryByText(/over by/i)).toBeNull();

    vi.useRealTimers();
  });
});
