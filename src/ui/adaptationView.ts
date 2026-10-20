import type { ContextAdaptation, Severity, TargetModule } from '../types/event';

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Note',
};

export const MODULE_LABELS: Record<TargetModule, string> = {
  budget: 'Budget',
  timeline: 'Timeline',
  vendor: 'Vendors',
  safety: 'Safety',
  ideas: 'Ideas',
};

export interface SummarizedAdaptations {
  counts: Record<Severity, number>;
  prominent: ContextAdaptation[];
  notes: ContextAdaptation[];
  announcement: string;
  headline: string;
}

export function summarizeAdaptations(list: ContextAdaptation[]): SummarizedAdaptations {
  const counts: Record<Severity, number> = {
    critical: 0,
    warning: 0,
    info: 0,
  };

  const prominent: ContextAdaptation[] = [];
  const notes: ContextAdaptation[] = [];

  for (const item of list) {
    counts[item.severity] += 1;
    if (item.severity === 'critical' || item.severity === 'warning') {
      prominent.push(item);
    } else {
      notes.push(item);
    }
  }

  const total = list.length;

  if (total === 0) {
    return {
      counts,
      prominent,
      notes,
      headline: 'Standard celebration setup',
      announcement: 'No special adaptations needed. Your plan uses the standard setup.',
    };
  }

  const headline = total === 1 ? '1 plan adaptation active' : `${total} plan adaptations active`;

  const parts: string[] = [];
  if (counts.critical > 0) {
    parts.push(`${counts.critical} critical`);
  }
  if (counts.warning > 0) {
    parts.push(`${counts.warning} ${counts.warning === 1 ? 'warning' : 'warnings'}`);
  }
  if (counts.info > 0) {
    parts.push(`${counts.info} ${counts.info === 1 ? 'note' : 'notes'}`);
  }

  const announcement = `${headline}: ${parts.join(', ')}.`;

  return {
    counts,
    prominent,
    notes,
    headline,
    announcement,
  };
}
