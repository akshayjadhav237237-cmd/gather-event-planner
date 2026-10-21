// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildBackupJson, type BackupPayload } from '../../src/export';
import { usePlanStore } from '../../src/store/planStore';
import { resetTestStore, stubClipboard, stubObjectURL } from '../helpers/dom';

const TODAY = '2026-10-20';

describe('Export and Restore Interaction Tests', () => {
  beforeEach(() => {
    resetTestStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    resetTestStore();
  });

  // Test 11: Export dialog: clipboard success & fallback, calendar download blob invocation
  it('handles clipboard copy with announcement, provides fallback on unavailable clipboard, and downloads ics blob', async () => {
    const user = userEvent.setup();
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    const { writeText } = stubClipboard();
    const { createObjectURL } = stubObjectURL();

    render(<App />);

    // Open export dialog
    const exportBtn = screen.getByRole('button', { name: /export/i });
    await user.click(exportBtn);

    // Verify Export dialog is visible
    expect(screen.getByRole('heading', { name: 'Export & Backup' })).toBeDefined();

    // 1. With clipboard stubbed to succeed, click "Copy plan summary"
    const copyHeading = screen.getByText('Copy plan summary');
    const copyRow = copyHeading.closest('div')?.parentElement;
    if (!copyRow) throw new Error('Copy row not found');
    const copyBtn = within(copyRow).getByRole('button', { name: /copy/i });

    await user.click(copyBtn);
    expect(writeText).toHaveBeenCalled();
    expect(await screen.findByText('Summary copied to clipboard.')).toBeDefined();

    // 2. With clipboard unavailable, announces fallback message
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    await user.click(copyBtn);
    expect(screen.getByText('Copying is not available here. Use a download instead.')).toBeDefined();

    // 3. Calendar download invokes URL.createObjectURL with a Blob
    const calendarHeading = screen.getByText('Calendar file (.ics)');
    const calendarRow = calendarHeading.closest('div')?.parentElement;
    if (!calendarRow) throw new Error('Calendar row not found');
    const downloadCalBtn = within(calendarRow).getByRole('button', { name: /download/i });

    await user.click(downloadCalBtn);
    expect(createObjectURL).toHaveBeenCalled();
    const createdBlob = createObjectURL.mock.calls[0]?.[0];
    expect(createdBlob instanceof Blob).toBe(true);
  });

  // Test 12: Backup and restore: valid file triggers confirmation and restores plan; invalid file shows warning
  it('triggers confirmation step and replaces store on valid backup, while showing warning on invalid backup', async () => {
    const user = userEvent.setup();
    const scenario = getDemoScenarios(TODAY)[0];
    if (!scenario) throw new Error('Scenario not found');
    usePlanStore.getState().loadScenario(scenario.context);

    render(<App />);

    // Open export dialog
    const exportBtn = screen.getByRole('button', { name: /export/i });
    await user.click(exportBtn);

    // 1. Test valid backup restore
    const backupContext = {
      ...scenario.context,
      id: 'restored-event-1',
      title: 'Restored Anniversary Gala',
    };
    const validPayload: BackupPayload = {
      context: backupContext,
      taskCompletion: { 'task-restored-1': true },
      actualSpend: { catering: 45000 },
      vendorQuotes: [],
      ideas: null,
    };
    const validJson = buildBackupJson(validPayload, new Date().toISOString());
    const validFile = new File([validJson], 'backup.json', { type: 'application/json' });

    const fileInput = screen.getByLabelText(/select backup file/i);
    await user.upload(fileInput, validFile);

    // Confirmation step is displayed
    expect(await screen.findByText(/Replace your current plan with the backup of/i)).toBeDefined();
    expect(screen.getByText(/Restored Anniversary Gala/i)).toBeDefined();

    // Confirm replace
    const replaceBtn = screen.getByRole('button', { name: /replace plan/i });
    await user.click(replaceBtn);

    // Current plan replaced in store
    expect(usePlanStore.getState().context?.title).toBe('Restored Anniversary Gala');
    expect(usePlanStore.getState().actualSpend['catering']).toBe(45000);

    // 2. Test invalid backup restore
    await user.click(screen.getByRole('button', { name: /export/i }));
    const fileInputAfter = screen.getByLabelText(/select backup file/i);

    const invalidFile = new File(['{"corrupted": true}'], 'invalid.json', { type: 'application/json' });
    await user.upload(fileInputAfter, invalidFile);

    // Displays friendly warning alert
    expect(await screen.findByText('Backup restore failed')).toBeDefined();

    // Current plan is preserved
    expect(usePlanStore.getState().context?.title).toBe('Restored Anniversary Gala');
    expect(usePlanStore.getState().actualSpend['catering']).toBe(45000);
  });
});
