import { CURRENCY_CODES, EVENT_SUBFORMATS } from '../../config/constants';
import type { CurrencyCode, SubFormat } from '../../types/event';
import {
  describeBudgetHint,
  type FieldErrors,
  type FieldKey,
  type FormDraft,
} from '../../ui/formModel';
import { CURRENCY_LABELS, SUBFORMAT_LABELS } from '../../ui/labels';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface EssentialsFieldsProps {
  draft: FormDraft;
  errors: FieldErrors;
  onChange: <K extends FieldKey>(key: K, value: FormDraft[K]) => void;
  idPrefix?: string;
}

export function EssentialsFields({
  draft,
  errors,
  onChange,
  idPrefix = 'context',
}: EssentialsFieldsProps) {
  const allowedSubformats = EVENT_SUBFORMATS[draft.eventType];
  const budgetHint = describeBudgetHint(draft);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <FormField
          id={`${idPrefix}-title`}
          label="Event title"
          error={errors.title}
        >
          {(aria) => (
            <Input
              {...aria}
              value={draft.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Give your celebration a title"
              maxLength={80}
            />
          )}
        </FormField>
      </div>

      <FormField
        id={`${idPrefix}-subFormat`}
        label="Format"
        error={errors.subFormat}
      >
        {(aria) => (
          <Select
            {...aria}
            value={draft.subFormat}
            onChange={(e) => onChange('subFormat', e.target.value as SubFormat)}
          >
            {allowedSubformats.map((format) => (
              <option key={format} value={format}>
                {SUBFORMAT_LABELS[format]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-eventDate`}
        label="Date of celebration"
        error={errors.eventDate}
      >
        {(aria) => (
          <Input
            {...aria}
            type="date"
            value={draft.eventDate}
            onChange={(e) => onChange('eventDate', e.target.value)}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-currency`}
        label="Currency"
        error={errors.currency}
      >
        {(aria) => (
          <Select
            {...aria}
            value={draft.currency}
            onChange={(e) => onChange('currency', e.target.value as CurrencyCode)}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCY_LABELS[code]}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-guestCount`}
        label="Estimated guest count"
        error={errors.guestCount}
      >
        {(aria) => (
          <Input
            {...aria}
            type="text"
            inputMode="numeric"
            value={draft.guestCount}
            onChange={(e) => onChange('guestCount', e.target.value)}
            placeholder="e.g. 150"
          />
        )}
      </FormField>

      <div className="md:col-span-2">
        <FormField
          id={`${idPrefix}-totalBudget`}
          label="Total budget"
          hint={budgetHint || 'Enter your overall budget for the celebration'}
          error={errors.totalBudget}
        >
          {(aria) => (
            <Input
              {...aria}
              type="text"
              inputMode="numeric"
              value={draft.totalBudget}
              onChange={(e) => onChange('totalBudget', e.target.value)}
              placeholder="e.g. 1500000"
            />
          )}
        </FormField>
      </div>
    </div>
  );
}
