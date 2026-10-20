import { MAX_PRIORITIES } from '../../config/constants';
import { CATEGORY_SETS } from '../../data/categories';
import type { EventType } from '../../types/event';
import { ChipCheckbox } from '../ui/ChipCheckbox';

export interface PriorityPickerProps {
  eventType: EventType;
  priorities: string[];
  onToggle: (categoryId: string) => void;
  idPrefix?: string;
}

export function PriorityPicker({
  eventType,
  priorities,
  onToggle,
  idPrefix = 'context-priority',
}: PriorityPickerProps) {
  const categories = CATEGORY_SETS[eventType];
  const atCapacity = priorities.length >= MAX_PRIORITIES;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          Top spending priorities
        </span>
        <span className="text-xs text-muted tabular-nums">
          {priorities.length} of {MAX_PRIORITIES} chosen
        </span>
      </div>

      <p className="text-xs text-muted">
        Select up to 3 areas where you want the budget engine to allocate stronger funding and premium options.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {categories.map((cat) => {
          const isSelected = priorities.includes(cat.id);
          const isDisabled = !isSelected && atCapacity;

          return (
            <ChipCheckbox
              key={cat.id}
              id={`${idPrefix}-${cat.id}`}
              label={cat.name}
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => onToggle(cat.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
