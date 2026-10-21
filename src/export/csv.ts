import { CATEGORY_SETS } from '../data/categories';
import { quoteAllInTotal } from '../domain/vendorEngine';
import type { BudgetBreakdown, EventType, VendorQuote } from '../types/event';
import { buildBudgetRows, summarizeSpending } from '../ui/budgetView';

const INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/** Escapes a CSV cell value with RFC 4180 quotes and spreadsheet formula injection defenses. */
export function escapeCsvCell(value: string | number): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return '""';
    }
    return String(value);
  }

  let cell = value;
  if (INJECTION_PREFIXES.some((prefix) => cell.startsWith(prefix))) {
    cell = "'" + cell;
  }

  if (cell.includes(',') || cell.includes('"') || cell.includes('\r') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }

  return cell;
}

/** Serializes a 2D array of cells into an RFC 4180 CSV string with CRLF line endings. */
export function toCsv(rows: ReadonlyArray<ReadonlyArray<string | number>>): string {
  if (rows.length === 0) {
    return '';
  }
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n') + '\r\n';
}

/** Builds an RFC 4180 CSV export of the budget breakdown and actual spending. */
export function buildBudgetCsv(
  breakdown: BudgetBreakdown,
  actualSpend: Record<string, number>
): string {
  const budgetRows = buildBudgetRows(breakdown, actualSpend);
  const { totalSpent, remainingOfTotal } = summarizeSpending(breakdown, actualSpend);

  const rows: Array<Array<string | number>> = [
    ['Amounts in ' + breakdown.currency],
    ['Category', 'Planning split (%)', 'Allocated', 'Spent', 'Remaining'],
  ];

  for (const r of budgetRows) {
    rows.push([r.name, r.allocatedPct, r.allocatedAmount, r.spent, r.remaining]);
  }

  rows.push([
    'Contingency (held back)',
    Math.round(breakdown.contingencyPct * 100),
    breakdown.contingencyAmount,
    0,
    breakdown.contingencyAmount,
  ]);

  rows.push(['Total budget', 100, breakdown.totalBudget, totalSpent, remainingOfTotal]);

  return '\uFEFF' + toCsv(rows);
}

/** Builds an RFC 4180 CSV export of user-entered vendor quotes. */
export function buildVendorCsv(quotes: readonly VendorQuote[], eventType: EventType): string {
  const categoryMap = new Map((CATEGORY_SETS[eventType] ?? []).map((cat) => [cat.id, cat.name]));

  const rows: Array<Array<string | number>> = [
    [
      'Category',
      'Vendor',
      'Base quote',
      'Service and tax (%)',
      'All-in total',
      'Deposit paid',
      'Deposit remaining',
      'Contract signed',
      'Insurance or licences verified',
      'Backup plan',
    ],
  ];

  for (const q of quotes) {
    const catName = categoryMap.get(q.categoryId) ?? q.categoryId;
    const allInTotal = quoteAllInTotal(q);
    const depositRemaining = Math.max(0, allInTotal - q.depositPaid);
    rows.push([
      catName,
      q.vendorName,
      q.baseQuote,
      q.serviceAndTaxPct,
      allInTotal,
      q.depositPaid,
      depositRemaining,
      q.contractSigned ? 'Yes' : 'No',
      q.insuranceVerified ? 'Yes' : 'No',
      q.backupPlan || 'None',
    ]);
  }

  return '\uFEFF' + toCsv(rows);
}
