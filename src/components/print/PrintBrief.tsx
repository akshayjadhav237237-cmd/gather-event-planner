import { memo, type FC } from 'react';
import type { PlanBundle } from '../../types/engine';
import type { PersonalizedIdeas, VendorQuote } from '../../types/event';
import { buildBudgetRows, summarizeSpending } from '../../ui/budgetView';
import { groupTasksByPhase, skippedTasks } from '../../ui/timelineView';
import { formatCurrency } from '../../utils/currency';
import { formatDateShort, formatDateLong } from '../../ui/formatDate';
import { formatSlotRange } from '../../ui/runOfShowView';
import {
  EVENT_TYPE_LABELS,
  SUBFORMAT_LABELS,
  SETTING_LABELS,
  SEASON_LABELS,
} from '../../ui/labels';
import {
  buildPrintBudgetRows,
  buildPrintIdeaGroups,
  buildPrintVendorRows,
  formatPrintHeaderDetails,
  formatPrintSubDetails,
  formatTaskMarker,
  PRINT_DISCLAIMER,
} from '../../ui/printView';
import { PrintBudgetTable, PrintQuotesTable } from './PrintSections';
import { addDays, isValidIsoDate } from '../../utils/dateMath';

export interface PrintBriefProps {
  bundle: PlanBundle;
  taskCompletion: Record<string, boolean>;
  actualSpend: Record<string, number>;
  vendorQuotes: readonly VendorQuote[];
  ideas: PersonalizedIdeas | null;
  today?: string;
}

export const PrintBrief: FC<PrintBriefProps> = memo(
  ({ bundle, taskCompletion, actualSpend, vendorQuotes, ideas, today }) => {
    const { context, signals, decision, budget, timeline } = bundle;
    const currency = context.currency;
    const effectiveToday =
      today ??
      (isValidIsoDate(context.eventDate)
        ? addDays(context.eventDate, -signals.daysUntilEvent)
        : '');
    const budgetRows = buildPrintBudgetRows(buildBudgetRows(budget, actualSpend), currency);
    const budgetSummary = summarizeSpending(budget, actualSpend);
    const phaseGroups = groupTasksByPhase(timeline.tasks, taskCompletion, 'all', effectiveToday);
    const skipped = skippedTasks(timeline.tasks);
    const vendorRows = buildPrintVendorRows(
      vendorQuotes,
      budget.categories,
      context.eventType,
      currency
    );
    const ideaGroups = ideas ? buildPrintIdeaGroups(ideas) : null;
    const typeLabel = EVENT_TYPE_LABELS[context.eventType] ?? context.eventType;
    const formatLabel = SUBFORMAT_LABELS[context.subFormat] ?? context.subFormat;

    return (
      <article className="hidden print:block space-y-6 text-black bg-white">
        <header className="border-b border-black pb-4 space-y-1">
          <h2 className="text-2xl font-serif font-bold tracking-tight">{context.title}</h2>
          <p className="text-sm">
            {formatPrintHeaderDetails(
              typeLabel,
              formatLabel,
              formatDateLong(context.eventDate),
              context.guestCount,
              formatCurrency(context.totalBudget, currency)
            )}
          </p>
          <p className="text-xs text-ink-soft">
            {formatPrintSubDetails(
              SETTING_LABELS[context.setting] ?? context.setting,
              SEASON_LABELS[context.season] ?? context.season,
              formatCurrency(signals.perGuestBudget, currency)
            )}
          </p>
        </header>

        <section aria-labelledby="print-why-heading" className="space-y-2">
          <h3 id="print-why-heading" className="text-lg font-serif font-bold">
            Why this plan looks this way
          </h3>
          {decision.adaptations.length === 0 ? (
            <p className="text-sm">Standard baseline planning rules applied.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {decision.adaptations.map((a) => (
                <li key={a.id}>
                  <span className="font-semibold uppercase text-xs">[{a.severity}]</span>{' '}
                  {a.explanation}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="print-budget-heading" className="space-y-2">
          <h3 id="print-budget-heading" className="text-lg font-serif font-bold">
            Budget
          </h3>
          <PrintBudgetTable
            budgetRows={budgetRows}
            budget={budget}
            currency={currency}
            budgetSummary={budgetSummary}
          />
        </section>

        <section aria-labelledby="print-timeline-heading" className="space-y-3">
          <h3 id="print-timeline-heading" className="text-lg font-serif font-bold">
            Timeline &amp; Checklist
          </h3>
          {phaseGroups.map((phase) => (
            <div key={phase.phase} className="space-y-1">
              <h4 className="font-semibold text-sm">
                {phase.phase} ({phase.doneCount}/{phase.totalCount})
              </h4>
              <ul className="space-y-0.5 text-sm">
                {phase.items.map(({ task, done }) => (
                  <li key={task.id} className="flex items-baseline justify-between gap-4">
                    <span>
                      {formatTaskMarker(done)} {task.title}
                    </span>
                    <span className="text-xs">{formatDateShort(task.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {skipped.length > 0 && (
            <p className="text-xs italic pt-1">
              Skipped for compressed schedule ({skipped.length} tasks):{' '}
              {skipped.map((t) => t.title).join(', ')}
            </p>
          )}
        </section>

        <section aria-labelledby="print-schedule-heading" className="space-y-2">
          <h3 id="print-schedule-heading" className="text-lg font-serif font-bold">
            Day-of Schedule
          </h3>
          <table className="w-full text-sm">
            <caption className="text-left font-semibold text-sm mb-1">Day-of run of show</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left">
                  Time
                </th>
                <th scope="col" className="text-left">
                  Activity
                </th>
                <th scope="col" className="text-left">
                  Role
                </th>
                <th scope="col" className="text-right">
                  Buffer
                </th>
              </tr>
            </thead>
            <tbody>
              {timeline.runOfShow.map((slot, idx) => (
                <tr key={`${slot.startTime}-${idx}`}>
                  <td>{formatSlotRange(slot.startTime, slot.durationMin)}</td>
                  <td>{slot.activity}</td>
                  <td>{slot.owner}</td>
                  <td className="text-right">
                    {slot.bufferMin > 0 ? `${slot.bufferMin} min` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="print-quotes-heading" className="space-y-2">
          <h3 id="print-quotes-heading" className="text-lg font-serif font-bold">
            Vendor Quotes
          </h3>
          {vendorRows.length > 0 ? (
            <PrintQuotesTable vendorRows={vendorRows} />
          ) : (
            <p className="text-sm">No quotes added yet.</p>
          )}
        </section>

        <section aria-labelledby="print-ideas-heading" className="space-y-3">
          <h3 id="print-ideas-heading" className="text-lg font-serif font-bold">
            Personalized Ideas
          </h3>
          {ideaGroups ? (
            <div className="space-y-3 text-sm">
              {ideaGroups.map((g) => (
                <div key={g.title} className="space-y-1">
                  <h4 className="font-semibold">{g.title}</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {g.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">Open the Ideas tab to include ideas in this brief.</p>
          )}
        </section>

        <p className="text-xs italic pt-4">{PRINT_DISCLAIMER}</p>
      </article>
    );
  }
);

PrintBrief.displayName = 'PrintBrief';
