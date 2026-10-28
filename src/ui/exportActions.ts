import { buildBackupJson, buildBudgetCsv, buildIcs, buildVendorCsv, toFileSlug } from '../export';
import type { PlanExportInput } from '../export/markdown';
import type { VendorQuote } from '../types/event';

/** Formats a Date object into an RFC 5545 UTC timestamp (YYYYMMDDTHHMMSSZ). */
export function toIcsStamp(now: Date): string {
  const year = String(now.getUTCFullYear()).padStart(4, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export interface ExportActionItem {
  id: 'ics' | 'budgetCsv' | 'vendorCsv' | 'backup';
  filename: string;
  mime: string;
  content: string;
  disabled: boolean;
  reason: string | null;
}

/** Prepares export file metadata, filenames, and contents for all download options. */
export function describeExports(state: PlanExportInput, now: Date): ExportActionItem[] {
  const slug = toFileSlug(state.bundle.context.title);
  const stamp = toIcsStamp(now);

  const todayIso = `${String(now.getUTCFullYear()).padStart(4, '0')}-${String(
    now.getUTCMonth() + 1
  ).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;

  const isPast = state.bundle.context.eventDate < todayIso;
  const hasOpenTasks = state.bundle.timeline.tasks.some(
    (t) => !state.taskCompletion[t.id] && !t.skippedInCompression
  );

  const icsDisabled = isPast && !hasOpenTasks;
  const icsReason = icsDisabled ? 'No open tasks or event date to export.' : null;

  const vendorQuotesDisabled = state.vendorQuotes.length === 0;
  const vendorQuotesReason = vendorQuotesDisabled ? 'Add a vendor quote first.' : null;

  const items: ExportActionItem[] = [
    {
      id: 'ics',
      filename: `${slug}-calendar.ics`,
      mime: 'text/calendar;charset=utf-8',
      content: buildIcs({
        context: state.bundle.context,
        timeline: state.bundle.timeline,
        taskCompletion: state.taskCompletion,
        stamp,
      }),
      disabled: icsDisabled,
      reason: icsReason,
    },
    {
      id: 'budgetCsv',
      filename: `${slug}-budget.csv`,
      mime: 'text/csv;charset=utf-8',
      content: buildBudgetCsv(state.bundle.budget, state.actualSpend),
      disabled: false,
      reason: null,
    },
    {
      id: 'vendorCsv',
      filename: `${slug}-vendors.csv`,
      mime: 'text/csv;charset=utf-8',
      content: buildVendorCsv(state.vendorQuotes, state.bundle.context.eventType),
      disabled: vendorQuotesDisabled,
      reason: vendorQuotesReason,
    },
    {
      id: 'backup',
      filename: `${slug}-backup.json`,
      mime: 'application/json;charset=utf-8',
      content: buildBackupJson(
        {
          context: state.bundle.context,
          taskCompletion: state.taskCompletion,
          actualSpend: state.actualSpend,
          vendorQuotes: [...state.vendorQuotes] as VendorQuote[],
          ideas: state.ideas,
        },
        now.toISOString()
      ),
      disabled: false,
      reason: null,
    },
  ];

  return items;
}
