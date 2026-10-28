import type { FC } from 'react';
import type { BudgetBreakdown, CurrencyCode } from '../../types/event';
import type { SpendingSummaryView } from '../../ui/budgetView';
import {
  formatContingencySplit,
  type PrintBudgetDisplayRow,
  type PrintVendorRowView,
} from '../../ui/printView';
import { formatCurrency } from '../../utils/currency';

interface PrintBudgetTableProps {
  budgetRows: readonly PrintBudgetDisplayRow[];
  budget: BudgetBreakdown;
  currency: CurrencyCode;
  budgetSummary: SpendingSummaryView;
}

export const PrintBudgetTable: FC<PrintBudgetTableProps> = ({
  budgetRows,
  budget,
  currency,
  budgetSummary,
}) => (
  <table className="w-full text-sm">
    <caption className="text-left font-semibold text-sm mb-1">Budget breakdown</caption>
    <thead>
      <tr>
        <th scope="col" className="text-left">
          Category
        </th>
        <th scope="col" className="text-right">
          Planning split
        </th>
        <th scope="col" className="text-right">
          Allocated
        </th>
        <th scope="col" className="text-right">
          Spent
        </th>
        <th scope="col" className="text-right">
          Remaining
        </th>
      </tr>
    </thead>
    <tbody>
      {budgetRows.map((r) => (
        <tr key={r.id}>
          <td>{r.name}</td>
          <td className="text-right">{r.allocatedPct}</td>
          <td className="text-right">{r.allocatedAmount}</td>
          <td className="text-right">{r.spent}</td>
          <td className="text-right">{r.remaining}</td>
        </tr>
      ))}
      <tr>
        <td>Contingency (held back)</td>
        <td className="text-right">{formatContingencySplit(budget.contingencyPct)}</td>
        <td className="text-right">{formatCurrency(budget.contingencyAmount, currency)}</td>
        <td className="text-right">—</td>
        <td className="text-right">{formatCurrency(budget.contingencyAmount, currency)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr className="font-semibold">
        <th scope="row" className="text-left">
          Total
        </th>
        <td className="text-right">100%</td>
        <td className="text-right">{formatCurrency(budget.totalBudget, currency)}</td>
        <td className="text-right">{formatCurrency(budgetSummary.totalSpent, currency)}</td>
        <td className="text-right">{formatCurrency(budgetSummary.remainingOfTotal, currency)}</td>
      </tr>
    </tfoot>
  </table>
);

interface PrintQuotesTableProps {
  vendorRows: readonly PrintVendorRowView[];
}

export const PrintQuotesTable: FC<PrintQuotesTableProps> = ({ vendorRows }) => (
  <table className="w-full text-sm">
    <caption className="text-left font-semibold text-sm mb-1">Vendor quotes comparison</caption>
    <thead>
      <tr>
        <th scope="col" className="text-left">
          Category
        </th>
        <th scope="col" className="text-left">
          Vendor
        </th>
        <th scope="col" className="text-right">
          All-in total
        </th>
        <th scope="col" className="text-center">
          Contract signed
        </th>
        <th scope="col" className="text-center">
          Insurance verified
        </th>
      </tr>
    </thead>
    <tbody>
      {vendorRows.map((q) => (
        <tr key={q.id}>
          <td>{q.category}</td>
          <td>{q.vendorName}</td>
          <td className="text-right">{q.allInFormatted}</td>
          <td className="text-center">{q.contractSigned}</td>
          <td className="text-center">{q.insuranceVerified}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
