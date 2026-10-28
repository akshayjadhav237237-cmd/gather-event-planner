import { useState } from 'react';
import { projectEventFinance } from '../../domain/communityTools';
import type { BudgetBreakdown, EventContext } from '../../types/event';
import { type FinanceFormFields, parseFinanceInputs } from '../../ui/calculatorsView';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

export interface CommunityFinanceProps {
  context: EventContext;
  breakdown: BudgetBreakdown;
}

export function CommunityFinance({ context, breakdown }: CommunityFinanceProps) {
  const [fields, setFields] = useState<FinanceFormFields>(() => ({
    ticketPrice: '0',
    expectedTickets: String(context.guestCount),
    sponsorshipTotal: '0',
    vendorFeeTotal: '0',
    expenses: String(breakdown.totalBudget),
  }));

  const updateField = (key: keyof FinanceFormFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const parsed = parseFinanceInputs(fields);
  const errors = parsed.ok ? {} : parsed.errors;
  const financeResult = parsed.ok
    ? projectEventFinance(parsed.value)
    : projectEventFinance({
        ticketPrice: 0,
        expectedTickets: 0,
        sponsorshipTotal: 0,
        vendorFeeTotal: 0,
        expenses: 0,
      });

  const breakEvenText =
    financeResult.breakEvenTickets === null
      ? 'Enter a ticket price to see break-even.'
      : `${financeResult.breakEvenTickets} tickets needed to break even`;

  return (
    <Card as="section" padding="md" className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">Revenue and break-even</h3>
        <p className="text-sm text-muted">
          Model ticket sales, sponsorships, and fee income against expected event costs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField id="finance-ticket-price" label="Ticket price" error={errors.ticketPrice}>
          {(aria) => (
            <Input
              {...aria}
              inputMode="numeric"
              value={fields.ticketPrice}
              onChange={(e) => updateField('ticketPrice', e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="finance-expected-tickets"
          label="Expected tickets"
          error={errors.expectedTickets}
        >
          {(aria) => (
            <Input
              {...aria}
              inputMode="numeric"
              value={fields.expectedTickets}
              onChange={(e) => updateField('expectedTickets', e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="finance-sponsorship-total"
          label="Sponsorship total"
          error={errors.sponsorshipTotal}
        >
          {(aria) => (
            <Input
              {...aria}
              inputMode="numeric"
              value={fields.sponsorshipTotal}
              onChange={(e) => updateField('sponsorshipTotal', e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="finance-vendor-fee-total"
          label="Vendor fees total"
          error={errors.vendorFeeTotal}
        >
          {(aria) => (
            <Input
              {...aria}
              inputMode="numeric"
              value={fields.vendorFeeTotal}
              onChange={(e) => updateField('vendorFeeTotal', e.target.value)}
            />
          )}
        </FormField>

        <FormField id="finance-expenses" label="Expenses" error={errors.expenses}>
          {(aria) => (
            <Input
              {...aria}
              inputMode="numeric"
              value={fields.expenses}
              onChange={(e) => updateField('expenses', e.target.value)}
            />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-control bg-sunken">
        <div className="space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold block">
            Total revenue
          </span>
          <span className="font-serif text-2xl tabular-nums text-ink block">
            {formatCurrency(financeResult.revenue, context.currency)}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold block">
            Net financial balance
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-2xl tabular-nums text-ink">
              {formatCurrency(Math.abs(financeResult.net), context.currency)}
            </span>
            <Badge tone={financeResult.net >= 0 ? 'success' : 'critical'}>
              {financeResult.net >= 0 ? 'Surplus' : 'Shortfall'}
            </Badge>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-xs uppercase tracking-wider text-muted font-semibold block">
            Break-even tickets
          </span>
          <p className="text-sm text-ink mt-1">{breakEvenText}</p>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {`Total revenue: ${formatCurrency(financeResult.revenue, context.currency)}. Net balance: ${formatCurrency(
          Math.abs(financeResult.net),
          context.currency
        )} ${financeResult.net >= 0 ? 'surplus' : 'shortfall'}. ${breakEvenText}`}
      </div>
    </Card>
  );
}
