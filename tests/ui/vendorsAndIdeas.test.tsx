// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setApiKey } from '../../src/ai/apiKeyStorage';
import { App } from '../../src/App';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { usePlanStore } from '../../src/store/planStore';
import { resetTestStore } from '../helpers/dom';

const TODAY = '2026-10-20';

describe('Vendors and Ideas Interaction Tests', () => {
  beforeEach(() => {
    resetTestStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    resetTestStore();
  });

  // Test 6: Vendors: Empty quote form shows validation errors; valid quote renders card; remove removes it
  it('validates empty quote submission, adds valid quote card with all-in total, and removes on confirmation', async () => {
    const user = userEvent.setup();
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // Switch to Vendors tab
    const vendorsTab = screen.getByRole('tab', { name: /vendors/i });
    await user.click(vendorsTab);

    // Click Save quote with empty form
    const saveBtn = await screen.findByRole('button', { name: /save quote/i });
    await user.click(saveBtn);

    // Validation errors displayed
    expect(await screen.findByText('Vendor name is required.')).toBeDefined();
    expect(await screen.findByText('Base quote must be a whole number 0 or greater.')).toBeDefined();

    // Enter valid quote details
    const nameInput = screen.getByLabelText(/vendor name/i);
    fireEvent.change(nameInput, { target: { value: 'Grand Palace Catering' } });

    const baseInput = screen.getByLabelText(/base quote/i);
    fireEvent.change(baseInput, { target: { value: '50000' } });

    await user.click(saveBtn);

    // Quote card renders with all-in total
    expect(screen.getAllByText('Grand Palace Catering').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/all-in total/i).length).toBeGreaterThanOrEqual(1);

    // Click remove
    const removeBtn = screen.getByRole('button', { name: /^remove$/i });
    await user.click(removeBtn);

    // Confirmation dialog appears
    const confirmBtn = screen.getByRole('button', { name: /^remove quote$/i });
    await user.click(confirmBtn);

    // Quote card is removed
    expect(screen.queryByText('Grand Palace Catering')).toBeNull();
  });

  // Test 7: Ideas (no key): Idea sections render; clicking Regenerate keeps app stable with no depth errors
  it('renders idea sections and keeps app stable without maximum update depth errors on regenerate', async () => {
    const user = userEvent.setup({ delay: null, skipHover: true, pointerEventsCheck: 0 });
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // Switch to Ideas tab
    const ideasTab = screen.getByRole('tab', { name: /ideas/i });
    fireEvent.click(ideasTab);

    // Verify sections render
    expect(await screen.findByText('Themes')).toBeDefined();
    expect(screen.getByText('Food & Drink')).toBeDefined();
    expect(screen.getByText('Activities')).toBeDefined();

    // Verify clicking Regenerate does not throw or trigger errors
    const errors: ErrorEvent[] = [];
    const errorHandler = (event: ErrorEvent) => {
      errors.push(event);
    };
    window.addEventListener('error', errorHandler);

    // Click Regenerate on Themes section
    const regenButtons = screen.getAllByRole('button', { name: /regenerate/i });
    const firstRegen = regenButtons[0];
    if (!firstRegen) throw new Error('No regenerate button found');
    await user.click(firstRegen);

    window.removeEventListener('error', errorHandler);
    expect(errors).toHaveLength(0);

    // Sections remain displayed
    expect(screen.getByText('Themes')).toBeDefined();
    expect(screen.getByText('Food & Drink')).toBeDefined();
    expect(screen.getByText('Activities')).toBeDefined();
  });

  // Test 8: Ideas with key & failing network: Network failure triggers offline fallback; key NEVER leaks
  it('falls back to offline mode on network failure without leaking the API key in rendered text', async () => {
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    const FAKE_KEY = 'TEST_MOCK_GEMINI_API_KEY_1234567890_VALID';
    setApiKey(FAKE_KEY);

    // Stub fetch to simulate network failure
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    render(<App />);

    // Switch to Ideas tab
    const ideasTab = screen.getByRole('tab', { name: /ideas/i });
    fireEvent.click(ideasTab);

    // Click Refresh all ideas
    const refreshBtn = await screen.findByRole('button', { name: /refresh all ideas/i });
    fireEvent.click(refreshBtn);

    // Offline fallback text is shown
    expect(await screen.findByText('Offline fallback')).toBeDefined();

    // Ideas still render
    expect(screen.getByText('Themes')).toBeDefined();
    expect(screen.getByText('Food & Drink')).toBeDefined();

    // API key string NEVER appears anywhere in document text
    expect(document.body.textContent).not.toContain(FAKE_KEY);
  });

  // Test 9: AI settings dialog: invalid key shows error; Escape or Done closes dialog
  it('validates invalid API key and closes dialog when dismissed', async () => {
    const user = userEvent.setup({ delay: null, skipHover: true, pointerEventsCheck: 0 });
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // Open AI settings
    const settingsBtn = screen.getByRole('button', { name: /ai settings/i });
    await user.click(settingsBtn);

    // Dialog title
    expect(screen.getByRole('heading', { name: 'AI settings' })).toBeDefined();

    // Enter invalid key
    const keyInput = screen.getByLabelText(/gemini api key/i);
    fireEvent.change(keyInput, { target: { value: 'invalid' } });

    // Click Save key
    const saveKeyBtn = screen.getByRole('button', { name: /save key/i });
    await user.click(saveKeyBtn);

    // Error is shown
    expect(screen.getByText('That does not look like a valid key.')).toBeDefined();

    // Click Done to close dialog
    const doneBtn = screen.getByRole('button', { name: /done/i });
    await user.click(doneBtn);

    // Dialog is closed
    const dialogs = document.querySelectorAll('dialog');
    const aiDialog = Array.from(dialogs).find((d) => d.textContent?.includes('Configure optional live intelligence'));
    expect(aiDialog?.getAttribute('open')).toBeNull();
  });
});
