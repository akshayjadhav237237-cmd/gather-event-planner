import {
  type ChangeEvent,
  type FC,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AlertCircle } from 'lucide-react';
import type { CurrencyCode } from '../../types/event';
import type { BudgetRowView } from '../../ui/budgetView';
import { parseWholeNumber } from '../../ui/formModel';
import { formatCurrency } from '../../utils/currency';
import { debounce } from '../../utils/debounce';
import { ProgressBar } from '../shared/ProgressBar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Disclosure } from '../ui/Disclosure';
import { Input } from '../ui/Input';
import { CategoryStatusBadge } from './CategoryStatusBadge';

export interface CategoryRowProps {
  row: BudgetRowView;
  currency: CurrencyCode;
  onSpendChange: (categoryId: string, amount: number) => void;
}

export const CategoryRow: FC<CategoryRowProps> = ({
  row,
  currency,
  onSpendChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    row.spent === 0 ? '' : String(row.spent),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(row.spent === 0 ? '' : String(row.spent));
    setError(null);
  }, [row.spent]);

  const debouncedUpdate = useMemo(
    () =>
      debounce((amount: unknown) => {
        if (typeof amount === 'number') {
          onSpendChange(row.id, amount);
        }
      }, 300),
    [onSpendChange, row.id],
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const trimmed = val.trim();
    if (trimmed === '') {
      setError(null);
      debouncedUpdate(0);
      return;
    }

    const parsed = parseWholeNumber(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Enter a valid whole number');
      return;
    }

    setError(null);
    debouncedUpdate(parsed);
  };

  const handleBlur = () => {
    debouncedUpdate.cancel();
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      onSpendChange(row.id, 0);
      return;
    }
    const parsed = parseWholeNumber(trimmed);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onSpendChange(row.id, parsed);
    }
  };

  const deltaText =
    row.pctDelta !== 0
      ? row.pctDelta > 0
        ? `+${row.pctDelta} pts vs. standard split`
        : `-${Math.abs(row.pctDelta)} pts vs. standard split`
      : null;

  const inputId = `spend-${row.id}`;
  const errorId = `spend-error-${row.id}`;

  return (
    <Card padding="md" className="space-y-4 h-full flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink">{row.name}</h3>
            {row.isPriority && <Badge tone="accent">Priority</Badge>}
            {row.isFixedCost && <Badge tone="neutral">Fixed cost</Badge>}
          </div>
          <CategoryStatusBadge status={row.status} remaining={row.remaining} currency={currency} />
        </div>

        <div className="flex flex-wrap items-baseline gap-2 text-sm text-ink">
          <span className="font-serif text-lg font-medium tabular-nums">
            {formatCurrency(row.allocatedAmount, currency)}
          </span>
          <span className="text-xs text-muted">
            {`Planning split ${row.allocatedPct}%`}
          </span>
          {deltaText && (
            <span className="text-xs text-muted">({deltaText})</span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Spent so far</span>
            <span className="tabular-nums">{row.usedPct}%</span>
          </div>
          <ProgressBar
            label={`Spent on ${row.name}`}
            value={row.spent}
            max={row.allocatedAmount}
            tone={row.status === 'over' ? 'critical' : 'accent'}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <label htmlFor={inputId} className="block text-xs font-medium text-ink">
            {`Spent so far on ${row.name}`}
          </label>
          <Input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder="0"
          />
          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-xs text-critical inline-flex items-center gap-1.5"
            >
              <AlertCircle size={14} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
        </div>
      </div>

      {row.swap && (
        <div className="pt-2">
          <Disclosure id={`swap-${row.id}`} title="Ways to save">
            <p className="text-sm text-ink-soft pt-1">{row.swap}</p>
          </Disclosure>
        </div>
      )}
    </Card>
  );
};
