import type { FC } from 'react';
import { AlertCircle, AlertTriangle, Check } from 'lucide-react';
import type { CurrencyCode } from '../../types/event';
import type { BudgetRowStatus } from '../../ui/budgetView';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../ui/Badge';

export interface CategoryStatusBadgeProps {
  status: BudgetRowStatus;
  remaining: number;
  currency: CurrencyCode;
}

export const CategoryStatusBadge: FC<CategoryStatusBadgeProps> = ({
  status,
  remaining,
  currency,
}) => {
  switch (status) {
    case 'ok':
      return (
        <Badge tone="success" icon={<Check size={14} aria-hidden="true" />}>
          On track
        </Badge>
      );
    case 'near':
      return (
        <Badge tone="warning" icon={<AlertTriangle size={14} aria-hidden="true" />}>
          Nearly used
        </Badge>
      );
    case 'over':
      return (
        <Badge tone="critical" icon={<AlertCircle size={14} aria-hidden="true" />}>
          {`Over by ${formatCurrency(Math.abs(remaining), currency)}`}
        </Badge>
      );
    case 'none':
    default:
      return null;
  }
};
