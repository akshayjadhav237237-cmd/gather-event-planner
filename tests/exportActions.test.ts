import { describe, expect, it } from 'vitest';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { buildPlan } from '../src/domain/buildPlan';
import type { PlanExportInput } from '../src/export/markdown';
import type { VendorQuote } from '../src/types/event';
import { describeExports, toIcsStamp } from '../src/ui/exportActions';

describe('exportActions', () => {
  describe('toIcsStamp', () => {
    it('formats UTC dates into RFC 5545 UTC timestamp format', () => {
      const date = new Date(Date.UTC(2026, 9, 21, 4, 30, 15));
      expect(toIcsStamp(date)).toBe('20261021T043015Z');
    });

    it('pads single-digit month, day, hour, minute, second with leading zeros', () => {
      const date = new Date(Date.UTC(2026, 0, 5, 3, 7, 9));
      expect(toIcsStamp(date)).toBe('20260105T030709Z');
    });

    it('handles year-end dates correctly', () => {
      const date = new Date(Date.UTC(2025, 11, 31, 23, 59, 59));
      expect(toIcsStamp(date)).toBe('20251231T235959Z');
    });
  });

  describe('describeExports', () => {
    const today = '2026-06-01';
    const now = new Date(Date.UTC(2026, 5, 1, 12, 0, 0));
    const scenarios = getDemoScenarios(today);

    it('produces 4 export items with correct filenames, MIME types, and contents across demo scenarios', () => {
      for (const scenario of scenarios) {
        const bundle = buildPlan(scenario.context, today);
        const input: PlanExportInput = {
          bundle,
          taskCompletion: {},
          actualSpend: {},
          vendorQuotes: [],
          ideas: null,
        };

        const items = describeExports(input, now);
        expect(items).toHaveLength(4);

        const [ics, budgetCsv, vendorCsv, backup] = items;

        expect(ics.id).toBe('ics');
        expect(ics.mime).toBe('text/calendar;charset=utf-8');
        expect(ics.filename).toMatch(/^[a-z0-9-]+-calendar\.ics$/);
        expect(ics.content).toContain('BEGIN:VCALENDAR');
        expect(ics.content).toContain('END:VCALENDAR');

        expect(budgetCsv.id).toBe('budgetCsv');
        expect(budgetCsv.mime).toBe('text/csv;charset=utf-8');
        expect(budgetCsv.filename).toMatch(/^[a-z0-9-]+-budget\.csv$/);
        expect(budgetCsv.content).toContain('Total budget');
        expect(budgetCsv.disabled).toBe(false);

        expect(vendorCsv.id).toBe('vendorCsv');
        expect(vendorCsv.mime).toBe('text/csv;charset=utf-8');
        expect(vendorCsv.filename).toMatch(/^[a-z0-9-]+-vendors\.csv$/);
        expect(vendorCsv.disabled).toBe(true);
        expect(vendorCsv.reason).toBe('Add a vendor quote first.');

        expect(backup.id).toBe('backup');
        expect(backup.mime).toBe('application/json;charset=utf-8');
        expect(backup.filename).toMatch(/^[a-z0-9-]+-backup\.json$/);
        expect(backup.disabled).toBe(false);
      }
    });

    it('enables vendor CSV export when at least one quote is present', () => {
      const bundle = buildPlan(scenarios[0].context, today);
      const sampleQuote: VendorQuote = {
        id: 'q-1',
        categoryId: 'catering',
        vendorName: 'Royal Feast Catering',
        baseQuote: 50000,
        serviceAndTaxPct: 18,
        depositPaid: 10000,
        contractSigned: true,
        insuranceVerified: true,
        backupPlan: 'Local kitchen backup',
        notes: 'Includes Jain options',
      };

      const input: PlanExportInput = {
        bundle,
        taskCompletion: {},
        actualSpend: {},
        vendorQuotes: [sampleQuote],
        ideas: null,
      };

      const items = describeExports(input, now);
      const vendorCsv = items.find((item) => item.id === 'vendorCsv');
      expect(vendorCsv?.disabled).toBe(false);
      expect(vendorCsv?.reason).toBeNull();
      expect(vendorCsv?.content).toContain('Royal Feast Catering');
    });

    it('disables calendar ICS when event is in the past AND all open tasks are completed', () => {
      const pastContext = {
        ...scenarios[1].context,
        eventDate: '2026-05-01',
      };
      const bundle = buildPlan(pastContext, today);

      const allTasksCompleted: Record<string, boolean> = {};
      for (const t of bundle.timeline.tasks) {
        allTasksCompleted[t.id] = true;
      }

      const input: PlanExportInput = {
        bundle,
        taskCompletion: allTasksCompleted,
        actualSpend: {},
        vendorQuotes: [],
        ideas: null,
      };

      const items = describeExports(input, now);
      const ics = items.find((item) => item.id === 'ics');
      expect(ics?.disabled).toBe(true);
      expect(ics?.reason).toBe('No open tasks or event date to export.');
    });

    it('keeps calendar ICS enabled if event is in the past BUT has open uncompleted tasks', () => {
      const pastContext = {
        ...scenarios[1].context,
        eventDate: '2026-05-01',
      };
      const bundle = buildPlan(pastContext, today);

      const input: PlanExportInput = {
        bundle,
        taskCompletion: {},
        actualSpend: {},
        vendorQuotes: [],
        ideas: null,
      };

      const items = describeExports(input, now);
      const ics = items.find((item) => item.id === 'ics');
      expect(ics?.disabled).toBe(false);
      expect(ics?.reason).toBeNull();
    });

    it('keeps calendar ICS enabled if event is in the future even if all tasks are completed', () => {
      const bundle = buildPlan(scenarios[0].context, today);
      const allTasksCompleted: Record<string, boolean> = {};
      for (const t of bundle.timeline.tasks) {
        allTasksCompleted[t.id] = true;
      }

      const input: PlanExportInput = {
        bundle,
        taskCompletion: allTasksCompleted,
        actualSpend: {},
        vendorQuotes: [],
        ideas: null,
      };

      const items = describeExports(input, now);
      const ics = items.find((item) => item.id === 'ics');
      expect(ics?.disabled).toBe(false);
      expect(ics?.reason).toBeNull();
    });
  });
});
