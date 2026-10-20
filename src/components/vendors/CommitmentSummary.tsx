import type { FC } from 'react';
import type { CurrencyCode, VendorQuote } from '../../types/event';
import { Card } from '../ui/Card';
import { Stat } from '../ui/Stat';
import { formatCurrency } from '../../utils/currency';
import { summarizeCommitments } from '../../ui/vendorView';

export interface CommitmentSummaryProps {
  quotes: readonly VendorQuote[];
  currency: CurrencyCode;
}

export const CommitmentSummary: FC<CommitmentSummaryProps> = ({ quotes, currency }) => {
  const { signedAllIn, signedDeposits, signedOutstanding, shortlistedCount } =
    summarizeCommitments(quotes);

  return (
    <Card padding="md" as="section" aria-labelledby="commitment-summary-heading">
      <div className="space-y-3">
        <h3
          id="commitment-summary-heading"
          className="text-xs uppercase tracking-wider text-muted font-semibold"
        >
          Committed Spend Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat
            label="Committed all-in"
            value={formatCurrency(signedAllIn, currency)}
            sub="Signed contracts only"
          />
          <Stat
            label="Deposits paid"
            value={formatCurrency(signedDeposits, currency)}
            sub="On signed quotes"
          />
          <Stat
            label="Still to pay"
            value={formatCurrency(signedOutstanding, currency)}
            sub="Outstanding balance"
          />
          <Stat
            label="Shortlisted"
            value={shortlistedCount}
            sub={shortlistedCount === 1 ? '1 quote collected' : `${shortlistedCount} quotes collected`}
          />
        </div>
      </div>
    </Card>
  );
};
