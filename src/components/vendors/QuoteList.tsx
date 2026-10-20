import type { FC } from 'react';
import type { BudgetBreakdown, VendorCategoryGuide, VendorQuote } from '../../types/event';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../shared/EmptyState';
import { QuoteCard } from './QuoteCard';
import { formatCurrency } from '../../utils/currency';
import { quoteAllInTotal } from '../../domain/vendorEngine';
import { categoryAllocationStatus } from '../../ui/vendorView';

export interface QuoteListProps {
  quotes: readonly VendorQuote[];
  guides: readonly VendorCategoryGuide[];
  breakdown: BudgetBreakdown;
  onEditQuote: (quote: VendorQuote) => void;
  onRemoveQuote: (quote: VendorQuote) => void;
}

export const QuoteList: FC<QuoteListProps> = ({
  quotes,
  guides,
  breakdown,
  onEditQuote,
  onRemoveQuote,
}) => {
  if (quotes.length === 0) {
    return (
      <EmptyState
        title="No vendor quotes yet"
        description="Add quotes as you collect them to compare all-in costs and track signed commitments."
      />
    );
  }

  const categoryIds = Array.from(new Set(quotes.map((q) => q.categoryId)));

  return (
    <div className="space-y-6" aria-labelledby="shortlisted-quotes-heading">
      <h3 id="shortlisted-quotes-heading" className="text-lg font-serif text-ink font-normal">
        Shortlisted Quotes ({quotes.length})
      </h3>

      <div className="space-y-6">
        {categoryIds.map((catId) => {
          const categoryQuotes = quotes.filter((q) => q.categoryId === catId);
          const guide = guides.find((g) => g.id === catId);
          const categoryName = guide ? guide.name : catId;
          const { allocation, lowestAllIn, overBy } = categoryAllocationStatus(
            catId,
            quotes,
            breakdown
          );

          return (
            <div key={catId} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-line pb-2">
                <h4 className="text-base font-semibold text-ink">{categoryName}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  <span>
                    {allocation !== null
                      ? `Planning allocation ${formatCurrency(allocation, breakdown.currency)}. `
                      : ''}
                    {lowestAllIn !== null
                      ? `Lowest quote ${formatCurrency(lowestAllIn, breakdown.currency)}.`
                      : ''}
                  </span>
                  {overBy > 0 && (
                    <Badge tone="warning">
                      Over allocation by {formatCurrency(overBy, breakdown.currency)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {categoryQuotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    currency={breakdown.currency}
                    isLowest={lowestAllIn !== null && quoteAllInTotal(quote) === lowestAllIn}
                    categoryQuoteCount={categoryQuotes.length}
                    onEdit={onEditQuote}
                    onRemove={onRemoveQuote}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
