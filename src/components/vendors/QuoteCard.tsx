import { type FC, memo } from 'react';
import type { CurrencyCode, VendorQuote } from '../../types/event';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/currency';
import { quoteAllInTotal } from '../../domain/vendorEngine';

export interface QuoteCardProps {
  quote: VendorQuote;
  currency: CurrencyCode;
  isLowest?: boolean;
  categoryQuoteCount: number;
  onEdit: (quote: VendorQuote) => void;
  onRemove: (quote: VendorQuote) => void;
}

export const QuoteCard: FC<QuoteCardProps> = memo(({
  quote,
  currency,
  isLowest = false,
  categoryQuoteCount,
  onEdit,
  onRemove,
}) => {
  const allIn = quoteAllInTotal(quote);
  const depositPaid = Number.isFinite(quote.depositPaid) ? Math.max(0, quote.depositPaid) : 0;
  const depositRemaining = Math.max(0, allIn - depositPaid);

  return (
    <Card padding="sm" as="article" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-ink">{quote.vendorName}</h4>
          <div className="flex flex-wrap items-center gap-1.5">
            {isLowest && categoryQuoteCount >= 2 && (
              <Badge tone="success">Lowest all-in</Badge>
            )}
            {!quote.contractSigned && (
              <Badge tone="warning">Contract not signed</Badge>
            )}
            {!quote.insuranceVerified && (
              <Badge tone="warning">Insurance not verified</Badge>
            )}
            {quote.contractSigned && (
              <Badge tone="info">Contract signed</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button variant="ghost" size="sm" onClick={() => onEdit(quote)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-critical hover:text-critical"
            onClick={() => onRemove(quote)}
          >
            Remove
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-line text-sm">
        <div>
          <span className="text-xs text-muted block">Base quote</span>
          <span className="font-medium text-ink tabular-nums">
            {formatCurrency(quote.baseQuote, currency)}
          </span>
          {quote.serviceAndTaxPct > 0 && (
            <span className="text-xs text-muted block">
              +{quote.serviceAndTaxPct}% tax/service
            </span>
          )}
        </div>

        <div>
          <span className="text-xs text-muted block">All-in total</span>
          <span className="font-semibold text-ink tabular-nums">
            {formatCurrency(allIn, currency)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-xs text-muted block">Still to pay</span>
          <span className="font-medium text-ink tabular-nums">
            {formatCurrency(depositRemaining, currency)}
          </span>
          {depositPaid > 0 && (
            <span className="text-xs text-muted block">
              ({formatCurrency(depositPaid, currency)} deposit paid)
            </span>
          )}
        </div>
      </div>

      {quote.backupPlan.trim().length > 0 && (
        <div className="text-xs text-ink-soft bg-sunken rounded-control p-2.5">
          <span className="font-medium text-ink">Backup plan: </span>
          <span>{quote.backupPlan}</span>
        </div>
      )}
    </Card>
  );
});

QuoteCard.displayName = 'QuoteCard';
