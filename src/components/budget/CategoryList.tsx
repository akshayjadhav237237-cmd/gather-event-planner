import type { FC } from 'react';
import type { CurrencyCode } from '../../types/event';
import type { BudgetRowView } from '../../ui/budgetView';
import { CategoryRow } from './CategoryRow';

export interface CategoryListProps {
  rows: BudgetRowView[];
  currency: CurrencyCode;
  onSpendChange: (categoryId: string, amount: number) => void;
}

export const CategoryList: FC<CategoryListProps> = ({
  rows,
  currency,
  onSpendChange,
}) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
      {rows.map((row) => (
        <li key={row.id}>
          <CategoryRow
            row={row}
            currency={currency}
            onSpendChange={onSpendChange}
          />
        </li>
      ))}
    </ul>
  );
};
