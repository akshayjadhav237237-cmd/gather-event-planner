import { CATEGORY_SETS } from '../data/categories';
import { quoteAllInTotal } from '../domain/quoteMath';
import type { PlanBundle } from '../types/engine';
import type { PersonalizedIdeas, VendorQuote } from '../types/event';
import { buildBudgetRows, summarizeSpending } from '../ui/budgetView';
import { formatDateShort } from '../ui/formatDate';
import {
  EVENT_TYPE_LABELS,
  SEASON_LABELS,
  SETTING_LABELS,
  SUBFORMAT_LABELS,
} from '../ui/labels';
import { groupTasksByPhase } from '../ui/timelineView';
import { formatCurrency } from '../utils/currency';

export interface PlanExportInput {
  bundle: PlanBundle;
  taskCompletion: Record<string, boolean>;
  actualSpend: Record<string, number>;
  vendorQuotes: readonly VendorQuote[];
  ideas: PersonalizedIdeas | null;
}

/** Formats a full celebration plan summary into a clean markdown document. */
export function buildPlanBrief(input: PlanExportInput): string {
  const { bundle, taskCompletion, actualSpend, vendorQuotes, ideas } = input;
  const { context: ctx, budget, timeline, decision } = bundle;
  const currency = ctx.currency;

  const lines: string[] = [
    `# ${ctx.title}`,
    '',
    `- **Type**: ${EVENT_TYPE_LABELS[ctx.eventType] ?? ctx.eventType}`,
    `- **Sub-format**: ${SUBFORMAT_LABELS[ctx.subFormat] ?? ctx.subFormat}`,
    `- **Date**: ${formatDateShort(ctx.eventDate)}`,
    `- **Guests**: ${ctx.guestCount}`,
    `- **Budget**: ${formatCurrency(ctx.totalBudget, currency)}`,
    `- **Setting**: ${SETTING_LABELS[ctx.setting] ?? ctx.setting}`,
    `- **Season**: ${SEASON_LABELS[ctx.season] ?? ctx.season}`,
    '',
    '## Why this plan looks this way',
    '',
  ];

  if (decision.adaptations.length === 0) {
    lines.push('Standard baseline planning rules applied.', '');
  } else {
    for (const adapt of decision.adaptations) {
      lines.push(`- [${adapt.severity.toUpperCase()}] ${adapt.explanation}`);
    }
    lines.push('');
  }

  lines.push('## Budget', '');
  const budgetRows = buildBudgetRows(budget, actualSpend);
  for (const r of budgetRows) {
    lines.push(
      `- **${r.name}** (${r.allocatedPct}%): Allocated ${formatCurrency(r.allocatedAmount, currency)} | Spent ${formatCurrency(r.spent, currency)} | Remaining ${formatCurrency(r.remaining, currency)}`
    );
  }
  const contingencyPct = Math.round(budget.contingencyPct * 100);
  lines.push(
    `- **Contingency (held back)** (${contingencyPct}%): Allocated ${formatCurrency(budget.contingencyAmount, currency)} | Remaining ${formatCurrency(budget.contingencyAmount, currency)}`
  );
  const { totalSpent, remainingOfTotal } = summarizeSpending(budget, actualSpend);
  lines.push(
    `- **Total budget**: ${formatCurrency(budget.totalBudget, currency)} | Spent ${formatCurrency(totalSpent, currency)} | Remaining ${formatCurrency(remainingOfTotal, currency)}`,
    ''
  );

  lines.push('## Timeline', '');
  const phaseGroups = groupTasksByPhase(timeline.tasks, taskCompletion, 'all', ctx.eventDate);
  for (const group of phaseGroups) {
    lines.push(`### ${group.phase}`, '');
    for (const item of group.items) {
      const box = item.done ? '[x]' : '[ ]';
      lines.push(`- ${box} ${item.task.title} - Due ${formatDateShort(item.task.dueDate)}`);
    }
    lines.push('');
  }
  const skipped = timeline.tasks.filter((t) => t.skippedInCompression);
  if (skipped.length > 0) {
    lines.push(
      `*Note: ${skipped.length} non-essential tasks omitted due to compressed timeline.*`,
      ''
    );
  }

  lines.push('## Vendor quotes', '');
  if (vendorQuotes.length === 0) {
    lines.push('No quotes added yet.', '');
  } else {
    const catMap = new Map((CATEGORY_SETS[ctx.eventType] ?? []).map((c) => [c.id, c.name]));
    for (const q of vendorQuotes) {
      const catName = catMap.get(q.categoryId) ?? q.categoryId;
      const allIn = quoteAllInTotal(q);
      const contractStatus = q.contractSigned ? 'Yes' : 'No';
      const insuranceStatus = q.insuranceVerified ? 'Yes' : 'No';
      lines.push(
        `- **${q.vendorName}** (${catName}): ${formatCurrency(allIn, currency)} | Contract signed: ${contractStatus} | Insurance verified: ${insuranceStatus}`
      );
    }
    lines.push('');
  }

  if (ideas !== null) {
    lines.push('## Ideas', '', '### Theme concepts', '');
    for (const concept of ideas.themeConcepts) {
      lines.push(`- **${concept.title}**: ${concept.summary} (${concept.whyItFits})`);
    }
    lines.push('', '### Catering concepts', '');
    for (const idea of ideas.cateringIdeas) {
      lines.push(`- **${idea.title}**: ${idea.summary} (${idea.whyItFits})`);
    }
    lines.push('', '### Activities', '');
    for (const act of ideas.activityIdeas) {
      lines.push(`- **${act.title}**: ${act.summary} (${act.whyItFits})`);
    }
    lines.push('', '### Bespoke tasks', '');
    for (const task of ideas.bespokeTasks) {
      lines.push(`- **${task.title}** (${task.phase}): ${task.rationale}`);
    }
    lines.push('');
  }

  lines.push(
    '---',
    'This plan provides planning heuristics and suggestions. Confirm all requirements, prices, and agreements directly with local vendors and authorities.'
  );

  return lines.join('\n');
}
