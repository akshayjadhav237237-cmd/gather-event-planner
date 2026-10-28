import type { ContextFlag, EventType } from '../../types/event';
import { FLAG_GROUPS, FLAG_LABELS, isFlagRelevant } from '../../ui/labels';
import { ChipCheckbox } from '../ui/ChipCheckbox';

export interface FlagGroupsProps {
  eventType: EventType;
  flags: ContextFlag[];
  onToggle: (flag: ContextFlag) => void;
  idPrefix?: string;
}

export function FlagGroups({
  eventType,
  flags,
  onToggle,
  idPrefix = 'context-flag',
}: FlagGroupsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-sm font-medium text-ink">Special arrangements & constraints</span>
        <p className="text-xs text-muted mt-0.5">
          Flags adapt vendor checklists, dietary planning, and run-of-show logistics.
        </p>
      </div>

      {FLAG_GROUPS.map((group) => {
        const relevantFlags = group.flags.filter((flag) => isFlagRelevant(flag, eventType));

        if (relevantFlags.length === 0) {
          return null;
        }

        return (
          <fieldset key={group.title} className="border-0 p-0 m-0">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              {group.title}
            </legend>

            <div className="flex flex-wrap gap-2">
              {relevantFlags.map((flag) => {
                const isChecked = flags.includes(flag);
                const label = FLAG_LABELS[flag];

                return (
                  <ChipCheckbox
                    key={flag}
                    id={`${idPrefix}-${flag}`}
                    label={label}
                    checked={isChecked}
                    onChange={() => onToggle(flag)}
                  />
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
